from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Content(Base):
    """Atomic content unit within a chapter — video, survey, or image."""
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # video | survey | image
    url = Column(String, default="")       # video url or image url
    caption = Column(String, default="")   # image caption
    question = Column(String, default="")  # survey question
    options_json = Column(String, default="[]")  # survey options as JSON string
    seq_no = Column(Integer, default=0)
