from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import bcrypt
from database import get_db
from models.user import User
from auth.jwt import create_token, require_auth

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: str
    credits: int
    role: str


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar,
        "credits": user.credits,
        "role": user.role,
    }


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    user = User(name=req.name, email=req.email, password_hash=hashed, credits=1000)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"token": create_token(user.id), "user": user_to_dict(user)}


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not bcrypt.checkpw(req.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"token": create_token(user.id), "user": user_to_dict(user)}


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(require_auth)):
    return user_to_dict(user)
