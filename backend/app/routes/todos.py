from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.models.todo import Todo
from app.models.user import UserInDB
from app.services.todo_service import TodoService
from app.core.dependencies import get_current_user, rate_limit_dependency
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger("todos")
audit_logger = logging.getLogger("audit")

@router.get("/todos/", response_model=List[Todo])
def list_todos(
    request: Request, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(200))
):
    try:
        todos = TodoService.list_todos()
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todos listed by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"LIST_TODOS - User: {current_user.username} - IP: {client_ip} - Count: {len(todos)}")
        return todos
        
    except Exception as e:
        logger.error(f"Error listing todos: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/todos/", response_model=Todo)
def create_todo(
    request: Request, 
    todo: Todo, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(100))
):
    try:
        if not todo.title or len(todo.title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Título do todo é obrigatório"
            )
        
        if len(todo.title) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Título muito longo (máximo 200 caracteres)"
            )
        
        todo.title = todo.title.strip()
        if todo.description:
            todo.description = todo.description.strip()
        
        created_todo = TodoService.create_todo(todo)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todo created: {created_todo.id} by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"CREATE_TODO - ID: {created_todo.id} - User: {current_user.username} - IP: {client_ip} - Title: {todo.title[:50]}")
        return created_todo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating todo: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/todos/{todo_id}", response_model=Todo)
def get_todo(
    request: Request, 
    todo_id: int, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(300))
):
    try:
        todo = TodoService.get_todo(todo_id)
        
        if not todo:
            logger.warning(f"Todo not found: {todo_id} - User: {current_user.username}")
            audit_logger.warning(f"ACCESS_TODO_NOT_FOUND - ID: {todo_id} - User: {current_user.username}")
            raise HTTPException(status_code=404, detail="Todo não encontrado")
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todo accessed: {todo_id} by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"ACCESS_TODO - ID: {todo_id} - User: {current_user.username} - IP: {client_ip}")
        return todo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting todo: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.put("/todos/{todo_id}", response_model=Todo)
def update_todo(
    request: Request, 
    todo_id: int, 
    updated_todo: Todo, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(200))
):
    try:
        existing_todo = TodoService.get_todo(todo_id)
        if not existing_todo:
            raise HTTPException(status_code=404, detail="Todo não encontrado")
        
        if not updated_todo.title or len(updated_todo.title.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Título do todo é obrigatório"
            )
        
        updated_todo.title = updated_todo.title.strip()
        if updated_todo.description:
            updated_todo.description = updated_todo.description.strip()
        
        todo = TodoService.update_todo(todo_id, updated_todo)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todo updated: {todo_id} by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"UPDATE_TODO - ID: {todo_id} - User: {current_user.username} - IP: {client_ip}")
        return todo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating todo: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.patch("/todos/{todo_id}/toggle", response_model=Todo)
def toggle_todo_status(
    request: Request, 
    todo_id: int, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(300))
):
    try:
        existing_todo = TodoService.get_todo(todo_id)
        if not existing_todo:
            raise HTTPException(status_code=404, detail="Todo não encontrado")
        
        todo = TodoService.toggle_todo_status(todo_id)
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todo status toggled: {todo_id} by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"TOGGLE_TODO - ID: {todo_id} - User: {current_user.username} - IP: {client_ip} - NewStatus: {todo.completed if todo else 'unknown'}")
        return todo
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling todo: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.delete("/todos/{todo_id}")
def delete_todo(
    request: Request, 
    todo_id: int, 
    current_user: UserInDB = Depends(get_current_user),
    _: bool = Depends(rate_limit_dependency(100))
):
    try:
        existing_todo = TodoService.get_todo(todo_id)
        if not existing_todo:
            raise HTTPException(status_code=404, detail="Todo não encontrado")
        
        if not TodoService.delete_todo(todo_id):
            raise HTTPException(status_code=404, detail="Todo não encontrado")
        
        client_ip = request.client.host if request.client else "unknown"
        logger.info(f"Todo deleted: {todo_id} by: {current_user.username} - IP: {client_ip}")
        audit_logger.info(f"DELETE_TODO - ID: {todo_id} - User: {current_user.username} - IP: {client_ip}")
        return {"message": "Todo deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting todo: {str(e)} - User: {current_user.username}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )