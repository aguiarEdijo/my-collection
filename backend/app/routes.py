from fastapi import APIRouter, HTTPException, Depends
from fastapi import Depends
from app.auth import authenticate
from app.models import Todo

router = APIRouter()

@router.get("/todos/", response_model=list[Todo], dependencies=[Depends(authenticate)])
def list_todos():
    return todos

# Banco de dados em memória
todos = []

@router.get("/todos/", response_model=list[Todo])
def list_todos():
    return todos

@router.post("/todos/", response_model=Todo)
def create_todo(todo: Todo):
    todos.append(todo)
    return todo

@router.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    for todo in todos:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo não encontrado")

@router.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, updated_todo: Todo):
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos[index] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="Todo não encontrado")

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(index)
            return {"message": "Todo deletado com sucesso"}
    raise HTTPException(status_code=404, detail="Todo não encontrado")
