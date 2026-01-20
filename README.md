# Backend Point of Sales

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

Backend for Point of Sales for a small business called "DCTires" a tire store and inventory management in a real world scenario. This project is developed with Node.js, Express and MySQL.

## Context of the project

The DCTires System is born because of the need of a small business called "DCTires" to manage their inventory and sales process. The business has a tire store and they need a system to manage their products, categories, clients, employees, sales, among other features.

## Solved problems

- The business needed a system to manage their inventory and sales process.
- The business needed a system to manage their products, categories, clients, employees, sales, among other features.
- The business needed a system to sale and purchase products quickly and easily.
- The business needed a system to generate reports of sales and purchases.
- The business needed a feature to send messages by WhatsApp to their clients.

## What is this project?
- Managment of products, categories, clients, employees, sales, among other features.
- Sales and purchases management.
- Reports of sales and purchases.
- Users and roles management.
- Authentication and authorization with JWT.
- Dockerized the application to ensure a smooth deployment and scalability.

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
├── middlewares/        # Express middlewares (Auth)
├── routes/             # API Route definitions
├── servicios/          # Business logic and DB interactions
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
- Clone the repository (git clone https://github.com/yaelmedina32/Back-Punto-Venta.git) and navigate to the project directory.
- Create a `.env` file in the root directory with the environment variables on the example provided in the repository.
- Adjust the environment variables to match your local setup, such as DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, HOST, PORT, JWT_SECRET.
- Turn on the Docker compose in the root directory of the project by running `docker-compose up --build`
- The API will be available at `http://localhost:4300` (or `http://localhost:PORT` if you changed the PORT in the .env file)

## My Role and responsabilities in this project 
- Developed all stack in this project, including Node.js, Express, MySQL beacuase of the need of a scalable application.
- Decided to containerize the application using Docker and Docker Compose to ensure a smooth deployment and scalability.
- Made authentication process with JWT to ensure secure access to the API.
- Implemented the RESTful API with Node.js and Express.
- Designed and implemented the database schema with MySQL, all the tables and relationships based in the requirements of the business.
- Rescued all the requirements of the business to ensure a smooth integration of the two parts of the project with constants meetings. 
- Made the frontend development to ensure a smooth integration of the two parts of the project.
