const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const ruta = express.Router();

ruta.get('/proveedores', async(req,res) => {
    const consulta = `select proveedorid, nombre, telefono, rfc, calle,
    nointerior, noexterior, colonia, ciudad, municipio,
    estado, pais, email, cp from proveedor`;
    const resultado = await procesadorConsultas(consulta);
    return res.json(resultado[0]);
})

ruta.get('/proveedor/:proveedorid', async(req,res) => {
    const proveedorid = req.params.proveedorid;
    const consulta = `select proveedorid, nombre, telefono, rfc, calle,
    nointerior, noexterior, colonia, ciudad, municipio,
    estado, pais, email, cp from proveedor where proveedorid = ${proveedorid}`;
    const resultado = await procesadorConsultas(consulta);
    return res.json(resultado[0]);
});

ruta.post('/proveedor', async(req,res) => {
    const datos = req.body.datos;
    try{
        const consulta = datos.tipo == 'edicion' 
        ? `update proveedor set nombre = '${datos.nombre}', telefono = '${datos.telefono}', rfc = '${datos.rfc}', calle = '${datos.calle}',
            noexterior = '${datos.noexterior}', colonia = '${datos.colonia}', ciudad = '${datos.ciuadad}', municipio = '${datos.municipio}', estado = '${datos.estado}', pais = '${datos.pais}',
            email = '${datos.email}', cp = '${datos.cp}' where proveedorid = ${datos.proveedorid}`
        : `insert into proveedor (nombre, telefono, rfc, calle, noexterior, colonia, ciudad, municipio, estado, pais, email, cp)
            values ('${datos.nombre}','${datos.telefono}', '${datos.rfc}', '${datos.calle}', '${datos.noexterior}', '${datos.colonia}', '${datos.ciudad}', '${datos.municipio}', 
            '${datos.estado}', '${datos.pais}', '${datos.email}', '${datos.cp}')`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
    
})

module.exports = ruta;