from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Creator, Bundle, Series, DailyVideo

router = APIRouter(prefix="/creators", tags=["creators"])


@router.get("")
def list_creators(db: Session = Depends(get_db)):
    creators = db.query(Creator).all()
    return [_creator_summary(c) for c in creators]


@router.get("/{creator_id}")
def get_creator(creator_id: int, db: Session = Depends(get_db)):
    creator = db.query(Creator).filter(Creator.id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")

    bundles = db.query(Bundle).filter(Bundle.creator_id == creator_id).all()
    videos = db.query(DailyVideo).filter(DailyVideo.creator_id == creator_id).all()

    return {
        **_creator_summary(creator),
        "bio": creator.bio,
        "homepage": creator.homepage,
        "offerings": creator.offerings,
        "bundles": [{"id": b.id, "title": b.title, "subtitle": b.subtitle, "thumbnail": b.thumbnail, "category": b.category, "is_free": b.is_free, "credits_required": b.credits_required} for b in bundles],
        "videos": [{"id": v.id, "title": v.title, "thumbnail": v.thumbnail, "category": v.category} for v in videos],
    }


def _creator_summary(c: Creator) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "avatar": c.avatar,
        "job_title": c.job_title,
    }
