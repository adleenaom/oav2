from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    body = Column(String, default="")
    type = Column(String, default="general")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
