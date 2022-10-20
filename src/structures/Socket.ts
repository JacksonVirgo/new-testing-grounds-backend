import { Socket } from 'socket.io';

export interface WebSocket {
	socket: Socket;
	discord: DiscordInformation;
}

export interface DiscordInformation {
	id: string;
	username: string;
	avatar?: string;
	discriminator: string;
}

export const connectedSockets: Record<string, WebSocket> = {};
