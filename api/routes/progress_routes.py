from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.progress import UserProgress
from auth.jwt import require_auth

router = APIRouter(prefix="/progress", tags=["progress"])


class ProgressUpdate(BaseModel):
    content_id: int
    content_type: str  # foryou | bundle | chapter
    current_time: float = 0
    duration: float = 0
    completed: bool = False


@router.get("")
def get_progress(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    items = db.query(UserProgress).filter(UserProgress.user_id == user.id).all()
    return [
        {
            "content_id": p.content_id,
            "content_type": p.content_type,
            "current_time": p.current_time,
            "duration": p.duration,
            "completed": p.completed,
        }
        for p in items
    ]


@router.post("")
def update_progress(req: ProgressUpdate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    existing = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.content_id == req.content_id,
        UserProgress.content_type == req.content_type,
    ).first()

    if existing:
        existing.current_time = req.current_time
        existing.duration = req.duration
        existing.completed = req.completed
    else:
        db.add(UserProgress(
            user_id=user.id,
            content_id=req.content_id,
            content_type=req.content_type,
            current_time=req.current_time,
            duration=req.duration,
            completed=req.completed,
        ))

    db.commit()
    return {"status": "ok"}
