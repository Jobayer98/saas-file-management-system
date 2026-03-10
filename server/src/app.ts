import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error/error.middleware';
import { swaggerSpec } from './config/swagger/swagger.config';
import { generalRateLimit } from './middlewares/rateLimiter';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));

// Global rate limiting
app.use(generalRateLimit);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SaaS File Management API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use(process.env.API_PREFIX || '/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
