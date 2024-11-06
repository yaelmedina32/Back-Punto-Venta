const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const sjcl = require('sjcl');
const crypt = require('bcryptjs');

const rutas = express.Router();

//////////////////////////////////////////////// CONSULTAS ////////////////////////////////////////////////

rutas.get('/inventario/disponible/:almacenid', async(req,res) => {
    const almacenid = req.params.almacenid;
    const consulta = `SELECT i.dot, p.nombre, COUNT(*) AS cantidad FROM inventario i
    INNER JOIN estatus e ON e.estatusid = i.estatusid
    INNER JOIN producto p ON p.productoid = i.productoid
    WHERE e.estatusId = 4 
    GROUP BY i.dot, p.nombre`;
    const inventario = await procesadorConsultas(consulta);
    return res.json(inventario[0]);
});

rutas.get('/historial/ventas', async(req,res) => {
    const consulta = `SELECT v.ventaid AS folioventa, date_format(v.fechaventa, '%d/%m/%Y') fechaventa, monto AS montoventa,
    e.descripcion estatus, v.clienteid, 
    case when isnull((select nombre from cliente c where c.clienteid = v.clienteid)) then '' else (select nombre from cliente c where c.clienteid = v.clienteid) end cliente,
    v.tipoVenta,
    (select count(*) from pagoventa pv where pv.ventaid = v.ventaid) cantidadpagos
    FROM venta v
    INNER JOIN estatus e ON e.estatusid = v.estatusid
    left JOIN folioventa fv ON fv.ventaId = v.ventaid
    left JOIN inventario i ON i.inventarioid = fv.inventarioid
    left JOIN producto p ON p.productoid = i.productoid
    left join ventaServicio sv on sv.ventaid = v.ventaid
    GROUP BY v.ventaid, monto, e.descripcion, v.fechaventa, v.tipoVenta
    ORDER BY v.ventaid `;
    const historial = await procesadorConsultas(consulta);
    return res.json(historial[0]);
})

rutas.get('/detallespagoOc', async (req, res) => {
    const consulta = `SELECT
	 CASE WHEN ISNULL(p.pagoId) then 'Sin Pago' ELSE p.pagoId END AS pagoId, CASE WHEN ISNULL(p.monto) then 0 ELSE p.monto END AS monto,
	  CASE WHEN ISNULL(p.fechapago) THEN 'NA' ELSE DATE_FORMAT(p.fechapago, '%d/%m/%y') END AS fechapago,COALESCE((SELECT descripcion FROM estatus e WHERE e.estatusId = p.estatusId), 'NA') AS estatusPagoOc,
	o.ordenCompraId, o.usuarioId, o.importeTotal, o.pendiente, o.fecha, o.solicitante, 
	(SELECT descripcion FROM estatus e WHERE e.estatusId = o.estatusId ) AS estatusOrdenCompra
FROM pagooc p
RIGHT JOIN ordencompra o ON p.ordenCompraId = o.ordenCompraId`
const detallesoc = await procesadorConsultas(consulta);
return res.json(detallesoc[0]);
})

rutas.get('/detallePago', async (req,res) => {
    const consulta =`SELECT 
	v.ventaId,
	(SELECT descripcion FROM estatus e WHERE e.estatusId = v.estatusId) AS estatusVenta,
	 CASE WHEN ISNULL(p.pagoId) then 'Sin Pago' ELSE p.pagoId END AS pagoId,
	 COALESCE((SELECT  descripcion  FROM estatus e WHERE e.estatusId = p.estatusId), 'NA') AS estatusPagoVenta, 
	v.monto AS montoVenta, CASE WHEN ISNULL(p.monto) THEN 0 ELSE p.monto END AS montoPago, 
	CASE WHEN p.fechapago IS NULL THEN 'Sin Registros' ELSE DATE_FORMAT(p.fechaPago, '%d/%m/%y') END AS fechaPago, nombre

FROM venta v
LEFT JOIN pagoventa p ON p.ventaId = v.ventaId
INNER JOIN usuario u ON u.usuarioId = v.usuarioId`
    const detalles = await procesadorConsultas(consulta);
    return res.json(detalles[0]);
})

rutas.get('/detalle/venta/:ventaid', async(req,res) => {
    const ventaid = req.params.ventaid;
    const consulta = `SELECT concat(p.nombre, ' ', p.modelo) producto ,i.precioventa, i.dot,
    COUNT(*) cantidad
    FROM folioventa fv
    INNER JOIN inventario i ON i.inventarioid = fv.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    WHERE fv.ventaid = ${ventaid}
    GROUP BY p.nombre, p.modelo, i.precioventa, i.dot`;
    const detalles = await procesadorConsultas(consulta);
    return res.json(detalles[0]);
})

