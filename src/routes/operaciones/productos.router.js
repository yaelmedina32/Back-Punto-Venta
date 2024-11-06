const express = require('express');
const procesarConsulta = require('../../controladores/procesadorConsultas.controller');

const rutas = express.Router();

//////////////////////////////////////////////////// CONSULTAS ////////////////////////////////////////////////////

rutas.get('/productos', async(req,res) => {
    const consulta = `Select p.productoid, p.clave, p.nombre, p.iva, c.nombre categoria,
    m.nombre marca, case when isnull(p.modelo) then 'N/A' else p.modelo end modelo, p.tipo, p.ancho, p.alto, 
    p.roc, p.tamanorin, p.indicecarga, p.letravelocidadId, p.aplicacion, p.tipovehiculo, 
    concat(p.ancho, p.alto, tamanorin, indicecarga) nombrefiltro
    from producto p
    inner join marca m on m.marcaid = p.marcaid
    inner join categoria c on c.categoriaid = p.categoriaid`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
});

rutas.get('/productos/servicios', async(req,res) => {
    const consulta = `select productoid, nombre, precio, 0 nuevo from producto WHERE CATEGORIAID = 2`
    const servicios = await procesarConsulta(consulta);
    return res.json(servicios[0]);
})

rutas.get('/productos/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `    
    Select p.productoid, p.nombre, p.modelo, i.dot, concat(u.pasillo, '-', u.anaquel, '-', u.nivel) ubicacion
    , u.ubicacionid, i.precioventa
    from producto p
    inner join productoubicacion pu on pu.productoid = p.productoid
    inner join ubicacion u on u.ubicacionid = pu.ubicacionid 
    inner join inventario i on i.productoid = p.productoid and i.ubicacionid = u.ubicacionid
    where u.almacenid = ${almacenid}`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
})

rutas.get('/productos/inventario/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `    
    Select i.inventarioid, p.productoid, p.nombre, p.modelo, i.dot, concat(u.pasillo, '-', u.anaquel, '-', u.nivel) ubicacion
    , u.ubicacionid, i.precioventa
    from producto p
    inner join inventario i on i.productoid = p.productoid 
    inner join ubicacion u on i.ubicacionid = u.ubicacionid
    where u.almacenid = ${almacenid} and i.estatusid = 4`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
})

rutas.get('/productos/resumido/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `
    SELECT 0 productoid, '0' clave, 'Producto Sin inventario' nombre
        UNION ALL 
    Select p.productoid, p.clave, concat(p.nombre, '-', p.modelo) nombre
    from producto p
    inner join productoUbicacion pu on pu.productoid = p.productoid
    inner join ubicacion u on u.ubicacionid = pu.ubicacionid
    where u.almacenid = ${almacenid}
    group by p.productoid, p.clave, p.nombre`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
})

rutas.get('/producto/:productoid', async(req,res) => {
    const productoid = req.params.productoid;
    const consulta = `Select p.productoid, p.clave, p.nombre, p.iva, c.categoriaid, m.nombre marca, p.modelo, p.tipo, p.ancho, p.alto, 
    p.roc, p.tamanorin, p.indicecarga, p.letravelocidadId, p.aplicacion, p.tipovehiculo, m.marcaid
    from producto p
    inner join marca m on m.marcaid = p.marcaid
    inner join categoria c on c.categoriaid = p.categoriaid
    where p.productoid = ${productoid}`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
})


rutas.get('/categorias', async(req,res) => {
    const consulta = `select *, 0 nuevo from categoria`;
    const resultado = await procesarConsulta(consulta);
    return res.json(resultado[0]);
})

rutas.get('/producto/ubicacion/:productoid/:almacenid', async(req,res) => {
    const productoid = req.params.productoid;
    const almacenid = req.params.almacenid;
    const consulta = `select pu.id, p.productoid, clave, nombre as producto, 
    CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion, 
    u.almacenid, u.ubicacionid, case when ISNULL(pu.id) then 1 ELSE 0 end as nuevo
    from productoUbicacion pu
    INNER join ubicacion u on u.ubicacionId = pu.ubicacionId AND u.almacenId = ${almacenid}
    right join producto p on p.productoId = pu.productoId
    where p.productoId = ${productoid}
    GROUP BY pu.id, p.productoid, clave, nombre, pasillo, anaquel, nivel
    order by pasillo, anaquel, nivel`;
    const ubicaciones = await procesarConsulta(consulta);
    return res.json(ubicaciones[0]);
});

rutas.get('/letraVelocidad', async(req,res) => {
    const consulta = `select *, 0 as nuevo from letravelocidad`;
    const letras = await procesarConsulta(consulta);
    return res.json(letras[0]);
}) 


//////////////////////////////////////////////////// INSERCIONES ////////////////////////////////////////////////////

rutas.post('/producto', async(req,res) => {
    const datos = req.body.datos;
    try{
        const consulta = datos.edicion == 'edicion' 
        ? `update producto set iva = ${datos.iva}, categoriaId = ${datos.categoria}, ancho = ${datos.ancho}, alto = ${datos.alto},
            roc = '${datos.roc.toUpperCase()}', tamanoRin = ${datos.tamanorin}, indiceCarga = ${datos.indiceCarga}, letraVelocidadId = '${datos.letraVelocidadId}', aplicacion = '${datos.aplicacion}',
            tipoVehiculo = '${datos.tipoVehiculo}', modelo = '${datos.modelo}', marcaid = ${datos.marcaid}, nombre = '${datos.nombre}' where productoid = ${datos.productoid}`

        : `insert into producto (clave, iva, categoriaId,  ancho, alto, roc, tamanoRin, indiceCarga, letraVelocidadId, aplicacion, tipoVehiculo, modelo, marcaid, nombre)
            values ('${datos.clave}', ${datos.iva}, ${datos.categoria}, ${datos.ancho}, ${datos.alto}, '${datos.roc.toUpperCase()}', ${datos.tamanorin}, ${datos.indiceCarga},
            '${datos.letraVelocidadId}', '${datos.aplicacion}', '${datos.tipoVehiculo}', '${datos.modelo}', ${datos.marcaid}, '${datos.nombre}')`;
        await procesarConsulta(consulta);
        return res.status(200).send({mensaje: "Datos Insertados Correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
})


rutas.post('/ubicaciones/producto', async(req,res) => {
    const datos = req.body.datos;
    try{
        datos.forEach(async (element) => {
            if(element.nuevo == 1){
                const consulta = `insert into productoUbicacion (productoId, ubicacionId) values (${element.productoid}, ${element.ubicacionid})`;
                await procesarConsulta(consulta);
            }
            if(element.nuevo == 2){
                const consulta = `update productoUbicacion set ubicacionid = ${element.ubicacionid} where id = ${element.id}`;
                await procesarConsulta(consulta);
            }
        });
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
});



rutas.post('/categorias', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.map((element) => {
            const consulta = element.nuevo == 1 
                ? `insert into categoria (nombre) values ('${element.nombre}')`
            : element.nuevo == 2 
                ? `update categoria set nombre = '${element.nombre}' where categoriaid = ${element.categoriaId}`
            : `delete from categoria where categoriaId = ${element.categoriaId}`;
            return procesarConsulta(consulta);
        })
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos modificados correctamente"});
    }catch(error){
        return res.status(500).send(error);
    }
})

rutas.post('/letraVelocidad', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.map(element => {
            const consulta = element.nuevo == 1 

            ? `INSERT INTO  letravelocidad (letra) VALUES ('${element.letra}')` 
            : element.nuevo == 2 
            ? `update letravelocidad set letra = '${element.letra}' where letraVelocidadid = ${element.letraVelocidadId}`
            : ` delete FROM letravelocidad WHERE letraVelocidadId = ${element.letraVelocidadId} `;
            return procesarConsulta(consulta);
        })
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            console.log(error)
            return res.status(500).send({error: error});
        }
}});

rutas.post('/servicios', async(req,res) => {
    const datos = req.body.datos;
    try{
        const promesas = datos.map(element => {
            const consulta = element.nuevo == 1 
            ? `INSERT INTO producto (nombre, precio, estatusid, categoriaid) values ('${element.nombre}', ${element.precio}, 8, 2)`
            : element.nuevo == 2 
            ? `update producto set nombre = '${element.nombre}', precio = ${element.precio} where productoid = ${element.productoid}`
            : ` update producto set estatusid = 9 where productoid = ${element.productoid}`;
            return procesarConsulta(consulta);
        })
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        if(error){
            console.log(error)
            return res.status(500).send({error: error});
        }
}});

//////////////////////////////////////////////////// DELETES ////////////////////////////////////////////////////


//////////////////////////////////////////////////// UPDATES ////////////////////////////////////////////////////


module.exports = rutas;