from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False, index=True)
    question = Column(String, nullable=False)
    options_json = Column(String, default="[]")
    correct_option_id = Column(String, default="")
    seq_no = Column(Integer, default=0)
