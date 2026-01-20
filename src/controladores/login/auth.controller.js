const authService = require('../../servicios/login/auth.service');

const postLogin = async (req, res) => {
    const usuario = req.body.acceso;
    const clave = req.body.clave;
    const key = req.body.key;

    try {
        const resultado = await authService.login(usuario, clave, key);
        return res.status(200).send(resultado);
    } catch (error) {
        return res.status(500).send(error);
    }
};

const postRegenerarToken = (req, res) => {
    try {
        const newToken = authService.regenerarToken();
        return res.json(newToken);
    } catch (error) {
        return res.status(500).send(error);
    }
};

module.exports = {
    postLogin,
    postRegenerarToken
};
