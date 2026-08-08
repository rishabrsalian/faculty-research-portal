import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Faculty Research & Publication Portal API',
      version: '1.0.0',
      description:
        'REST API for Engineering College Faculty Research, Publication & Professional Contribution Management System',
      contact: {
        name: 'API Support',
        email: 'admin@college.edu',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Faculty', description: 'Faculty profile management' },
      { name: 'Publications', description: 'Research publications' },
      { name: 'Publication Types', description: 'Publication type definitions' },
      { name: 'Journals', description: 'Academic journals' },
      { name: 'Conferences', description: 'Academic conferences' },
      { name: 'Patents', description: 'Faculty patents' },
      { name: 'Projects', description: 'Funded research projects' },
      { name: 'Conference Contributions', description: 'Conference participations' },
      { name: 'Professional Contributions', description: 'Awards, workshops, lectures' },
      { name: 'Reports', description: 'Analytics & reports' },
      { name: 'Notifications', description: 'System notifications' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
