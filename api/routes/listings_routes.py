from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import DailyVideo, Bundle, Plan, Banner, Creator

router = APIRouter(prefix="/listings", tags=["listings"])


@router.get("/home")
def home_listings(db: Session = Depends(get_db)):
    """Returns all homepage sections in one call."""
    daily_videos = db.query(DailyVideo).order_by(DailyVideo.created_at.desc()).limit(10).all()
    standalone_bundles = db.query(Bundle).filter(Bundle.plan_id.is_(None)).all()
    lesson_plans = db.query(Plan).filter(Plan.is_lesson.is_(True)).all()
    banners = db.query(Banner).all()

    return {
        "for_you": [_daily_video_dict(v, db) for v in daily_videos],
        "originals": [_bundle_dict(b, db) for b in standalone_bundles],
        "lessons": [_plan_dict(p) for p in lesson_plans],
        "banners": [{"id": b.id, "title": b.title, "image": b.image, "color": b.color} for b in banners],
    }


def _daily_video_dict(v: DailyVideo, db: Session) -> dict:
    creator = db.query(Creator).filter(Creator.id == v.creator_id).first() if v.creator_id else None
    return {
        "id": v.id,
        "title": v.title,
        "full_title": v.full_title,
        "category": v.category,
        "description": v.description,
        "video_url": v.video_url,
        "thumbnail": v.thumbnail,
        "series_count": v.series_count,
        "total_minutes": v.total_minutes,
        "creator": {"id": creator.id, "name": creator.name, "avatar": creator.avatar} if creator else None,
    }


def _bundle_dict(b: Bundle, db: Session) -> dict:
    creator = db.query(Creator).filter(Creator.id == b.creator_id).first() if b.creator_id else None
    return {
        "id": b.id,
        "plan_id": b.plan_id,
        "title": b.title,
        "subtitle": b.subtitle,
        "description": b.description,
        "category": b.category,
        "credits_required": b.credits_required,
        "duration_minutes": b.duration_minutes,
        "is_free": b.is_free,
        "thumbnail": b.thumbnail,
        "creator": {"id": creator.id, "name": creator.name, "avatar": creator.avatar} if creator else None,
    }


def _plan_dict(p: Plan) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "image": p.image,
        "category": p.category,
        "credits_required": p.credits_required,
        "rating": p.rating / 10 if p.rating else 0,
        "review_count": p.review_count,
        "certificate_on_completion": p.certificate_on_completion,
    }
