const rechazosService = require('../../servicios/operaciones/rechazos.service');

const getRechazos = async (req, res) => {
    try {
        const rechazos = await rechazosService.obtenerRechazos();
        return res.json(rechazos);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postRechazos = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await rechazosService.guardarRechazos(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log("Error completo:", error); 
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).send({ mensaje: 'No se pudo eliminar el Rechazo debido a que hay un producto asociado a el', code: 400 });
        } else {
            return res.status(500).json({ mensaje: 'error en el codigo', error: error.message, code: 500 });
        }
    }
};

module.exports = {
    getRechazos,
    postRechazos
};
