from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Bundle, Creator

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/similar/{bundle_id}")
def similar_bundles(bundle_id: int, db: Session = Depends(get_db)):
    """Return 3 similar bundles based on same category, then older bundles."""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        return []

    # Same category first, excluding self
    same_cat = db.query(Bundle).filter(
        Bundle.category == bundle.category,
        Bundle.id != bundle_id,
    ).limit(3).all()

    results = same_cat

    # Fill remaining with other bundles
    if len(results) < 3:
        exclude_ids = [b.id for b in results] + [bundle_id]
        others = db.query(Bundle).filter(
            Bundle.id.notin_(exclude_ids)
        ).order_by(Bundle.id).limit(3 - len(results)).all()
        results.extend(others)

    return [
        {
            "id": b.id,
            "title": b.title,
            "thumbnail": b.thumbnail,
            "category": b.category,
            "is_free": b.is_free,
            "credits_required": b.credits_required,
            "creator": _get_creator(b.creator_id, db),
        }
        for b in results[:3]
    ]


def _get_creator(creator_id, db):
    if not creator_id:
        return None
    c = db.query(Creator).filter(Creator.id == creator_id).first()
    return {"id": c.id, "name": c.name, "avatar": c.avatar} if c else None
