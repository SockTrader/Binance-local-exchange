import { NewOrderSpot } from 'binance-api-node';
import { Request, RequestHandler, Router } from 'express';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import container from '../../container';
import { OrderService } from '../../services/order.service';
import { OrderMatchingService } from '../../services/orderMatching.service';
import { OrderStore } from '../../store/order.store';

const router = Router();

export enum OrderResponseType {
  ACK = 'ACK',
  FULL = 'FULL',
  RESULT = 'RESULT',
}

export const determineResponseType = (data: NewOrderSpot): OrderResponseType => {
  let responseType: OrderResponseType;

  if (data.newOrderRespType) {
    responseType = data.newOrderRespType as OrderResponseType;
  } else {
    responseType = (['MARKET', 'LIMIT'].includes(data.type))
      ? OrderResponseType.FULL
      : OrderResponseType.ACK;
  }

  return responseType;
};

export const getACKResponse = (data: NewOrderSpot) => ({
  symbol: data.symbol,
  orderId: 1, // @TODO create unique in-memory number (store)
  orderListId: -1,
  clientOrderId: data.newClientOrderId ?? uuid(),
  transactTime: new Date().getTime(),
});

export const getRESULTResponse = (data: NewOrderSpot) => ({
  ...getACKResponse(data),
  price: '0.00000000',
  origQty: '10.00000000',
  executedQty: '10.00000000',
  cummulativeQuoteQty: '10.00000000',
  status: data.type === 'MARKET' ? 'FILLED' : 'NEW',
  timeInForce: data.timeInForce ?? 'GTC',
  type: data.type,
  side: data.side,
});

export const getFULLResponse = (data: NewOrderSpot) => ({
  ...getRESULTResponse(data),
  fills: [
    {
      'price': '4000.00000000',
      'qty': '1.00000000',
      'commission': '4.00000000',
      'commissionAsset': 'USDT'
    },
    {
      'price': '3999.00000000',
      'qty': '5.00000000',
      'commission': '19.99500000',
      'commissionAsset': 'USDT'
    }
  ]
});

export const OrderHandler: RequestHandler = async (req: Request<{}, any, NewOrderSpot>, res) => {
  const order: NewOrderSpot = { ...req.body, ...req.query };

  const orderService = container.resolve(OrderService);

  const clientOrderId = await orderService.addFromOrderSpot(order);
  const confirmedOrder = await firstValueFrom(orderService.getConfirmedOrder$(order, clientOrderId));

  debugger;
  return confirmedOrder;
  // @TODO map to response (Observable?)

  const responseType: OrderResponseType = determineResponseType(order);
  //if (responseType === OrderResponseType.ACK) {
  //  return res.json(getACKResponse(data));
  //} else if (responseType === OrderResponseType.RESULT) {
  //  return res.json(getRESULTResponse(data));
  //} else if (responseType === OrderResponseType.FULL) {
  //  return res.json(getFULLResponse(data));
  //} else {
  //  throw new Error(`Unknown responseType: ${responseType}`);
  //}
};

router.post('', OrderHandler);

export const order = router;
