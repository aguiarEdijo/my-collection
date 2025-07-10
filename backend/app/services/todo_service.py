from app.models.todo import Todo
from typing import Optional

todos_db = []

class TodoService:
    @staticmethod
    def list_todos():
        return todos_db
    
    @staticmethod
    def create_todo(todo: Todo) -> Todo:
        new_id = len(todos_db) + 1
        todo.id = new_id
        todos_db.append(todo)
        return todo

    @staticmethod
    def get_todo(todo_id: int):
        for todo in todos_db:
            if todo.id == todo_id:
                return todo
        return None

    @staticmethod
    def update_todo(todo_id: int, updated_todo: Todo):
        for index, todo in enumerate(todos_db):
            if todo.id == todo_id:
                todos_db[index] = updated_todo
                return updated_todo
        return None
    
    @staticmethod
    def toggle_todo_status(todo_id: int) -> Optional[Todo]:
        for index, todo in enumerate(todos_db):
            if todo.id == todo_id:
                # Inverte o status de completed
                todos_db[index].completed = not todo.completed
                return todos_db[index]
        return None

    @staticmethod
    def delete_todo(todo_id: int):
        for index, todo in enumerate(todos_db):
            if todo.id == todo_id:
                todos_db.pop(index)
                return True
        return False