const express = require('express');
const turnosController = require('../../controladores/administracion/turnos.controller');
const rutas = express.Router();


rutas.get('/turno/:usuarioid/:sucursalid', turnosController.getTurnoActivo);

rutas.get('/turnos/turnosCorte/:turnoId', turnosController.getCortesPorTurno);

rutas.get('/turnos/tunoTipo/:turnoid', turnosController.getProductosPorTurno);

rutas.get('/turnos/:sucursalid', turnosController.getTurnos);

rutas.get('/turnos/pagos/:turnoid', turnosController.getPagosTurno);

rutas.get('/turnos/servicios/:turnoid', turnosController.getServiciosTurno);

rutas.get('/servicios', turnosController.getServicios);

rutas.get('/ventas/turno/:turnoid', turnosController.getVentasTurno);

rutas.get('/ingresos/turno/:turnoid', turnosController.getIngresosTurno);

rutas.get('/historial/retiros', turnosController.getHistorialRetiros);

rutas.get('/historial/cortes', turnosController.getHistorialCortes);

rutas.get('/consultarRetiros', turnosController.getRetirosConsultar);

rutas.post('/retiroEfectivoo', turnosController.postRetiroEfectivo);

rutas.post('/cambiarEstatusRetiro', turnosController.postCambiarEstatusRetiro);

//SE INICIALIZA EL TURNO INSERTANDO UN REGISTRO EN LA TABLA DE TURNO
rutas.post('/turno', turnosController.postTurno);

rutas.put('/terminar/turno', turnosController.putTerminarTurno);


rutas.put('/cancelar/corte', turnosController.putCancelarCorte);

module.exports = rutas;
