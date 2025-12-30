import os

import psycopg2
from fastapi import HTTPException


def get_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(status_code=500, detail="Missing DATABASE_URL")
    return psycopg2.connect(db_url)


def init_db():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        email TEXT PRIMARY KEY,
                        password_salt TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    )
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS google_users (
                        sub TEXT PRIMARY KEY,
                        email TEXT NOT NULL,
                        email_verified BOOLEAN,
                        name TEXT,
                        picture TEXT,
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    )
                    """
                )
            conn.commit()
    except Exception as exc:
        print(f"Database init failed: {exc}")
