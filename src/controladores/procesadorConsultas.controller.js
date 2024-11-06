const sql = require('../configuraciones/bd');

module.exports = procesarConsulta = (consulta) => {
    return sql.query(consulta);
}