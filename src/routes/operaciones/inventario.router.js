const express = require('express');
const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const rutas = express.Router();

rutas.get('/inventario/:venta', async(req,res) => {
    const venta = req.params.venta;
    try{
       
        const consulta = `select i.inventarioid, clave, p.nombre nombreproducto, (select nombre from marca m where m.marcaid = p.marcaid) marca
        , p.modelo, p.productoid, DATE_FORMAT(i.fechaalta, '%d/%m/%Y') fechaalta, i.dot
        , CONCAT(pasillo, '-', anaquel, '-', nivel) ubicacion, u.ubicacionid, i.costo, i.precioventa, oc.ordencompraid, 0 as nuevo,
        concat(p.ancho, p.alto, tamanorin, indicecarga) nombrefiltro, 1 cantidad
        from inventario i 
        inner join producto p on p.productoid = i.productoid
        inner join ubicacion u on u.ubicacionid = i.ubicacionid
        left JOIN ordencompra oc on i.ordencompraid = oc.ordencompraid 
        WHERE i.estatusid in (4${venta != '1' ? ', 14' : ''})`;
        const inventario = await procesadorConsultas(consulta);
        return res.json(inventario[0]);
    }catch(error){
        if(error){
            return res.status(500).send({error: error});
        }
    }
});

rutas.get('/inventario/venta/:ventaid', async(req,res) => {
    const ventaid = req.params.ventaid;
    const consulta = `select i.inventarioid, p.nombre nombreproducto, (select nombre from marca m where m.marcaid = p.marcaid) marca
        , p.modelo, p.productoid, DATE_FORMAT(i.fechaalta, '%d/%m/%Y') fechaalta, i.dot
        , CONCAT(pasillo, '-', anaquel, '-', nivel) ubicacion, precioventa, oc.ordencompraid, 0 as nuevo,
        concat(p.ancho, p.alto, tamanorin, indicecarga) nombrefiltro, 1 cantidad
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
            '' nombrefiltro, vs.cantidad
        FROM ventaServicio vs
        INNER JOIN producto p ON p.productoid = vs.productoid
        WHERE vs.ventaid = ${ventaid}`;
    const inventario = await procesadorConsultas(consulta);
    return res.json(inventario[0]);
})

rutas.post('/inventario/excel', async(req,res) => {
    const datos = req.body.datos;
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
        where p.ancho = ${element.ancho} and p.alto = ${element.alto} and p.modelo = '${element.modelo}' and p.roc = '${element.roc}' 
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

    // datos.productos.forEach((ele) => {
    //     !productos.some(element => element[0].some(producto => producto.ancho == ele.ancho && producto.modelo == ele.modelo &&
    //         producto.roc == ele.roc && producto.alto == ele.alto && ele.indicecarga == producto.indiceCarga && producto.marca == ele.marca
    //         && ele.letra == producto.letra
    //     )) ? productosSinAlta.push(ele) : null;
    // })

    return res.json({letras: letrasSinAlta, marcas: marcasSinAlta, productos: productosSinAlta});
});

rutas.post('/inventario/excel/faltantes', async(req,res) => {
    const datos = req.body.datos;
    try{
        if(datos.letras){
            const promesasLetras = datos.letras.filter(ele => !ele.insertado).map((element) => {
                const consulta = `insert into letraVelocidad (letra) values ('${element.letra}')`;
                return procesadorConsultas(consulta);
            })
            await Promise.all(promesasLetras);
        }
        if(datos.marcas){
            const promesasMarcas = datos.marcas.filter(ele => !ele.insertado).map((element) => {
                const consulta = `insert into marca (nombre) values ('${element.marca}')`;
                return procesadorConsultas(consulta);
            })
            await Promise.all(promesasMarcas);
        }
        if(datos.productos){
            const promesasProductos = datos.productos.map((element) => {
                const consulta = `insert into producto (nombre, iva, categoriaId, tipo, ancho, alto, roc, tamanoRin, indiceCarga, marcaId, modelo${element.letra != "" ? ", letraVelocidadId" : ""})
                values  ('${element.ancho + '/' + element.alto + element.roc + element.rin + " " +  element.indicecarga}', 0, 3, 'Producto', ${element.ancho}, ${element.alto}, '${element.roc}',
                ${element.rin}, ${element.indicecarga}, (select marcaId from marca where binary nombre = '${element.marca}'), '${element.modelo}'
                ${element.letra == '' ? '' : `, (select letraVelocidadId from letraVelocidad where binary letra = '${element.letra}')`} )`;
                return procesadorConsultas(consulta);
            })
            await Promise.all(promesasProductos);
        }
        
        const promesasInventarios = datos.inventario.map((element) => {
            const consulta = `insert into inventario (productoid, fechaalta, dot, ubicacionid, estatusid, costo, ordencompraid)
            values ((select productoid from producto p
            inner join marca m on m.marcaid = p.marcaid
            left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
            where ancho = ${element.ancho} and alto = ${element.alto} and roc = '${element.roc}'
            and tamanoRin = ${element.rin} ${element.indicecarga != "" ? ` and indiceCarga = ${element.indicecarga}` : "" } and m.nombre = '${element.marca}'
            and p.modelo = '${element.modelo}'
            and l.letra ${element.letra == '' ? ' is null' : " = '" + element.letra + "'"}), now() ${element.dot ? ", '" + element.dot + "'" : "''"},
            (select ubicacionid from ubicacion where pasillo = ${element.pasillo} and anaquel = ${element.anaquel} and nivel = '${element.nivel}')
            , ${element.merma ? '11' : element.dot == '' ? '14' : '4'}, ${element.costo}, ${element.ordencompraid})`;
            return procesadorConsultas(consulta);
        });
        await Promise.all(promesasInventarios);    
        const promesasOC = datos.inventario.map((element) => {
            const consulta = `insert into ordencompraproducto (ordencompraid, productoid, cantidad, preciounitario, descripcionproducto, unidadid)
            values (
                ${element.ordencompraid},
                (select productoid from producto p
                inner join marca m on m.marcaid = p.marcaid
                left join letravelocidad l on l.letravelocidadid = p.letravelocidadid
                where ancho = ${element.ancho} and alto = ${element.alto} and roc = '${element.roc}'
                and tamanoRin = ${element.rin} ${element.indicecarga != "" ? ` and indiceCarga = ${element.indicecarga}` : "" } and m.nombre = '${element.marca}'
                and p.modelo = '${element.modelo}'
                and l.letra ${element.letra == '' ? ' is null' : " = '" + element.letra + "'"}),
                1, ${element.costo}, '', 1
            )`
            return procesadorConsultas(consulta);
        })
        await Promise.all(promesasOC);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
})

rutas.put('/inventario', async(req,res) => {
    const datos = req.body.datos;
    datos
    try{
        
        const promesas = datos.map(element => {
            const consulta = `update inventario set dot = '${element.dot}' ${element.merma ? ', estatusid=11' : element.dot != '' && element.precioventa > 0 ? ', estatusid = 4' : ''}, 
            precioventa = ${element.precioventa} where inventarioid = ${element.inventarioid}`;
            return procesadorConsultas(consulta);
        });
        await Promise.all(promesas);
        return res.status(200).send({mensaje: "Datos insertados correctamente"});
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
})

module.exports = rutas;