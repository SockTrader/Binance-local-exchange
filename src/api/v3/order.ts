import { NewOrderSpot, Order } from 'binance-api-node';
import { Request, RequestHandler, Router } from 'express';
import { firstValueFrom } from 'rxjs';
import container from '../../container';
import { OrderService } from '../../services/order.service';

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

export const getACKResponse = (data: Order) => ({
  symbol: data.symbol,
  orderId: data.orderId,
  orderListId: data.orderListId,
  clientOrderId: data.clientOrderId,
  ...(data.transactTime ? {transactTime: data.transactTime} : {}),
});

export const getRESULTResponse = (data: Order) => ({
  ...getACKResponse(data),
  price: data.price,
  origQty: data.origQty,
  executedQty: data.executedQty,
  cummulativeQuoteQty: data.cummulativeQuoteQty,
  status: data.status,
  timeInForce: data.timeInForce,
  type: data.type,
  side: data.side,
});

export const getFULLResponse = (data: Order) => ({
  ...getRESULTResponse(data),
  fills: data.fills ?? [],
});

export const orderPOSTHandler: RequestHandler = async (req: Request<{}, any, NewOrderSpot>, res) => {
  const request: NewOrderSpot = { ...req.body, ...req.query };

  const orderService = container.resolve(OrderService);

  const clientOrderId = await orderService.addFromSpotOrder(request);
  const confirmedOrder = await firstValueFrom(orderService.getConfirmedOrder$(request, clientOrderId));

  const responseType: OrderResponseType = determineResponseType(request);
  if (responseType === OrderResponseType.ACK) {
    return res.json(getACKResponse(confirmedOrder));
  } else if (responseType === OrderResponseType.RESULT) {
    return res.json(getRESULTResponse(confirmedOrder));
  } else if (responseType === OrderResponseType.FULL) {
    return res.json(getFULLResponse(confirmedOrder));
  } else {
    throw new Error(`Unknown responseType: ${responseType}`);
  }
};

router.post('', orderPOSTHandler);

export const order = router;
