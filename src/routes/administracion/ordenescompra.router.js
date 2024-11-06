const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const ruta = express.Router();

/////////////////////////// CONSULTAS ///////////////////////////

ruta.post('/ordenescompra', async(req,res) => {
    const datos = req.body.datos;
    let stringOC = datos.reduce((acum, actual) => acum += actual + ',', "");
    stringOC = stringOC.substring(0, stringOC.length - 1);
    const consulta = `select oc.ordencompraid, oc.importetotal, oc.cantidadproductos, COUNT(ocp.ordencompraid) cantidad
    from ordencompra oc
    left join ordencompraproducto ocp on ocp.ordencompraid = oc.ordencompraid
    where oc.ordencompraid in (${stringOC})
    GROUP BY oc.cantidadproductos, oc.ordencompraid, oc.importetotal`;
    try{ 
        const resultado = await procesadorConsultas(consulta);
        return res.json(resultado[0]);   
    }catch(error){
        if(error){
            return res.status(500).send({error: error, success: false});
        }
    }
});

ruta.get('/ordenescompra/:almacenid/:estatus', async(req,res) => {
    const almacenid = req.params.almacenid;
    const estatus = req.params.estatus;
    const consulta = `select oc.ordencompraid, oc.usuarioid, p.nombre as proveedor, date_format(fecha , '%d/%m/%y') fecha, oc.solicitante, p.proveedorid, oc.importetotal, 
    e.descripcion estatus, e.estatusid, oc.pendiente, oc.descripcion , oc.nofactura
    from ordencompra oc
    inner join estatus e on e.estatusid = oc.estatusid
    inner join proveedor p on p.proveedorid = oc.proveedorid
    where oc.almacenid = ${almacenid} ${estatus == 'inventario' ? ' and (oc.estatusid = 1 || oc.estatusid = 12)' : '' }`;
    try{ 
        const resultado = await procesadorConsultas(consulta);
        return res.json(resultado[0]);   
    }catch(error){
        if(error){
            return res.status(500).send({error: error, success: false});
        }
    }
});

ruta.get('/maxOC', async(req,res) => {
    const consulta = `select case when isnull(max(ordencompraid)) then 0 ELSE MAX(ordencompraid) end ordencompraid from ordenCompra`;
    const resultado = await procesadorConsultas(consulta);
    return res.json(resultado[0]);
});

ruta.get('/ordencompra/:ordencompraid', async(req,res) => {
    const ordencompraid = req.params.ordencompraid;
    const consulta = `select ordencompraid, usuarioid, solicitante, fecha,
    proveedorid, importetotal, e.descripcion estatus, e.estatusid, pendiente,
    oc.descripcion from ordencompra oc 
    inner join estatus e on e.estatusid = oc.estatusid
    where ordencompraid = ${ordencompraid}`;
    try{
        const ordencompra = await procesadorConsultas(consulta);
        return res.json(ordencompra[0]);
    }catch(error){
        if(error){
            return res.status(500).send({error: error, success: false});
        }
    }
});

ruta.get('/productos/ordencompra/:ordencompraid', async(req,res) => {
    const ordencompraid = req.params.ordencompraid;
    const consulta = `SELECT @rn:=@rn+1 AS consecutivo, consulta.* FROM (
SELECT ocp.descripcionProducto as producto, ocp.cantidad, um.unidad, ocp.precioUnitario, (ocp.cantidad * ocp.precioUnitario) AS importe 
    FROM ordencompra oc
    INNER JOIN ordencompraproducto ocp ON ocp.ordencompraid = oc.ordencompraid
    inner join unidadMedida um on um.unidadId = ocp.unidadId
    left JOIN producto p ON p.productoid = ocp.productoId
    WHERE oc.ordenCompraId = ${ordencompraid}) consulta, (SELECT @rn:=0) t2;`;
    console.log(consulta);
    try{
        const resultado = await procesadorConsultas(consulta);
        return res.json(resultado[0]);
    }catch(error){
        if(error){
            return res.status(500).send({error: error, success: false});
        }
    }
})

ruta.get('/detalle/ordencompra/:ordencompraid', async(req,res) => {
    const ordencompraid = req.params.ordencompraid;
    const consulta = `SELECT oc.ordencompraid, oc.almacenid, oc.descripcion, oc.proveedorid, ocp.productoid, 
    ocp.cantidad, ocp.preciounitario, ocp.descripcionproducto producto, ocp.unidadid,
    p.nombre as nombreproducto, p.modelo, um.unidad,
    (SELECT COUNT(*) FROM inventario i WHERE i.ordencompraid = ocp.ordenCompraId and i.productoid = ocp.productoid) cantidadinventario
    FROM ordencompra oc
    INNER JOIN ordencompraproducto ocp ON ocp.ordencompraid = oc.ordencompraid
    inner join producto p on p.productoid = ocp.productoid
    left join unidadmedida um on um.unidadid = ocp.unidadid
    WHERE oc.ordencompraid = ${ordencompraid} and p.productoid != 0`;
    const datos = await procesadorConsultas(consulta);
    return res.json(datos[0]);
});

