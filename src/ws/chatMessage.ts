import { SocketEndpoint, RawRequest } from '../structures/WS';
interface Request extends RawRequest {
	message: string;
}
const chatMessage: SocketEndpoint<Request> = async ({ message }, socket, server) => {
	const result = { author: socket.discord.username, message: message };
	socket.socket.broadcast.emit('chatMessage', result);
	return { status: 200, author: socket.discord.username, message };
};
export default chatMessage;
