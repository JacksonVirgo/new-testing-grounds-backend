import { Router } from 'express';
import authRouter from './auth';
const router = Router();

router.get('/ping', (req, res) => {
	res.status(200).json(req.body);
});

router.use('/auth', authRouter);

router.use(function (_req, res) {
	res.sendStatus(404);
});

export default router;
