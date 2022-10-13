import { Socket } from 'socket.io';

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
		socket.emit('error', 'An unexpected error has occurred [REQ_HANDLE]');
	}
}

// Programmatic Loading

export const websocketCommands: Record<string, SocketEndpoint> = {};
export async function loadWebSocketFunctions() {}
