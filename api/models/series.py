from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Series(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    image = Column(String, default="")
    creator_id = Column(Integer, ForeignKey("creators.id"), nullable=True)


class SeriesTag(Base):
    __tablename__ = "series_tags"

    id = Column(Integer, primary_key=True)
    series_id = Column(Integer, ForeignKey("series.id"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)
