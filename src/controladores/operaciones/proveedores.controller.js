const proveedoresService = require('../../servicios/operaciones/proveedores.service');

const getProveedores = async (req, res) => {
    try {
        const resultado = await proveedoresService.obtenerProveedores();
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const getProveedor = async (req, res) => {
    const proveedorid = req.params.proveedorid;
    try {
        const resultado = await proveedoresService.obtenerProveedorPorId(proveedorid);
        return res.json(resultado);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
};

const postProveedor = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await proveedoresService.guardarProveedor(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

const deleteProveedor = async (req, res) => {
    const proveedorid = req.params.proveedorid;
    try {
        const resultado = await proveedoresService.eliminarProveedor(proveedorid);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error: error });
        }
    }
};

module.exports = {
    getProveedores,
    getProveedor,
    postProveedor,
    deleteProveedor
};
