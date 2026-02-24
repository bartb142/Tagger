import requests
import json
import os

# Create dummy files
with open("test1.jpg", "wb") as f:
    f.write(b"dummy image 1")
    
with open("test2.jpg", "wb") as f:
    f.write(b"dummy image 2")

data = {
    "description": "Batch test from script",
    "tags_json": json.dumps(["tag1", "tag3"])
}

files = [
    ("files", ("test1.jpg", open("test1.jpg", "rb"), "image/jpeg")),
    ("files", ("test2.jpg", open("test2.jpg", "rb"), "image/jpeg"))
]

print("Sending batch upload request...")
r = requests.post("http://localhost:8000/api/items/batch", data=data, files=files)
print("Status Code:", r.status_code)
print("Response:", json.dumps(r.json(), indent=2, ensure_ascii=False))

# Clean up
os.remove("test1.jpg")
os.remove("test2.jpg")
