export function cookieStringToJSON(cookie: string): Record<string, string> {
	const output = {};
	cookie.split(/\s*;\s*/).forEach((pair: string) => {
		const newPair = pair.split(/\s*=\s*/);
		output[newPair[0]] = newPair.splice(1).join('=');
	});
	return output;
}
