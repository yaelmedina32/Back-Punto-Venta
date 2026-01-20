const ventasService = require('../../servicios/operaciones/ventas.service');

const getInventarioDisponible = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const inventario = await ventasService.obtenerInventarioDisponible(almacenid);
        return res.json(inventario);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getHistorialVentas = async (req, res) => {
    try {
        const historial = await ventasService.obtenerHistorialVentas();
        return res.json(historial);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDetallesPagoOc = async (req, res) => {
    try {
        const detallesoc = await ventasService.obtenerDetallesPagoOc();
        return res.json(detallesoc);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDetallePago = async (req, res) => {
    try {
        const detalles = await ventasService.obtenerDetallePago();
        return res.json(detalles);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDetalleVenta = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const detalles = await ventasService.obtenerDetalleVenta(ventaid);
        return res.json(detalles);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDetalleInventarioVenta = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const detalles = await ventasService.obtenerDetalleInventarioVenta(ventaid);
        return res.json(detalles);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDevoluciones = async (req, res) => {
    try {
        const devoluciones = await ventasService.obtenerDevoluciones();
        return res.json(devoluciones);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getDetalleDeuda = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const detalles = await ventasService.obtenerDetalleDeuda(ventaid);
        return res.json(detalles);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getAbonos = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const abonos = await ventasService.obtenerAbonos(ventaid);
        return res.json(abonos);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postUltimaVenta = async (req, res) => {
    const datos = req.body.datos;
    try {
        const ventaid = await ventasService.obtenerUltimaVenta(datos);
        return res.json(ventaid);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postVender = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ventasService.vender(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

const postAutorizar = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ventasService.autorizar(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

const getImprimirTicket = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const respuesta = await ventasService.imprimirTicket(ventaid);
        return res.json(respuesta);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postAbonos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const response = await ventasService.procesarAbonos(datos);
        return res.status(200).send(response);
    } catch (error) {
        console.error('Error al procesar pagos:', error);
        return res.status(500).send({ message: 'Hubo un error al procesar los pagos', error: error.message });
    }
};

const postEnviarDocumento = async (req, res) => {
    const datos = req.body.datos;
    try {
        const response = await ventasService.enviarDocumento(datos);
        return res.status(200).send(response);
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        return res.status(500).send({ message: 'Hubo un error al enviar la notificación', error: error.message });
    }
};

const putDevolucion = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ventasService.procesarDevolucion(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error });
        }
    }
};

const putCambiarEstatusV = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ventasService.cambiarEstatusVenta(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const putCambiarEstatusOc = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ventasService.cambiarEstatusOrdenCompra(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

module.exports = {
    getInventarioDisponible,
    getHistorialVentas,
    getDetallesPagoOc,
    getDetallePago,
    getDetalleVenta,
    getDetalleInventarioVenta,
    getDevoluciones,
    getDetalleDeuda,
    getAbonos,
    postUltimaVenta,
    postVender,
    postAutorizar,
    getImprimirTicket,
    postAbonos,
    postEnviarDocumento,
    putDevolucion,
    putCambiarEstatusV,
    putCambiarEstatusOc
};
