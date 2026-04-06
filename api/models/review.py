from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, default="")
    avatar = Column(String, default="")
    content = Column(String, default="")
    rating = Column(Integer, default=5)  # 1-5
    created_at = Column(DateTime, server_default=func.now())
