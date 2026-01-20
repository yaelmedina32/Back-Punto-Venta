const turnosService = require('../../servicios/administracion/turnos.service');

const getTurnoActivo = async (req, res) => {
    const usuarioid = req.params.usuarioid;
    const sucursalid = req.params.sucursalid;
    try {
        const turno = await turnosService.obtenerTurnoActivo(usuarioid, sucursalid);
        return res.json(turno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getCortesPorTurno = async (req, res) => {
    const turnoId = parseInt(req.params.turnoId, 10);
    try {
        const cortes = await turnosService.obtenerCortesPorTurno(turnoId);
        return res.json(cortes);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProductosPorTurno = async (req, res) => {
    const turnoid = req.params.turnoid;
    try {
        const productos = await turnosService.obtenerProductosPorTurno(turnoid);
        return res.json(productos);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getTurnos = async (req, res) => {
    const sucursalid = req.params.sucursalid;
    try {
        const turnos = await turnosService.obtenerTurnos(sucursalid);
        return res.json(turnos);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getPagosTurno = async (req, res) => {
    const turnoid = req.params.turnoid;
    try {
        const pagosTurno = await turnosService.obtenerPagosTurno(turnoid);
        return res.json(pagosTurno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getServiciosTurno = async (req, res) => {
    const turnoid = req.params.turnoid;
    try {
        const serviciosTurno = await turnosService.obtenerServiciosTurno(turnoid);
        return res.json(serviciosTurno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getServicios = async (req, res) => {
    try {
        const servicios = await turnosService.obtenerServicios();
        return res.json(servicios);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getVentasTurno = async (req, res) => {
    const turnoid = req.params.turnoid;
    try {
        const ventasTurno = await turnosService.obtenerVentasTurno(turnoid);
        return res.json(ventasTurno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getIngresosTurno = async (req, res) => {
    const turnoid = req.params.turnoid;
    try {
        const pagosTurno = await turnosService.obtenerIngresosTurno(turnoid);
        return res.json(pagosTurno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getHistorialRetiros = async (req, res) => {
    try {
        const retirosTurno = await turnosService.obtenerHistorialRetiros();
        return res.json(retirosTurno);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getHistorialCortes = async (req, res) => {
    try {
        const cortes = await turnosService.obtenerHistorialCortes();
        return res.json(cortes);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getRetirosConsultar = async (req, res) => {
    try {
        const retiros = await turnosService.obtenerRetirosConsultar();
        return res.json(retiros);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const postRetiroEfectivo = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await turnosService.crearRetiroEfectivo(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postCambiarEstatusRetiro = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await turnosService.cambiarEstatusRetiro(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: error });
        }
    }
};

const postTurno = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await turnosService.crearTurno(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const putTerminarTurno = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await turnosService.terminarTurno(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error })
        }
    }
};

const putCancelarCorte = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await turnosService.cancelarCorte(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error })
        }
    }
};

module.exports = {
    getTurnoActivo,
    getCortesPorTurno,
    getProductosPorTurno,
    getTurnos,
    getPagosTurno,
    getServiciosTurno,
    getServicios,
    getVentasTurno,
    getIngresosTurno,
    getHistorialRetiros,
    getHistorialCortes,
    getRetirosConsultar,
    postRetiroEfectivo,
    postCambiarEstatusRetiro,
    postTurno,
    putTerminarTurno,
    putCancelarCorte
};
