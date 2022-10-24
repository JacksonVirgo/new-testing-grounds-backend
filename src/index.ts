import protocol from 'http';
import { Server, Socket } from 'socket.io';
import { handleRequest, loadWebSocketFunctions, websocketCommands } from './structures/WS';
import { loadExpress } from './api/core';
import { verifySocketConnection } from './util/auth';
import { onlineUsers } from './structures/User';
import { PrismaClient } from '@prisma/client';
import { decrypt, encrypt } from './util/crypto';

export const prisma = new PrismaClient();
const app = loadExpress();
const server = protocol.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ['http://localhost:3000', 'http://localhost:3001'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

io.on('connection', async (socket: Socket) => {
	verifySocketConnection(
		socket,
		() => {
			console.log('Socket Accepted');

			socket.emit('validationSuccess');
			socket.on('disconnect', () => {});
			for (const handle in websocketCommands) {
				socket.on(handle, async (data: any) => {
					const webSocket = onlineUsers[socket.id];
					await handleRequest(io, webSocket, data, handle, websocketCommands[handle]);
				});
			}
		},
		(status, reason) => {
			console.log('Socket Kicked', status, reason);
			socket.emit('loginRequest', { reason });
			socket.disconnect(true);
		}
	);
});

const PORT = 3000;
server.listen(PORT, async () => {
	console.log(`Connecting to port [${PORT}]`);
	await loadWebSocketFunctions();
});
