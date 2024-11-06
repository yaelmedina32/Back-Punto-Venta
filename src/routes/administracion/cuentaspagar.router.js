const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const rutas = express.Router();

rutas.get('/pagos/:ordencompraid', async(req,res) => {
    const ordencompraid = req.params.ordencompraid;
    const consulta = `SELECT p.pagoid, p.fechapago, p.monto, p.ordencompraid, 0 nuevo
    FROM  pagoOC p
    where p.ordencompraid = ${ordencompraid}`;
    const pagos = await procesadorConsultas(consulta);
    return res.json(pagos[0]);
});

rutas.get('/foliomax/:ordencompraid', async(req,res) => {
    const ordencompraid = req.params.ordencompraid;
    const consulta = `select case when isnull(max(pagoid)) then 1 else max(pagoid) + 1 end maxpago  
    FROM  pagoOC p
    where ordencompraid = ${ordencompraid}`;
    const maxpago = await procesadorConsultas(consulta);
    return res.json(maxpago[0][0].maxpago);
});

rutas.post('/abonos', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.filter(ele => ele.nuevo == 1).map((element) => {
            const consulta = `insert into pagoOC (monto, fechapago, ordencompraid) values (${element.monto}, now(), ${element.ordencompraid})`;
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesas);
        const consulta = `update ordencompra set pendiente = case when pendiente - ${datos.filter(ele => ele.nuevo == 1).reduce((acum, actual) => acum += actual.monto, 0)} < 0 then 0
        else  pendiente - ${datos.filter(ele => ele.nuevo == 1).reduce((acum, actual) => acum += actual.monto, 0)} end
        ${datos[0].saldada = true ? ', estatusid = 12' : ''}
        where ordencompraid = ${datos[0].ordencompraid}`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send(error);
        }
    }
})

module.exports = rutas;