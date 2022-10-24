import { SocketEndpoint, RawRequest } from '../structures/WS';
interface Request extends RawRequest {
	message: string;
}
const chatMessage: SocketEndpoint = async (data, user, server) => {
	const { message } = data;
	console.log(data, user);

	const result = { author: user.username, message: message };
	user.socket.broadcast.emit('chatMessage', result);
	return { status: 200, author: user.username, message };
};
export default chatMessage;
