import { Socket } from 'socket.io';
import type { SocketId } from 'socket.io-adapter';
import { connectedSockets } from './Socket';

export const currentGames: Record<SocketId, Game> = {};
export type RoomCode = string;

type PhaseType = 'day' | 'night' | 'pregame';

class Game {
	public host: SocketId;
	public players: SocketId[] = [];

	private currentPhaseType: PhaseType = 'pregame';

	constructor(host: SocketId) {
		this.host = host;
		delete currentGames[this.host];
		currentGames[this.host] = this;
	}
	onMessage(message: string) {
		// Broadcast Message
	}
	onWhisper(message: string, recipient: number) {
		// Broadcast Whisper Notif
	}
	onAction(target: number | number[]) {}
}
