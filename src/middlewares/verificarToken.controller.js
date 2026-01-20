const express = require('express');
const jwt= require('jsonwebtoken');
const dotenv=require('dotenv')
dotenv.config({path:'.env'})

const verifica = express.Router();
const verificar = verifica.use((req, res , next) =>{
    const token = req.headers.token
    jwt.verify(token, process.env.SECRET, (error, decoded) =>{
        if(!token){
            return res.status(406).send({errorToken:'Error en el Sistema'});
        }
        if(error){
            return res.status(406).send({errorToken:'Error en el Sistema'});
        }
        req.decoded = decoded;
        next();
    })
})
module.exports = verificar;