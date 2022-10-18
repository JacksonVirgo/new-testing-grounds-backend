import { Router } from 'express';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { getConfig } from '../config';
import crypto from 'crypto';

type AccessData = {
	accessToken: string;
	refreshToken: string;
	expires: number;
};
type SessionToken = string;
const authTokens: Record<SessionToken, AccessData> = {};

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
		data_1.append('redirect_uri', `http://localhost:3000`);
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

			return res.status(200).json({ sessionToken });
		} else return res.status(401).json({});
	} catch (err) {
		console.log(err);
		return res.status(500).json({});
	}
});

router.get('/verify', async (req, res) => {
	const { body } = req;
	const { sessionToken } = body;
	if (!sessionToken) return res.sendStatus(406);
	try {
		const accessDetails = authTokens[sessionToken];
		if (!accessDetails) return res.sendStatus(401);
		const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${accessDetails.accessToken}` } });
		if (!user) return res.sendStatus(401);
		return res.sendStatus(200);
	} catch (err) {
		console.log('Auth Verification Error', err);
		return res.sendStatus(500);
	}
});

export default router;
