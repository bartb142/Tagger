import requests
import json

data = {
    "name": "test item",
    "description": "",
    "tags": json.dumps(["tag1", "tag2"])
}
r = requests.post("http://localhost:8000/api/items", data=data)
print(r.status_code)
print(r.json())
