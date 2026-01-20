const procesadorConsultas = require('../../controladores/procesadorConsultas.controller');
const crypt = require('bcryptjs');
const sjcl = require('sjcl');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const login = async (usuario, clave, key) => {
    const decifrado = sjcl.decrypt(key, clave);
    const hashedPassword = await crypt.hash(decifrado, 10);

    const consulta = `select usuarioid, nombre, estatusid, clave from usuario where acceso = '${usuario}'`;
    const datosUsuario = await procesadorConsultas(consulta);

    if (datosUsuario[0].length <= 0) {
        return { mensaje: "Usuario no encontrado", success: false };
    }

    return new Promise((resolve, reject) => {
        crypt.compare(decifrado, datosUsuario[0][0].clave, function(err, response) {
            if (err) {
                reject({ error: err });
            }
            if (response) {
                const payload = datosUsuario[0].usuarioid;
                const token = jwt.sign({ foo: payload }, process.env.JWT_SECRET, { expiresIn: '15m' });
                const datos = {
                    usuarioid: datosUsuario[0][0].usuarioid,
                    nombre: datosUsuario[0][0].nombre,
                    estatus: datosUsuario[0][0].estatusid,
                    token: token
                };
                resolve(datos);
            } else {
                resolve({ mensaje: "Usuario no encontrado", success: false });
            }
        });
    });
};

const regenerarToken = () => {
    const newToken = jwt.sign({ check: true }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return newToken;
};

module.exports = {
    login,
    regenerarToken
};
