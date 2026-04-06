from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Bundle, Series, Chapter, Content, Resource, Creator

router = APIRouter(prefix="/bundles", tags=["bundles"])


@router.get("")
def list_bundles(plan_id: Optional[int] = None, standalone: bool = False, db: Session = Depends(get_db)):
    query = db.query(Bundle)
    if plan_id is not None:
        query = query.filter(Bundle.plan_id == plan_id)
    if standalone:
        query = query.filter(Bundle.plan_id.is_(None))
    bundles = query.order_by(Bundle.seq_no).all()
    return [_bundle_summary(b, db) for b in bundles]


@router.get("/{bundle_id}")
def get_bundle(bundle_id: int, db: Session = Depends(get_db)):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return _bundle_detail(bundle, db)


def _bundle_summary(b: Bundle, db: Session) -> dict:
    creator = db.query(Creator).filter(Creator.id == b.creator_id).first() if b.creator_id else None
    chapter_count = db.query(Chapter).join(Series).filter(Series.bundle_id == b.id).count()
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
        "chapter_count": chapter_count,
        "creator": {"id": creator.id, "name": creator.name, "avatar": creator.avatar, "job_title": creator.job_title, "bio": creator.bio} if creator else None,
    }


def _bundle_detail(b: Bundle, db: Session) -> dict:
    base = _bundle_summary(b, db)
    series_list = db.query(Series).filter(Series.bundle_id == b.id).all()

    series_data = []
    for s in series_list:
        chapters = db.query(Chapter).filter(Chapter.series_id == s.id).order_by(Chapter.seq_no).all()
        resources = db.query(Resource).filter(Resource.series_id == s.id).all()

        chapter_data = []
        for ch in chapters:
            contents = db.query(Content).filter(Content.chapter_id == ch.id).order_by(Content.seq_no).all()
            chapter_data.append({
                "id": ch.id,
                "title": ch.title,
                "description": ch.description,
                "duration": ch.duration,
                "seq_no": ch.seq_no,
                "is_premium": ch.is_premium,
                "thumbnail": ch.thumbnail,
                "parts": [
                    {"type": c.type, "url": c.url, "caption": c.caption, "question": c.question, "options_json": c.options_json}
                    for c in contents
                ],
            })

        series_data.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "image": s.image,
            "chapters": chapter_data,
            "resources": [{"id": r.id, "title": r.title, "url": r.url} for r in resources],
        })

    base["series"] = series_data
    return base
