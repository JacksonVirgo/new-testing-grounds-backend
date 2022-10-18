import { Socket } from 'socket.io';
import type { SocketId } from 'socket.io-adapter';

let currentGames: Record<SocketId, Game> = {};
export function getGame(key: string) {
	return currentGames[key];
}

export type RoomCode = string;
class Game {
	private host: SocketId;
	private players: SocketId[] = [];
	constructor(host: SocketId) {
		this.host = host;
		delete currentGames[this.host];
		currentGames[this.host] = this;
	}
}

function generateRoomCode(length: number) {
	const characters = 'abcdefghijklmnopqrstuvwxyz';
	let result = ' ';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
