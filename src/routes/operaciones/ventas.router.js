const express = require('express');
const ventasController = require('../../controladores/operaciones/ventas.controller');

const rutas = express.Router();

//////////////////////////////////////////////// CONSULTAS ////////////////////////////////////////////////

rutas.get('/inventario/disponible/:almacenid', ventasController.getInventarioDisponible);

rutas.get('/historial/ventas', ventasController.getHistorialVentas);

rutas.get('/detallespagoOc', ventasController.getDetallesPagoOc);

rutas.get('/detallePago', ventasController.getDetallePago);

rutas.get('/detalle/venta/:ventaid', ventasController.getDetalleVenta);

rutas.get('/detalle/inventario/venta/:ventaid', ventasController.getDetalleInventarioVenta);

rutas.get('/devoluciones', ventasController.getDevoluciones);

rutas.get('/detalle/deuda/:ventaid', ventasController.getDetalleDeuda);

rutas.get('/abonos/:ventaid', ventasController.getAbonos);

rutas.post('/ultimaventa', ventasController.postUltimaVenta);

//////////////////////////////////////////////// INSERCIONES ////////////////////////////////////////////////


rutas.post('/vender', ventasController.postVender);

rutas.post('/autorizar', ventasController.postAutorizar);

rutas.get('/imprimirTicket/:ventaid', ventasController.getImprimirTicket);

rutas.post('/abonos', ventasController.postAbonos);

rutas.post('/enviarDocumento', ventasController.postEnviarDocumento);

//////////////////////////////////////////////// MODIFICACIONES ////////////////////////////////////////////////

rutas.put('/devolucion', ventasController.putDevolucion);

rutas.put('/cambiarEstatusV', ventasController.putCambiarEstatusV);

rutas.put('/cambiarEstatusOc', ventasController.putCambiarEstatusOc);

module.exports = rutas;
