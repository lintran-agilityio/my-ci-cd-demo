import swaggerJsDoc from "swagger-jsdoc";

import { PORT, API_PREFIX } from "@/constants";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "The API documents for manager comments on Post of User",
      version: '1.0.0',
      description: 'This is the API manager comments on the Post of User',
    },
    servers: [
      {
        url: `http://localhost:${PORT}${API_PREFIX}`,
        description: 'Development server',
      }
    ],
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //     },
    //   },          
    // },
    // security: {
    //   bearerAuth: [],
    // },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsDoc(options);
