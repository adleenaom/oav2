from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    url = Column(String, default="")
