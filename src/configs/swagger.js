import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BIK User Server API',
            version: '1.0.0',
            description: 'Documentación técnica del gateway de banca móvil del Banco Informático Kinal.'
        },
        servers: [
            { url: 'http://localhost:5000' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/modules/**/*.routes.js']
};

const swaggerSpec = swaggerJsDoc(options);

/**
 * Inicializa y configura la interfaz gráfica de Swagger UI en la ruta especificada de la aplicación Express.
 */
export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
