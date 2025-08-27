import swaggerJsDoc from "swagger-jsdoc";

import { PORT, API_PREFIX } from "@/constants";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Instagram Clone APIs",
      version: '1.0.0',
      description: 'A comprehensive API for Instagram-like social media platform featuring user authentication, posts management, and social interactions',
      contact: {
        name: 'API Support',
        email: 'support@instagram-clone.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}${API_PREFIX}`,
        description: 'Development server',
      },
      {
        url: `https://api.instagram-clone.com${API_PREFIX}`,
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            totalItems: { type: 'number' },
            totalPages: { type: 'number' },
            currentPage: { type: 'number' },
            pageSize: { type: 'number' }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized - invalid or missing token'
        },
        InternalServerError: {
          description: 'Internal server error'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsDoc(options);
