import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import urlRoutes from './interfaces/http/routes/urlRoutes';
import initializeDatabase from './infrastructure/database/init';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  console.warn('clerk_secret_key is not set. authentication will not work properly.');
}

if(process.env.NODE_ENV !== 'production') {
  initializeDatabase()
    .catch(err => {
      console.error('failed to initialize database: ' + err.message);
      process.exit(1);
    });
}

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(clerkMiddleware());

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  const calculateInMB = (value: number) => value / 1024 / 1024 
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      rss: `${Math.round(calculateInMB(memoryUsage.rss))} mb`,
      heapTotal: `${Math.round(calculateInMB(memoryUsage.heapTotal))} mb`,
      heapUsed: `${Math.round(calculateInMB(memoryUsage.heapUsed))} mb`,
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log(`health check: ${JSON.stringify(healthData)}`);
  res.status(200).json(healthData);
});

app.use(urlRoutes);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

process.on('uncaughtException', (error) => {
  console.error(`uncaught exception: ${error.message}${error.stack ? ', stack: ' + error.stack : ''}`);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    console.error(`unhandled rejection: ${reason.message}${reason.stack ? ', stack: ' + reason.stack : ''}`);
  } else {
    console.error(`unhandled rejection: ${String(reason)}`);
  }
});

export default app;
