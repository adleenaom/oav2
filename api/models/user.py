from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    avatar = Column(String, default="")
    phone = Column(String, default="")
    country = Column(String, default="")
    gender = Column(String, default="")
    credits = Column(Integer, default=1000)
    role = Column(String, default="user")  # user | creator | admin
    created_at = Column(DateTime, server_default=func.now())
