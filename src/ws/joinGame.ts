import { SocketEndpoint, RawRequest } from '../structures/WS';

interface Request extends RawRequest {
	nickname: string;
}
const joinGame: SocketEndpoint<Request> = async (req) => {
	return { status: 200, message: req };
};
export default joinGame;
