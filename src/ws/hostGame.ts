import { SocketEndpoint, RawRequest } from '../structures/WS';

interface Request extends RawRequest {
	limit?: number;
	nickname?: string;
}
const hostGame: SocketEndpoint<Request> = async (req) => {
	return { status: 200, message: req };
};
export default hostGame;
