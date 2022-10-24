import { User } from './User';

export class Room {
	public members: User[] = [];
	constructor() {
		this.sendPublicMessage.bind(this);
	}
	sendPublicMessage(author: User, message: string) {
		for (const member of this.members) {
			member.socket.emit('messageCreate', {
				author: author.username,
				message: message,
			});
		}
	}
}
