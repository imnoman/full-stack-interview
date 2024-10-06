from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for all origins (for development purposes)
origins = [
    "http://localhost:3000",  
    "http://localhost",  
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ticketing"]  
todos_collection = db["tickets"]

# Pydantic models
class TodoItem(BaseModel):
    title: str
    estimated_time: int  # in minutes
    creation_time: datetime = datetime.now()  # Default to now, but this is set later in the database

class TodoInDB(TodoItem):
    id: str

# Helper to serialize MongoDB objects
def serialize_todo(todo):
    return {
        "id": str(todo["_id"]),
        "title": todo["title"],
        "creation_time": todo.get("creation_time", None),  # Use get to avoid KeyError
        "estimated_time": todo["estimated_time"],
    }

# Routes
@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/todos")
def get_todos():
    todos = list(todos_collection.find())
    return [serialize_todo(todo) for todo in todos]

@app.post("/todos")
def add_todo(todo: TodoItem):
    todo_data = todo.dict()
    todo_data["creation_time"] = datetime.now()  # Ensure creation_time is included
    result = todos_collection.insert_one(todo_data)
    return {"id": str(result.inserted_id)}

@app.delete("/todos/{id}")
def delete_todo(id: str):
    result = todos_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}
