import { Router } from 'express';
import authRouter from './auth';
import gamesRouter from './games';
import path from 'path';
import express, { json } from 'express';
import cors from 'cors';

const router = Router();
router.get('/ping', (req, res) => res.status(200).json(req.body));
router.use('/auth', authRouter);
router.use('/games', gamesRouter);
router.use((_req, res) => res.sendStatus(404));

export function loadExpress() {
	const app = express();
	const clientPages = path.join(__dirname, '..', '..', 'client');

	app.use(cors({}));
	app.use(json());
	app.use('/api', router);
	app.use(express.static(clientPages, { extensions: ['html'] }));

	return app;
}
