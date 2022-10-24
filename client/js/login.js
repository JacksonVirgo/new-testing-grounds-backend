const socket = io();

$('.discord-button').on('click', () => {
	window.location.replace()
})

$(document).ready(async () => {
	const urlStr = document.URL;
	const queryStr = urlStr.split('?')[1];
	const query = new URLSearchParams(queryStr);
	const code = query.get('code');
	if (code) {
		const authData = await fetch(`http://localhost:3000/api/auth?code=${code}`, { method: 'POST' });
		if (authData.status === 200) {
			window.location.replace('/lobby');
		}
	}
});
