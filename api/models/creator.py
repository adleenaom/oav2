from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    avatar = Column(String, default="")
    job_title = Column(String, default="")
    bio = Column(String, default="")
    homepage = Column(String, default="")
    offerings = Column(String, default="")  # JSON array as string
