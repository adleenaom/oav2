from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Plan, PlanLearning, Bundle, Creator, Review, Badge

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("")
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(Plan).filter(Plan.is_lesson.is_(True)).all()
    return [_plan_summary(p, db) for p in plans]


@router.get("/{plan_id}")
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _plan_detail(plan, db)


def _plan_summary(p: Plan, db: Session) -> dict:
    bundle_count = db.query(Bundle).filter(Bundle.plan_id == p.id).count()
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "image": p.image,
        "background": p.background,
        "category": p.category,
        "credits_required": p.credits_required,
        "rating": p.rating / 10 if p.rating else 0,
        "review_count": p.review_count,
        "bundle_count": bundle_count,
        "certificate_on_completion": p.certificate_on_completion,
    }


def _plan_detail(p: Plan, db: Session) -> dict:
    base = _plan_summary(p, db)

    learnings = db.query(PlanLearning).filter(PlanLearning.plan_id == p.id, PlanLearning.type == "learning").all()
    audience = db.query(PlanLearning).filter(PlanLearning.plan_id == p.id, PlanLearning.type == "audience").all()
    bundles = db.query(Bundle).filter(Bundle.plan_id == p.id).order_by(Bundle.seq_no).all()
    reviews = db.query(Review).filter(Review.plan_id == p.id).order_by(Review.created_at.desc()).limit(10).all()
    badges = db.query(Badge).filter(Badge.plan_id == p.id).all()

    bundle_data = []
    for b in bundles:
        creator = db.query(Creator).filter(Creator.id == b.creator_id).first() if b.creator_id else None
        bundle_data.append({
            "id": b.id,
            "title": b.title,
            "subtitle": b.subtitle,
            "description": b.description,
            "category": b.category,
            "credits_required": b.credits_required,
            "duration_minutes": b.duration_minutes,
            "is_free": b.is_free,
            "thumbnail": b.thumbnail,
            "creator": {"id": creator.id, "name": creator.name, "avatar": creator.avatar} if creator else None,
        })

    base["learning_points"] = [l.text for l in learnings]
    base["target_audience"] = [a.text for a in audience]
    base["bundles"] = bundle_data
    base["reviews"] = [{"id": r.id, "name": r.name, "avatar": r.avatar, "content": r.content, "rating": r.rating} for r in reviews]
    base["badges"] = [{"id": b.id, "title": b.title, "description": b.description, "image": b.image} for b in badges]

    return base
