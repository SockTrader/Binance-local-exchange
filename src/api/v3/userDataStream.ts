import { Router } from 'express';

const router = Router();

router.post('', (req, res) => {
  res.json({ listenKey: 'userDataStream' });
});

router.put('', (req, res) => {
  res.json({});
});

export const userDataStream = router;
