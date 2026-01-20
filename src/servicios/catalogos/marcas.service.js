const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerMarcas = async () => {
    const consulta = `select *, 0 as nuevo from marca order by nombre`;
    const marcas = await procesadorConsultas(consulta);
    return marcas[0];
};

const gestionarMarcas = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = element.nuevo == 1 
        ? `insert into marca (nombre) values ('${element.nombre}')` 
        : element.nuevo == 2 
        ? `update marca set nombre = '${element.nombre}' where marcaid = ${element.marcaId}`
        : ` delete FROM marca WHERE marcaid = ${element.marcaId} `;
        
        return procesadorConsultas(consulta);
    });
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerMarcas,
    gestionarMarcas
};
