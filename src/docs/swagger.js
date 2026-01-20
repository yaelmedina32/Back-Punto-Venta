const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Point of Sales API',
      version: '1.0.0',
      description: 'Backend API for a Point of Sales system',
    },
    servers: [
      {
        url: 'http://localhost:4300',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/routes/operaciones/*.js', './src/routes/administracion/*.js', './src/routes/configuraciones/*.js'], // ajusta si usas otro path
};

module.exports = swaggerJSDoc(options);
