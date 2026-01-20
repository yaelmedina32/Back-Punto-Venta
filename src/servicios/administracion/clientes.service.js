const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerClientes = async () => {
    const consulta = `select numeroCliente, nombreCliente 
        from venta
    where nombreCliente is not null and numeroCliente is not null
    group by numeroCliente, nombreCliente`;
    const clientes = await procesadorConsultas(consulta);
    return clientes[0];
};

const obtenerMaxClienteId = async () => {
    const consulta = `SELECT max(clienteid) clienteid FROM cliente`;
    const cliente = await procesadorConsultas(consulta);
    return cliente[0];
};

const crearCliente = async (datos) => {
    const consulta = `insert into cliente (nombre, fechaalta, correo, telefono, estatusid) values ('${datos.nombre}', now(), '${datos.correo}', '${datos.telefono}', 8)`
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const actualizarClientes = async (datos) => {
    const promesas = datos.map((element) => {
        const consulta = ` update cliente set estatusid = ${element.estatusId} where clienteid = ${element.clienteId}`;
        return procesadorConsultas(consulta);
    })
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerClientes,
    obtenerMaxClienteId,
    crearCliente,
    actualizarClientes
};
