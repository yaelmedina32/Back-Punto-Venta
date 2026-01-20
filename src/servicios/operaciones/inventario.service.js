const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');

const obtenerInventario = async (venta, almacenid) => {
    const consulta = `select i.inventarioid, clave, p.nombre nombreproducto, p.modelo, (select nombre from marca m where m.marcaid = p.marcaid) marca
    , p.modelo, p.productoid, DATE_FORMAT(i.fechaalta, '%d/%m/%Y') fechaalta, i.dot
    , CONCAT(pasillo, '-', anaquel, '-', nivel) ubicacion, CONCAT(pasillo, anaquel, nivel) ubicacionFiltrado
    , u.ubicacionid, i.costo, i.precioventa, oc.ordencompraid, 0 as nuevo,
    concat(ifnull(p.ancho,''), ifnull(cast(cast(p.alto as signed) as char(10)), ''), ifnull(tamanorin, ''), ifnull(cast(indicecarga as signed), ''))  nombrefiltro
    , 1 cantidad, 0 descuento
    from inventario i
    inner join producto p on p.productoid = i.productoid
    inner join ubicacion u on u.ubicacionid = i.ubicacionid
    left JOIN ordencompra oc on i.ordencompraid = oc.ordencompraid 
    WHERE i.estatusid in (4${venta != '1' ? ', 14' : ''}) and u.almacenid = ${almacenid} ${venta == '1' ? " and i.dot != '' and (precioventa is not null or precioventa > 0)" : ''}`;
    const inventario = await procesadorConsultas(consulta);
    return inventario[0];
};

const obtenerInventarioExcel = async () => {
    const consulta =`select (select nombre from marca m where m.marcaId= p.marcaId ) as marca, p.modelo, p.ancho, p.alto, p.tamanoRin AS rin, p.indiceCarga, p.roc, i.dot, 
(select letra from letravelocidad l where l.letraVelocidadId = p.letraVelocidadId) as letraVelocidad, p.tipo, i.costo, i.precioVenta, 
u.pasillo, u.anaquel, u.nivel, i.ordenCompraId
 from folioventa f
right join inventario i on i.inventarioId= f.inventarioId
inner join producto p on p.productoId = i.productoId
inner join ubicacion u on u.ubicacionId = i.ubicacionId
where f.folioventaId is null and i.estatusId !=11`
    const inventarioExcel = await procesadorConsultas(consulta);
    return inventarioExcel;
};

const obtenerInventariosVentas = async (ventaid) => {
    const consulta = `
        select i.inventarioid, p.nombre nombreproducto, (select nombre from marca m where m.marcaid = p.marcaid) marca
            , p.modelo, p.productoid, DATE_FORMAT(i.fechaalta, '%d/%m/%Y') fechaalta, i.dot
            , CONCAT(pasillo, '-', anaquel, '-', nivel) ubicacion, precioventa, oc.ordencompraid, 0 as nuevo,
                concat(ifnull(p.ancho,''), ifnull(cast(cast(p.alto as signed) as char(10)), ''), ifnull(tamanorin, ''), ifnull(cast(indicecarga as signed), ''))  nombrefiltro
            , 1 cantidad, fv.descuento, i.precioventa - fv.descuento AS total, CONCAT(pasillo, '-', anaquel, '-', nivel) ubicacion, CONCAT(pasillo, anaquel, nivel) ubicacionFiltrado
        from inventario i 
        INNER JOIN folioventa fv ON fv.inventarioid = i.inventarioid
        inner join producto p on p.productoid = i.productoid
        inner join ubicacion u on u.ubicacionid = i.ubicacionid
        left JOIN ordencompra oc on i.ordencompraid = oc.ordencompraid 
        WHERE fv.ventaid = ${ventaid}
    
        UNION All

        select 0 inventarioid, p.nombre nombreproducto, '' marca
            , '' modelo, p.productoid, '' fechaalta, '' dot
            , '' ubicacion,  p.precio precioventa, 0 ordencompraid, 0 as nuevo,
            '' nombrefiltro, vs.cantidad, vs.descuento as descuento, p.precio- vs.descuento AS total, '' ubicacion, '' ubicacionFiltrado
        FROM ventaServicio vs
        INNER JOIN producto p ON p.productoid = vs.productoid
        WHERE vs.ventaid = ${ventaid}
         `;
    const inventario = await procesadorConsultas(consulta);
    return inventario[0];
};

