const marcasService = require('../../servicios/catalogos/marcas.service');

const getMarcas = async (req, res) => {
    try {
        const marcas = await marcasService.obtenerMarcas();
        return res.json(marcas);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al obtener marcas', error: error.message });
    }
};

const postMarcas = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await marcasService.gestionarMarcas(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        console.log("Error completo:", error); 
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).send({ mensaje: 'No se pudo eliminar la Marca debido a que hay un producto asociado a ella', code: 400 });
        } else {
            console.log('surgio un error', error);
            return res.status(500).json({ mensaje: 'error en el codigo', error: error.message });
        }
    }
};

module.exports = {
    getMarcas,
    postMarcas
};
