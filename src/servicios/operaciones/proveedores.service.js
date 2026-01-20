const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerProveedores = async () => {
    const consulta = `select proveedorid, concat(case when alias != '' then concat('(', alias, ')') else '' end, ' ', nombre) nombrefiltro, telefono, rfc, calle,
    nointerior, noexterior, colonia, ciudad, municipio,
    estado, pais, email, cp, alias, nombre from proveedor`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerProveedorPorId = async (proveedorid) => {
    const consulta = `select proveedorid, nombre, telefono, rfc, calle,
    nointerior, noexterior, colonia, ciudad, municipio,
    estado, pais, email, cp, alias from proveedor where proveedorid = ${proveedorid}`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const guardarProveedor = async (datos) => {
    const consulta = datos.tipo == 'edicion' 
    ? `update proveedor set nombre = '${datos.nombre}', telefono = '${datos.telefono}', rfc = '${datos.rfc}', calle = '${datos.calle}',
        noexterior = '${datos.noexterior}', colonia = '${datos.colonia}', ciudad = '${datos.ciuadad}', municipio = '${datos.municipio}', estado = '${datos.estado}', pais = '${datos.pais}',
        email = '${datos.email}', cp = '${datos.cp}', alias= '${datos.alias}' where proveedorid = ${datos.proveedorid}`
    : `insert into proveedor (nombre, telefono, rfc, calle, noexterior, colonia, ciudad, municipio, estado, pais, email, cp, alias)
        values ('${datos.nombre}','${datos.telefono}', '${datos.rfc}', '${datos.calle}', '${datos.noexterior}', '${datos.colonia}', '${datos.ciudad}', '${datos.municipio}', 
        '${datos.estado}', '${datos.pais}', '${datos.email}', '${datos.cp}', '${datos.alias}')`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const eliminarProveedor = async (proveedorid) => {
    const consulta = `delete from proveedor where proveedorid = ${proveedorid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos eliminados correctamente" };
};

module.exports = {
    obtenerProveedores,
    obtenerProveedorPorId,
    guardarProveedor,
    eliminarProveedor
};
