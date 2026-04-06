from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.purchase import UserPurchase
from models.bundle import Bundle
from models.plan import Plan
from auth.jwt import require_auth

router = APIRouter(prefix="/credits", tags=["credits"])


class PurchaseRequest(BaseModel):
    bundle_id: Optional[int] = None
    plan_id: Optional[int] = None


@router.get("")
def get_credits(user: User = Depends(require_auth)):
    return {"credits": user.credits}


@router.get("/purchases")
def get_purchases(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    purchases = db.query(UserPurchase).filter(UserPurchase.user_id == user.id).all()
    return {
        "bundle_ids": [p.bundle_id for p in purchases if p.bundle_id],
        "plan_ids": [p.plan_id for p in purchases if p.plan_id],
    }


@router.post("/purchase")
def purchase(req: PurchaseRequest, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    if req.bundle_id:
        bundle = db.query(Bundle).filter(Bundle.id == req.bundle_id).first()
        if not bundle:
            raise HTTPException(status_code=404, detail="Bundle not found")
        if bundle.is_free:
            # Free — just record it
            pass
        elif user.credits < bundle.credits_required:
            raise HTTPException(status_code=400, detail="Insufficient credits")
        else:
            user.credits -= bundle.credits_required

        existing = db.query(UserPurchase).filter(
            UserPurchase.user_id == user.id, UserPurchase.bundle_id == req.bundle_id
        ).first()
        if not existing:
            db.add(UserPurchase(user_id=user.id, bundle_id=req.bundle_id, credits_spent=bundle.credits_required))

    elif req.plan_id:
        plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        if user.credits < plan.credits_required:
            raise HTTPException(status_code=400, detail="Insufficient credits")
        user.credits -= plan.credits_required

        existing = db.query(UserPurchase).filter(
            UserPurchase.user_id == user.id, UserPurchase.plan_id == req.plan_id
        ).first()
        if not existing:
            db.add(UserPurchase(user_id=user.id, plan_id=req.plan_id, credits_spent=plan.credits_required))

    db.commit()
    db.refresh(user)
    return {"credits": user.credits, "message": "Purchase successful"}
