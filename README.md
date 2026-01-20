# Backend Point of Sales

Backend for Point of Sales, developed with Node.js, Express and MySQL.

## What is this project?
- Managment of products, categories, clients, employees, sales, among other features.
- Sales and purchases management.
- Reports of sales and purchases.
- Users and roles management.
- Authentication and authorization with JWT.

## STACK
- Node.js
- Express
- MySQL
- Docker
- Docker Compose

## Arquitecture
- RESTful API
- MVC Pattern
- Dockerized

## Project Structure

```bash
src/
├── assets/             # Static assets (logos)
├── configuraciones/    # Database and global configs
├── controladores/      # Controllers (Request/Response handling)
│   ├── administracion/
│   ├── catalogos/
│   ├── configuraciones/
│   ├── login/
│   └── operaciones/
├── middlewares/        # Express middlewares (Auth)
├── routes/             # API Route definitions
│   ├── administracion/
│   ├── catalogos/
│   ├── configuraciones/
│   ├── login/
│   └── operaciones/
├── servicios/          # Business logic and DB interactions
│   ├── administracion/
│   ├── catalogos/
│   ├── configuraciones/
│   ├── login/
│   └── operaciones/
└── index.js            # Entry point
```

## Environment Variables
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- HOST
- PORT
- JWT_SECRET

## Installation
- Clone the repository
- Run `docker-compose up --build`
- The API will be available at `http://localhost:4300`

## My Role in this project
- I was responsible for the development of the backend of the Point of Sales project.
- I implemented the RESTful API with Node.js and Express.
- I designed and implemented the database schema with MySQL.
- I used Docker and Docker Compose to containerize the application.
- I made the frontend development to ensure a smooth integration of the two parts of the project.
