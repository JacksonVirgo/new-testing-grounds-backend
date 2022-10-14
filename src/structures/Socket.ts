import { Socket } from 'socket.io';

export interface WebSocket {
	discordId: string;
	socket: Socket;
}

export const connectedSockets: Record<string, WebSocket> = {};