ruta.get('/unidades', async(req,res) => {
    const consulta = `SELECT unidadid, descripcion FROM unidadmedida `;
    try{
        const unidades = await procesadorConsultas(consulta);
        return res.json(unidades[0]);
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
});

ruta.get('/cantidad/inventario/:productoid/:almacenid', async(req,res) => {
    const productoid = req.params.productoid;
    const almacenid = req.params.almacenid;
    const consulta = `select count(*) inventareado 
    from inventario i
    inner join ubicacion u on u.ubicacionid = i.ubicacionid
    where u.almacenid = ${almacenid} and i.productoid = ${productoid}`;
    const conteo = await procesadorConsultas(consulta);
    return res.json(conteo[0]);
});

ruta.get('/contenedores/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    //SACO LOS CONTENEDORES DE LOS INVENTARIOS QUE ESTÁN PREREGSITRADOS (ESTATUSID 14)
    const consulta = `select distinct contenedor from inventario i 
    inner join ubicacion u on u.ubicacionid = i.ubicacionid
    where contenedor is not null and estatusid in (14, 4) 
    and u.almacenid = ${almacenid} and i.ordencompraid is null and i.productoid is not null`;
    const contenedores = await procesadorConsultas(consulta);
    return res.json(contenedores[0]);
})

/////////////////////////// INSERCIONES ///////////////////////////

ruta.post('/ordencompra', async(req, res) => {
    const datos = req.body.datos;
    const oc = !datos.sininventario ? datos[0]['oc'] : datos['oc'];
    const proveedorid = !datos.sininventario ? datos[0]['proveedorid'] : datos['proveedorid'];
    const descripcionOC = !datos.sininventario ? datos[0]['descripcion'] : datos['descripcion'];
    const solicitante = !datos.sininventario ? datos[0]['solicitante'] : datos['solicitante'];
    const almacenId = !datos.sininventario ? datos[0]['almacenId'] : datos['almacenId'];
    const usuarioid = !datos.sininventario ? datos[0]['usuarioid'] : datos['usuarioid'];
    if(!datos.sininventario){
        try{
            let consulta = `insert into ordenCompra (ordencompraid, usuarioid, proveedorId, importeTotal, estatusId, pendiente, descripcion, fecha, solicitante, almacenId)
            values (${oc}, ${usuarioid}, ${proveedorid}, ${(datos.reduce((acum, actual) => acum += actual.importe, 0))}, 7, 
            ${(datos.reduce((acum, actual) => acum += actual.importe, 0))}, ${!descripcionOC ? "''" : "'" + descripcionOC + "'"}, now(), '${solicitante}', ${almacenId})`;
            await procesadorConsultas(consulta);
            const promesas = datos.map(element => {
                consulta = `insert into ordenCompraProducto (ordencompraId, productoId, cantidad, precioUnitario, descripcionProducto, unidadid)
                values (${oc}, ${element.producto}, ${element.cantidad}, ${element.precio}, '${element.nombreproducto}', ${element.unidadid}); 
                `
                return procesadorConsultas(consulta);
            });
            await Promise.all(promesas);
            return res.status(200).send({mensaje: "Datos insertados correctamente", success: true});
        }catch(error){
            if(error){
                return res.status(500).send({error: error, success: false});
            }
        }
    }else{
        const costo = datos['costo'];
        const cantidad = datos['cantidad'];
        const consulta = `insert into ordenCompra (ordencompraid, usuarioid, proveedorId, importeTotal, estatusId, pendiente, descripcion, fecha, solicitante, almacenId, cantidadProductos)
        values (${oc}, ${usuarioid}, ${proveedorid}, ${costo}, 7, 
        ${costo}, ${!descripcionOC ? "''" : "'" + descripcionOC + "'"}, now(), '${solicitante}', ${almacenId}, ${cantidad})`;
        try{
            await procesadorConsultas(consulta);
            return res.status(200).send({mensaje: 'Datos insertados correctamente'});
        }catch(error){
            return res.status(500).send(error);
        }
    }
})


ruta.post('/inventario', async(req,res) => {
    const datos = req.body.datos;
    try{
        let consulta = "insert into folioAlta (fechaalta) values (now());";
        await procesadorConsultas(consulta);
        consulta = "SELECT folioaltaid FROM folioAlta ORDER BY folioAltaid DESC LIMIT 1"
        const folioaltaid = await procesadorConsultas(consulta);
        let totalRegistros = 0; 
        const promesas = datos.map((row) => {
            let datosAuxCantidad = [];
            for(let i = 0; i < row.cantidad; i++){
                totalRegistros++;
                datosAuxCantidad.push(row);
            }
            datosAuxCantidad.map((row) => {
                consulta = `insert into inventario (productoid, fechaalta, dot, ubicacionid, precioventa, ordencompraid, estatusId)
                values (${row.productoid}, now(), '${row.dot}', ${row.ubicacionid}, ${row.precioventa}, ${row.ordencompraid},  4)`;
                return procesadorConsultas(consulta);
            })
        });
        await Promise.all(promesas);
        consulta = `insert into folioAltaInventario (folioAltaId, inventarioId)
        select ${folioaltaid[0][0].folioaltaid}, inventarioId from inventario
        order by inventarioId desc
        limit ${totalRegistros};`
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Registros insertados correctamente"});
    }catch(error){
        if(error){
            console.log(error);
            return res.status(500).send({error: error});
        }
    }
});

/////////////////////////// ACTUALIZACIONES ///////////////////////////

ruta.put('/numerofactura', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `update ordencompra set nofactura = '${datos.factura}' where ordencompraid = ${datos.ordencompraid}`;
    try{
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        return res.status(500).send(error);
    }
})

ruta.put('/estatus/ordencompra', async(req,res) => {
    const datos = req.body.datos;
    try{
        const consulta = `update ordencompra set estatusId = ${datos.aceptado} where ordencompraid = ${datos.ordencompraid}`;
        await procesadorConsultas(consulta);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        console.log(error);
        if(error) return res.status(500).send({error: error});
    }
})

module.exports = ruta;
