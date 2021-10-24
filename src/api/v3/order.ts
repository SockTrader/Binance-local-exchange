import { Request, Router } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

export enum OrderResponseType {
  ACK = 'ACK',
  FULL = 'FULL',
  RESULT = 'RESULT',
}

export const determineResponseType = ({ body }: Request): OrderResponseType => {
  let responseType: OrderResponseType;

  if (body.newOrderRespType) {
    responseType = body.newOrderRespType;
  } else {
    responseType = (['MARKET', 'LIMIT'].includes(body.type))
      ? OrderResponseType.FULL
      : OrderResponseType.ACK;
  }

  return responseType;
};

export const getACKResponse = ({ body }: Request) => ({
  symbol: body.symbol,
  orderId: 1, // @TODO create unique in-memory number (store)
  orderListId: -1,
  clientOrderId: body.newClientOrderId ?? uuid(),
  transactTime: new Date().getTime(),
});

export const getRESULTResponse = (req: Request) => ({
  ...getACKResponse(req),
  price: '0.00000000',
  origQty: '10.00000000',
  executedQty: '10.00000000',
  cummulativeQuoteQty: '10.00000000',
  status: req.body.type === 'MARKET' ? 'FILLED' : 'NEW',
  timeInForce: req.body.timeInForce ?? 'GTC',
  type: req.body.type,
  side: req.body.side,
});

export const getFULLResponse = (req: Request) => ({
  ...getRESULTResponse(req),
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

router.post('', (req, res) => {
  //const body = req.body;
  const responseType: OrderResponseType = determineResponseType(req);

  // @TODO store order in order.store

  if (responseType === OrderResponseType.ACK) {
    return res.json(getACKResponse(req));
  } else if (responseType === OrderResponseType.RESULT) {
    return res.json(getRESULTResponse(req));
  } else if (responseType === OrderResponseType.FULL) {
    return res.json(getFULLResponse(req));
  } else {
    throw new Error(`Unknown responseType: ${responseType}`);
  }
});

export const order = router;