const procesarExcelInventario = async (datos) => {
    ///////////////////////////////// LETRAS ////////////////////////////////////

    //PRIMERO PONGO LAS LETRAS SIN REPETIRSE
    const arregloLetrasSinRepetir = datos.letras.filter(ele => ele != '').reduce((acumulador, elemento) => {
        if(!acumulador.some(e => JSON.stringify(e) === JSON.stringify(elemento))){
            acumulador.push(elemento);
        }
        return acumulador;
    }, []);
    let letras = arregloLetrasSinRepetir.reduce((acum, actual) => acum += "'" + actual + "',", "");
    let letrasSinAlta = [];
    letras = letras.substring(0, letras.length - 1);
    //LUEGO SACO CUÁLES LETRAS ESTÁN INSERTADAS EN LA TABLA
    if(letras != ""){
        let consulta = `select * from letraVelocidad where letra in (${letras})`;
        const arregloLetras = await procesadorConsultas(consulta);
        //LUEGO SACO LAS LETRAS QUE VIENEN DEL EXCEL, Y DEVUELVO LAS QUE NO HAN SIDO DADAS DE ALTA
        arregloLetrasSinRepetir.forEach(element => {
            !arregloLetras[0].some(ele => ele.letra == element) ?
            letrasSinAlta.push(
                {
                    letra: element,
                    letraid: arregloLetras[0].some(ele => ele.letra == element) ? arregloLetras[0].find(ele => ele.letra == element).letraVelocidadId : 0,
                }
            ) : null;
        });
    }

    ///////////////////////////////// MARCAS ////////////////////////////////////

    const arregloMarcasSinRepetir = datos.marcas.filter(ele => ele != '').reduce((acumulador, elemento) => {
        if(!acumulador.some(e => JSON.stringify(e) === JSON.stringify(elemento))){
            acumulador.push(elemento);
        }
        return acumulador;
    }, []);

    let marcas = arregloMarcasSinRepetir.reduce((acum, actual) => acum += "'" + actual + "',", "");
    marcas = marcas.substring(0, marcas.length - 1);
    let marcasSinAlta = [];
    consulta = `select * from marca where nombre in (${marcas})`;
    const arregloMarcas = await procesadorConsultas(consulta);
    arregloMarcasSinRepetir.forEach((element) => {
        !arregloMarcas[0].some(ele => ele.nombre == element) ?
        marcasSinAlta.push(
            {
                marca: element,
                marcaid: arregloMarcas[0].some(ele => ele.nombre == element) ? arregloMarcas[0].find(ele => ele.nombre == element).marcaId : 0,
            }
        ) : null;
    });

    
    ///////////////////////////////// PRODUCTOS ////////////////////////////////////
    let productosInsertados = [];
    let productosSinAlta = [];
    const promesas = datos.productos.map((element) => {
        consulta = `select p.*, m.nombre as marca, case when isnull(l.letra) then '' else l.letra end letra from producto p
        inner join marca m on m.marcaid = p.marcaid
        left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
        where p.ancho = ${element.ancho} and p.alto ${element.alto == '' ? ' is null' : ' = ' + element.alto} and p.modelo = '${element.modelo}' and p.roc = '${element.roc}' 
        and p.tamanorin = ${element.rin} and p.indicecarga ${!element.indicecarga ? 'is null' : '=' + element.indicecarga}
        and l.letra ${element.letra == '' ? 'is null' : "= '" + element.letra + "'"} and m.nombre = '${element.marca}'`;
        return procesadorConsultas(consulta);
    })

    const productos = await Promise.all(promesas);
    
    productos.forEach((element) => {
        element[0].length > 0 ? productosInsertados.push(element[0][0]) : null;
    })

    datos.productos.forEach((element) =>{
        !productosInsertados.some(ele => ele.ancho == element.ancho && ele.alto == element.alto && element.modelo == ele.modelo 
            && ele.roc == element.roc && element.letra == ele.letra && element.marca == ele.marca && element.indicecarga == ele.indiceCarga
        ) ? productosSinAlta.push(element) : null
    });

    return {letras: letrasSinAlta, marcas: marcasSinAlta, productos: productosSinAlta};
};

