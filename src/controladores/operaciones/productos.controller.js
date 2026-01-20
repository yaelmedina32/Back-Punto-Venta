const productosService = require('../../servicios/operaciones/productos.service');

const getImprimirCotizacion = async (req, res) => {
    const productoid = req.params.productoid;
    try {
        const respuesta = await productosService.imprimirCotizacion(productoid);
        return res.send(respuesta); // Assuming imprimirCotizacion returns a string or simple response
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getCotizacion = async (req, res) => {
    try {
        const resultado = await productosService.obtenerCotizacion();
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postProductos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.obtenerProductos(datos);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProductosServicios = async (req, res) => {
    try {
        const servicios = await productosService.obtenerProductosServicios();
        return res.json(servicios);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProductosInventario = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const resultado = await productosService.obtenerProductosInventario(almacenid);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postProductosResumido = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.obtenerProductosResumido(datos);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProducto = async (req, res) => {
    const productoid = req.params.productoid;
    try {
        const resultado = await productosService.obtenerProductoPorId(productoid);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getCategorias = async (req, res) => {
    try {
        const resultado = await productosService.obtenerCategorias();
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProductoUbicacion = async (req, res) => {
    const productoid = req.params.productoid;
    const almacenid = req.params.almacenid;
    try {
        const ubicaciones = await productosService.obtenerUbicacionProducto(productoid, almacenid);
        return res.json(ubicaciones);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getLetraVelocidad = async (req, res) => {
    try {
        const letras = await productosService.obtenerLetraVelocidad();
        return res.json(letras);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postProducto = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarProducto(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log('producto', error);
        return res.status(500).send(error);
    }
};

const postCotizacion = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarCotizacion(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log('cotizacion', error);
        if (error.message === "ProductoId no válido") {
            return res.status(400).send({ mensaje: error.message });
        }
        return res.status(500).send({ error: error });
    }
};

const postUbicacionesProducto = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarUbicacionesProducto(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const postCategorias = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarCategorias(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send(error);
    }
};

const postLetraVelocidad = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarLetraVelocidad(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: error });
        }
    }
};

const postServicios = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await productosService.guardarServicios(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: error });
        }
    }
};

const deleteProducto = async (req, res) => {
    const productoid = req.params.productoid;
    try {
        const resultado = await productosService.eliminarProducto(productoid);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error.sqlMessage && error.sqlMessage.includes('FOREIGN KEY')) {
            return res.status(400).send({ foranea: 'Producto con inventario' });
        }
        return res.status(500).send(error);
    }
};

module.exports = {
    getImprimirCotizacion,
    getCotizacion,
    postProductos,
    getProductosServicios,
    getProductosInventario,
    postProductosResumido,
    getProducto,
    getCategorias,
    getProductoUbicacion,
    getLetraVelocidad,
    postProducto,
    postCotizacion,
    postUbicacionesProducto,
    postCategorias,
    postLetraVelocidad,
    postServicios,
    deleteProducto
};
