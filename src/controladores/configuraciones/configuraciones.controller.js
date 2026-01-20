const configuracionesService = require('../../servicios/configuraciones/configuraciones.service');

const getPermisoBoton = async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const botonPermisos = await configuracionesService.obtenerPermisoBoton(usuarioId);
        return res.json(botonPermisos);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const postPermisos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const permisos = await configuracionesService.obtenerPermisos(datos.usuarioid);
        return res.json(permisos);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await configuracionesService.obtenerUsuarios();
        return res.json(usuarios);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getEstatus = async (req, res) => {
    try {
        const estatus = await configuracionesService.obtenerEstatus();
        return res.json(estatus);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getLimitesPrecios = async (req, res) => {
    try {
        const limites = await configuracionesService.obtenerLimitesPrecios();
        return res.json(limites);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getAsignaciones = async (req, res) => {
    const usuarioid = req.params.usuarioid;
    try {
        const permisos = await configuracionesService.obtenerAsignaciones(usuarioid);
        return res.json(permisos);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getBotonesPermiso = async (req, res) => {
    const usuarioid = req.params.usuarioid;
    try {
        const permisos = await configuracionesService.obtenerBotonesPermiso(usuarioid);
        return res.json(permisos);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const postLimitesPrecios = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.guardarLimitesPrecios(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const postUsuario = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.crearUsuario(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const putPermisosBtn = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.actualizarPermisosBtn(datos);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).send(error);
    }
};

const putPassword = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.actualizarPassword(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const putPermisos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.actualizarPermisos(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const putUsuario = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await configuracionesService.actualizarUsuario(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send(error);
    }
};

module.exports = {
    getPermisoBoton,
    postPermisos,
    getUsuarios,
    getEstatus,
    getLimitesPrecios,
    getAsignaciones,
    getBotonesPermiso,
    postLimitesPrecios,
    postUsuario,
    putPermisosBtn,
    putPassword,
    putPermisos,
    putUsuario
};
