import { Router } from 'express';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { getConfig } from '../config';
import crypto, { verify } from 'crypto';
import { authTokens, SessionToken } from '../util/auth';
import { DiscordInformation } from '../structures/Socket';

const router = Router();
const config = getConfig();
const scopes = ['identify', 'guilds', 'guilds.join'];

router.post('/', async (req, res) => {
	const { query } = req;
	const code = query.code;
	if (!code) return res.status(406).json({ error: 'Invalid Code' });

	try {
		const data_1 = new URLSearchParams();
		data_1.append('client_id', config.discordClientID);
		data_1.append('client_secret', config.discordClientSecret);
		data_1.append('grant_type', 'authorization_code');
		data_1.append('redirect_uri', `http://localhost:3000/login`);
		data_1.append('scope', 'identify');
		data_1.append('code', code as string);

		const result = await axios.post('https://discord.com/api/oauth2/token', data_1);

		if (result.status === 200) {
			const { access_token, expires_in, refresh_token } = result.data;

			let sessionToken: SessionToken | undefined;
			let hasSessionToken = false;
			while (!hasSessionToken) {
				sessionToken = crypto.randomUUID().split('-').join('');
				const fetchedSession = authTokens[sessionToken];
				if (!fetchedSession) {
					authTokens[sessionToken] = {
						accessToken: access_token,
						refreshToken: refresh_token,
						expires: expires_in,
					};
					hasSessionToken = true;
				}
			}

			return res
				.cookie('sessionToken', sessionToken, {
					secure: false,
					httpOnly: true,
				})
				.sendStatus(200);
		} else return res.status(401).json({});
	} catch (err) {
		console.log(err);
		return res.status(500).json({});
	}
});

router.post('/logout', async (req, res) => {
	res.cookie('sessionToken', '', {
		secure: false,
		httpOnly: true,
	}).sendStatus(200);
});

export type DiscordData = {
	status: number;
	discord?: DiscordInformation;
	reason?: string;
};
export async function verifySessionToken(sessionToken: string | undefined): Promise<DiscordData> {
	if (!sessionToken) return { status: 406 };
	try {
		const accessDetails = authTokens[sessionToken];
		if (!accessDetails) return { status: 401, reason: 'You need to log in.' };
		const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${accessDetails.accessToken}` } });
		if (!user) return { status: 401, reason: 'Invalid token' };

		const userData = user.data.user;
		const { id, username, avatar, discriminator } = userData;

		const discordData: DiscordInformation = {
			id,
			username,
			avatar,
			discriminator,
		};

		return { status: 200, discord: discordData };
	} catch (err) {
		console.log('Auth Verification Error', err);
		return { status: 500 };
	}
}

router.get('/verify', async (req, res) => {
	const { body } = req;
	const { sessionToken } = body;
	return verifySessionToken(sessionToken);
});

export default router;
