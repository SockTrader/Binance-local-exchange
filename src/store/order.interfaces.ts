import { Order, OrderFill } from 'binance-api-node';

export interface InternalOrderFill extends Omit<OrderFill, 'price' | 'qty' | 'commission'> {
  price: number;
  qty: number;
  commission: number;
}

export interface InternalBaseOrder extends Omit<Order, 'transactTime' | 'fills' | 'cummulativeQuoteQty' | 'executedQty' | 'icebergQty' | 'origQty' | 'price' | 'stopPrice'> {
  icebergQty?: number;
  stopPrice?: number;
  fills?: InternalOrderFill[];
  executedQty?: number;
}

export type InternalMarketOrder = InternalBaseOrder & {
  origQty: number;
  transactTime: number;
};

export type InternalMarketQuoteOrder = InternalBaseOrder & {
  cummulativeQuoteQty: number;
  transactTime: number;
};

export type InternalLimitOrder = InternalBaseOrder & {
  price: number;
  cummulativeQuoteQty?: number;
  origQty: number;
};

export type InternalOrder = InternalMarketOrder | InternalMarketQuoteOrder | InternalLimitOrder;
