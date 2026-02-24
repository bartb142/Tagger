from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base

# Association table for the many-to-many relationship between items and tags
item_tag_association = Table(
    'item_tag',
    Base.metadata,
    Column('item_id', Integer, ForeignKey('items.id', ondelete="CASCADE"), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete="CASCADE"), primary_key=True)
)

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, default="")
    
    tags = relationship("Tag", secondary=item_tag_association, back_populates="items")
    photos = relationship("Photo", back_populates="item", cascade="all, delete-orphan")

class Photo(Base):
    __tablename__ = "photos"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, nullable=False)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"))
    
    item = relationship("Item", back_populates="photos")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    color = Column(String, default="#4f46e5")
    
    items = relationship("Item", secondary=item_tag_association, back_populates="tags")
