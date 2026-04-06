from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    duration = Column(String, default="")
    seq_no = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    thumbnail = Column(String, default="")
