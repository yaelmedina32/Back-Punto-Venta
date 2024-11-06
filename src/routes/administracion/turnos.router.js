const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const rutas = express.Router();



rutas.get('/turno/:usuarioid/:sucursalid', async(req,res) => {
    const usuarioid = req.params.usuarioid;
    const sucursalid = req.params.sucursalid;
    const consulta = `select turnoid from turno where usuarioid = ${usuarioid} and sucursalid = ${sucursalid} and fechacierre is null`;
    const turno = await procesadorConsultas(consulta);
    return res.json(turno[0]);
})

rutas.get('/turnos/:sucursalid', async(req,res) => {
    const sucursalid = req.params.sucursalid;
    const consulta = `select u.nombre, t.fechainicio, u.usuarioid, t.turnoid, count(distinct c.corteid) cortes,
    sum(distinct t.cantidadInicial + (select case when isnull(sum(p.monto)) then 0 else sum(p.monto) end 
        from venta v 
        inner join pagoVenta p on p.ventaid = v.ventaid
        where p.turnoid = t.turnoid and p.tipopagoid = 5 and v.estatusId != 3) - 
        (select case when  isnull(sum(monto)) then 0 else sum(monto) end from corte c where c.turnoid = t.turnoid and c.estatusid = 1)) restante,
    t.cantidadinicial
    from turno t 
    inner join usuario u on u.usuarioid = t.usuarioid
    left join corte c on c.turnoid = t.turnoid
    where t.fechaCierre is null and t.sucursalid = ${sucursalid}
    group by u.nombre, t.fechaInicio, u.usuarioid, t.turnoid`;
    const turnos = await procesadorConsultas(consulta);
    return res.json(turnos[0]);
});


rutas.get('/historial/cortes', async(req,res) => {
    const consulta = `SELECT c.corteid, c.monto, date_format(c.fechacorte, '%d/%m/%Y') fechacorte, (SELECT nombre FROM usuario u WHERE u.usuarioid = c.usuarioid) nombre, date_format(t.fechainicio, '%d/%m/%Y') fechainicio,
    CASE when isnull(t.fechacierre) then 'Turno vigente' ELSE date_format(t.fechacierre, '%d/%m/%Y') END fechacierre
    , (select descripcion from estatus e where e.estatusid = c.estatusid) estatus
    FROM corte c 
    INNER JOIN turno t ON t.turnoid = c.turnoid`;
    const cortes = await procesadorConsultas(consulta);
    return res.json(cortes[0]);
})

rutas.post('/corteparcial', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `insert into corte (turnoid, monto, fechacorte, usuarioId, estatusId, tipo) values (${datos.turnoid}, ${datos.monto}, now(), ${datos.usuarioid}, 1, '${datos.tipo}')`;
    try{
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
});

//SE INICIALIZA EL TURNO INSERTANDO UN REGISTRO EN LA TABLA DE TURNO
rutas.post('/turno', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `INSERT INTO turno (usuarioId, fechaInicio, cantidadInicial, sucursalId) 
    VALUES (${datos.usuarioid}, now(), ${datos.cantidad}, ${datos.sucursalid})`;
    try{
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
})

rutas.put('/terminar/turno', async(req,res) => {
    const datos = req.body.datos;
    try{
        let consulta = `update turno set fechacierre = now() where turnoid = ${datos.turnoid}`;
        await procesadorConsultas(consulta);
        consulta = `insert into corte (turnoid, monto, fechacorte, usuarioid, estatusid, tipo)
        select ${datos.turnoid},
        sum(distinct t.cantidadInicial + (select case when isnull(sum(p.monto)) then 0 else sum(p.monto) end from venta v 
            inner join pagoVenta p on p.ventaid = v.ventaid
            where p.turnoid = t.turnoid and p.tipopagoid = 5 and v.estatusId != 3) - 
            (select case when  isnull(sum(monto)) then 0 else sum(monto) end from corte c where c.turnoid = t.turnoid and c.estatusid = 1)),
        now(), ${datos.usuarioid}, 8, 'total'
        from turno t 
        inner join usuario u on u.usuarioid = t.usuarioid
        left join corte c on c.turnoid = t.turnoid
        where t.turnoid = ${datos.turnoid}
        group by u.nombre, t.fechaInicio, u.usuarioid, t.turnoid`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos Actualizados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error})
        }
    }
})


rutas.put('/cancelar/corte', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `update corte set estatusId = 3 where corteid = ${datos.corteid}`;
    try{
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos Actualizados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error})
        }
    }
})

module.exports = rutas;