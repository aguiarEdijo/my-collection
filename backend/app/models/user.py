from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    
    @validator('username')
    def validate_username(cls, v):
        import re
        if not re.match(r"^[a-zA-Z0-9_.-]+$", v):
            raise ValueError('Nome de usuário contém caracteres inválidos')
        return v.strip().lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True

class UserInDB(UserBase):
    id: Optional[int] = None  # Opcional para permitir criação
    password: str
    created_at: datetime
    is_active: bool = True
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None