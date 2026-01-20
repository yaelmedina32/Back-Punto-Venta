const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerOrdenesCompraPorIds = async (datos) => {
    let stringOC = datos.reduce((acum, actual) => acum += actual + ',', "");
    stringOC = stringOC.substring(0, stringOC.length - 1);
    const consulta = `select oc.ordencompraid, oc.importetotal, oc.cantidadproductos, COUNT(ocp.ordencompraid) cantidad
    from ordencompra oc
    left join ordencompraproducto ocp on ocp.ordencompraid = oc.ordencompraid
    where oc.ordencompraid in (${stringOC})
    GROUP BY oc.cantidadproductos, oc.ordencompraid, oc.importetotal`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerOrdenesCompra = async (almacenid, estatus) => {
    const consulta = `select oc.ordencompraid, oc.usuarioid, p.nombre as proveedor, date_format(fecha , '%d/%m/%y') fecha, oc.solicitante, p.proveedorid, oc.importetotal, 
    e.descripcion estatus, e.estatusid, oc.pendiente, oc.descripcion , oc.nofactura, GROUP_CONCAT(distinct fv.ventaid SEPARATOR ', ') ventas
		from ordencompra oc
		inner join estatus e on e.estatusid = oc.estatusid
		inner join proveedor p on p.proveedorid = oc.proveedorid
        left join inventario i on i.ordencompraid = oc.ordencompraid
        left join folioVenta fv on fv.inventarioid = i.inventarioid
    where oc.almacenid = ${almacenid} ${estatus == 'inventario' ? ' and (oc.estatusid = 1 || oc.estatusid = 12)' : '' }
    group by oc.ordencompraid, oc.usuarioid, p.nombre, fecha, oc.solicitante, p.proveedorid, oc.importetotal, e.descripcion,
    e.estatusid, oc.pendiente, oc.descripcion , oc.nofactura
    order by oc.ordencompraid desc`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerMaxOrdenCompra = async () => {
    const consulta = `select case when isnull(max(ordencompraid)) then 0 ELSE MAX(ordencompraid) end ordencompraid from ordenCompra`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerOrdenCompraPorId = async (ordencompraid) => {
    const consulta = `select ordencompraid, usuarioid, solicitante, fecha,
    proveedorid, importetotal, e.descripcion estatus, e.estatusid, pendiente,
    oc.descripcion from ordencompra oc 
    inner join estatus e on e.estatusid = oc.estatusid
    where ordencompraid = ${ordencompraid}`;
    const ordencompra = await procesadorConsultas(consulta);
    return ordencompra[0];
};

const obtenerProductosOrdenCompra = async (ordencompraid) => {
    const consulta = `SELECT @rn:=@rn+1 AS consecutivo, consulta.* FROM (
	SELECT ocp.descripcionProducto as producto, ocp.cantidad, um.unidad, ocp.precioUnitario, ocp.totalIva, ocp.precioUnitarioIva, (ocp.cantidad * ocp.precioUnitarioIva) AS importe ,
	count(i.inventarioid) cantidadSurtidos, count(v.folioVentaId) vendidos, group_concat(ve.ventaId, ', ' ) folios, um.unidadid, ocp.productoid
		FROM ordencompra oc
		INNER JOIN ordencompraproducto ocp ON ocp.ordencompraid = oc.ordencompraid
		inner join unidadMedida um on um.unidadId = ocp.unidadId
		left JOIN producto p ON p.productoid = ocp.productoId
		LEFT JOIN inventario i on i.ordencompraid = oc.ordencompraid and i.productoid = ocp.productoid
        left join folioventa v on v.inventarioid = i.inventarioid
        left join venta ve on ve.ventaid = v.ventaid and ve.estatusid = 12
    WHERE oc.ordenCompraId = ${ordencompraid}
		group by ocp.descripcionproducto, ocp.cantidad, um.unidad, ocp.preciounitario, ocp.totaliva, um.unidadid, ocp.productoid, ocp.precioUnitarioIva
        ) consulta, (SELECT @rn:=0) t2;`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerDetalleOrdenCompra = async (ordencompraid) => {
    const consulta = `SELECT oc.ordencompraid, oc.almacenid, oc.descripcion, oc.proveedorid, ocp.productoid, 
    ocp.cantidad, case when totalIva > 0 then preciounitarioiva else ocp.preciounitario end preciounitario, ocp.descripcionproducto producto, ocp.unidadid,
    p.nombre as nombreproducto, p.modelo, um.unidad,
    (SELECT COUNT(*) FROM inventario i WHERE i.ordencompraid = ocp.ordenCompraId and i.productoid = ocp.productoid) cantidadinventario
    FROM ordencompra oc
    INNER JOIN ordencompraproducto ocp ON ocp.ordencompraid = oc.ordencompraid
    inner join producto p on p.productoid = ocp.productoid
    left join unidadmedida um on um.unidadid = ocp.unidadid
    WHERE oc.ordencompraid = ${ordencompraid} and p.productoid != 0`;
    const datos = await procesadorConsultas(consulta);
    return datos[0];
};

const obtenerUnidades = async () => {
    const consulta = `SELECT unidadid, descripcion FROM unidadmedida `;
    const unidades = await procesadorConsultas(consulta);
    return unidades[0];
};

const obtenerCantidadInventario = async (productoid, almacenid) => {
    const consulta = `select count(*) inventareado 
    from inventario i
    inner join ubicacion u on u.ubicacionid = i.ubicacionid
    where u.almacenid = ${almacenid} and i.productoid = ${productoid}`;
    const conteo = await procesadorConsultas(consulta);
    return conteo[0];
};

const obtenerContenedores = async (almacenid) => {
    const consulta = `select distinct contenedor from inventario i 
    inner join ubicacion u on u.ubicacionid = i.ubicacionid
    where contenedor is not null and estatusid in (14, 4) 
    and u.almacenid = ${almacenid} and i.ordencompraid is null and i.productoid is not null`;
    const contenedores = await procesadorConsultas(consulta);
    return contenedores[0];
};

const crearOrdenCompra = async (datos) => {
    const oc = !datos.sininventario ? datos[0]['oc'] : datos['oc'];
    const proveedorid = !datos.sininventario ? datos[0]['proveedorid'] : datos['proveedorid'];
    const descripcionOC = !datos.sininventario ? datos[0]['descripcion'] : datos['descripcion'];
    const solicitante = !datos.sininventario ? datos[0]['solicitante'] : datos['solicitante'];
    const almacenId = !datos.sininventario ? datos[0]['almacenId'] : datos['almacenId'];
    const usuarioid = !datos.sininventario ? datos[0]['usuarioid'] : datos['usuarioid'];

    if (!datos.sininventario) {
        for(let dato of datos){
            const resultProductoId = await procesadorConsultas(`select productoid from producto p 
                left join marca m on m.marcaid = p.marcaid
                where concat(p.nombre, ' - ', case when m.nombre is null then '' else m.nombre end) = '${dato.nombreproducto}'`);
            dato.producto = resultProductoId[0][0].productoid;
        }

        let consulta = `insert into ordenCompra (ordencompraid, usuarioid, proveedorId, importeTotal, estatusId, pendiente, descripcion, fecha, solicitante, almacenId, iva)
        values (${oc}, ${usuarioid}, ${proveedorid}, ${(datos.reduce((acum, actual) => acum += actual.importe, 0))}, 7, 
        ${(datos.reduce((acum, actual) => acum += actual.importe, 0))}, ${!descripcionOC ? "''" : "'" + descripcionOC + "'"}, now(), '${solicitante}', ${almacenId}
        , ${(datos.reduce((acum, actual) => acum += actual.totaliva, 0))})`;
        await procesadorConsultas(consulta);
        
        const promesas = datos.map(element => {
            consulta = `insert into ordenCompraProducto (ordencompraId, productoId, cantidad, precioUnitario, descripcionProducto, unidadid, precioUnitarioIva, totalIva)
            values (${oc}, ${element.producto == 0 ? 'null'  : element.producto}, ${element.cantidad}, ${element.precio}, '${element.nombreproducto}', ${element.unidadid}, ${element.precio + (element.totaliva / element.cantidad)}, ${element.totaliva / element.cantidad});`;
            return procesadorConsultas(consulta);
        });
        await Promise.all(promesas);
        return { mensaje: "Datos insertados correctamente", success: true };
    } else {
        const costo = datos['costo'];
        const cantidad = datos['cantidad'];
        const consulta = `insert into ordenCompra (ordencompraid, usuarioid, proveedorId, importeTotal, estatusId, pendiente, descripcion, fecha, solicitante, almacenId, cantidadProductos)
        values (${oc}, ${usuarioid}, ${proveedorid}, ${costo}, 7, 
        ${costo}, ${!descripcionOC ? "''" : "'" + descripcionOC + "'"}, now(), '${solicitante}', ${almacenId}, ${cantidad})`;
        await procesadorConsultas(consulta);
        return { mensaje: 'Datos insertados correctamente' };
    }
};

const crearInventario = async (datos) => {
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
        return Promise.all(datosAuxCantidad.map((row) => {
            consulta = `insert into inventario (productoid, fechaalta, dot, ubicacionid, precioventa, ordencompraid, estatusId)
            values (${row.productoid}, now(), '${row.dot}', ${row.ubicacionid}, ${row.precioventa}, ${row.ordencompraid},  4)`;
            return procesadorConsultas(consulta);
        }));
    });
    await Promise.all(promesas);

    consulta = `insert into folioAltaInventario (folioAltaId, inventarioId)
    select ${folioaltaid[0][0].folioaltaid}, inventarioId from inventario
    order by inventarioId desc
    limit ${totalRegistros};`
    await procesadorConsultas(consulta);
    return { mensaje: "Registros insertados correctamente" };
};

const actualizarOrdenCompra = async (datos) => {
    let consulta  = `update ordencompra set descripcion = '${datos.descripcion}', importeTotal = ${datos.productos.reduce((acum, actual) => acum += actual.importe, 0)},` 
    + ` iva = ${datos.productos.reduce((acum, actual) => acum += parseFloat(actual.totaliva), 0.00)}, pendiente = ${datos.productos.reduce((acum, actual) => acum += actual.importe, 0)},`
    + `proveedorid = ${datos.productos[0].proveedorid} where ordencompraid = ${datos.ordencompraid}`
    await procesadorConsultas(consulta);

    await procesadorConsultas(`delete from ordencompraproducto where ordencompraid = ${datos.ordencompraid}`);
    for(let producto of datos.productos){
        consulta = `insert into ordencompraproducto (ordencompraid, productoId, cantidad, precioUnitario, descripcionProducto, unidadid, precioUnitarioIva, totalIva)
        values (${datos.ordencompraid}, ${producto.producto == 0 ? 'null'  : producto.producto }, ${producto.cantidad}, ${producto.precio}, '${producto.nombreproducto}', ${producto.unidadid}, ${parseFloat(producto.precio) + (producto.totaliva / producto.cantidad)}, ${producto.totaliva / producto.cantidad});`;
        await procesadorConsultas(consulta);
    }
    return { mensaje: "Datos insertados correctamente" };
};

const actualizarNumeroFactura = async (datos) => {
    const consulta = `update ordencompra set nofactura = '${datos.factura}' where ordencompraid = ${datos.ordencompraid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const actualizarEstatusOrdenCompra = async (datos) => {
    const consulta = `update ordencompra set estatusId = ${datos.aceptado} where ordencompraid = ${datos.ordencompraid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerOrdenesCompraPorIds,
    obtenerOrdenesCompra,
    obtenerMaxOrdenCompra,
    obtenerOrdenCompraPorId,
    obtenerProductosOrdenCompra,
    obtenerDetalleOrdenCompra,
    obtenerUnidades,
    obtenerCantidadInventario,
    obtenerContenedores,
    crearOrdenCompra,
    crearInventario,
    actualizarOrdenCompra,
    actualizarNumeroFactura,
    actualizarEstatusOrdenCompra
};
