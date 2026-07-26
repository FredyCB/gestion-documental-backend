import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestión Documental',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de Gestión Documental',
      contact: {
        name: 'Soporte',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Archivos donde buscará las anotaciones
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;