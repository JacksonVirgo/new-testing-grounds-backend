import { Router } from 'express';
import type { SocketId } from 'socket.io-adapter';
import { currentGames } from '../structures/Game';

const router = Router();

type Games = {
	amount: number;
	games: {
		host: SocketId;
		players: number;
	}[];
};
router.route('/').get((req, res) => {
	const totalGames = Object.values(currentGames);
	const response: Games = { amount: totalGames.length, games: [] };
	totalGames.forEach(({ host, players }) => {
		response.games.push({
			host,
			players: players.length,
		});
	});
	res.status(200).json(response);
});

export default router;
