const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const rutas = express.Router();

rutas.get('/clientes', async(req,res) => {
    const consulta = `SELECT *, (SELECT descripcion FROM estatus e WHERE e.estatusid = c.estatusid) estatus FROM cliente c`;
    const clientes = await procesadorConsultas(consulta);
    return res.json(clientes[0]);
});

rutas.get('/cliente/max', async(req,res) => {
    const consulta = `SELECT max(clienteid) clienteid FROM cliente`;
    const cliente = await procesadorConsultas(consulta);
    return res.json(cliente[0]);
});

rutas.post('/clientes', async(req,res) => {
    console.log("entra");
    const datos = req.body.datos;
    const consulta = `insert into cliente (nombre, fechaalta, correo, telefono, estatusid) values ('${datos.nombre}', now(), '${datos.correo}', '${datos.telefono}', 8)`
    try{
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});   
    }catch(error){
        if(error){
            return res.status(500).send({error});
        }
    }
})

rutas.put('/clientes', async(req,res) => {
    const datos = req.body.datos;
    try{    
        const promesas = datos.map((element) => {
            const consulta = ` update cliente set estatusid = ${element.estatusId} where clienteid = ${element.clienteId}`;
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesas);
        
        return res.status(200).send({mensaje: "Datos insertados correctamente"});   
    }catch(error){
        if(error){
            return res.status(500).send({error});
        }
    }
})

module.exports = rutas;