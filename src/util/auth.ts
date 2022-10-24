import { verify } from 'crypto';
import { parse } from 'dotenv';
import { Socket } from 'socket.io';
import type { SocketId } from 'socket.io-adapter';
import { verifySessionToken } from '../api/auth';
import { addUser, User, onlineUsers } from '../structures/User';

export type AccessData = {
	accessToken: string;
	refreshToken: string;
	expires: number;
};
export type SessionToken = string;
export const authTokens: Record<SessionToken, AccessData> = {};

export function getAuthTokenData(session: SessionToken) {
	console.log(session, authTokens);
	return authTokens[session];
}

// Sockets

export type WebSocketAuth = {
	verified: boolean;
	sessionToken: string;
};
export const acceptedSockets: Record<SocketId, WebSocketAuth> = {};

export async function verifySocketConnection(socket: Socket, callback: () => void, error: (status: number, reason?: string) => void) {
	const cookies = socket.handshake.headers.cookie;
	if (!cookies) return error(406, 'Invalid cookies.');

	if (cookies.includes(`sessionToken=`)) {
		const cookie = parse(cookies);
		const sessionToken = cookie['sessionToken'];
		if (!sessionToken) {
			return error(401, 'Lack of session token');
		}

		try {
			const verification = await verifySessionToken(sessionToken);
			if (!verification) return error(403);

			const { discordId, username } = verification;
			addUser({
				socket,
				discordId,
				username,
			});

			return callback();
		} catch (err) {
			console.log('Verif Error', err);
			return error(401, 'Session token verification failed.');
		}
	}
}
