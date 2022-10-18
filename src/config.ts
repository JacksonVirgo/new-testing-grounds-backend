import { config as loadConfigFromEnv } from 'dotenv';
loadConfigFromEnv();

interface Config {
	discordClientID: string;
	discordClientSecret: string;
	encryptionSecret: string;
}

let config: Config;
export function getConfig() {
	if (config) return config;

	const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SECRET_KEY } = process.env;
	if (!DISCORD_CLIENT_ID) throw Error('DISCORD_CLIENT_ID is invalid or missing');
	if (!DISCORD_CLIENT_SECRET) throw Error('DISCORD_CLIENT_SECRET is invalid or missing.');
	if (!SECRET_KEY) throw Error('SECRET_KEY is invalid or missing.');

	config = {
		discordClientID: DISCORD_CLIENT_ID,
		discordClientSecret: DISCORD_CLIENT_SECRET,
		encryptionSecret: SECRET_KEY,
	};

	return config;
}
