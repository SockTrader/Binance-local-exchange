import chalk from 'chalk';
import express, { Express } from 'express';
import { ApplicationConfig } from './services/configuration.service';
import ApiRoutes from './endpoints/api/api.routes';
import ServerRoutes from './endpoints/server/server.routes';
import { verifyRequest } from './middleware/security.middleware';

export const createApplication = (config: ApplicationConfig): Express => {
  const app = express();

  app.all('*', verifyRequest(config));

  app.all('*', (req, res, next) => {
    console.log(chalk.blue(`[REQ] ${req.method} ${req.path}`))
    return next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/server', ServerRoutes);
  app.use('/api', ApiRoutes);
  app.all('/', (req, res) => {
    res.status(404).send('Binance local exchange is working!');
  });

  app.all('*', (req, res) => {
    const msg = `Route ${req.url} could not be found`;
    console.error(msg);

    res.status(404).send(msg);
  });

  app.disable('x-powered-by');

  return app;
}
