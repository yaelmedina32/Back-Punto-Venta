const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const rutas = express.Router();


rutas.get('/marcas', async(req,res) => {
    const consulta = `select *, 0 as nuevo from marca`;
    const marcas = await procesadorConsultas(consulta);
    return res.json(marcas[0]);
})

rutas.post('/marcas', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.map(element => {
            const consulta = element.nuevo == 1 
            ? `insert into marca (nombre) values ('${element.nombre}')` 
            : `update marca set nombre = '${element.nombre}' where marcaid = ${element.marcaId}`;
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
})

module.exports = rutas;