const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');

const imprimirCotizacion = async (productoid) => {
    let consulta = `select  p.nombre, (select m.nombre from marca m where m.marcaId = p.marcaId ) as marca,  p.precioCompra 
    from producto p where p.productoid = ${productoid}`;
    const datosProducto = await procesadorConsultas(consulta);
    let consultaFolio = ` 
    SELECT folioCotizacionId, cotizacionId, productoId
    FROM cotizacion
    WHERE productoId = ${productoid}
    ORDER BY folioCotizacionId DESC
    LIMIT 1; `;
    const datosFolio = await procesadorConsultas(consultaFolio);
    if (datosFolio.length === 0 || datosFolio[0].length === 0) {
        console.log('No se encontró un folio de cotización para el producto');
        return 'No se encontró un folio de cotización para este producto';
    }
    const folioCotizacionId = datosFolio[0][0].folioCotizacionId;
    const producto = datosProducto[0][0];
    const nombre = producto?.nombre || '';
    const marca = producto?.marca || '';
    const precioCompra = producto?.precioCompra || '';
    console.log('folioCotizacionId', folioCotizacionId)
    console.log('nombre', nombre)
    console.log('marca', marca)
    console.log('precio agregado', (precioCompra) + 500)
    console.log('precio dividido', (precioCompra) / 0.9)
    try {
        let printer = new ThermalPrinter({
            type: PrinterTypes.EPSON,
            interface: '//localhost/POS-80',
            removeSpecialCharacters: false,
            lineCharacter: "=",
            breakLine: BreakLine.WORD,
            options: {
                timeout: 5000
            }
        });
        await printer.printImage('./src/assets/logo.png');
        printer.alignCenter();
        printer.println('Folio Cotizacion: ' + folioCotizacionId);
        printer.alignRight();
        printer.bold(true);
        printer.println(nombre);
        printer.alignCenter();
        printer.bold(true);
        printer.println(marca);
        printer.alignCenter();
        printer.tableCustom([

            { text: `$${(precioCompra) + 500}`, align: "LEFT", width: 0.3 },
            { text: `$${((precioCompra) / 0.9).toFixed(2)}`, align: "RIGHT", width: 0.3 }
        ], {
            border: true,
            width: [20, 20],
            padding: 2,
            align: ['LEFT', 'RIGHT']
        });
        printer.bold(false);

        printer.cut();
        await printer.execute()
        return 'ok'
    } catch (error) {
        console.log(error)
        return 'error'
    }
};

const obtenerCotizacion = async () => {
    const consulta = `SELECT 
  c.folioCotizacionId AS folioCotizacionId,
  c.cotizacionId,
  (SELECT p.nombre FROM producto p WHERE p.productoId = c.productoId) AS nombreProducto,
  c.precio,
  CASE 
    WHEN c.fecha IS NULL THEN NULL 
    ELSE DATE_FORMAT(c.fecha, '%d-%m-%Y') 
  END AS fecha
FROM cotizacion c;

`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerProductos = async (datos) => {
    const consulta = `Select p.productoid, p.clave, p.nombre, p.iva, c.nombre categoria,p.precioCompra,
    m.nombre marca, case when isnull(p.modelo) then 'N/A' else p.modelo end modelo, p.tipo, p.ancho, p.alto, 
    p.roc, p.tamanorin, p.indicecarga, p.letravelocidadId, p.aplicacion, p.tipovehiculo, 
   case when c.categoriaid =3 then
	case when concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga end) is null 
        then '' 
		else concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga END) end
	else p.nombre end nombrefiltro
    from producto p
    inner join marca m on m.marcaid = p.marcaid
    inner join categoria c on c.categoriaid = p.categoriaid
    ${datos.filtroNombre != '' || datos.filtroCategoria != '' || datos.filtroMarca != '' || datos.filtroModelo != ''  || datos.filtroPrecioCompra != ''
        ? 'where' 
        : ''}
    ${datos.filtroNombre != '' ? `case when c.categoriaid =3 then
	case when concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga end) is null 
        then '' 
		else concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga END) end
	else p.nombre end like '%${datos.filtroNombre}%'` : ''}
    ${datos.filtroCategoria != '' ? `${ datos.filtroNombre != '' || datos.filtroMarca != '' || datos.filtroModelo != '' ? ' and ' : ''} c.nombre like '%${datos.filtroCategoria}%'` : ''}
    ${datos.filtroMarca != '' ? `${ datos.filtroNombre != '' || datos.filtroCategoria != '' || datos.filtroModelo != '' ? ' and ' : ''} m.nombre like '%${datos.filtroMarca}%'` : ''}
    ${datos.filtroModelo != '' ? `${ datos.filtroNombre != '' || datos.filtroCategoria != '' || datos.filtroMarca != '' ? ' and ' : ''} p.modelo like '%${datos.filtroModelo}%'` : ''}
    ${datos.filtroPrecioCompra != '' ? `${ datos.filtroNombre != '' || datos.filtroCategoria != '' || datos.filtroMarca != '' || datos.filtroModelo != '' ? ' and ' : ''} p.precioCompra like '%${datos.filtroPrecioCompra}%'` : ''}
    order by p.nombre
    limit 100`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerProductosServicios = async () => {
    const consulta = `select productoid, nombre, precio, 0 nuevo from producto WHERE CATEGORIAID = 2`
    const servicios = await procesadorConsultas(consulta);
    return servicios[0];
};

