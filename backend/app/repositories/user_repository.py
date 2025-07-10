from typing import Optional, List
from datetime import datetime
from app.models.user import UserInDB

class UserRepository:
    def __init__(self):
        self._users: List[UserInDB] = []
        self._next_id = 1
    
    def create(self, user: UserInDB) -> UserInDB:
        user.id = self._next_id
        self._next_id += 1
        self._users.append(user)
        return user
    
    def get_by_username(self, username: str) -> Optional[UserInDB]:
        return next((u for u in self._users if u.username == username), None)
    
    def get_by_id(self, user_id: int) -> Optional[UserInDB]:
        return next((u for u in self._users if u.id == user_id), None)
    
    def update(self, user: UserInDB) -> UserInDB:
        index = next((i for i, u in enumerate(self._users) if u.id == user.id), None)
        if index is not None:
            self._users[index] = user
        return user
    
    def deactivate(self, username: str) -> bool:
        user = self.get_by_username(username)
        if user:
            user.is_active = False
            return True
        return False
    
    def exists_username(self, username: str) -> bool:
        return any(u.username == username for u in self._users)
    
    def get_all(self) -> List[UserInDB]:
        return self._users.copy()

user_repository = UserRepository() 