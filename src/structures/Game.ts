import type { SocketId } from 'socket.io-adapter';

let currentGames: Record<string, Game> = {};
export function getGame(key: string) {
	return currentGames[key];
}

export type RoomCode = string;
class Game {
	private hosts: SocketId[] = [];
	private players: SocketId[] = [];
	private roomCode: RoomCode;
	constructor() {
		this.roomCode = generateRoomCode(4);
		if (!currentGames[this.roomCode]) currentGames[this.roomCode] = this;
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
