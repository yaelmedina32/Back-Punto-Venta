const express = require('express');
const authController = require('../../controladores/login/auth.controller');
const app = express();

//Valida Token
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const ruta = express.Router();

ruta.post('/login', authController.postLogin);

ruta.post('/regenerarToken', authController.postRegenerarToken);

module.exports = ruta;
