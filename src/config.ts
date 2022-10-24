import { config as loadConfigFromEnv } from 'dotenv';
loadConfigFromEnv();

interface Config {
	discordClientID: string;
	discordClientSecret: string;
	encryptionSecret: string;
	encryptionIV: string;
	jwtSecret: string;
}

let config: Config;
export function getConfig() {
	if (config) return config;

	const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET, DATABASE_ENCRYPTION_SECRET, DATABASE_ENCRYPTION_IV } = process.env;
	if (!DISCORD_CLIENT_ID) throw Error('DISCORD_CLIENT_ID is invalid or missing');
	if (!DISCORD_CLIENT_SECRET) throw Error('DISCORD_CLIENT_SECRET is invalid or missing.');
	if (!DATABASE_ENCRYPTION_SECRET) throw Error('DATABASE_ENCRYPTION_SECRET is invalid or missing.');
	if (!JWT_SECRET) throw Error('JWT_SECRET is invalid or missing.');
	if (!DATABASE_ENCRYPTION_IV) throw Error('DATABASE_ENCRYPTION_IV is invalid or missing.');

	config = {
		discordClientID: DISCORD_CLIENT_ID,
		discordClientSecret: DISCORD_CLIENT_SECRET,
		encryptionSecret: DATABASE_ENCRYPTION_SECRET,
		encryptionIV: DATABASE_ENCRYPTION_IV,
		jwtSecret: JWT_SECRET,
	};

	return config;
}
