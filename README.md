# Backend Point of Sales

Backend for Point of Sales for a small business called "DCTires" a tire store and inventory management. This project is developed with Node.js, Express and MySQL.

DCTires System is a web application that allows the management of products, categories, clients, employees, sales, among other features, with all the features completly customized to the needs of the business. Making the sales process easier and more efficient.

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

## My Role and responsabilities in this project 
- Developed all stack in this project, including Node.js, Express, MySQL beacuase of the need of a scalable application.
- Decided to containerize the application using Docker and Docker Compose to ensure a smooth deployment and scalability.
- Made authentication process with JWT to ensure secure access to the API.
- Implemented the RESTful API with Node.js and Express.
- Designed and implemented the database schema with MySQL, all the tables and relationships based in the requirements of the business.
- Rescued all the requirements of the business to ensure a smooth integration of the two parts of the project with constants meetings. 
- Made the frontend development to ensure a smooth integration of the two parts of the project.
