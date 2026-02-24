from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class TagBase(BaseModel):
    name: str
    color: Optional[str] = "#4f46e5"

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class Tag(TagBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class PhotoBase(BaseModel):
    file_path: str

class Photo(PhotoBase):
    id: int
    item_id: int
    
    model_config = ConfigDict(from_attributes=True)

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = ""

class ItemCreate(ItemBase):
    tags: List[str] = []

class ItemUpdate(BaseModel):
    description: Optional[str] = None
    tags: Optional[List[str]] = None

class Item(ItemBase):
    id: int
    tags: List[Tag] = []
    photos: List[Photo] = []
    
    model_config = ConfigDict(from_attributes=True)
