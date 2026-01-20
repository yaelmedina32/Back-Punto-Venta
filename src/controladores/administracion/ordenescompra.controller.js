const ordenescompraService = require('../../servicios/administracion/ordenescompra.service');

const postOrdenesCompraConsulta = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ordenescompraService.obtenerOrdenesCompraPorIds(datos);
        return res.json(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error, success: false });
        }
    }
};

const getOrdenesCompra = async (req, res) => {
    const almacenid = req.params.almacenid;
    const estatus = req.params.estatus;
    try {
        const resultado = await ordenescompraService.obtenerOrdenesCompra(almacenid, estatus);
        return res.json(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error, success: false });
        }
    }
};

const getMaxOC = async (req, res) => {
    try {
        const resultado = await ordenescompraService.obtenerMaxOrdenCompra();
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error, success: false });
    }
};

const getOrdenCompra = async (req, res) => {
    const ordencompraid = req.params.ordencompraid;
    try {
        const ordencompra = await ordenescompraService.obtenerOrdenCompraPorId(ordencompraid);
        return res.json(ordencompra);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error, success: false });
        }
    }
};

const getProductosOrdenCompra = async (req, res) => {
    const ordencompraid = req.params.ordencompraid;
    try {
        const resultado = await ordenescompraService.obtenerProductosOrdenCompra(ordencompraid);
        return res.json(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error, success: false });
        }
    }
};

const getDetalleOrdenCompra = async (req, res) => {
    const ordencompraid = req.params.ordencompraid;
    try {
        const datos = await ordenescompraService.obtenerDetalleOrdenCompra(ordencompraid);
        return res.json(datos);
    } catch (error) {
        return res.status(500).send({ error: error, success: false });
    }
};

const getUnidades = async (req, res) => {
    try {
        const unidades = await ordenescompraService.obtenerUnidades();
        return res.json(unidades);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const getCantidadInventario = async (req, res) => {
    const productoid = req.params.productoid;
    const almacenid = req.params.almacenid;
    try {
        const conteo = await ordenescompraService.obtenerCantidadInventario(productoid, almacenid);
        return res.json(conteo);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getContenedores = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const contenedores = await ordenescompraService.obtenerContenedores(almacenid);
        return res.json(contenedores);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postOrdenCompra = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ordenescompraService.crearOrdenCompra(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error, success: false });
        }
    }
};

const postInventario = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ordenescompraService.crearInventario(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: error });
        }
    }
};

const putOrdenCompra = async (req, res) => {
    const { datos } = req.body;
    try {
        const resultado = await ordenescompraService.actualizarOrdenCompra(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

const putNumeroFactura = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ordenescompraService.actualizarNumeroFactura(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send(error);
    }
};

const putEstatusOrdenCompra = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ordenescompraService.actualizarEstatusOrdenCompra(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log(error);
        if (error) return res.status(500).send({ error: error });
    }
};

module.exports = {
    postOrdenesCompraConsulta,
    getOrdenesCompra,
    getMaxOC,
    getOrdenCompra,
    getProductosOrdenCompra,
    getDetalleOrdenCompra,
    getUnidades,
    getCantidadInventario,
    getContenedores,
    postOrdenCompra,
    postInventario,
    putOrdenCompra,
    putNumeroFactura,
    putEstatusOrdenCompra
};
