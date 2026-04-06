from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from database import Base


class DailyVideo(Base):
    __tablename__ = "daily_videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    full_title = Column(String, default="")
    category = Column(String, default="")
    description = Column(String, default="")
    video_url = Column(String, default="")
    thumbnail = Column(String, default="")
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=True)
    series_count = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class DailyVideoTag(Base):
    __tablename__ = "daily_video_tags"

    id = Column(Integer, primary_key=True)
    daily_video_id = Column(Integer, ForeignKey("daily_videos.id"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
