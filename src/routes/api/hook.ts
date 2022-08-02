import { TodoistApi } from '@doist/todoist-api-typescript';
import type { HabiticaResponse } from 'src/routes/api/HabiticaResponse';
import type { Event, EventData } from './Event';

const todoistProjectToSyncId = 2284823736;
export function get() {
	return {
		status: 200,
		body: 'Hello!'
	};
}

export async function post({ request }: { request: Request }) {
	const data = (await request.json()) as Event;
	const { event_data, event_name, initiator, user_id, version } = data;
	const api = new TodoistApi(import.meta.env.VITE_API_TOKEN);

	if (event_name === 'item:added' && event_data.project_id === todoistProjectToSyncId) {
		// Add a new daily in Habitica
		await addDailyToHabitica(event_data);
	}
	// If the event is edited, update the task in habitica
	if (event_name === 'item:updated') {
		await editHabiticaTask(event_data);
	}
	if (event_name === 'item:completed') {
		// Mark a daily as completed in Habitica
		await markHabiticaTaskCompleted(event_data);
	}
	if (event_name === 'item:uncompleted') {
		await markHabiticaTaskUncompleted(event_data);
	}
	if (event_name === 'item:deleted') {
		// Delete a daily in Habitica
		await deleteHabiticaTask(event_data);
	}
	return {
		status: 200,
		body: 'Done!'
	};
}

// Begin Helper Functions
const headers = {
	'x-api-user': import.meta.env.VITE_HABITICA_API_USER,
	'x-api-key': import.meta.env.VITE_HABITICA_API_KEY,
	'Content-Type': 'application/json'
};
const priorityTodoistToHabitica: { [key: number]: string } = {
	1: '0.1',
	2: '1',
	3: '1.5',
	4: '2'
};

async function deleteHabiticaTask(event_data: EventData) {
	const url = `https://habitica.com/api/v3/tasks/${event_data.id}`;
	const response = await fetch(url, {
		method: 'DELETE',
		headers
	});
	const habiticaResponse = await response.json();
	if (habiticaResponse.error) {
		console.error(habiticaResponse.error);
	}
}

async function markHabiticaTaskUncompleted(event_data: EventData) {
	const url = `https://habitica.com/api/v3/tasks/${event_data.id}/score/down`;
	const response = await fetch(url, {
		method: 'POST',
		headers
	});
	const habiticaResponse = await response.json();
	if (habiticaResponse.error) {
		console.error(habiticaResponse.error);
	}
}

async function addDailyToHabitica(event_data: EventData) {
	const url = `https://habitica.com/api/v3/tasks/user`;
	const habiticaPriority = priorityTodoistToHabitica[event_data.priority];
	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			text: event_data.content,
			notes: event_data.description,
			type: 'daily',
			priority: habiticaPriority,
			alias: event_data.id
		})
	});
	const habiticaResponse = await response.json();
	if (habiticaResponse.error) {
		console.error(habiticaResponse.error);
	}
}

async function editHabiticaTask(event_data: EventData) {
	const url = `https://habitica.com/api/v3/tasks/${event_data.id}`;
	const habiticaPriority = priorityTodoistToHabitica[event_data.priority];
	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			text: event_data.content,
			notes: event_data.description,
			priority: habiticaPriority
		})
	});
	const habiticaResponse = (await response.json()) as HabiticaResponse;
	if (habiticaResponse.error) {
		console.error(habiticaResponse.error);
	}
}

async function markHabiticaTaskCompleted(event_data: EventData) {
	const url = `https://habitica.com/api/v3/tasks/${event_data.id}/score/up`;
	const response = await fetch(url, {
		method: 'POST',
		headers
	});
	const habiticaResponse = await response.json();
	if (habiticaResponse.error) {
		console.error(habiticaResponse.error);
	}
}
