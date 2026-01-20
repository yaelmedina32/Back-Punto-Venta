const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerUbicaciones = async (almacenid) => {
    const consulta = `select *, 0 nuevo from ubicacion where almacenid = ${almacenid} order by pasillo, anaquel, nivel`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerUbicacionesFormateadas = async (almacenid) => {
    const consulta = `SELECT ubicacionid, CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion, CONCAT(pasillo,  anaquel,  nivel) as ubicacionfiltro FROM ubicacion where almacenid = ${almacenid}`;
    const ubicaciones = await procesadorConsultas(consulta); 
    return ubicaciones[0];
};

const obtenerUbicacionesProductoLista = async (almacenid) => {
    const consulta = `SELECT u.ubicacionid, CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion FROM ubicacion u`;
    const ubicaciones = await procesadorConsultas(consulta); 
    return ubicaciones[0];
};

const guardarUbicaciones = async (datos) => {
    let consulta = "";
    const promesas = datos.filter(ele => ele.nuevo != 0).map(element => {
        if(element.nuevo == -1){
            consulta = `delete from ubicacion where ubicacionid = ${element.ubicacionId}`;
        }
        if(element.nuevo == 1){
            consulta = `insert into ubicacion (pasillo, anaquel, nivel, capacidad, almacenid) values ('${element.pasillo}', '${element.anaquel}', '${element.nivel}'
                , ${element.capacidad}, ${element.almacenid});`;
        }
        if(element.nuevo == 2){
            consulta = `update ubicacion set pasillo = '${element.pasillo}', anaquel = '${element.anaquel}', nivel = '${element.nivel}',
            capacidad = ${element.capacidad} where ubicacionId = ${element.ubicacionId}`;
        }
        return procesadorConsultas(consulta);
    });
    await Promise.all( promesas );
    return { mensaje: "Se modificaron los datos correctamente" };
};

module.exports = {
    obtenerUbicaciones,
    obtenerUbicacionesFormateadas,
    obtenerUbicacionesProductoLista,
    guardarUbicaciones
};
