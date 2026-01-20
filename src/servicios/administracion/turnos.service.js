const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerTurnoActivo = async (usuarioid, sucursalid) => {
    const consulta = `select turnoid from turno where usuarioid = ${usuarioid} and sucursalid = ${sucursalid} and fechacierre is null`;
    const turno = await procesadorConsultas(consulta);
    return turno[0];
};

const obtenerCortesPorTurno = async (turnoId) => {
    const consulta = ` select * from corte where turnoId = ${turnoId} `;
    const cortes = await procesadorConsultas(consulta);
    return cortes[0];
};

const obtenerProductosPorTurno = async (turnoid) => {
    const consulta = `
select DISTINCT p.*
 from producto p
inner join inventario i on  i.productoId=p.productoId
inner join folioventa fv on fv.inventarioId= i.inventarioId 
inner join venta v on v.ventaId= fv.ventaId
inner join pagoventa pv on pv.ventaId= v.ventaId
where pv.turnoId=${turnoid} `;
    const productos = await procesadorConsultas(consulta);
    return productos[0];
};

const obtenerTurnos = async (sucursalid) => {
    const consulta = `select u.nombre, t.fechainicio, u.usuarioid, t.turnoid, count(distinct c.corteid) cortes,
    sum(distinct t.cantidadInicial + (select case when isnull(sum(p.monto)) then 0 else sum(p.monto) end 
        from venta v 
        inner join pagoVenta p on p.ventaid = v.ventaid
        where p.turnoid = t.turnoid and v.estatusId != 3 and p.estatusId = 1) - 
        (select case when  isnull(sum(monto)) then 0 else sum(monto) end from corte c where c.turnoid = t.turnoid and c.estatusid = 7)) restante,
    t.cantidadinicial
    from turno t 
    inner join usuario u on u.usuarioid = t.usuarioid
    left join corte c on c.turnoid = t.turnoid
    where t.fechaCierre is null and t.sucursalid = ${sucursalid}
    group by u.nombre, t.fechaInicio, u.usuarioid, t.turnoid`;
    const turnos = await procesadorConsultas(consulta);
    return turnos[0];
};

const obtenerPagosTurno = async (turnoid) => {
    const consulta = `    
       select turnoId, tipoPagoId,fechaPago, monto 
       from pagoventa where turnoid = ${turnoid} and estatusid =  1`;
    const pagosTurno = await procesadorConsultas(consulta);
    return pagosTurno[0];
};

const obtenerServiciosTurno = async (turnoid) => {
    const consulta = `    
    select DISTINCT  p.nombre as servicio, vs.cantidad as cantidad
        from producto p 
        inner join ventaservicio vs on vs.productoId= p.productoId 
        inner join venta v on v.ventaId= vs.ventaId
        inner  join pagoventa pv on pv.ventaId= v.ventaId
    where pv.turnoId=${turnoid}`;
    const serviciosTurno = await procesadorConsultas(consulta);
    return serviciosTurno[0];
};

const obtenerServicios = async () => {
    const consulta = `select productoId, nombre from producto where categoriaid != 3 and categoriaid != 1`;
    const servicios = await procesadorConsultas(consulta);
    return servicios[0];
};

const consultaTurnosHelper = (alias, turnoid) => {
    return `select v.ventaId, v.monto montoVenta, oc.ordencompraId, prov.nombre proveedor, i.productoId, pr.nombre producto
    , ifnull(pr.tipo, 'Semi Nueva') tipo, i.precioVenta - fv.descuento precioUnitario, (i.precioVenta - fv.descuento) * count(*) precioVenta, count(*) cantidad, sum(distinct ifnull(p.monto, 0)) pagoVenta
    from venta v
    inner join folioVenta fv on fv.ventaid = v.ventaid
    inner join inventario i on i.inventarioid = fv.inventarioid
    inner join ordencompra oc on oc.ordencompraid = i.ordencompraid
    inner join proveedor prov on prov.proveedorid = oc.proveedorid
    inner join producto pr on pr.productoid = i.productoid
    left join pagoVenta p on v.ventaId = p.ventaId and p.estatusId = 1
    where ${alias}.turnoid = ${turnoid}
    group by v.ventaid, v.monto, oc.ordencompraId, prov.nombre, i.productoId, pr.nombre, pr.tipo, i.precioVenta, fv.descuento
    
    union all 
    
    select v.ventaId, v.monto montoVenta, 'N/A' ordencompraId, 'N/A' proveedor, pr.productoId, concat(pr.nombre, ' x', vs.cantidad) producto, 'N/A' tipo
    , pr.precio precioUnitario, (pr.precio * vs.cantidad) precioVenta, vs.cantidad, sum(ifnull(p.monto, 0)) pagoVenta
    from venta v
    inner join ventaservicio vs on vs.ventaid = v.ventaid 
    inner join producto pr on pr.productoid = vs.productoid 
    left join pagoVenta p on v.ventaId = p.ventaId and p.estatusId = 1
    where ${alias}.turnoid = ${turnoid}
    group by v.ventaid, v.monto, pr.productoId, pr.nombre, pr.tipo, pr.precio, vs.cantidad`
};

