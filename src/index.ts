import express, { json } from 'express';
import cors from 'cors';
import protocol from 'http';
import { Server, Socket } from 'socket.io';
import { handleRequest, loadWebSocketFunctions, websocketCommands } from './structures/WS';
import apiRouter from './api/core';
import path from 'path';
import { acceptedSockets, authTokens } from './util/auth';
import axios from 'axios';

const app = express();
const server = protocol.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

app.use(cors({}));
app.use(json());
app.use('/api', apiRouter);
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

type AuthProps = { token: string };
type AuthResponse = {
	isValidated?: boolean;
	status: number;
};
const validateSocketConnection = async (socket: Socket): Promise<AuthResponse> => {
	const authData = socket.handshake.auth;
	if (!authData) return { status: 401 };
	try {
		const authDataParsed = authData as AuthProps;
		const accessData = authTokens[authDataParsed.token];
		const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${accessData.accessToken}` } });

		if (user) {
			const { id } = user.data;
			if (id) {
				return { isValidated: true, status: 200 };
			}
		}

		return { status: 401 };
	} catch (err) {
		console.log(err);
		return { status: 500 };
	}
};

io.on('connection', async (socket: Socket) => {
	socket.on('verify', async (data) => {
		const { sessionToken } = data;
		if (!sessionToken) return;

		try {
			const accessData = authTokens[sessionToken];
			const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${accessData.accessToken}` } });

			// replace next two lines with proper error handling.
			if (!user) return;
			if (!user.data.id) return;

			acceptedSockets[socket.id] = {
				verified: true,
				sessionToken,
			};
		} catch (err) {
			console.log('Socket Verification Error', err);
		}
	});

	for (const handle in websocketCommands) {
		socket.on(handle, async (data: any) => {
			await handleRequest(socket, data, handle, websocketCommands[handle]);
		});
	}
});

server.listen(3000, async () => {
	console.log(`Connecting to port [${3000}]`);
	await loadWebSocketFunctions();

	console.log(`WebSocket Server Online`);

	// Connect to Database
});
