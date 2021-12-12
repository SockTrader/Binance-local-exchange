import express from 'express';
import container from '../../container';
import { ExchangeInfoController } from './v3/exchangeInfo.controller';
import { OrderController } from './v3/order.controller';
import { TimeController } from './v3/time.controller';
import { UserDataStreamController } from './v3/userDataStream.controller';

const router = express.Router();

const timeController = container.resolve(TimeController);
const orderController = container.resolve(OrderController);
const userDataStreamController = container.resolve(UserDataStreamController);
const exchangeInfoController = container.resolve(ExchangeInfoController);

router.get('/v3/exchangeInfo', exchangeInfoController.getExchangeInfo.bind(exchangeInfoController));
router.post('/v3/userDataStream', userDataStreamController.postUserDataStream.bind(userDataStreamController));
router.put('/v3/userDataStream', userDataStreamController.putUserDataStream.bind(userDataStreamController));
router.delete('/v3/userDataStream', userDataStreamController.deleteUserDataStream.bind(userDataStreamController));
router.get('/v3/time', timeController.getTime.bind(timeController));
router.post('/v3/order', orderController.postOrder.bind(orderController));

export default router;
