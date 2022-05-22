const headers = {
	'x-api-user': import.meta.env.VITE_HABITICA_API_USER,
	'x-api-key': import.meta.env.VITE_HABITICA_API_KEY,
	'Content-Type': 'application/json'
};

const getAliases = async () => {
	const response = await fetch('https://habitica.com/api/v3/tasks/user', {
		headers
	});
	const habiticaResponse = await response.json();
	// Remove all undefined entries
	const aliases = habiticaResponse.data.map((task) => task.id);
	return aliases.filter((id) => id !== undefined);
};

export async function get() {
	const aliases = await getAliases();
	// For alias in aliases, add a request to a queue that is spaced out every 5 seconds
	// to avoid hitting the habitica api rate limit
	const queue: (() => Promise<void>)[] = [];
	for (const alias of aliases) {
		queue.push(async () => {
			const url = `https://habitica.com/api/v3/tasks/${alias}/score/up`;
			const response = await fetch(url, {
				method: 'POST',
				headers
			});
			const habiticaResponse = await response.json();
			console.log(habiticaResponse);
		});
	}
	// Run the queue every 5 seconds
	const interval = setInterval(async () => {
		if (queue.length === 0) {
			clearInterval(interval);
			return;
		}
		await queue.shift()();
	}, 5000);
	return {
		status: 200,
		body: 'Hello!'
	};
}
