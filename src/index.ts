import express, { json } from 'express';
import cors from 'cors';
import protocol from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';
import { handleRequest, loadWebSocketFunctions, websocketCommands } from './structures/WS';

// Load Config

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

type AuthProps = { token: string };
type AuthResponse = {
	isValidated?: boolean;
	status: number;
};
const validateSocketConnection = async (socket: Socket): Promise<AuthResponse> => {
	const exampleAuth = 'secret_value';
	const authData = socket.handshake.auth;
	if (!authData) return { status: 401 };
	try {
		const authDataParsed = authData as AuthProps;
		if (authDataParsed.token === exampleAuth) return { isValidated: true, status: 200 };
		return { status: 401 };
	} catch (err) {
		console.log(err);
		return { status: 500 };
	}
};

io.on('connection', async (socket: Socket) => {
	const { status } = await validateSocketConnection(socket);
	if (status == 200) {
		await loadWebSocketFunctions();
		for (const handle in websocketCommands) {
			socket.on(handle, async (data: any) => {
				await handleRequest(socket, data, handle, websocketCommands[handle]);
			});
		}
		socket.emit('connectionSuccess', { status: 200 });
	} else if (status == 401) {
		socket.emit('validationError', { status: 401 });
		socket.disconnect(true);
		// GET CLIENT to redirect to the login page.
	} else {
		socket.emit('error', { status: 500, message: 'An unexpected error has occurred.' });
	}
});

server.listen(3000, async () => {
	console.log(`Connecting to port [${3000}]`);

	// Connect to Database
});
