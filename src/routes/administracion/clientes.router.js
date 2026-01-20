const express = require('express');
const clientesController = require('../../controladores/administracion/clientes.controller');
const rutas = express.Router();

rutas.get('/clientes', clientesController.getClientes);
rutas.get('/cliente/max', clientesController.getMaxClienteId);
rutas.post('/clientes', clientesController.postCliente);
rutas.put('/clientes', clientesController.putClientes);

module.exports = rutas;
