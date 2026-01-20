const inventarioService = require('../../servicios/operaciones/inventario.service');

const getInventario = async (req, res) => {
    const venta = req.params.venta;
    const almacenid = req.params.almacenid;
    try {
        const inventario = await inventarioService.obtenerInventario(venta, almacenid);
        return res.json(inventario);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const getInventarioExcel = async (req, res) => {
    try {
        const inventarioExcel = await inventarioService.obtenerInventarioExcel();
        return res.json(inventarioExcel);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error })
        }
    }
};

const getInventariosVentas = async (req, res) => {
    const ventaid = req.params.ventaid;
    try {
        const inventario = await inventarioService.obtenerInventariosVentas(ventaid);
        return res.json(inventario);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postInventarioExcel = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await inventarioService.procesarExcelInventario(datos);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postInventarioExcelFaltantes = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await inventarioService.procesarFaltantesExcel(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

const putInventario = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await inventarioService.actualizarInventario(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
};

module.exports = {
    getInventario,
    getInventarioExcel,
    getInventariosVentas,
    postInventarioExcel,
    postInventarioExcelFaltantes,
    putInventario
};
