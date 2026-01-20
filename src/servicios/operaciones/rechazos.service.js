const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerRechazos = async () => {
    const consulta = `select *, 0 as nuevo from motivorechazo`;
    const rechazos = await procesadorConsultas(consulta);
    return rechazos[0];
};

const guardarRechazos = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = element.nuevo == 1 
        ? `insert into motivorechazo (motivo) values ('${element.motivo}')` 
        : element.nuevo == 2 
        ? `update motivorechazo set motivo = '${element.motivo}' where motivoId = ${element.motivoId}`
        : ` delete FROM motivorechazo WHERE motivoId = ${element.motivoId} `;
        
        return procesadorConsultas(consulta);
    })
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerRechazos,
    guardarRechazos
};
