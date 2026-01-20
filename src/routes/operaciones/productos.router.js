const express = require('express');
const productosController = require('../../controladores/operaciones/productos.controller');
const rutas = express.Router();

//////////////////////////////////////////////////// CONSULTAS ////////////////////////////////////////////////////

rutas.get('/imprimircotizacion/:productoid', productosController.getImprimirCotizacion);

rutas.get('/cotizacion', productosController.getCotizacion);

rutas.post('/productos', productosController.postProductos);

rutas.get('/productos/servicios', productosController.getProductosServicios);

// rutas.get('/productos/:almacenid', async(req,res) => { ... }) // Was commented out in original file

rutas.get('/productos/inventario/:almacenid', productosController.getProductosInventario);

rutas.post('/productos/resumido/:almacenid', productosController.postProductosResumido);

rutas.get('/producto/:productoid', productosController.getProducto);


rutas.get('/categorias', productosController.getCategorias);

rutas.get('/producto/ubicacion/:productoid/:almacenid', productosController.getProductoUbicacion);

rutas.get('/letraVelocidad', productosController.getLetraVelocidad);


//////////////////////////////////////////////////// INSERCIONES ////////////////////////////////////////////////////

rutas.post('/producto', productosController.postProducto);

rutas.post('/cotizacion', productosController.postCotizacion);

rutas.post('/ubicaciones/producto', productosController.postUbicacionesProducto);

rutas.post('/categorias', productosController.postCategorias);

rutas.post('/letraVelocidad', productosController.postLetraVelocidad);

rutas.post('/servicios', productosController.postServicios);

//////////////////////////////////////////////////// DELETES ////////////////////////////////////////////////////
rutas.delete('/producto/:productoid', productosController.deleteProducto);

//////////////////////////////////////////////////// UPDATES ////////////////////////////////////////////////////


module.exports = rutas;
