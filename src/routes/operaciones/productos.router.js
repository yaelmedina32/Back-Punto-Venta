const express = require('express');
const productosController = require('../../controladores/operaciones/productos.controller');
const rutas = express.Router();

//////////////////////////////////////////////////// CONSULTAS ////////////////////////////////////////////////////

rutas.get('/imprimircotizacion/:productoid', productosController.getImprimirCotizacion);

rutas.get('/cotizacion', productosController.getCotizacion);
/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products <{productoid, nombre, ancho, alto, roc, tamanorin, precioCompra, categoria, marca, modelo, letraVelocidad, servicios, nombrefiltro}>
 */
rutas.post('/productos', productosController.postProductos);

/**
 * @swagger
 * /productos/servicios:
 *   get:
 *     summary: Get all services from the table "producto" where "categoria" is "Servicio"
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of services <{productoid, nombre, precio}>
 */

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
