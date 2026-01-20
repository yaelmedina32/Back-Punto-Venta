const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const sjcl = require('sjcl');
const crypt = require('bcryptjs');

const obtenerPermisoBoton = async (usuarioId) => {
    const consulta = `
    SELECT
        b.botonId, b.nombre, m.menuId, usuarioId
        FROM boton b
        LEFT JOIN menu m ON  m.menuId = b.menuId
        LEFT JOIN botonusuario bu ON bu.botonId = b.botonId 
        WHERE usuarioId = ${usuarioId} `;
    const botonPermisos = await procesadorConsultas(consulta);
    return botonPermisos[0];
};

const obtenerPermisos = async (usuarioid) => {
    const consulta = `SELECT up.usuarioid, m.*
    FROM usuarioPermiso up
    INNER JOIN menu m ON m.menuid = up.menuid
    where up.usuarioid = ${usuarioid}
    order by m.nombre`;
    const permisos = await procesadorConsultas(consulta);
    return permisos[0];
};

const obtenerUsuarios = async () => {
    const consulta = `select usuarioid, nombre, acceso, email, direccion, estatusid from usuario`;
    const usuarios = await procesadorConsultas(consulta);
    return usuarios[0];
};

const obtenerEstatus = async () => {
    const consulta = `select estatusid, descripcion from estatus where estatusid in (8,9)`
    const estatus = await procesadorConsultas(consulta);
    return estatus[0];
};

const obtenerLimitesPrecios = async () => {
    const consulta = `select case when isnull(max(descuentoMax)) then 0 else descuentoMax end descuentoMax,
    case when isnull (max(sumaMaxima)) then 0 else sumaMaxima end sumaMaxima
     from limitePrecio`;
    const limites = await procesadorConsultas(consulta);
    return { descuento: limites[0][0].descuentoMax, suma: limites[0][0].sumaMaxima };
};

const obtenerAsignaciones = async (usuarioid) => {
    const consulta = `SELECT m.menuid, m.nombre, case when isnull(up.permisoId ) then 0 ELSE 1 END asignado
    FROM menu m 
    LEFT JOIN usuariopermiso up ON up.menuid = m.menuId 
    AND up.usuarioId = ${usuarioid}`;
    const permisos = await procesadorConsultas(consulta);
    return permisos[0];
};

const obtenerBotonesPermiso = async (usuarioid) => {
    const consulta = `
SELECT DISTINCT
 CASE WHEN ISNULL(up.permisoId) THEN 0 ELSE 1 END AS asignado,
    m.nombre, 
    CASE WHEN ISNULL(b.botonId) THEN 0 ELSE b.botonId END AS botonId,
    CASE WHEN ISNULL(b.nombre) THEN 'no hay boton' ELSE b.nombre END AS nombreBoton,
    CASE WHEN ISNULL(m.menuId) THEN 0 ELSE m.menuId END AS menuId,
    CASE WHEN ISNULL(b.descripcion) THEN 'sin datos' ELSE b.descripcion END AS descripcion,
    CASE WHEN ISNULL(bu.usuarioId) THEN 0 ELSE bu.usuarioId END AS usuarioId
   
FROM 
    menu m
LEFT JOIN 
    boton b ON m.menuId = b.menuId
LEFT JOIN 
    botonusuario bu ON bu.botonId = b.botonId AND bu.usuarioid = ${usuarioid}
LEFT JOIN 
    usuariopermiso up ON up.menuId = m.menuId AND up.usuarioid = ${usuarioid}`;
    const permisos = await procesadorConsultas(consulta);
    return permisos[0];
};

const guardarLimitesPrecios = async (datos) => {
    const consulta = `insert into limitePrecio values(${datos.descuento}, ${datos.suma})`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const crearUsuario = async (datos) => {
    const clave = datos.clave;
    const key = datos.key;
    const decifrado = sjcl.decrypt(key, clave);
    const hashedPassword = await crypt.hash(decifrado, 10)
    const consulta = `insert into usuario (nombre, acceso, clave, fechaalta, email, direccion, estatusId)
    values ('${datos.nombre}', '${datos.acceso}', '${hashedPassword}', now(), '${datos.email}', '${datos.direccion}', 8)`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const actualizarPermisosBtn = async (datos) => {
    for(let i = 0; i < datos.length; i++){
        const menu = datos[i];
        for(let j = 0; j < menu.botones.length; j++) {
            const boton = menu.botones[j];
            const consulta = boton.seleccionado && !boton.preseleccionado 
            ? `insert into botonusuario (botonId, usuarioId) values (${boton.botonId}, ${boton.usuarioId})`
                : !boton.seleccionado 
            ? `delete from botonusuario where usuarioId = ${boton.usuarioId} and botonId = ${boton.botonId}` 
                : null;
            if(consulta){
                await procesadorConsultas(consulta);
            }
        }
    };
    return { message: "Permisos actualizados exitosamente." };
};

const actualizarPassword = async (datos) => {
    const clave = datos.clave;
    const key = datos.key;
    const decifrado = sjcl.decrypt(key, clave);
    const hashedPassword = await crypt.hash(decifrado, 10);
    const consulta = `update usuario set clave = '${hashedPassword}' where usuarioid = ${datos.usuarioid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos Modificados Correctamente" };
};

const actualizarPermisos = async (datos) => {
    let consulta = `delete from usuarioPermiso where usuarioid = ${datos[0].usuarioid}`;
    await procesadorConsultas(consulta);
    const promesas = datos.filter(ele => ele.asignado == 1).map((row) => {
        consulta = `insert into usuarioPermiso (usuarioid, menuid, fechapermiso, estatusid) values (${row.usuarioid}, ${row.menuid}, now(), 8)`;
        return procesadorConsultas(consulta);
    });
    await Promise.all(promesas);
    return { mensaje: "Datos Modificados Correctamente" };
};

const actualizarUsuario = async (datos) => {
    const consulta = `update usuario set nombre = '${datos.nombre}', acceso = '${datos.acceso}', email = ${!datos.email ? `''` : `'${datos.email}'`},
    direccion = ${!datos.direccion ? `''` : `'${datos.direccion}'`}, estatusid = ${datos.estatusid} where usuarioid = ${datos.usuarioid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos Modificados Correctamente" };
};

module.exports = {
    obtenerPermisoBoton,
    obtenerPermisos,
    obtenerUsuarios,
    obtenerEstatus,
    obtenerLimitesPrecios,
    obtenerAsignaciones,
    obtenerBotonesPermiso,
    guardarLimitesPrecios,
    crearUsuario,
    actualizarPermisosBtn,
    actualizarPassword,
    actualizarPermisos,
    actualizarUsuario
};
