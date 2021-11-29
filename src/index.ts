import chalk from 'chalk';
import express from 'express';
import 'reflect-metadata';
import { ExchangeInfoController } from './api/v3/exchangeInfo.controller';
import { OrderController } from './api/v3/order.controller';
import { TimeController } from './api/v3/time.controller';
import { UserDataStreamController } from './api/v3/userDataStream.controller';
import container from './container';
import WebsocketServer from './websocket/server';

const app = express();

app.all('*', ((req, res, next) => {
  console.log(chalk.blue(`[REQ] ${req.method} ${req.path}`))
  return next();
}));

const timeController = container.resolve(TimeController);
const orderController = container.resolve(OrderController);
const userDataStreamController = container.resolve(UserDataStreamController);
const exchangeInfoController = container.resolve(ExchangeInfoController);

app.use(express.urlencoded({ extended: true }));
app.get('/api/v3/exchangeInfo', exchangeInfoController.getExchangeInfo.bind(exchangeInfoController));
app.post('/api/v3/userDataStream', userDataStreamController.postUserDataStream.bind(userDataStreamController));
app.put('/api/v3/userDataStream', userDataStreamController.putUserDataStream.bind(userDataStreamController));
app.delete('/api/v3/userDataStream', userDataStreamController.deleteUserDataStream.bind(userDataStreamController));
app.get('/api/v3/time', timeController.getTime.bind(timeController));
app.post('/api/v3/order', orderController.postOrder.bind(orderController));

app.all('*', (req, res) => {
  const msg = `Route ${req.url} could not be found`;
  console.error(msg);

  res.status(404).send(msg);
});

app.disable('x-powered-by');

const server = container.resolve(WebsocketServer);
server.upgrade(app);

//start our server
server.serverInstance?.listen(process.env.PORT || 8000, () => {
  //@ts-ignore
  console.log(`Server started on port ${server.serverInstance.address()!.port}`);
});
