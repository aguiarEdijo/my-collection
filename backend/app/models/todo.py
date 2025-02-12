from pydantic import BaseModel
from typing import Optional

class Todo(BaseModel):
    id: Optional[int] = None  # O backend gerará o ID
    title: str
    description: str
    completed: bool = False