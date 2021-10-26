import Binance from 'binance-api-node';
import config from 'config';
import { Router } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ExchangeInfoStore } from '../../store/exchangeInfo.store';

const router = Router();

router.get('', async (req, res) => {
  if (config.get('local.exchangeInfo')) {
    const filepath = path.join(__dirname, './exchangeInfo.data.json');
    const result = JSON.parse(await fs.readFile(filepath, 'utf8'));

    new ExchangeInfoStore().upsertMany(result.symbols);

    return res
      .header('Content-Type', 'application/json')
      .header('X-Local', 'true')
      .json(result);
  } else {
    const result = await Binance().exchangeInfo();

    new ExchangeInfoStore().upsertMany(result.symbols);

    return res.header('X-Local', 'false').json(result);
  }
});

export const exchangeInfo = router;
