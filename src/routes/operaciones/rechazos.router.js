const express = require('express');
const rechazosController = require('../../controladores/operaciones/rechazos.controller');
const rutas = express.Router();


rutas.get('/rechazos', rechazosController.getRechazos);

rutas.post('/rechazos', rechazosController.postRechazos);

module.exports = rutas;
