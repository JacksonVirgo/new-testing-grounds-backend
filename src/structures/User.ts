import { join } from '@prisma/client/runtime';
import { Socket } from 'socket.io';
import type { SocketId } from 'socket.io-adapter';

export interface User {
	socket: Socket;
	discordId: string;
	username: string;
}

export const onlineUsers: Record<SocketId, User> = {};
export function addUser(newUser: User) {
	let deletionCount = 0;
	for (const handle in onlineUsers) {
		const oldUser = onlineUsers[handle];
		if (oldUser.discordId == newUser.discordId) {
			delete onlineUsers[handle];
			deletionCount += 1;
		}
	}
	onlineUsers[newUser.socket.id] = newUser;

	console.log(deletionCount, newUser.username, newUser.discordId);

	const joinMessage = {
		author: 'SERVER',
		message: `${newUser.username} has joined.`,
	};

	newUser.socket.broadcast.emit('chatMessage', joinMessage);
	newUser.socket.emit('chatMessage', joinMessage);
}
