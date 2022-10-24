import { Server } from 'socket.io';
import { readdirSync } from 'fs';
import path from 'path';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { User } from './User';

export interface RawRequest {}
export interface WebSocketResponse {
	status: number;
}

type WebsocketServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type SocketEndpoint = (req: any, user: User, server: WebsocketServer) => Promise<WebSocketResponse | null>;
export async function handleRequest(server: WebsocketServer, user: User, request: any, handle: string, endpoint: SocketEndpoint) {
	console.log('Request for - ' + handle);
	try {
		const parsedRequest = request as RawRequest;
		const response = await endpoint(parsedRequest, user, server);
		console.log(handle, !!response);
		if (response) {
			user.socket.emit(handle, response);
		}
	} catch (err) {
		console.log(err);
		user.socket.emit('error', {
			status: 406,
			where: handle,
		});
	}
}

// Programmatic Loading

export const websocketCommands: Record<string, SocketEndpoint> = {};
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
			const websocketEndpoint = rootImport.default as SocketEndpoint;
			websocketCommands[handle] = websocketEndpoint;

			loadedWebsocketEndpoints.push(handle);
		} catch (err) {
			failedWebsocketEndpoints.push(handle);
		}
	}

	console.log(`${loadedWebsocketEndpoints.length} successful - ${failedWebsocketEndpoints.length} failed.${failedWebsocketEndpoints.length > 0 ? `\nFailed endpoints:\n${failedWebsocketEndpoints}` : ''}`);
	console.log(`--- ### ---`);
}
