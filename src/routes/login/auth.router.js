const crypt = require('bcryptjs');
const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const sjcl = require('sjcl');

const ruta = express.Router();

ruta.post('/login', async(req,res) => {
    const usuario = req.body.acceso;
    const clave = req.body.clave;
    const key = req.body.key;

    const decifrado = sjcl.decrypt(key, clave);
    console.log(decifrado);

    
    const hashedPassword = await crypt.hash(decifrado, 10)
    console.log(hashedPassword);

    const consulta = `select usuarioid, nombre, estatusid, clave from usuario where acceso = '${usuario}'`;
    const datosUsuario = await procesadorConsultas(consulta);

    if(datosUsuario[0].length <= 0){
        return res.status(200).send({mensaje: "Usuario no encontrado", success: false});
    }
    crypt.compare(decifrado, datosUsuario[0][0].clave, function(err, response){
        if(err){
            return res.status(500).send({error: err});
        }if(response){
            const datos = {
                usuarioid: datosUsuario[0][0].usuarioid,
                nombre: datosUsuario[0][0].nombre,
                estatus: datosUsuario[0][0].estatusid
            }
            return res.status(200).send(datos);
        }
        return res.status(200).send({mensaje: "Usuario no encontrado", success: false});
    })
});

module.exports = ruta;