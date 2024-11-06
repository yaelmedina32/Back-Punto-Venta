const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const ruta = express.Router()

ruta.get('/sucursales/:usuarioid', async(req,res) => {
    const usuarioid = req.params.usuarioid;
    const consulta = `select * from sucursal s
    inner join usuarioSucursal us on us.sucursalId = s.sucursalId
    where us.usuarioid = ${usuarioid}`;
    const sucursales = await procesadorConsultas(consulta);
    return res.json(sucursales[0]);
})

ruta.get('/almacenes/:sucursalid', async(req,res) => {
    const sucursalid = req.params.sucursalid;
    const consulta = `select * from almacen where sucursalid = ${sucursalid}`;
    const almacenes = await procesadorConsultas(consulta);
    return res.json(almacenes[0]);
});

ruta.get('/tipopagos', async(req,res) => {
    const consulta = `select * from tipoPago`;
    const tipos = await procesadorConsultas(consulta);
    return res.json(tipos[0]);
}) 
ruta.get('/formaspagos', async(req,res) => {
    const consulta = `select *, 0 as nuevo from tipoPago`;
    const tipos = await procesadorConsultas(consulta);
    return res.json(tipos[0]);
}) 
ruta.post('/formaspagos', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.map(element => {
            const consulta = element.nuevo == 1 

            ? `INSERT INTO  tipopago (descripcion) VALUES ('${element.descripcion}')` 
            : element.nuevo == 2 
            ? `update tipopago set descripcion = '${element.descripcion}' where tipoid = ${element.tipoId}`
            : ` delete FROM tipopago WHERE tipoid = ${element.tipoId} `;
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            console.log(error)
            return res.status(500).send({error: error});
        }
    }
})


module.exports = ruta;