rutas.get('/detalle/inventario/venta/:ventaid', async(req,res) => {
    const ventaid = req.params.ventaid;
    const consulta = `SELECT i.inventarioid, concat(p.nombre, ' ', p.modelo) producto ,i.precioventa, i.dot, 0 productoid
    FROM folioventa fv
    INNER JOIN inventario i ON i.inventarioid = fv.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    WHERE fv.ventaid = ${ventaid} and i.estatusid = 5
    
    UNION All
    
    SELECT 0 inventarioid, p.nombre producto , p.precio, '' dot, p.productoid 
    FROM ventaServicio vs
    INNER JOIN producto p ON p.productoid = vs.productoid
    WHERE vs.ventaid = ${ventaid}`;
    const detalles = await procesadorConsultas(consulta);
    return res.json(detalles[0]);
});

rutas.get('/devoluciones', async(req,res) => {
    const consulta = `SELECT fv.ventaid, p.nombre, date_format(d.fechadevolucion, '%d/%m/%Y') fechadevolucion, d.motivo, i.precioventa
    FROM devolucion d
    INNER JOIN inventario i ON i.inventarioid = d.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    INNER JOIN folioventa fv ON fv.inventarioid = i.inventarioid`;
    const devoluciones = await  procesadorConsultas(consulta);
    return res.json(devoluciones[0]);
});

rutas.get('/detalle/deuda/:ventaid', async(req,res) => {
    const ventaid = req.params.ventaid;
    const consulta = `SELECT v.monto, v.clienteid, (SELECT nombre FROM cliente c WHERE c.clienteid = v.clienteid) nombre, 
    case when isnull(SUM(p.monto)) then 0 ELSE SUM(p.monto) END pagos,
    v.monto - case when isnull(SUM(p.monto)) then 0 ELSE SUM(p.monto) END restante,
    p.tipopagoid, v.tipoventa
    FROM venta v
    left JOIN pagoventa p ON p.ventaid = v.ventaid and p.estatusid = 1
    WHERE v.ventaid = ${ventaid}
    GROUP BY v.monto, v.clienteid`;
    const detalles = await procesadorConsultas(consulta);
    return res.json(detalles[0])
});

rutas.get('/abonos/:ventaid', async(req,res) => {
    const ventaid = req.params.ventaid;
    const consulta = `select pagoid, monto, date_format(fechapago, '%d/%m/%Y') fechapago, estatusid, 
    (select descripcion from estatus e where e.estatusid = p.estatusid) estatus, ventaid, 0 as nuevo, tipopagoid
    from pagoventa p where ventaid = ${ventaid}`;
    const abonos = await procesadorConsultas(consulta);
    return res.json(abonos[0]);
});

rutas.post('/ultimaventa', async(req,res) => {
    const datos = req.body.datos;
    let inventarios = datos.reduce((acum, actual) => acum += actual.inventarioid + ",", "");
    inventarios = inventarios.substring(0, inventarios.length - 1);
    const consulta = `select distinct ventaid from folioventa where inventarioid in (${inventarios})`;
    const ventaid = await procesadorConsultas(consulta);
    return res.json(ventaid[0][0].ventaid);
})

//////////////////////////////////////////////// INSERCIONES ////////////////////////////////////////////////

