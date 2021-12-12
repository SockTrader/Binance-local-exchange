import chalk from 'chalk';
import express, { Express } from 'express';
import ApiRoutes from './endpoints/api/api.routes';
import ServerRoutes from './endpoints/server/server.routes';

export const createApplication = (): Express => {
  const app = express();

  app.all('*', ((req, res, next) => {
    console.log(chalk.blue(`[REQ] ${req.method} ${req.path}`))
    return next();
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/server', ServerRoutes);
  app.use('/api', ApiRoutes);

  app.all('*', (req, res) => {
    const msg = `Route ${req.url} could not be found`;
    console.error(msg);

    res.status(404).send(msg);
  });

  app.disable('x-powered-by');

  return app;
}
