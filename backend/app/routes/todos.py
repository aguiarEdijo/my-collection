from fastapi import APIRouter, Depends, HTTPException, status
from app.models.todo import Todo
from app.services.todo_service import TodoService
from app.utils.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from typing import List


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

@router.get("/todos/", response_model=List[Todo])
def list_todos(current_user: dict = Depends(get_current_user)):
    return TodoService.list_todos()

@router.post("/todos/", response_model=Todo)
def create_todo(todo: Todo, current_user: dict = Depends(get_current_user)):
    return TodoService.create_todo(todo)

@router.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int, current_user: dict = Depends(get_current_user)):
    todo = TodoService.get_todo(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo não encontrado")
    return todo

@router.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, updated_todo: Todo, current_user: dict = Depends(get_current_user)):
    todo = TodoService.update_todo(todo_id, updated_todo)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo não encontrado")
    return todo

@router.patch("/todos/{todo_id}/toggle", response_model=Todo)
def toggle_todo_status(todo_id: int, current_user: dict = Depends(get_current_user)):
    todo = TodoService.toggle_todo_status(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo não encontrado")
    return todo

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, current_user: dict = Depends(get_current_user)):
    if not TodoService.delete_todo(todo_id):
        raise HTTPException(status_code=404, detail="Todo não encontrado")
    return {"message": "Todo deletado com sucesso"}