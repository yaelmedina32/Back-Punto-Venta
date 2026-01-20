const express = require('express');
const proveedoresController = require('../../controladores/operaciones/proveedores.controller');
const ruta = express.Router();

ruta.get('/proveedores', proveedoresController.getProveedores);

ruta.get('/proveedor/:proveedorid', proveedoresController.getProveedor);

ruta.post('/proveedor', proveedoresController.postProveedor);

ruta.delete('/proveedor/:proveedorid', proveedoresController.deleteProveedor);

module.exports = ruta;