const obtenerProductosInventario = async (almacenid) => {
    const consulta = `    
    Select i.inventarioid, p.productoid, p.nombre, p.modelo, i.dot, concat(u.pasillo, '-', u.anaquel, '-', u.nivel) ubicacion
    , u.ubicacionid, i.precioventa
    from producto p
    inner join inventario i on i.productoid = p.productoid 
    inner join ubicacion u on i.ubicacionid = u.ubicacionid
    where u.almacenid = ${almacenid} and i.estatusid = 4`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerProductosResumido = async (datos) => {
    const consulta = `
    SELECT 0 productoid, '0' clave, 'Producto Sin inventario' nombre, 'Producto Sin Inventario' nombrefiltro
            UNION ALL 
    Select p.productoid, p.clave, concat(p.nombre, ' - ', case when m.nombre is null then '' else m.nombre end) nombre,
            case when p.categoriaid = 3 then 
                concat(concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga end), '-', m.nombre) 
            else p.nombre end nombrefiltro
        from producto p
        left join marca m on m.marcaid = p.marcaid
        ${datos.filtroProducto != '' ? ` 
        where (concat(concat(p.ancho, case when p.alto is null then '' else cast(p.alto as signed) end, tamanorin, case when indicecarga IS NULL then '' ELSE indicecarga end), '-', m.nombre) 
                like '%${datos.filtroProducto}%' or concat(p.nombre, '-', m.nombre) like '%${datos.filtroProducto}%')` : ''}
        group by p.productoid, p.clave, p.nombre
        limit 100`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerProductoPorId = async (productoid) => {
    const consulta = `Select p.productoid, p.clave, p.nombre, p.iva, c.categoriaid, m.nombre marca, p.modelo, p.tipo, p.ancho, p.alto, 
    p.roc, p.tamanorin, p.indicecarga, p.letravelocidadId, p.aplicacion, p.tipovehiculo, m.marcaid, p.precioCompra
    from producto p
    inner join marca m on m.marcaid = p.marcaid
    inner join categoria c on c.categoriaid = p.categoriaid
    where p.productoid = ${productoid}`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerCategorias = async () => {
    const consulta = `select *, 0 nuevo from categoria`;
    const resultado = await procesadorConsultas(consulta);
    return resultado[0];
};

const obtenerUbicacionProducto = async (productoid, almacenid) => {
    const consulta = `select pu.id, p.productoid, clave, nombre as producto, 
    CONCAT(pasillo, '-', anaquel, '-', nivel) as ubicacion, 
    u.almacenid, u.ubicacionid, case when ISNULL(pu.id) then 1 ELSE 0 end as nuevo
    from productoUbicacion pu
    INNER join ubicacion u on u.ubicacionId = pu.ubicacionId AND u.almacenId = ${almacenid}
    right join producto p on p.productoId = pu.productoId
    where p.productoId = ${productoid}
    GROUP BY pu.id, p.productoid, clave, nombre, pasillo, anaquel, nivel
    order by pasillo, anaquel, nivel`;
    const ubicaciones = await procesadorConsultas(consulta);
    return ubicaciones[0];
};

const obtenerLetraVelocidad = async () => {
    const consulta = `select *, 0 as nuevo from letravelocidad`;
    const letras = await procesadorConsultas(consulta);
    return letras[0];
};

const guardarProducto = async (datos) => {
    const checarPrecioCompra = `select precioCompra from producto where productoid = ${datos.productoid}`;
    const resultadoPrecioCompra = await procesadorConsultas(checarPrecioCompra);

    let precioBD = 'Insert';
    if (resultadoPrecioCompra[0] && resultadoPrecioCompra[0][0]) {
        precioBD = resultadoPrecioCompra[0][0].precioCompra ?? 0;
    }

    const consulta = datos.edicion == 'edicion' 
    ? `update producto set iva = ${datos.iva}, categoriaId = ${datos.categoria}, ancho = ${datos.ancho}, alto = ${datos.alto},
        roc = '${datos.roc.toUpperCase()}', tamanoRin = ${datos.tamanorin}, indiceCarga = ${datos.indiceCarga}, letraVelocidadId = ${datos.letraVelocidadId ? `${datos.letraVelocidadId}` : 'null'}, aplicacion = '${datos.aplicacion}',
        tipoVehiculo = ${datos.tipoVehiculo ? `${datos.tipoVehiculo}` : 'null'}, modelo = '${datos.modelo}', marcaid = ${datos.marcaid}, nombre = '${datos.nombre}', precioCompra =  '${datos.precioCompra}' where productoid = ${datos.productoid}`


    : `insert into producto (clave, iva, categoriaId,  ancho, alto, roc, tamanoRin, indiceCarga, letraVelocidadId, aplicacion, tipoVehiculo ${datos.modelo ? `, modelo` : ""}, marcaid, nombre, precioCompra)
        values (0, ${datos.iva}, ${datos.categoria}, ${datos.ancho == '' ? 'null' : datos.ancho}, ${datos.alto == '' ? 'null' : datos.alto}, '${datos.roc.toUpperCase()}',${datos.tamanorin === '' ? 'null' : datos.tamanorin}, ${datos.indiceCarga === '' ? 'null' : datos.indiceCarga},

        ${datos.letraVelocidadId ? `${datos.letraVelocidadId}` : 'null'}, '${datos.aplicacion}', ${datos.tipoVehiculo ? `'${datos.tipoVehiculo}'`  : 'null'} ${datos.modelo ? `, '${datos.modelo}'` : ""}, ${datos.marcaid}, '${datos.nombre}', ${datos.precioCompra === '' ? 'null' : `'${datos.precioCompra}'`})`;
    
    const resultadoInsert = await procesadorConsultas(consulta);
    const productoid = resultadoInsert[0].insertId || datos.productoid;

    if (resultadoInsert[0].insertId && precioBD == 'Insert') {
        const productoid = resultadoInsert[0].insertId || datos.productoid;
        const checarPrecioCompra = `select productoId, precioCompra from producto where productoid = ${productoid} `;
        const resultadoPrecioCompra = await procesadorConsultas(checarPrecioCompra);
        return { mensaje: "Datos Insertados con precioCompra", datosProcesados: resultadoPrecioCompra[0][0] };
    } else {
        if(precioBD.toString() !== datos.precioCompra ){
            const consultaProductoInsertado = ` select productoId, precioCompra from producto where productoid = ${productoid} `;
            const productoInsertado = await procesadorConsultas(consultaProductoInsertado); 
            return { mensaje: "Datos Insertados con precioCompra", datosProcesados: productoInsertado[0][0] };
        } else {
            const consultaProductoInsertado = ` select productoId from producto where productoid = ${productoid}`
            const productoInsertado = await procesadorConsultas(consultaProductoInsertado); 
            return { mensaje: "Datos Insertados sin precioCompra", datosProcesados: productoInsertado[0][0] };
        }
    }
};

const guardarCotizacion = async (datos) => {
    if (datos.productoid != 0) {
        const fechaFormateada = new Date(datos.fecha).toISOString().slice(0, 19).replace('T', ' ');
        const consulta = `INSERT INTO foliocotizacion ( fecha ) VALUES ('${fechaFormateada}')`;
        const resultado = await procesadorConsultas(consulta);
        const primerId = resultado[0].insertId;

        const consultaFolio = `
            INSERT INTO cotizacion (folioCotizacionId, productoId, precio, fecha)
            VALUES 
                (${primerId}, ${datos.productoid}, ${datos.precioCompra} + 500, '${fechaFormateada}'),
                (${primerId}, ${datos.productoid}, ${datos.precioCompra} / 0.9, '${fechaFormateada}')
        `;

        await procesadorConsultas(consultaFolio);
        return { mensaje: "Datos insertados correctamente" };
    }
    throw new Error("ProductoId no válido");
};

const guardarUbicacionesProducto = async (datos) => {
    datos.forEach(async (element) => {
        if(element.nuevo == 1){
            const consulta = `insert into productoUbicacion (productoId, ubicacionId) values (${element.productoid}, ${element.ubicacionid})`;
            await procesadorConsultas(consulta);
        }
        if(element.nuevo == 2){
            const consulta = `update productoUbicacion set ubicacionid = ${element.ubicacionid} where id = ${element.id}`;
            await procesadorConsultas(consulta);
        }
    });
    return { mensaje: "Datos insertados correctamente" };
};

const guardarCategorias = async (datos) => {
    const promesas = datos.map((element) => {
        const consulta = element.nuevo == 1 
            ? `insert into categoria (nombre) values ('${element.nombre}')`
        : element.nuevo == 2 
            ? `update categoria set nombre = '${element.nombre}' where categoriaid = ${element.categoriaId}`
        : `delete from categoria where categoriaId = ${element.categoriaId}`;
        return procesadorConsultas(consulta);
    })
    await Promise.all(promesas);
    return { mensaje: "Datos modificados correctamente" };
};

const guardarLetraVelocidad = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = element.nuevo == 1 
        ? `INSERT INTO  letravelocidad (letra) VALUES ('${element.letra}')` 
        : element.nuevo == 2 
        ? `update letravelocidad set letra = '${element.letra}' where letraVelocidadid = ${element.letraVelocidadId}`
        : ` delete FROM letravelocidad WHERE letraVelocidadId = ${element.letraVelocidadId} `;
        return procesadorConsultas(consulta);
    })
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

const guardarServicios = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = element.nuevo == 1 
        ? `INSERT INTO producto (nombre, precio, estatusid, categoriaid) values ('${element.nombre}', ${element.precio}, 8, 2)`
        : element.nuevo == 2 
        ? `update producto set nombre = '${element.nombre}', precio = ${element.precio} where productoid = ${element.productoid}`
        : ` update producto set estatusid = 9 where productoid = ${element.productoid}`;
        return procesadorConsultas(consulta);
    })
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

const eliminarProducto = async (productoid) => {
    const consulta = `delete from producto where productoid = ${productoid}`;
    await procesadorConsultas(consulta);
    return { mensaje: "Datos eliminados correctamente" };
};

module.exports = {
    imprimirCotizacion,
    obtenerCotizacion,
    obtenerProductos,
    obtenerProductosServicios,
    obtenerProductosInventario,
    obtenerProductosResumido,
    obtenerProductoPorId,
    obtenerCategorias,
    obtenerUbicacionProducto,
    obtenerLetraVelocidad,
    guardarProducto,
    guardarCotizacion,
    guardarUbicacionesProducto,
    guardarCategorias,
    guardarLetraVelocidad,
    guardarServicios,
    eliminarProducto
};
