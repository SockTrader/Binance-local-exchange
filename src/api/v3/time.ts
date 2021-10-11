import {Router} from 'express';
import config from 'config';
import Binance from "binance-api-node";

const router = Router();

router.get('*', async (req, res) => {
  if (config.get('local.time')) {
    return res.header('X-Local', 'true').json(new Date().getTime());
  } else {
    return res.header('X-Local', 'false').json(await Binance().time());
  }
});

export const time = router;
