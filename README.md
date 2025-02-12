# Todo App

A simple Todo application built with **FastAPI** (backend) and **React** (frontend). This project is containerized with **Docker** for easy setup and deployment.

---

## Features

- **Create, Read, Update, and Delete (CRUD) Todos**.
- Mark Todos as **completed** or **pending**.
- **User authentication** (JWT-based).
- **Responsive UI** built with Ant Design.
- **Dockerized** for easy development and deployment.

---

## Technologies

- **Backend**: FastAPI, Docker.
- **Frontend**: React, Vite, Ant Design, Docker.
- **Authentication**: JWT (JSON Web Tokens).

### Steps

1. Clone the repository:

```bash
   git clone https://github.com/aguiarEdijo/my-collection.git/
   cd my-collection
```

2. Start the project with Docker Compose:

```bash
docker-compose up --build
```

3. Access the application:

Frontend: http://localhost:5173

Backend: http://localhost:8000

API Docs (Swagger UI): http://localhost:8000/docs
