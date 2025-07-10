from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import todos, auth
from app.core.startup import init_test_environment
from app.core.logging_config import setup_logging

app = FastAPI(title="My Collection API", version="1.0.0")

app.include_router(todos.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    setup_logging()
    init_test_environment()

@app.get("/")
def read_root():
    return {"message": "My Collection API está funcionando!"}