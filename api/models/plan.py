from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    image = Column(String, default="")
    background = Column(String, default="")
    category = Column(String, default="")
    duration = Column(String, default="")
    is_lesson = Column(Boolean, default=True)
    credits_required = Column(Integer, default=0)
    rating = Column(Integer, default=0)  # stored as rating * 10 (e.g. 48 = 4.8)
    review_count = Column(Integer, default=0)
    certificate_on_completion = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class PlanTag(Base):
    __tablename__ = "plan_tags"

    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)


class PlanLearning(Base):
    __tablename__ = "plan_learnings"

    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    text = Column(String, nullable=False)
    type = Column(String, default="learning")  # learning | audience
