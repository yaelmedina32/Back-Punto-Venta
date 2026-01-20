const express = require('express');
const ubicacionesController = require('../../controladores/operaciones/ubicaciones.controller');
const rutas = express.Router();

rutas.get('/ubicaciones/:almacenid', ubicacionesController.getUbicaciones);

rutas.get('/ubicaciones/lista/formateadas/:almacenid', ubicacionesController.getUbicacionesFormateadas);

rutas.get('/ubicaciones/producto/lista', ubicacionesController.getUbicacionesProductoLista);

rutas.post('/ubicaciones', ubicacionesController.postUbicaciones);

module.exports = rutas;
