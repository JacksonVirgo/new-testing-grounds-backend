import { Socket } from 'socket.io';
import type { SocketId } from 'socket.io-adapter';

export type AccessData = {
	accessToken: string;
	refreshToken: string;
	expires: number;
};
export type SessionToken = string;
export const authTokens: Record<SessionToken, AccessData> = {};

// Sockets

export type WebSocketAuth = {
	verified: boolean;
	sessionToken: string;
};
export const acceptedSockets: Record<SocketId, WebSocketAuth> = {};
