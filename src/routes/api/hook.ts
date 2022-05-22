import {TodoistApi} from '@doist/todoist-api-typescript';
import type { Event } from './Event';

export function get() {
	return {
		status: 200,
		body: 'Hello!'
	};
}

export async function post({ request }) {
	const data = await request.json() as Event;
	const { event_data, event_name, initiator, user_id, version } = data;
	const api = new TodoistApi(import.meta.env.VITE_API_TOKEN)
	const headers = {
		'x-api-user': import.meta.env.VITE_HABITICA_API_USER,
		'x-api-key': import.meta.env.VITE_HABITICA_API_KEY
	};
	const priorityTodoistToHabitica: {[key: number]: string} = {
		1: '0.1',
		2: '1',
		3: '1.5',
		4: "2"
	}

	if (event_name === "item:added" && event_data.project_id === 2284823736) {
		// Add a new daily in Habitica
		const url = `https://habitica.com/api/v3/tasks/user`;
		const habiticaPriority = priorityTodoistToHabitica[event_data.priority];
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				text: event_data.content,
				type: 'daily',
				priority: habiticaPriority,
			})
		})
	}
	const method = 'post';
	let apiURL = '';
	const payload = {};
	switch (event_name) {
		case 'item:completed':
			// Add task first
			const alias = String(Math.floor(Math.random() * 1000000));
			// const alias = event_data.id
			console.log(
				await axios({
					method: method,
					url: 'https://habitica.com/api/v3/tasks/user',
					data: {
						text: event_data.content,
						type: 'todo',
						// TODO: Change event data from random
						alias: alias,
						notes: '',
						priority: event_data.priority
					},
					headers: headers
				})
			);
			// Then complete task
			apiURL = `https://habitica.com/api/v3/tasks/${alias}/score/up`;
			break;
		// case "item:uncompleted":
		//   apiURL = `https://habitica.com/api/v3/tasks/${event_data.id}/score/down`
		//   break
		// case "item:deleted":
		//   method = "delete"
		//   apiURL = `https://habitica.com/api/v3/tasks/${event_data.id}`
		//   break
	}
	try {
		console.log(
			await axios({
				method: method,
				url: apiURL,
				data: payload,
				headers: headers
			})
		);
	} catch (err) {
		console.log(err);
	}
	res.status(200).end(); // Responding is important
}
