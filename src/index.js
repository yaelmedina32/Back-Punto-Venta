const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./routes/login/auth.router');

const rutasCatalogos = {
	catalogos: require('./routes/catalogos/catalogos.router'),
	marcas: require('./routes/catalogos/marcas.router'),
};

const rutasOperaciones = {
    ubicaciones: require('./routes/operaciones/ubicaciones.router'),
	productos: require('./routes/operaciones/productos.router'),
	proveedores: require('./routes/operaciones/proveedores.router'),
	inventario: require('./routes/operaciones/inventario.router'),
	ventas: require('./routes/operaciones/ventas.router'),
};

const rutasAdministracion = {
	turnos: require('./routes/administracion/turnos.router'),
	clientes: require('./routes/administracion/clientes.router'),
	ordenescompra: require('./routes/administracion/ordenescompra.router'),
	cuentaspagar: require('./routes/administracion/cuentaspagar.router'),
}

const rutasConfiguraciones = {
	usuarios: require('./routes/configuraciones/configuraciones.router'),
};

const app = express();

app.set('trust proxy', true);

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin'
    + ', X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, token');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.setHeader('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

const api = '/api/'
app.use(api, auth);
app.use(api + 'operaciones/', rutasOperaciones.ubicaciones);
app.use(api + 'operaciones/', rutasOperaciones.productos);
app.use(api + 'operaciones/', rutasOperaciones.proveedores);
app.use(api + 'operaciones/', rutasOperaciones.inventario);
app.use(api + 'operaciones/', rutasOperaciones.ventas);

app.use(api + 'administracion/', rutasAdministracion.ordenescompra);
app.use(api + 'administracion/', rutasAdministracion.turnos);
app.use(api + 'administracion/', rutasAdministracion.clientes);
app.use(api + 'administracion/', rutasAdministracion.cuentaspagar);

app.use(api + 'catalogos/', rutasCatalogos.catalogos);
app.use(api + 'marcas/', rutasCatalogos.marcas);

app.use(api + 'configuraciones/', rutasConfiguraciones.usuarios);

app.listen(4300 || 5000 );