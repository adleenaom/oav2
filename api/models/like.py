from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from database import Base


class UserLike(Base):
    __tablename__ = "user_likes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    likeable_id = Column(Integer, nullable=False)
    likeable_type = Column(String, nullable=False)  # daily_video | series | chapter | article
    created_at = Column(DateTime, server_default=func.now())
