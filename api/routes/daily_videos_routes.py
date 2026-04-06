from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import DailyVideo, Creator

router = APIRouter(prefix="/daily-videos", tags=["daily-videos"])


@router.get("")
def list_daily_videos(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    total = db.query(DailyVideo).count()
    videos = db.query(DailyVideo).order_by(DailyVideo.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "items": [_video_dict(v, db) for v in videos],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/{video_id}")
def get_daily_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(DailyVideo).filter(DailyVideo.id == video_id).first()
    if not video:
        return {"error": "Not found"}
    return _video_dict(video, db)


def _video_dict(v: DailyVideo, db: Session) -> dict:
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
