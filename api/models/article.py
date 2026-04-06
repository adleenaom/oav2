from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    url = Column(String, default="")
    image = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())
