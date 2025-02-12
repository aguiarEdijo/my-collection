from app.models.user import User, UserInDB
from app.utils.security import verify_password, get_password_hash, create_access_token

# Banco de dados em memória (substitua por um banco de dados real no futuro)
users_db = []

class AuthService:
    @staticmethod
    def authenticate_user(username: str, password: str):
        user = next((user for user in users_db if user.username == username), None)
        if not user or not verify_password(password, user.password):
            return None
        return user

    @staticmethod
    def create_user(user: User):
        hashed_password = get_password_hash(user.password)
        user_in_db = UserInDB(**user.dict(exclude={'password'}), id=len(users_db) + 1, password=hashed_password)
        users_db.append(user_in_db)
        return user_in_db


    @staticmethod
    def create_access_token_for_user(user: UserInDB):
        access_token = create_access_token(data={"sub": user.username})
        return access_token