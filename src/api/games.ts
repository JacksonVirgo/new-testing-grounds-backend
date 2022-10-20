import { Router } from 'express';
import type { SocketId } from 'socket.io-adapter';
import { currentGames } from '../structures/Game';
import { connectedSockets, DiscordInformation } from '../structures/Socket';

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

router.get('/onlineusers', (req, res) => {
	const users: DiscordInformation[] = [];
	const values = Object.values(connectedSockets);

	values.forEach(({ discord }) => {
		users.push(discord);
	});

	return res.status(200).json({ users });
});

export default router;
