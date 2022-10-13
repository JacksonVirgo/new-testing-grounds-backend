import { SocketEndpoint, WebSocketRequest } from '../structures/WS';

const setNickname: SocketEndpoint = async (req: WebSocketRequest) => {
	return { status: 500 };
};

export default setNickname;
