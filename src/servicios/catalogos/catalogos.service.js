const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerSucursalesPorUsuario = async (usuarioid) => {
    const consulta = `select * from sucursal s
    inner join usuarioSucursal us on us.sucursalId = s.sucursalId
    where us.usuarioid = ${usuarioid}`;
    const sucursales = await procesadorConsultas(consulta);
    return sucursales[0];
};

const obtenerAlmacenesPorSucursal = async (sucursalid) => {
    const consulta = `select * from almacen where sucursalid = ${sucursalid}`;
    const almacenes = await procesadorConsultas(consulta);
    return almacenes[0];
};

const obtenerTiposPago = async () => {
    const consulta = `select * from tipoPago`;
    const tipos = await procesadorConsultas(consulta);
    return tipos[0];
};

const obtenerFormasPago = async () => {
    const consulta = `select *, 0 as nuevo from tipoPago`;
    const tipos = await procesadorConsultas(consulta);
    return tipos[0];
};

const gestionarFormasPago = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = element.nuevo == 1 
        ? `INSERT INTO  tipopago (descripcion) VALUES ('${element.descripcion}')` 
        : element.nuevo == 2 
        ? `update tipopago set descripcion = '${element.descripcion}' where tipoid = ${element.tipoId}`
        : ` delete FROM tipopago WHERE tipoid = ${element.tipoId} `;
        return procesadorConsultas(consulta);
    });
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerSucursalesPorUsuario,
    obtenerAlmacenesPorSucursal,
    obtenerTiposPago,
    obtenerFormasPago,
    gestionarFormasPago
};
