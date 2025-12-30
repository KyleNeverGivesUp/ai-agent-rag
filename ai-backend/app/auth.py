import base64
import hashlib
import hmac
import os
import uuid

import httpx
from fastapi import APIRouter, HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from .db import get_db
from .schemas import EmailCheckRequest, GoogleAuthRequest, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])

_AVATAR_COLORS = [
    "#8B5CF6",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
]
_MAX_USERS = 100


def _user_key(email: str) -> str:
    return email.strip().lower()


def _hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    if salt is None:
        salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100_000,
    )
    return (
        base64.b64encode(salt).decode("utf-8"),
        base64.b64encode(derived).decode("utf-8"),
    )


def _verify_password(password: str, salt_b64: str, hash_b64: str) -> bool:
    salt = base64.b64decode(salt_b64.encode("utf-8"))
    expected = base64.b64decode(hash_b64.encode("utf-8"))
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100_000,
    )
    return hmac.compare_digest(derived, expected)


def _ensure_capacity(cur):
    cur.execute("SELECT COUNT(*) FROM users")
    count = cur.fetchone()[0]
    if count >= _MAX_USERS:
        raise HTTPException(
            status_code=403,
            detail="User registration limit reached. Please try again later.",
        )

def _avatar_color(seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    idx = int(digest[:8], 16) % len(_AVATAR_COLORS)
    return _AVATAR_COLORS[idx]

def _initial(given_name: str | None, email: str) -> str:
    if given_name:
        return given_name.strip()[:1].upper()
    return email.strip()[:1].upper()


@router.post("/check-email")
def check_email(req: EmailCheckRequest):
    email = _user_key(req.email)
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
            exists = cur.fetchone() is not None
    return {"exists": exists}


@router.post("/signup")
def signup(req: RegisterRequest):
    email = _user_key(req.email)
    with get_db() as conn:
        with conn.cursor() as cur:
            _ensure_capacity(cur)
            cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                raise HTTPException(status_code=409, detail="User already exists")
            salt, hashed = _hash_password(req.password)
            cur.execute(
                """
                INSERT INTO users (email, password_salt, password_hash)
                VALUES (%s, %s, %s)
                """,
                (email, salt, hashed),
            )
        conn.commit()
    token = f"session-{uuid.uuid4()}"
    return {
        "ok": True,
        "token": token,
        "user": {
            "email": email,
            "initial": _initial(None, email),
            "avatar_color": _avatar_color(email),
        },
    }


@router.post("/login")
def login(req: LoginRequest):
    email = _user_key(req.email)
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT password_salt, password_hash
                FROM users
                WHERE email = %s
                """,
                (email,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")
            password_salt, password_hash = row
    if not _verify_password(req.password, password_salt, password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"session-{uuid.uuid4()}"
    return {
        "token": token,
        "user": {
            "email": email,
            "initial": _initial(None, email),
            "avatar_color": _avatar_color(email),
        },
    }


@router.post("/google")
async def auth_google(req: GoogleAuthRequest):
    if not req.id_token and not req.access_token:
        raise HTTPException(status_code=400, detail="Missing Google token")

    user = None

    if req.id_token:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="Missing GOOGLE_CLIENT_ID")
        try:
            request = google_requests.Request()
            payload = google_id_token.verify_oauth2_token(
                req.id_token,
                request,
                client_id,
            )
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid id_token")

        user = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "email_verified": payload.get("email_verified"),
            "given_name": payload.get("given_name"),
            "name": payload.get("name"),
            "picture": payload.get("picture"),
        }

    if user is None and req.access_token:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {req.access_token}"},
                timeout=10.0,
            )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid access token")
        payload = response.json()
        user = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "email_verified": payload.get("email_verified"),
            "given_name": payload.get("given_name"),
            "name": payload.get("name"),
            "picture": payload.get("picture"),
        }

    if not user or not user.get("sub") or not user.get("email"):
        raise HTTPException(status_code=400, detail="Google profile incomplete")

    user["initial"] = _initial(user.get("given_name"), user["email"])
    user["avatar_color"] = _avatar_color(user["sub"])

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO google_users (sub, email, email_verified, given_name, name, picture, avatar_color)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (sub) DO UPDATE SET
                    email = EXCLUDED.email,
                    email_verified = EXCLUDED.email_verified,
                    given_name = EXCLUDED.given_name,
                    name = EXCLUDED.name,
                    picture = EXCLUDED.picture,
                    avatar_color = EXCLUDED.avatar_color
                """,
                (
                    user["sub"],
                    user["email"],
                    user.get("email_verified"),
                    user.get("given_name"),
                    user.get("name"),
                    user.get("picture"),
                    user.get("avatar_color"),
                ),
            )
        conn.commit()

    token = f"session-{uuid.uuid4()}"
    return {"token": token, "user": user}
