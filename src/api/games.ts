import { Router } from 'express';
import type { SocketId } from 'socket.io-adapter';
import { onlineUsers } from '../structures/User';

const router = Router();

type Games = {
	amount: number;
	games: {
		host: SocketId;
		players: number;
	}[];
};
router.route('/').get((req, res) => {
	return res.sendStatus(404);
});

router.get('/onlineusers', (req, res) => {
	const users: string[] = [];
	const values = Object.values(onlineUsers);
	values.forEach(({ username }) => {
		users.push(username);
	});

	return res.status(200).json({ users });
});

export default router;
