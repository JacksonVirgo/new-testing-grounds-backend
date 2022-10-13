import { Socket } from 'socket.io';
import { readdirSync } from 'fs';
import path from 'path';

export interface WebSocketRequest {}
export interface WebSocketResponse {
	status: number;
}

export type SocketEndpoint = (req: WebSocketRequest) => Promise<WebSocketResponse | null>;

export async function handleRequest(socket: Socket, request: any, handle: string, endpoint: SocketEndpoint) {
	try {
		const parsedRequest = request as WebSocketRequest;
		const response = await endpoint(parsedRequest);
		if (response) {
			socket.emit(handle, response);
		}
	} catch (err) {
		console.log(err);
		socket.emit('error', 'An unexpected error has occurred [REQ_HANDLE]');
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
			const rootImport = await require(path.join(rootPath, fileHandle)).default;
			const websocketEndpoint = rootImport as SocketEndpoint;
			websocketCommands[handle] = websocketEndpoint;

			loadedWebsocketEndpoints.push(handle);
		} catch (err) {
			failedWebsocketEndpoints.push(handle);
		}
	}

	console.log(`${loadedWebsocketEndpoints.length} successful - ${failedWebsocketEndpoints.length} failed.${failedWebsocketEndpoints.length > 0 ? `\nFailed endpoints:\n${failedWebsocketEndpoints}` : ''}`);
	console.log(`--- ### ---`);
}
