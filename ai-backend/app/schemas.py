from pydantic import BaseModel


class IngestRequest(BaseModel):
    text: str


class ChatRequest(BaseModel):
    query: str


class EmailCheckRequest(BaseModel):
    email: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str | None = None
    access_token: str | None = None
