const clientesService = require('../../servicios/administracion/clientes.service');

const getClientes = async (req, res) => {
    try {
        const clientes = await clientesService.obtenerClientes();
        return res.json(clientes);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const getMaxClienteId = async (req, res) => {
    try {
        const cliente = await clientesService.obtenerMaxClienteId();
        return res.json(cliente);
    } catch (error) {
        return res.status(500).send({ error });
    }
};

const postCliente = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await clientesService.crearCliente(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error });
        }
    }
};

const putClientes = async (req, res) => {
    const datos = req.body.datos;
    try {
        const resultado = await clientesService.actualizarClientes(datos);
        return res.status(200).send(resultado);
    } catch (error) {
        if (error) {
            return res.status(500).send({ error });
        }
    }
};

module.exports = {
    getClientes,
    getMaxClienteId,
    postCliente,
    putClientes
};
