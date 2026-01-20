const express = require('express');
const catalogosController = require('../../controladores/catalogos/catalogos.controller');
const ruta = express.Router()

ruta.get('/sucursales/:usuarioid', catalogosController.getSucursales);

ruta.get('/almacenes/:sucursalid', catalogosController.getAlmacenes);

ruta.get('/tipopagos', catalogosController.getTiposPago);

ruta.get('/formaspagos', catalogosController.getFormasPago);

ruta.post('/formaspagos', catalogosController.postFormasPago);


module.exports = ruta;
