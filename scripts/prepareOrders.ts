#!/usr/bin/env ts-node

import fetch from 'node-fetch';

const addOrder = async () => {
  await fetch('http://localhost:8000/server/debug/reset', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  await fetch('http://localhost:8000/api/v3/exchangeInfo', {
    headers: { 'Content-Type': 'application/json' },
    method: 'GET',
  });

  await Promise.all([1000, 2000, 3000].map(price => {
    return fetch('http://localhost:8000/api/v3/order', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
          'type': 'LIMIT',
          'quantity': '1',
          'symbol': 'BTCUSDT',
          'side': 'BUY',
          'price': price
        }
      )
    });
  }));

  const streamId = await fetch('http://localhost:8000/api/v3/userDataStream', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  console.log('stream id', await streamId.json());
}

addOrder().then();
