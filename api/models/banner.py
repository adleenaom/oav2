from sqlalchemy import Column, Integer, String
from database import Base


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image = Column(String, default="")
    color = Column(String, default="")
    link_type = Column(String, default="")  # plan | bundle | url
    link_id = Column(String, default="")    # id or URL
