import Binance from 'binance-api-node';
import config from 'config';
import { Router } from 'express';
import * as path from 'path';

const router = Router();

router.get('', async (req, res) => {
  if (config.get('local.exchangeInfo')) {
    res.header('Content-Type', 'application/json');
    res.header('X-Local', 'true');

    return res.sendFile(path.join(__dirname, './exchangeInfo.data.json'))
  } else {
    return res.header('X-Local', 'false').json(await Binance().exchangeInfo());
  }
});

export const exchangeInfo = router;
