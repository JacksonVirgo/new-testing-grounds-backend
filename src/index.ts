import express, { json } from 'express';
import cors from 'cors';
import protocol from 'http';
import { Server, Socket } from 'socket.io';
import { handleRequest, loadWebSocketFunctions, websocketCommands } from './structures/WS';
import apiRouter from './api/core';
import path from 'path';
import { verifySessionToken } from './api/auth';
import { parse } from 'cookie';
import { connectedSockets } from './structures/Socket';

const app = express();
const server = protocol.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});
const clientPages = path.join(__dirname, '..', 'client');

app.use(cors({}));
app.use(json());
app.use('/api', apiRouter);
app.use(express.static(clientPages, { extensions: ['html'] }));

async function verifySocketConnection(socket: Socket, callback: () => void, error: (status: number, reason?: string) => void) {
	const cookies = socket.handshake.headers.cookie;
	if (!cookies) {
		return error(406, 'Invalid cookies.');
	}

	if (cookies.includes(`sessionToken=`)) {
		const cookie = parse(cookies);
		const sessionToken = cookie['sessionToken'];
		console.log(sessionToken);
		if (!sessionToken) {
			return error(401, 'Lack of session token');
		}

		const { status, reason, discord } = await verifySessionToken(sessionToken);
		console.log(status, reason);
		if (status === 200 && discord) {
			console.log('Verified');

			// ADD A LATER CHECK TO MAKE SURE
			// ONLY ONE SOCKET CAN BE CONNECTED TO
			// AN ACCOUNT AT ANY GIVEN TIME.
			// TOO LAZY RN T-T
			connectedSockets[socket.id] = {
				socket,
				discord,
			};
			return callback();
		}

		return error(401, 'Session token verification failed.');
	}
}

io.on('connection', async (socket: Socket) => {
	verifySocketConnection(
		socket,
		() => {
			console.log(`Socket Verified - ${socket.id}`);
			socket.on('disconnect', () => console.log(`Socket Disconnected - ${socket.id}`));
			for (const handle in websocketCommands) {
				socket.on(handle, async (data: any) => {
					const webSocket = connectedSockets[socket.id];
					await handleRequest(io, webSocket, data, handle, websocketCommands[handle]);
				});
			}
		},
		(status, reason) => {
			console.log('Verification Failed', status, reason);
			socket.emit('loginRequest');
			socket.disconnect(true);
		}
	);
});

server.listen(3000, async () => {
	console.log(`Connecting to port [${3000}]`);
	await loadWebSocketFunctions();
});
