from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import DailyVideo, Bundle, Plan, Creator, Series

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(
    q: str = Query("", min_length=1),
    db: Session = Depends(get_db),
):
    term = f"%{q}%"

    plans = db.query(Plan).filter(
        or_(Plan.title.ilike(term), Plan.description.ilike(term), Plan.category.ilike(term))
    ).limit(10).all()

    bundles = db.query(Bundle).filter(
        or_(Bundle.title.ilike(term), Bundle.description.ilike(term), Bundle.category.ilike(term))
    ).limit(10).all()

    creators = db.query(Creator).filter(
        or_(Creator.name.ilike(term), Creator.bio.ilike(term), Creator.job_title.ilike(term))
    ).limit(10).all()

    videos = db.query(DailyVideo).filter(
        or_(DailyVideo.title.ilike(term), DailyVideo.description.ilike(term), DailyVideo.category.ilike(term))
    ).limit(10).all()

    return {
        "plans": [{"id": p.id, "title": p.title, "description": p.description, "image": p.image, "category": p.category, "rating": p.rating / 10 if p.rating else 0} for p in plans],
        "bundles": [{"id": b.id, "title": b.title, "description": b.description, "thumbnail": b.thumbnail, "category": b.category, "is_free": b.is_free, "credits_required": b.credits_required} for b in bundles],
        "creators": [{"id": c.id, "name": c.name, "avatar": c.avatar, "job_title": c.job_title, "bio": c.bio} for c in creators],
        "videos": [{"id": v.id, "title": v.title, "thumbnail": v.thumbnail, "category": v.category, "description": v.description} for v in videos],
    }