const procesarFaltantesExcel = async (datos) => {
    if(datos.letras){
        for(let i = 0; i < datos.letras.filter(ele => !ele.insertado).length; i++){
            const element = datos.letras.filter(ele => !ele.insertado)[i];
            const consulta = `INSERT INTO letraVelocidad (letra)
            SELECT DISTINCT '${element.letra}'
            FROM letraVelocidad WHERE NOT EXISTS (SELECT 1 FROM letraVelocidad WHERE binary letra = '${element.letra}')`;
            await procesadorConsultas(consulta);
        }
    }
    if(datos.marcas){
        for(let i = 0; i < datos.marcas.filter(ele => !ele.insertado).length; i++){
            const element = datos.marcas.filter(ele => !ele.insertado)[i];
            const consulta = `INSERT INTO marca (nombre)
            SELECT DISTINCT '${element.marca}'
            FROM marca WHERE NOT EXISTS (SELECT 1 FROM marca WHERE binary nombre = '${element.marca}')`;
            await procesadorConsultas(consulta);
        }
    }
    if(datos.productos){
        for(let i = 0; i < datos.productos.length; i++){
            const element = datos.productos[i];
            console.log(element.letra)
            const consulta = `
              insert into producto (clave, nombre, iva, categoriaId, tipo, ancho ${element.alto == '' ? "" : ", alto"}, roc, tamanoRin ${element.indicecarga == '' ? "" : ", indiceCarga"}, marcaId, modelo ${element.letra == '' ? '' : ', letraVelocidadId'}, estatusId)
            SELECT 0, nombre, iva, categoriaid, tipo, ancho${element.alto == '' ? "" : ", alto "}, roc, tamanoRin ${element.indicecarga == '' ? "" : ", indiceCarga"}, marcaId, modelo ${element.letra == '' ? '' : ', letra'}, 4
            FROM (
                    SELECT  '${element.ancho + '/' + element.alto + element.roc + element.rin + " " +  element.indicecarga}' nombre
                    , 0 iva, 3 categoriaid,  '${element.tipo}' tipo
                    , ${element.ancho} ancho,
                    ${element.alto == '' ? "" : element.alto + " alto, "}  '${element.roc}' roc,
                    ${element.rin} tamanoRin, ${element.indicecarga == '' ? "" : element.indicecarga + " indiceCarga, "} 
                    (select marcaId from marca where binary nombre = '${element.marca}') marcaId,
                    ${element.letra == '' ? '' : ` (select letraVelocidadId from letraVelocidad where binary letra = '${element.letra}') letra, `}
                    '${element.modelo}' modelo
                ) i
                WHERE NOT EXISTS  (select 1 from producto p
            inner join marca m on m.marcaid = p.marcaid
            left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
            where p.ancho = '${element.ancho}' and p.alto ${element.alto == '' ? ' is null ' : " = '" + element.alto +  "'"} and p.modelo = '${element.modelo}' and p.roc = '${element.roc}'
            and p.tamanorin = '${element.rin}' and p.indicecarga ${!element.indicecarga ? ' is null' : '= ' + element.indicecarga}
            and l.letra ${element.letra == '' ? 'is null' : "= '" + element.letra + "'"} and m.nombre = '${element.marca}')`;
            await procesadorConsultas(consulta);
        }
    }

    for(let i = 0; i < datos.inventario.length; i++){
        const element = datos.inventario[i];
        let consulta = `insert into ubicacion (pasillo, anaquel, nivel, almacenid)
        select pasillo, anaquel, nivel, ${element.almacenid}
        from (
            select '${element.pasillo}' pasillo, '${element.anaquel}' anaquel, '${element.nivel}' nivel) i
            where not exists (select 1 from ubicacion u where u.pasillo = i.pasillo and u.anaquel = i.anaquel and u.nivel = i.nivel and u.almacenid = ${element.almacenid})`;
            
        await procesadorConsultas(consulta);

        consulta = `insert into inventario (productoid, fechaalta, dot, ubicacionid, estatusid, precioventa, costo, ordencompraid)
        values ((select max(productoid) from producto p
        inner join marca m on m.marcaid = p.marcaid
        left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
         where p.ancho = '${element.ancho}' and p.alto ${element.alto == '' ? ' is null ' : " = '" + element.alto +  "'"} and p.modelo = '${element.modelo}' and p.roc = '${element.roc}'
            and p.tamanorin = '${element.rin}' and p.indicecarga ${!element.indicecarga ? ' is null' : '= ' + element.indicecarga}
            and l.letra ${element.letra == '' ? 'is null' : "= '" + element.letra + "'"} and m.nombre = '${element.marca}')
        , now() , '${element.dot ? (element.dot.toString().includes("'") ? element.dot.toString().replace("'", "") : element.dot) : ""}',
        (select ubicacionid from ubicacion where pasillo = '${element.pasillo}' and anaquel = '${element.anaquel}' and nivel = '${element.nivel}')
        , ${element.merma ? '11' : element.dot == '' ? '14' : '4'}, ${!element.venta ?  ' null' : element.venta }, ${element.costo}, ${element.ordencompraid})`;
        console.log(consulta);
        await procesadorConsultas(consulta);
        consulta = `insert into ordencompraproducto (ordencompraid, productoid, cantidad, preciounitario, descripcionproducto, unidadid)
        values (
            ${element.ordencompraid},
            (select max(productoid) from producto p
            inner join marca m on m.marcaid = p.marcaid
            left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
            where ancho = ${element.ancho} and alto = ${element.alto == '' ? ' 0' :  element.alto} and roc = '${element.roc}'
            and tamanoRin = ${element.rin} ${element.indicecarga ? ` and indiceCarga = ${element.indicecarga}` : " and indiceCarga = 0" } 
            and m.nombre = '${element.marca}'
            and p.modelo ${!element.modelo ? ' is null ' : ` = '${element.modelo}'`}
            and l.letra ${element.letra == '' ? ' is null' : " = '" + element.letra + "'"}),
            1, ${element.costo}, '', 1
        )`;
        await procesadorConsultas(consulta);
    }

    return { mensaje: "Datos insertados correctamente" };
};

const actualizarInventario = async (datos) => {
    const promesas = datos.map(element => {
        const consulta = `update inventario set dot = '${element.dot}' ${element.ubicacionid ? ', ubicacionid = ' + element.ubicacionid : ''} ${element.merma ? ', estatusid=11' : element.dot != '' && element.precioventa > 0 ? ', estatusid = 4' : ''}, 
        precioventa = ${element.precioventa} where inventarioid = ${element.inventarioid}`;
        return procesadorConsultas(consulta);
    });
    await Promise.all(promesas);
    return { mensaje: "Datos insertados correctamente" };
};

module.exports = {
    obtenerInventario,
    obtenerInventarioExcel,
    obtenerInventariosVentas,
    procesarExcelInventario,
    procesarFaltantesExcel,
    actualizarInventario
};
