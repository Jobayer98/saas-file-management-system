import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/error/error.middleware';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use(process.env.API_PREFIX || '/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
