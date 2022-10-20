import { Server } from 'socket.io';
import { readdirSync } from 'fs';
import path from 'path';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { WebSocket } from './Socket';

export interface RawRequest {}
export interface WebSocketResponse {
	status: number;
}

type WebsocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type SocketEndpoint<T> = (req: T, socket: WebSocket, server: WebsocketServer) => Promise<WebSocketResponse | null>;
export async function handleRequest(server: WebsocketServer, socket: WebSocket, request: any, handle: string, endpoint: SocketEndpoint<typeof request>) {
	console.log('Request for - ' + handle);
	try {
		const parsedRequest = request as RawRequest;
		const response = await endpoint(parsedRequest, socket, server);
		console.log(handle, !!response);

		if (response) {
			socket.socket.emit(handle, response);
		}
	} catch (err) {
		console.log(err);
		socket.socket.emit('error', {
			status: 406,
			where: handle,
		});
	}
}

// Programmatic Loading

export const websocketCommands: Record<string, SocketEndpoint<any>> = {};
let hasLoadedCommands = false;
export function isWebsocketReady() {
	return hasLoadedCommands;
}
export async function loadWebSocketFunctions() {
	console.log('--- WEBSOCKET COMMANDS ---');
	if (hasLoadedCommands) return;

	const rootPath = path.join(__dirname, '..', 'ws');
	const paths = readdirSync(rootPath);

	let loadedWebsocketEndpoints: string[] = [];
	let failedWebsocketEndpoints: string[] = [];

	for (const fileHandle of paths) {
		const handle = fileHandle.split('.')[0];
		try {
			const rootImport = await require(path.join(rootPath, fileHandle));
			const websocketEndpoint = rootImport.default as SocketEndpoint<any>;
			websocketCommands[handle] = websocketEndpoint;

			loadedWebsocketEndpoints.push(handle);
		} catch (err) {
			failedWebsocketEndpoints.push(handle);
		}
	}

	console.log(`${loadedWebsocketEndpoints.length} successful - ${failedWebsocketEndpoints.length} failed.${failedWebsocketEndpoints.length > 0 ? `\nFailed endpoints:\n${failedWebsocketEndpoints}` : ''}`);
	console.log(`--- ### ---`);
}
