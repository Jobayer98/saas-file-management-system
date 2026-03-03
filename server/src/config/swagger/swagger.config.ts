import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SaaS File Management System API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the SaaS File Management System',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Admin - Packages',
        description: 'Package management endpoints (Admin only)',
      },
      {
        name: 'Admin - Users',
        description: 'User management endpoints (Admin only)',
      },
      {
        name: 'Admin - Statistics',
        description: 'Dashboard statistics endpoints (Admin only)',
      },
      {
        name: 'Subscriptions',
        description: 'User subscription management endpoints',
      },
      {
        name: 'Folders',
        description: 'Folder management endpoints',
      },
      {
        name: 'Files - Upload',
        description: 'File upload endpoints',
      },
      {
        name: 'Files - Management',
        description: 'File management endpoints',
      },
      {
        name: 'Files - Versions',
        description: 'File versioning endpoints',
      },
      {
        name: 'Dashboard',
        description: 'User dashboard statistics and overview endpoints',
      },
    ],
  },
  apis: [
    './src/config/swagger/components/*.yaml',
    './src/config/swagger/paths/**/*.yaml',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
