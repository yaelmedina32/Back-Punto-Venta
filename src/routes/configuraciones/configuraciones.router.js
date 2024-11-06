const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const rutas = express.Router();
const sjcl = require('sjcl');
const crypt = require('bcryptjs');

/////////////////////////////////////////////////// CONSULTAS //////////////////////////////////////////////////////////////////////////////////////////////////////
rutas.get('/permisoBoton/:usuarioId', async(req, res)=> {
    const { usuarioId } = req.params;
    const consulta = `
    SELECT
        b.botonId, b.nombre, m.menuId, usuarioId
        FROM boton b
        LEFT JOIN menu m ON  m.menuId = b.menuId
        LEFT JOIN botonusuario bu ON bu.botonId = b.botonId 
        WHERE usuarioId = ${usuarioId} `  
        console.log(consulta)  
    const botonPermisos = await procesadorConsultas(consulta);
    return res.json(botonPermisos[0]);
    
});
rutas.post('/permisos', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `SELECT up.usuarioid, m.*
    FROM usuarioPermiso up
    INNER JOIN menu m ON m.menuid = up.menuid
    where up.usuarioid = ${datos.usuarioid}
    order by m.nombre`;
    const permisos = await procesadorConsultas(consulta);
    return res.json(permisos[0]);
});

rutas.get('/usuarios', async(req,res) => {
    const consulta = `select usuarioid, nombre, acceso, email, direccion, estatusid from usuario`;
    const usuarios = await procesadorConsultas(consulta);
    return res.json(usuarios[0]);
});

rutas.get('/estatus', async(req,res) => {
    const consulta = `select estatusid, descripcion from estatus where estatusid in (8,9)`
    const estatus = await procesadorConsultas(consulta);
    return res.json(estatus[0]);
});

rutas.get('/limites/precios', async(req,res) => {
    const consulta = `select case when isnull(max(descuentoMax)) then 0 else descuentoMax end descuentoMax,
    case when isnull (max(sumaMaxima)) then 0 else sumaMaxima end sumaMaxima
     from limitePrecio`;
    const limites = await procesadorConsultas(consulta);
    return res.json({descuento: limites[0][0].descuentoMax, suma: limites[0][0].sumaMaxima});
})

rutas.get('/asignaciones/:usuarioid', async(req,res) => {
    const usuarioid = req.params.usuarioid;
    const consulta = `SELECT m.menuid, m.nombre, case when isnull(up.permisoId ) then 0 ELSE 1 END asignado
    FROM menu m 
    LEFT JOIN usuariopermiso up ON up.menuid = m.menuId 
    AND up.usuarioId = ${usuarioid}`;
    console.log(consulta);
    const permisos = await procesadorConsultas(consulta);
    return res.json(permisos[0]);
})
rutas.get('/botonesPermiso/:usuarioid', async(req,res) => {
    const usuarioid = req.params.usuarioid;
    const consulta = `
SELECT DISTINCT
 CASE WHEN ISNULL(up.permisoId) THEN 0 ELSE 1 END AS asignado,
    m.nombre, 
    CASE WHEN ISNULL(b.botonId) THEN 0 ELSE b.botonId END AS botonId,
    CASE WHEN ISNULL(b.nombre) THEN 'no hay boton' ELSE b.nombre END AS nombreBoton,
    CASE WHEN ISNULL(m.menuId) THEN 0 ELSE m.menuId END AS menuId,
    CASE WHEN ISNULL(bu.usuarioId) THEN 0 ELSE bu.usuarioId END AS usuarioId
   
FROM 
    menu m
LEFT JOIN 
    boton b ON m.menuId = b.menuId
LEFT JOIN 
    botonusuario bu ON bu.botonId = b.botonId 
LEFT JOIN 
    usuariopermiso up ON up.menuId = m.menuId AND up.usuarioId = ${usuarioid}`;
    const permisos = await procesadorConsultas(consulta);
    return res.json(permisos[0]);
})


rutas.post('/limites/precios', async(req,res) => {
    const datos = req.body.datos
    try{
        const consulta = `insert into limitePrecio values(${datos.descuento}, ${datos.suma})`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error})
        }
    }
});

rutas.post('/usuario', async(req,res) => {
    const datos = req.body.datos;
    const clave = datos.clave;
    const key = datos.key;
    try{
        const decifrado = sjcl.decrypt(key, clave);
        const hashedPassword = await crypt.hash(decifrado, 10)
        const consulta = `insert into usuario (nombre, acceso, clave, fechaalta, email, direccion, estatusId)
        values ('${datos.nombre}', '${datos.acceso}', '${hashedPassword}', now(), '${datos.email}', '${datos.direccion}', 8)`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});

    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }

})
;

rutas.put('/permisosbtn', async(req,res) => {
    const datos = req.body.datos;
    console.log(datos)
    for(let i = 0; i < datos.length; i++){
        const menu = datos[i];
       const promesas =  menu.botones.map((boton) => {
            const consulta = boton.seleccionado && !boton.preseleccionado 
            ? `insert into botonusuario (botonId, usuarioId) values (${boton.botonId}, ${boton.usuarioId})`
                : !boton.seleccionado 
            ? `delete from botonusuario where usuarioId = ${boton.usuarioId} and botonId = ${boton.botonId}` 
                : null;
                return consulta ? procesadorConsultas(consulta) : Promise.resolve(); 
            
        })
        try {
            await Promise.all(promesas);
        } catch (error) {
            console.error("Error al actualizar permisos:", error);
            res.status(500).json({ error: "Error al actualizar permisos." });
        }
    };
    return res.status(200).json({ message: "Permisos actualizados exitosamente." });
})
rutas.put('/permisos', async(req,res) => {
    const datos = req.body.datos;
    let consulta = `delete from usuarioPermiso where usuarioid = ${datos[0].usuarioid}`;
    await procesadorConsultas(consulta);
    const promesas = datos.filter(ele => ele.asignado == 1).map((row) => {
        consulta = `insert into usuarioPermiso (usuarioid, menuid, fechapermiso, estatusid) values (${row.usuarioid}, ${row.menuid}, now(), 8)`;
        return procesadorConsultas(consulta);
    });
    await Promise.all(promesas);
    return res.status(200).send({mensaje: "Datos Modificados Correctamente"});
})





module.exports = rutas;