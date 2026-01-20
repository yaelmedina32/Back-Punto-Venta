const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const sjcl = require('sjcl');
const crypt = require('bcryptjs');
const axios = require('axios');

const obtenerInventarioDisponible = async (almacenid) => {
    const consulta = `SELECT i.dot, p.nombre, COUNT(*) AS cantidad FROM inventario i
    INNER JOIN estatus e ON e.estatusid = i.estatusid
    INNER JOIN producto p ON p.productoid = i.productoid
    WHERE e.estatusId = 4 
    GROUP BY i.dot, p.nombre`;
    const inventario = await procesadorConsultas(consulta);
    return inventario[0];
};

const obtenerHistorialVentas = async () => {
    const consulta = ` SELECT v.ventaid AS folioventa, date_format(v.fechaventa, '%d/%m/%Y') fechaventa, monto AS montoventa, v.iva, v.montoTotal, v.usuarioId,
        (SELECT nombre FROM usuario u WHERE u.usuarioId = v.usuarioId) AS Vendedor,
        e.descripcion estatus, v.clienteid, 
        ifnull(v.nombreCliente, '') cliente,
        ifnull(v.numeroCliente, '') numero,
        v.tipoVenta,
        (select count(*) from pagoventa pv where pv.ventaid = v.ventaid and pv.estatusid = 1) cantidadpagos
    FROM venta v
    INNER JOIN estatus e ON e.estatusid = v.estatusid
    left JOIN folioventa fv ON fv.ventaId = v.ventaid
    left JOIN inventario i ON i.inventarioid = fv.inventarioid
    left JOIN producto p ON p.productoid = i.productoid
    left join ventaServicio sv on sv.ventaid = v.ventaid
    GROUP BY v.ventaid, monto, e.descripcion, v.fechaventa, v.tipoVenta, v.iva, v.montoTotal
    ORDER BY v.ventaid desc `;
    const historial = await procesadorConsultas(consulta);
    const detallesPromesas = historial[0].map(async (venta) => {
        const consultaDetalle = `SELECT concat(p.nombre, ' ', ifnull(p.modelo, '')) producto, i.precioventa, i.dot, COUNT(*) cantidad
        FROM folioventa fv
        INNER JOIN inventario i ON i.inventarioid = fv.inventarioid
        INNER JOIN producto p ON p.productoid = i.productoid
        WHERE fv.ventaid = ${venta.folioventa}
        GROUP BY p.nombre, p.modelo, i.precioventa, i.dot`;
        const detalles = await procesadorConsultas(consultaDetalle);
        venta.detalle = detalles[0].reduce((acum, actual) => acum += "*" + actual.producto, ""); 
        return venta;
    });

    await Promise.all(detallesPromesas);
    return historial[0];
};

const obtenerDetallesPagoOc = async () => {
    const consulta = `SELECT
	 CASE WHEN ISNULL(p.pagoId) then 'Sin Pago' ELSE p.pagoId END AS pagoId, CASE WHEN ISNULL(p.monto) then 0 ELSE p.monto END AS monto,
	  CASE WHEN ISNULL(p.fechapago) THEN 'NA' ELSE DATE_FORMAT(p.fechapago, '%d/%m/%y') END AS fechapago,COALESCE((SELECT descripcion FROM estatus e WHERE e.estatusId = p.estatusId), 'NA') AS estatusPagoOc,
	o.ordenCompraId, o.usuarioId, o.importeTotal, o.pendiente, o.fecha, o.solicitante, 
	(SELECT descripcion FROM estatus e WHERE e.estatusId = o.estatusId ) AS estatusOrdenCompra
FROM pagooc p
RIGHT JOIN ordencompra o ON p.ordenCompraId = o.ordenCompraId`
    const detallesoc = await procesadorConsultas(consulta);
    return detallesoc[0];
};

