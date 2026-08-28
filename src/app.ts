import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';

import { envVars } from '@/config/env';
import globalErrorHandler from '@/middlewares/globalErrorHandler';
import notFound from '@/middlewares/notFound';
import { apiLimiter } from '@/middlewares/rateLimiter';
import requestLogger from '@/middlewares/requestLogger';
import securityHeaders from '@/middlewares/securityHeaders';
import { HealthRoutes } from '@/modules/health/health.routes';
import router from '@/routes';

// App
const app: Application = express();

// middleware
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(requestLogger);
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(apiLimiter);

// * Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', HealthRoutes);
app.use('/api/v1', router);

//* Default route
app.get('/', async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Ahar server is running',
    environment: envVars.NODE_ENV,
    uptime: `${process.uptime().toFixed(2)} sec`,
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
