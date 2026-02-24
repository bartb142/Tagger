from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid

from . import models, schemas, database

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Local Home Collection Manager")

# Ensure required directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Mount static folders
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return FileResponse("static/index.html")

@app.get("/tags")
def tags_page():
    return FileResponse("static/tags.html")

# --- Tags API ---

@app.get("/api/tags", response_model=List[schemas.Tag])
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Tag).offset(skip).limit(limit).all()

@app.post("/api/tags", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(database.get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
    if db_tag:
        return db_tag
    new_tag = models.Tag(name=tag.name, color=tag.color)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

@app.put("/api/tags/{tag_id}", response_model=schemas.Tag)
def update_tag(tag_id: int, tag_update: schemas.TagUpdate, db: Session = Depends(database.get_db)):
    db_tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    if tag_update.name is not None:
        db_tag.name = tag_update.name
    if tag_update.color is not None:
        db_tag.color = tag_update.color
        
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.delete("/api/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(database.get_db)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"ok": True}

# --- Items API ---

@app.get("/api/items", response_model=List[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Item).offset(skip).limit(limit).all()

@app.post("/api/items", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(database.get_db)):
    db_item = models.Item(name=item.name, description=item.description)
    
    for t_name in item.tags:
        t_name = t_name.strip()
        if not t_name: continue
        tag = db.query(models.Tag).filter(models.Tag.name == t_name).first()
        if not tag:
            tag = models.Tag(name=t_name)
            db.add(tag)
            db.commit()
            db.refresh(tag) # Ensure it has an id
        db_item.tags.append(tag)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items/{item_id}", response_model=schemas.Item)
def read_item(item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.delete("/api/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}

@app.post("/api/items/{item_id}/photos", response_model=List[schemas.Photo])
def upload_photos(item_id: int, files: List[UploadFile] = File(...), db: Session = Depends(database.get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    photos = []
    for file in files:
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        photo = models.Photo(file_path=f"/uploads/{filename}", item_id=item.id)
        db.add(photo)
        photos.append(photo)

    db.commit()
    for p in photos:
        db.refresh(p)
        
    return photos
