from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from database import Base


class UserPurchase(Base):
    __tablename__ = "user_purchases"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    credits_spent = Column(Integer, default=0)
    purchased_at = Column(DateTime, server_default=func.now())
