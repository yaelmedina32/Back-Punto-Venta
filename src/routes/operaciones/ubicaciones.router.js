const express = require('express');
const procesarConsulta = require('../../controladores/procesadorConsultas.controller');

const rutas = express.Router();

rutas.get('/ubicaciones/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `select *, 0 nuevo from ubicacion where almacenid = ${almacenid} order by pasillo, anaquel, nivel`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
});


rutas.get('/ubicaciones/lista/formateadas/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `SELECT ubicacionid, CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion FROM ubicacion where almacenid = ${almacenid}`;
    const ubicaciones = await procesarConsulta(consulta); 
    return res.json(ubicaciones[0]);
})

rutas.get('/ubicaciones/producto/formateadas/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `SELECT pu.productoid, u.ubicacionid, CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion FROM ubicacion u
    inner join productoUbicacion pu on pu.ubicacionid = u.ubicacionid
    where pu.productoid = ${almacenid}`;
    const ubicaciones = await procesarConsulta(consulta); 
    return res.json(ubicaciones[0]);
});

rutas.get('/ubicaciones/producto/lista', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `SELECT pu.productoid, u.ubicacionid, CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion FROM ubicacion u
    inner join productoUbicacion pu on pu.ubicacionid = u.ubicacionid
    where pu.productoid`;
    const ubicaciones = await procesarConsulta(consulta); 
    return res.json(ubicaciones[0]);
})

rutas.post('/ubicaciones', async(req,res) => {
    const datos = req.body.datos;
    let consulta = "";
    const length = datos.length;
    let contador = 0;
    try{
        const promesas = datos.filter(ele => ele.nuevo != 0).map(element => {
            contador++;
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
            return procesarConsulta(consulta);
        });
        await Promise.all( promesas );
        return res.json({mensaje: "Se modificaron los datos correctamente"});
    }catch(error){
        if(error){
            console.log(error);
            return res.status(500).send({error: error});
        }
    }
});

module.exports = rutas;