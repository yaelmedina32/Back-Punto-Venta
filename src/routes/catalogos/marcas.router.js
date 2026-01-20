const express = require('express');
const marcasController = require('../../controladores/catalogos/marcas.controller');
const rutas = express.Router();

rutas.get('/marcas', marcasController.getMarcas);
rutas.post('/marcas', marcasController.postMarcas);

module.exports = rutas;