const obtenerVentasTurno = async (turnoid) => {
    const consulta = consultaTurnosHelper('v', turnoid);
    const ventasTurno = await procesadorConsultas(consulta);
    return ventasTurno[0];
};

const obtenerIngresosTurno = async (turnoid) => {
    const consulta = consultaTurnosHelper('p', turnoid);
    const pagosTurno = await procesadorConsultas(consulta);
    return pagosTurno[0];
};

const obtenerHistorialRetiros = async () => {
    const consulta = `select c.turnoid, sum(monto) monto, u.nombre usuario, c.tipo 
        From corte c 
        inner join usuario u on u.usuarioid = c.usuarioid
    where c.estatusid = 7
    group by c.turnoId, u.nombre, c.tipo`
    const retirosTurno = await procesadorConsultas(consulta);
    return retirosTurno[0];
};

const obtenerHistorialCortes = async () => {
    const consulta = `SELECT c.corteid, c.monto, date_format(c.fechacorte, '%d/%m/%Y %h:%m') fechacorte, (SELECT nombre FROM usuario u WHERE u.usuarioid = c.usuarioid) nombre, date_format(t.fechainicio, '%d/%m/%Y %h:%m') fechainicio,
    CASE when isnull(t.fechacierre) then 'Turno vigente' ELSE date_format(t.fechacierre, '%d/%m/%Y %h:%m') END fechacierre
    , (select descripcion from estatus e where e.estatusid = c.estatusid) estatus, t.cantidadInicial, t.turnoId
    FROM corte c 
    INNER JOIN turno t ON t.turnoid = c.turnoid
    order by c.fechacorte desc`;
    const cortes = await procesadorConsultas(consulta);
    return cortes[0];
};

const obtenerRetirosConsultar = async () => {
    const consulta = `select  c.corteId as corteId,c.turnoId as folioTurno, c.fechaCorte as fechaCorte ,c.monto as monto, u.nombre as nombre, e.descripcion as estatus, c.descrpcion as motivo
    from corte c
    inner join usuario u on u.usuarioId= c.usuarioId
    inner join estatus e on e.estatusId = c.estatusId
  where c.estatusId = 7
  ORDER BY c.fechaCorte DESC;
 `
    const retiros = await procesadorConsultas(consulta);
    return retiros[0];
};

const crearRetiroEfectivo = async (datos) => {
    const consulta = `insert into corte (turnoid, monto, fechacorte, usuarioId, estatusId, tipo, descrpcion) values (${datos.turnoid}, ${datos.monto}, now(), ${datos.usuarioid}, 7, '${datos.tipo}', '${datos.motivo}')`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const cambiarEstatusRetiro = async (datos) => {
    const consulta = ` update corte set estatusId= ${datos.estatus} where corteId = ${datos.corteId}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos Actualizados correctamente" };
};

const crearTurno = async (datos) => {
    const consulta = `INSERT INTO turno (usuarioId, fechaInicio, cantidadInicial, sucursalId) 
    VALUES (${datos.usuarioid}, now(), ${datos.cantidad}, ${datos.sucursalid})`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos insertados correctamente" };
};

const terminarTurno = async (datos) => {
    let consulta = `update turno set fechacierre = now() where turnoid = ${datos.turnoid}`;
    await procesadorConsultas(consulta);
    consulta = `insert into corte (turnoid, monto, fechacorte, usuarioid, estatusid, tipo)
    select ${datos.turnoid},
    sum(distinct (select case when isnull(sum(p.monto)) then 0 else sum(p.monto) end from venta v 
        inner join pagoVenta p on p.ventaid = v.ventaid
        where p.turnoid = t.turnoid and v.estatusId != 3 and p.estatusId = 1) - 
        (select case when  isnull(sum(monto)) then 0 else sum(monto) end from corte co where co.turnoid = t.turnoid and co.estatusid = 7)),
    now(), ${datos.usuarioid}, 8, 'total'
    from turno t 
    inner join usuario u on u.usuarioid = t.usuarioid
    left join corte c on c.turnoid = t.turnoid
    where t.turnoid = ${datos.turnoid}
    group by u.nombre, t.fechaInicio, u.usuarioid, t.turnoid`;
    console.log(consulta);
    await procesadorConsultas(consulta);
    return { mensaje: "Datos Actualizados correctamente" };
};

const cancelarCorte = async (datos) => {
    const consulta = `update corte set estatusId = 3 where corteid = ${datos.corteid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos Actualizados correctamente" };
};

module.exports = {
    obtenerTurnoActivo,
    obtenerCortesPorTurno,
    obtenerProductosPorTurno,
    obtenerTurnos,
    obtenerPagosTurno,
    obtenerServiciosTurno,
    obtenerServicios,
    obtenerVentasTurno,
    obtenerIngresosTurno,
    obtenerHistorialRetiros,
    obtenerHistorialCortes,
    obtenerRetirosConsultar,
    crearRetiroEfectivo,
    cambiarEstatusRetiro,
    crearTurno,
    terminarTurno,
    cancelarCorte
};
