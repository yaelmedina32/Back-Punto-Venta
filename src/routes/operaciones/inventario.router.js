const express = require('express');
const inventarioController = require('../../controladores/operaciones/inventario.controller');
const rutas = express.Router();

rutas.get('/inventario/:venta/:almacenid', inventarioController.getInventario);
rutas.get('/inventarioExcel', inventarioController.getInventarioExcel);

rutas.get('/inventarios/ventas/:ventaid', inventarioController.getInventariosVentas);

rutas.post('/inventario/excel', inventarioController.postInventarioExcel);

rutas.post('/inventario/excel/faltantes', inventarioController.postInventarioExcelFaltantes);

rutas.put('/inventario', inventarioController.putInventario);

module.exports = rutas;
