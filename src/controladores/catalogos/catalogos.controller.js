const catalogosService = require('../../servicios/catalogos/catalogos.service');

const getSucursales = async (req, res) => {
    try {
        const usuarioid = req.params.usuarioid;
        const sucursales = await catalogosService.obtenerSucursalesPorUsuario(usuarioid);
        return res.json(sucursales);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener sucursales', error: error.message });
    }
};

const getAlmacenes = async (req, res) => {
    try {
        const sucursalid = req.params.sucursalid;
        const almacenes = await catalogosService.obtenerAlmacenesPorSucursal(sucursalid);
        return res.json(almacenes);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener almacenes', error: error.message });
    }
};

const getTiposPago = async (req, res) => {
    try {
        const tipos = await catalogosService.obtenerTiposPago();
        return res.json(tipos);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener tipos de pago', error: error.message });
    }
};

const getFormasPago = async (req, res) => {
    try {
        const tipos = await catalogosService.obtenerFormasPago();
        return res.json(tipos);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener formas de pago', error: error.message });
    }
};

const postFormasPago = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await catalogosService.gestionarFormasPago(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).send({ mensaje: 'No se pudo eliminar la Tipos de pago debido a que hay un producto asociado a ella', code: 400 });
        } else {
            return res.status(500).json({ mensaje: 'error en el codigo', error: error.message });
        }
    }
};

module.exports = {
    getSucursales,
    getAlmacenes,
    getTiposPago,
    getFormasPago,
    postFormasPago
};
