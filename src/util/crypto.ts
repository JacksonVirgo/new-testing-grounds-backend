import { getConfig } from '../config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const config = getConfig();
const encryptionMethod = 'AES-256-CBC';
const key = crypto.createHash('sha512').update(config.encryptionSecret, 'utf-8').digest('hex').substring(0, 32);
const iv = crypto.createHash('sha512').update(config.encryptionIV, 'utf-8').digest('hex').substring(0, 16);

export function encrypt(str: string) {
	const encryptor = crypto.createCipheriv(encryptionMethod, key, iv);
	const aesEncrypted = encryptor.update(str, 'utf-8', 'base64') + encryptor.final('base64');
	return Buffer.from(aesEncrypted).toString('base64');
}

export function decrypt(str: string) {
	const buff = Buffer.from(str, 'base64');
	const encrypted = buff.toString('utf-8');
	const decryptor = crypto.createDecipheriv(encryptionMethod, key, iv);
	return decryptor.update(encrypted, 'base64', 'utf-8') + decryptor.final('utf-8');
}

export function hash(str: string): string {
	const salt = bcrypt.genSaltSync();
	const hash = bcrypt.hashSync(str, salt);
	return hash;
}
export function checkHash(value: string, hash: string): boolean {
	return bcrypt.compareSync(value, hash);
}
