from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, func
from database import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content_id = Column(Integer, nullable=False)
    content_type = Column(String, nullable=False)  # foryou | bundle | chapter
    current_time = Column(Float, default=0)
    duration = Column(Float, default=0)
    completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
