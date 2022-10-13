import { SocketEndpoint, WebSocketRequest } from '../structures/WS';

const setNickname: SocketEndpoint = async (req: WebSocketRequest) => {
	console.log('Command Reached - Set Nickname.');
	return { status: 200, message: 'Nickname Changed' };
};

export default setNickname;
