import { Order } from 'binance-api-node';

type OpenOrderBase = Omit<Order, 'price' | 'origQty' | 'executedQty' | 'cummulativeQuoteQty' | 'fills'> & { price?: number };

export type WithQuantity<T> = T & { quantity: number };
export type WithQuoteQuantity<T> = T & { quoteOrderQty: number };

export type OpenOrder = WithQuantity<OpenOrderBase> | WithQuoteQuantity<OpenOrderBase>;