const obtenerDetallePago = async () => {
    const consulta =`SELECT 
	v.ventaId,
	(SELECT descripcion FROM estatus e WHERE e.estatusId = v.estatusId) AS estatusVenta,
	 CASE WHEN ISNULL(p.pagoId) then 'Sin Pago' ELSE p.pagoId END AS pagoId,
	 COALESCE((SELECT  descripcion  FROM estatus e WHERE e.estatusId = p.estatusId), 'N/A') AS estatusPagoVenta, 
	v.monto AS montoVenta, CASE WHEN ISNULL(p.monto) THEN 0 ELSE p.monto END AS montoPago, 
	CASE WHEN p.fechapago IS NULL THEN 'Sin Registros' ELSE DATE_FORMAT(p.fechaPago, '%d/%m/%y') END AS fechaPago, nombre

FROM venta v
LEFT JOIN pagoventa p ON p.ventaId = v.ventaId
INNER JOIN usuario u ON u.usuarioId = v.usuarioId
order by case when estatusVenta = 'Pagado' then 1 when 'Cancelado' then 2 else 3 end,
v.ventaid desc, p.pagoid desc`
    const detalles = await procesadorConsultas(consulta);
    return detalles[0];
};

const obtenerDetalleVenta = async (ventaid) => {
    const consulta = `SELECT concat(p.nombre, ' ', ifnull(p.modelo, '')) producto ,i.precioventa - fv.descuento precioventa, fv.descuento, i.dot,
    COUNT(*) cantidad, p.productoid
    FROM folioventa fv
    INNER JOIN inventario i ON i.inventarioid = fv.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    WHERE fv.ventaid = ${ventaid}
    GROUP BY p.nombre, p.modelo, i.precioventa, i.dot, fv.descuento, p.productoid
    
    union all 
    
    SELECT concat(p.nombre, ' ', ifnull(p.modelo, '')) producto ,p.precio - fv.descuento precioventa, fv.descuento, null dot,
    fv.cantidad, fv.productoid
    FROM ventaservicio fv
    INNER JOIN producto p ON p.productoid = fv.productoid
    WHERE fv.ventaid = ${ventaid}
    GROUP BY p.nombre, p.modelo, p.precio,  fv.descuento, fv.cantidad, p.productoid`;
    const detalles = await procesadorConsultas(consulta);
    return detalles[0];
};

