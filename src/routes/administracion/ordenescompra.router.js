const express = require('express');
const ordenescompraController = require('../../controladores/administracion/ordenescompra.controller');
const ruta = express.Router();

/////////////////////////// CONSULTAS ///////////////////////////

ruta.post('/ordenescompra', ordenescompraController.postOrdenesCompraConsulta);

ruta.get('/ordenescompra/:almacenid/:estatus', ordenescompraController.getOrdenesCompra);

ruta.get('/maxOC', ordenescompraController.getMaxOC);

ruta.get('/ordencompra/:ordencompraid', ordenescompraController.getOrdenCompra);

ruta.get('/productos/ordencompra/:ordencompraid', ordenescompraController.getProductosOrdenCompra);

ruta.get('/detalle/ordencompra/:ordencompraid', ordenescompraController.getDetalleOrdenCompra);

ruta.get('/unidades', ordenescompraController.getUnidades);

ruta.get('/cantidad/inventario/:productoid/:almacenid', ordenescompraController.getCantidadInventario);

ruta.get('/contenedores/:almacenid', ordenescompraController.getContenedores);

/////////////////////////// INSERCIONES ///////////////////////////

ruta.post('/ordencompra', ordenescompraController.postOrdenCompra);

ruta.post('/inventario', ordenescompraController.postInventario);

/////////////////////////// ACTUALIZACIONES ///////////////////////////

ruta.put('/ordencompra', ordenescompraController.putOrdenCompra);

ruta.put('/numerofactura', ordenescompraController.putNumeroFactura);

ruta.put('/estatus/ordencompra', ordenescompraController.putEstatusOrdenCompra);

module.exports = ruta;
