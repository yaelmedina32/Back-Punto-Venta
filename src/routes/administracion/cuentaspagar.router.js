const express = require('express');
const cuentaspagarController = require('../../controladores/administracion/cuentaspagar.controller');
const rutas = express.Router();

rutas.get('/pagos/:ordencompraid', cuentaspagarController.getPagos);
rutas.get('/foliomax/:ordencompraid', cuentaspagarController.getFolioMax);
rutas.post('/abonos', cuentaspagarController.postAbonos);

module.exports = rutas;
