const express = require('express');
const configuracionesController = require('../../controladores/configuraciones/configuraciones.controller');
const rutas = express.Router();

rutas.get('/permisoBoton/:usuarioId', configuracionesController.getPermisoBoton);
rutas.post('/permisos', configuracionesController.postPermisos);
rutas.get('/usuarios', configuracionesController.getUsuarios);
rutas.get('/estatus', configuracionesController.getEstatus);
rutas.get('/limites/precios', configuracionesController.getLimitesPrecios);
rutas.get('/asignaciones/:usuarioid', configuracionesController.getAsignaciones);
rutas.get('/botonesPermiso/:usuarioid', configuracionesController.getBotonesPermiso);
rutas.post('/limites/precios', configuracionesController.postLimitesPrecios);
rutas.post('/usuario', configuracionesController.postUsuario);
rutas.put('/permisosbtn', configuracionesController.putPermisosBtn);
rutas.put('/password', configuracionesController.putPassword);
rutas.put('/permisos', configuracionesController.putPermisos);
rutas.put('/usuario', configuracionesController.putUsuario);

module.exports = rutas;
