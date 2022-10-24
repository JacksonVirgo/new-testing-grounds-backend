import { Router } from 'express';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { getConfig } from '../config';
import crypto from 'crypto';
import { SessionToken } from '../util/auth';
import { prisma } from '..';
import jwt from 'jsonwebtoken';
import { checkHash, decrypt, encrypt, hash } from '../util/crypto';

const router = Router();
const config = getConfig();
function getRandomSessionToken(): SessionToken {
	let sessionToken: SessionToken = crypto.randomUUID().split('-').join('');
	return sessionToken;
}

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
			const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${access_token}` } });
			const { id, username } = user.data.user;

			const fetchedUser = await prisma.user.findUnique({ where: { discordId: id } });
			const sessionToken = getRandomSessionToken();

			const encryptedAccessToken = encrypt(access_token);
			const encryptedRefreshToken = encrypt(refresh_token);
			const hashedSession = await hash(sessionToken); // Not sure if this is fully reliable :p
			if (!hashedSession) throw Error();

			if (fetchedUser) {
				const updatedUser = await prisma.user.update({
					where: {
						discordId: id,
					},
					data: {
						accessToken: encryptedAccessToken,
						sessionToken: hashedSession,
						refreshToken: encryptedRefreshToken,
					},
				});

				if (!updatedUser) return res.status(500).json({ error: 'Error updating the database.' });
			} else {
				const newUser = await prisma.user.create({
					data: {
						discordId: id,
						accessToken: encryptedAccessToken,
						sessionToken: hashedSession,
						refreshToken: encryptedRefreshToken,
					},
				});
				if (!newUser) return res.status(500).json({ error: 'Error updating the database.' });
			}

			const jwtToken = jwt.sign(
				{
					discordId: id,
					sessionToken,
				},
				config.jwtSecret
			);

			return res
				.cookie('sessionToken', jwtToken, {
					secure: false,
					httpOnly: true,
				})
				.sendStatus(200);
		} else return res.status(401).json({});
	} catch (err) {
		console.log('Verif Err yayeet');
		return res.status(500).json({});
	}
});

router.post('/logout', async (req, res) => {
	res.cookie('sessionToken', '', {
		secure: false,
		httpOnly: true,
	}).sendStatus(200);
});

type VerifiedSession = {
	discordId: string;
	username: string;
};
export async function verifySessionToken(session: string): Promise<VerifiedSession | null> {
	try {
		const payload = jwt.verify(session, config.jwtSecret);
		if (!payload) return null;

		const { discordId, sessionToken } = payload as any;
		if (!(discordId && sessionToken)) return null;

		const fetchedUser = await prisma.user.findFirst({
			where: {
				discordId,
			},
		});
		if (!fetchedUser) throw Error('Could not fetch user.');
		if (!checkHash(sessionToken, fetchedUser.sessionToken)) throw Error('Invalid Session Token');

		const { accessToken } = fetchedUser;
		const decryptedAccessToken = decrypt(accessToken);

		const user = await axios.get('https://discord.com/api/oauth2/@me', { headers: { Authorization: `Bearer ${decryptedAccessToken}` } });
		if (!user) return null;

		const { id, username } = user.data.user;
		if (!(id && username)) return null;

		return { discordId: id, username };
	} catch (err) {
		console.log('Session Token Verification Error (z)', err);
		return null;
	}
}

router.get('/verify', async (req, res) => {
	const { body } = req;
	const { sessionToken } = body;
	return verifySessionToken(sessionToken);
});

export default router;