const obtenerDetalleInventarioVenta = async (ventaid) => {
    const consulta = `SELECT i.inventarioid, concat(p.nombre, ' ', p.modelo) producto ,i.precioventa, i.dot, p.productoid
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
    return detalles[0];
};

const obtenerDevoluciones = async () => {
    const consulta = `SELECT fv.ventaid, p.nombre, date_format(d.fechadevolucion, '%d/%m/%Y') fechadevolucion, d.motivo, i.precioventa, 
    (select motivo from motivorechazo mr where mr.motivoId = d.motivoId ) AS descripcionMotivo
    FROM devolucion d
    INNER JOIN inventario i ON i.inventarioid = d.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    INNER JOIN folioventa fv ON fv.inventarioid = i.inventarioid`;
    const devoluciones = await procesadorConsultas(consulta);
    return devoluciones[0];
};

const obtenerDetalleDeuda = async (ventaid) => {
    const consulta = `SELECT v.monto subTotal, v.IVA, v.montototal totalVenta, v.clienteid, (SELECT nombre FROM cliente c WHERE c.clienteid = v.clienteid) nombre, 
    case when isnull(SUM(p.monto)) then 0 ELSE SUM(p.monto) END pagos,
    v.monto - case when isnull(SUM(p.monto)) then 0 ELSE SUM(p.monto) END restante,
    p.tipopagoid, v.tipoventa
    FROM venta v
    left JOIN pagoventa p ON p.ventaid = v.ventaid and p.estatusid = 1
    WHERE v.ventaid = ${ventaid}
    GROUP BY v.monto, v.clienteid, p.tipopagoid, v.tipoventa`;
    const detalles = await procesadorConsultas(consulta);
    return detalles[0];
};

const obtenerAbonos = async (ventaid) => {
    const consulta = `select pagoid, monto, date_format(fechapago, '%d/%m/%Y') fechapago, estatusid, 
    (select descripcion from estatus e where e.estatusid = p.estatusid) estatus, ventaid, 0 as nuevo, tipopagoid
    from pagoventa p where ventaid = ${ventaid} and p.estatusid != 3`;
    const abonos = await procesadorConsultas(consulta);
    return abonos[0];
};

const obtenerUltimaVenta = async (datos) => {
    let inventarios = datos.reduce((acum, actual) => acum += actual.inventarioid + ",", "");
    inventarios = inventarios.substring(0, inventarios.length - 1);
    const consulta = `select distinct ventaid from folioventa where inventarioid in (${inventarios})`;
    const ventaid = await procesadorConsultas(consulta);
    return ventaid[0][0].ventaid;
};

const vender = async (datos) => {
    //SE INSERTA EL REGISTRO DE LA VENTA
    let consulta = datos.modo === 'insercionVenta' ? `insert into venta (monto, IVA, montoTotal, fechaventa, estatusid ${datos.nombreCliente && datos.nombreCliente != '' ? ',nombreCliente' : ''} ${datos.numeroCliente && datos.numeroCliente != '' ? ',numeroCliente' : ''}, usuarioid, turnoid)
    values (${datos.subTotal}, ${datos.IVA}, ${datos.totalVenta}, now(), 15
    ${datos.nombreCliente && datos.nombreCliente != '' ? `, '${datos.nombreCliente}'` : ''} ${datos.numeroCliente && datos.numeroCliente != '' ? `, '${datos.numeroCliente}'` : ''}, ${datos.usuarioid}, ${datos.turnoid})`
    : `update venta set monto = ${datos.subTotal}, IVA = ${datos.IVA}, montoTotal = ${datos.totalVenta} ${datos.nombreCliente && datos.nombreCliente != '' ? `, nombreCliente = '${datos.nombreCliente}'` : ''}
        ${datos.numeroCliente && datos.numeroCliente != '' ? `, numeroCliente = '${datos.numeroCliente}'` : ''} where ventaid = ${datos.folioventa}`

    await procesadorConsultas(consulta);

    //SE INSERTA EL REGISTRO DE LOS DETALLES DE LA VENTA (EL INVENARIO QUE SE VENDIÓ)
    const ventaId = await procesadorConsultas("select max(ventaid) ventaid from venta");

    await procesadorConsultas(`delete from folioVenta where ventaid = ${datos.folioventa ? datos.folioventa : ventaId[0][0].ventaid}`)

    const promesasInserciones = datos.ventas.filter(ele => ele.inventarioid != 0).map(fila => {
        consulta = `insert into folioVenta (inventarioId, ventaId ${ fila.descuento ? `, descuento` : ''}) 
            values (${fila.inventarioid}, ${datos.folioventa ? datos.folioventa : ventaId[0][0].ventaid} ${fila.descuento ? ',' + fila.descuento : ''})`;
        return procesadorConsultas(consulta);
    });
    //ACTUALIZO EL INVENTARIO COMO VENDIDO
    const promesasUpdates = datos.ventas.filter(ele => ele.inventarioid != 0).map(fila => {
        consulta = `update inventario set estatusid = 5, fechaventa = now() where inventarioid = ${fila.inventarioid}`;
        return procesadorConsultas(consulta);
    });
    
    await procesadorConsultas(`delete from ventaServicio where ventaid = ${datos.folioventa ? datos.folioventa : ventaId[0][0].ventaid}`)
    
    //SE INSERTA EL REGISTRO DE LOS SERVICIOS QUE SE VENDIERON
    const promesasServicios = datos.ventas.filter(ele => ele.productoid != 0).map((fila) => {
        consulta = `insert into ventaServicio (ventaId, productoid, cantidad ${ fila.descuento ? `, descuento` : ''}) values (${!datos.folioventa ? ventaId[0][0].ventaid : datos.folioventa}, ${fila.productoid}, ${fila.cantidad} ${fila.descuento ? ',' + fila.descuento : ''})`;
        return procesadorConsultas(consulta);
    });

    await Promise.all(promesasInserciones);
    await Promise.all(promesasUpdates);
    await Promise.all(promesasServicios);

    return { mensaje: "Datos insertados correctamente" };
};

const autorizar = async (datos) => {
    const consulta = `select clave from usuario u 
    inner join usuarioCancelacion uc on uc.usuarioid = u.usuarioid `;
    const clave = await procesadorConsultas(consulta);
    const claveplana = sjcl.decrypt(datos.key, datos.clave);

     const comparar = (plana, hash) => new Promise((resolve, reject) => {
        crypt.compare(plana, hash, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });

    let usuarioEncontrado = false;
    for(let usuario of clave[0]){
        const coincide = await comparar(claveplana, usuario.clave);
        if(coincide){
            usuarioEncontrado = true;
            break;
        }
    }

    if(!usuarioEncontrado){
        throw new Error('Usuario Incorrecto');
    }
    return { mensaje: "Usuario Correcto" };
};

const imprimirTicket = async (ventaid) => {
    let consulta = `SELECT COUNT(*) cantidad, concat(substring(p.nombre, 1, case when length(p.nombre) > 15 then 15 else length(p.nombre) end) , ' ', case when p.modelo is null then '' ELSE p.modelo END, ' ', m.nombre, ' - ', ifnull(i.dot, '')) nombre
    , i.precioVenta, (i.precioVenta  - fv.descuento) * COUNT(*) AS importe, case when v.numeroCliente is not null then v.numeroCliente else '' end telefono, ifnull(v.nombreCliente, '') nombreCliente, v.monto subtotal, ifnull(v.iva, 0) iva, v.montototal
    FROM venta v 
    INNER JOIN folioventa fv ON fv.ventaid = v.ventaid
    INNER JOIN inventario i ON i.inventarioid = fv.inventarioid
    INNER JOIN producto p ON p.productoid = i.productoid
    INNER JOIN marca m ON m.marcaid = p.marcaid
    left JOIN cliente c on c.clienteid = v.clienteid
    WHERE v.ventaid = ${ventaid}
    GROUP BY p.nombre, i.precioventa, p.modelo, m.nombre, fv.descuento, v.monto, v.iva, v.montototal, i.dot, v.nombreCliente, v.numeroCliente

    UNION all
    
    SELECT vs.cantidad, substring(p.nombre, 1, case when length(p.nombre) > 20 then 20 else length(p.nombre) end) nombre
        , p.precio as precioVenta, p.precio * vs.cantidad AS importe
        , case when v.numeroCliente is not null then v.numeroCliente else '' end telefono, ifnull(v.nombreCliente, '') nombreCliente, v.monto subtotal, ifnull(v.iva, 0) iva, v.montototal
    FROM venta v 
    INNER JOIN ventaservicio vs ON vs.ventaId = v.ventaid	
    INNER JOIN producto p on p.productoid = vs.productoid
    left JOIN cliente c on c.clienteid = v.clienteid
    WHERE v.ventaid = ${ventaid}`;
    const datosVenta = await procesadorConsultas(consulta);
    consulta = `SELECT 
        GROUP_CONCAT(t.descripcion) as pago,
        CASE 
            WHEN COUNT(pv.pagoId) > 1 THEN 0 
            ELSE MAX(t.porcentajeDescuento) 
        END as descuento
    FROM venta v
        INNER JOIN pagoventa pv ON pv.ventaid = v.ventaid
        INNER JOIN tipopago t ON t.tipoid = pv.tipopagoid
    WHERE v.ventaid = ${ventaid};`
    const tipoPago = await procesadorConsultas(consulta);
    const totalIva = datosVenta[0].reduce((acum, actual) => acum += (actual.iva && actual.iva != 0) ? parseFloat(actual.importe) * 0.16 : 0, 0);
    const totallSinIva = datosVenta[0].reduce((acum, actual) => acum += parseFloat(actual.importe), 0);

    consulta = `select pv.monto, tp.descripcion tipoPago, date_format(pv.fechaPago, '%d/%m/%Y') fechaPago, v.nombreCliente
            from venta v
            inner join pagoVenta pv on pv.ventaid = v.ventaid
            inner join tipoPago tp on tp.tipoId = pv.tipoPagoId
        where v.ventaid = ${ventaid}`;

    const pagoVenta = await procesadorConsultas(consulta);
    
    return { datosVenta: datosVenta[0], tipoPago: tipoPago[0][0].pago || 'S/P', descuento: tipoPago[0][0].descuento, totalIva, totallSinIva, pagoVenta: pagoVenta[0] };
};

const procesarAbonos = async (datos) => {
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
    const response = await imprimirTicket(datos[0].ventaid);
    return response;
};

const enviarDocumento = async (datos) => {
    const response = await axios.post('http://microwsp:4301/wsp/enviar-documento', {
        chatId: datos.chatId,
        buffer: datos.buffer,
        nombreArchivo: datos.nombreArchivo,
        mimeType: datos.mimeType
    });
    return response.data;
};

const procesarDevolucion = async (datos) => {
    let consulta = `select fv.inventarioid from folioventa fv
    inner join inventario i on i.inventarioid = fv.inventarioid
    where fv.ventaid = ${datos.ventaid}`;
    const inventarios = await procesadorConsultas(consulta);
    for(let i = 0; i < inventarios[0].length; i++){
        const inventario = inventarios[0][i];
        try{
            consulta = `insert into devolucion (inventarioid, fechadevolucion, motivo, motivoId) values (${inventario.inventarioid}, now(), '${datos.motivo}',  '${datos.motivoId}' )`;
            await procesadorConsultas(consulta);
            consulta = `update inventario set estatusid = 4 where inventarioid = ${inventario.inventarioid}`;
            await procesadorConsultas(consulta);
        }catch(error){
            throw error;
        }
    }
    
    consulta = `update venta v set estatusid = 3
    where ventaid = ${datos.ventaid}`
    await procesadorConsultas(consulta);
    return { mensaje: 'Datos modificados cocrrectamente' };
};

const cambiarEstatusVenta = async (datos) => {
    const consulta = `
        UPDATE venta v
        LEFT JOIN pagoventa p ON v.ventaId = p.ventaId
        SET v.estatusId = ${datos.estatusVentaId},   
            p.estatusId = ${datos.estatusPagoId}   
        WHERE p.pagoId = ${datos.pagoId};
    `;
    await procesadorConsultas(consulta);
    return { mensaje: 'Datos modificados correctamente' };
};

const cambiarEstatusOrdenCompra = async (datos) => {
    const consulta = `
            UPDATE pagooc p
        LEFT JOIN ordencompra o ON p.ordenCompraId = o.ordenCompraId
        SET o.estatusId = ${datos.estatusOcId},   
            p.estatusId = ${datos.estatusPagoOcId} 
        WHERE p.pagoId = ${datos.pagoId};
    `;
    await procesadorConsultas(consulta);
    return { mensaje: 'Datos modificados correctamente' };
};

module.exports = {
    obtenerInventarioDisponible,
    obtenerHistorialVentas,
    obtenerDetallesPagoOc,
    obtenerDetallePago,
    obtenerDetalleVenta,
    obtenerDetalleInventarioVenta,
    obtenerDevoluciones,
    obtenerDetalleDeuda,
    obtenerAbonos,
    obtenerUltimaVenta,
    vender,
    autorizar,
    imprimirTicket,
    procesarAbonos,
    enviarDocumento,
    procesarDevolucion,
    cambiarEstatusVenta,
    cambiarEstatusOrdenCompra
};
