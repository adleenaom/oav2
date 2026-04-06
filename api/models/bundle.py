from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base


class Bundle(Base):
    __tablename__ = "bundles"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True, index=True)  # null = standalone (Originals)
    title = Column(String, nullable=False)
    subtitle = Column(String, default="")
    description = Column(String, default="")
    category = Column(String, default="")
    seq_no = Column(Integer, default=0)
    credits_required = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)
    is_free = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    thumbnail = Column(String, default="")
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=True)