rutas.post('/vender', async(req,res) => {
    const datos = req.body.datos;
    console.log(datos);
    try{
        //EL ESTATUSID LO INSERTO COMO 12 DE "PAGADO" EN CASO DE QUE SEA DE CONTADO, YA QUE LA VENTA SERÁ SALDADA, SI NO, COMO 8 "ACTIVADA" DE QUE HAY UNA DEUDA
        let consulta = "";
        if(datos.folioventa){
            consulta = `delete from ventaServicio where ventaid = ${datos.folioventa}`;
            await procesadorConsultas(consulta);

            consulta = `delete from folioVenta where ventaid = ${datos.folioventa}`;
            await procesadorConsultas(consulta);

            consulta = `delete from venta where ventaid = ${datos.folioventa}`;
            await procesadorConsultas(consulta);
            consulta = `insert into venta (ventaid, monto, fechaventa, estatusid ${datos.clienteid != 0 ? ',clienteid':''}, usuarioid)
            values (${datos.folioventa}, ${datos.monto}, now(), 14
           ${datos.clienteid != 0 ? `, ${datos.clienteid}` : ''}, ${datos.usuarioid})`;
           await procesadorConsultas(consulta);
        }else{
            consulta = `insert into venta (monto, fechaventa, estatusid ${datos.clienteid != 0 ? ',clienteid':''}, usuarioid)
            values (${datos.monto}, now(), 14
           ${datos.clienteid != 0 ? `, ${datos.clienteid}` : ''}, ${datos.usuarioid})`;

           await procesadorConsultas(consulta);
        }
        const ventaId = await procesadorConsultas("select max(ventaid) ventaid from venta");
        const promesasInserciones = datos.ventas.filter(ele => ele.inventarioid != 0).map(fila => {
            console.log(fila);
            consulta = `insert into folioVenta (inventarioId, ventaId) values (${fila.inventarioid}, ${datos.folioventa ? datos.folioventa : ventaId[0][0].ventaid})`;
            return procesadorConsultas(consulta);
        });
        const promesasUpdates = datos.ventas.filter(ele => ele.inventarioid != 0).map(fila => {
            consulta = `update inventario set estatusid = 5, fechaventa = now() where inventarioid = ${fila.inventarioid}`;
            return procesadorConsultas(consulta);
        });
        console.log(datos.ventas.filter(ele => ele.productoid != 0));
        const promesasServicios = datos.ventas.filter(ele => ele.productoid != 0).map((fila) => {
            consulta = `insert into ventaServicio (ventaId, productoid, cantidad) values (${!datos.folioventa ? ventaId[0][0].ventaid : datos.folioventa}, ${fila.productoid}, ${fila.cantidad})`;
            return procesadorConsultas(consulta);
        });

        await Promise.all(promesasInserciones);
        await Promise.all(promesasUpdates);
        await Promise.all(promesasServicios);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
});

rutas.post('/autorizar', async(req,res) => {
    const datos = req.body.datos;
    const consulta = `select clave from usuario where usuarioid = 3 `;
    const clave = await procesadorConsultas(consulta);
    const claveplana = sjcl.decrypt(datos.key, datos.clave);
    crypt.compare(claveplana, clave[0][0].clave, function(err, response){
        if(err){
            console.log(err);
            return res.status(500).send({error: err});
        }
        if(response){
            return res.json({mensaje: 'Usuario Correcto'});
        }
    })
});

rutas.post('/abonos', async(req,res) => {
    const datos = req.body.datos;
    console.log(datos);
    try{
        const promesas = datos.map((element) => {
            const consulta = element.nuevo == 1 ? 
                `insert into pagoventa (monto, fechapago, ventaid, turnoid, estatusid, tipopagoid) values (${element.monto}, now(), ${element.ventaid}, ${element.turnoid},
                 1, ${element.tipopagoid})`
            :   `update pagoventa set estatusid = 3 where pagoid = ${element.pagoid}`;
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesas);
        
        if(datos[0].completo){
            const consulta = `update venta set estatusid = 12 where ventaid = ${datos[0].ventaid}`;
            await procesadorConsultas(consulta);
        }

        return res.status(200).send({mensaje: "Datos Insertados correctamente"});
    }catch(error){
        return res.status(500).send(error);
    }
})

//////////////////////////////////////////////// MODIFICACIONES ////////////////////////////////////////////////

rutas.put('/devolucion', async(req,res) => {
    const datos = req.body.datos;
    let consulta = `insert into devolucion (inventarioid, fechadevolucion, motivo) values (${datos.inventarioid}, now(), '${datos.motivo}')`;
    try{
        await procesadorConsultas(consulta);
        consulta = `update inventario set estatusid = 4 where inventarioid = ${datos.inventarioid}`;
        await procesadorConsultas(consulta);
        consulta = `update venta v
        inner join folioventa fv on fv.ventaid = v.ventaid
        set monto = monto - ${datos.preciounitario} 
        where fv.inventarioid = ${datos.inventarioid} and v.estatusid != 3`;
        await procesadorConsultas(consulta);
        if(datos.cancelada){
            consulta = `update venta v
            inner join folioventa fv on fv.ventaid = v.ventaid
            set estatusid = 3
            where fv.inventarioid = ${datos.inventarioid} and v.estatusid != 3`
            await procesadorConsultas(consulta);
        }
        return res.status(200).send({mensaje: 'Datos modificados cocrrectamente'});
    }catch(error){
        if(error){
            return res.status(500).send({error});
        }
    }
})

rutas.put('/cambiarEstatusV', async (req, res) => {
    const datos = req.body.datos;
    console.log(datos)
console.log(datos)        
        const consulta = `
            UPDATE venta v
            LEFT JOIN pagoventa p ON v.ventaId = p.ventaId
            SET v.estatusId = ${datos.estatusVentaId},   
                p.estatusId = ${datos.estatusPagoId}   
            WHERE p.pagoId = ${datos.pagoId};
        `;
        try {
        await procesadorConsultas(consulta);
        return res.status(200).send({ mensaje: 'Datos modificados correctamente' });
    } catch (error) {
        return res.status(500).send({ error });
    }
});

rutas.put('/cambiarEstatusOc', async (req, res) => {
    const datos = req.body.datos;
    console.log(datos)
console.log(datos)        
        const consulta = `

             UPDATE pagooc p
            LEFT JOIN ordencompra o ON p.ordenCompraId = o.ordenCompraId
            SET o.estatusId = ${datos.estatusOcId},   
                p.estatusId = ${datos.estatusPagoOcId} 
            WHERE p.pagoId = ${datos.pagoId};
        `;
        try {
        await procesadorConsultas(consulta);
        return res.status(200).send({ mensaje: 'Datos modificados correctamente' });
    } catch (error) {
        return res.status(500).send({ error });
    }
});
module.exports = rutas;