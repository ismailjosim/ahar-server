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
// ** Request logger to log all incoming requests
app.use(requestLogger);
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  }),
);
// ** Rate limiter to limit the number of requests from a single IP address
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

// ** Global error handler to handle all the errors
app.use(globalErrorHandler);

// ** Not found handler to handle all the not found routes
app.use(notFound);

export default app;
