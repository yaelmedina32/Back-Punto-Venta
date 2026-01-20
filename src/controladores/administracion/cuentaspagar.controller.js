const cuentaspagarService = require('../../servicios/administracion/cuentaspagar.service');

const getPagos = async (req, res) => {
    try {
        const ordencompraid = req.params.ordencompraid;
        const pagos = await cuentaspagarService.obtenerPagos(ordencompraid);
        return res.json(pagos);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener pagos', error: error.message });
    }
};

const getFolioMax = async (req, res) => {
    try {
        const ordencompraid = req.params.ordencompraid;
        const maxpago = await cuentaspagarService.obtenerMaxFolio(ordencompraid);
        return res.json(maxpago);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener folio maximo', error: error.message });
    }
};

const postAbonos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await cuentaspagarService.registrarAbonos(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send(error);
        }
    }
};

module.exports = {
    getPagos,
    getFolioMax,
    postAbonos
};
