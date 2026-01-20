const ubicacionesService = require('../../servicios/operaciones/ubicaciones.service');

const getUbicaciones = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const resultado = await ubicacionesService.obtenerUbicaciones(almacenid);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getUbicacionesFormateadas = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const ubicaciones = await ubicacionesService.obtenerUbicacionesFormateadas(almacenid);
        return res.json(ubicaciones);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getUbicacionesProductoLista = async (req, res) => {
    const almacenid = req.params.almacenid;
    try {
        const ubicaciones = await ubicacionesService.obtenerUbicacionesProductoLista(almacenid);
        return res.json(ubicaciones);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postUbicaciones = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await ubicacionesService.guardarUbicaciones(datos);
        return res.json(resultado);
    } catch (error) {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: error });
        }
    }
};

module.exports = {
    getUbicaciones,
    getUbicacionesFormateadas,
    getUbicacionesProductoLista,
    postUbicaciones
};
