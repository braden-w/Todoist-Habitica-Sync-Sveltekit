export interface Event {
	event_name: string;
	user_id: number;
	event_data: EventData;
	initiator: Initiator;
	version: string;
}

interface EventData {
	added_by_uid: number;
	assigned_by_uid: null;
	checked: number;
	child_order: number;
	collapsed: number;
	content: string;
	description: string;
	date_added: string;
	date_completed: null;
	due: null;
	id: number;
	in_history: number;
	is_deleted: number;
	labels: any[];
	parent_id: null;
	priority: number;
	project_id: number;
	responsible_uid: null;
	section_id: null;
	sync_id: null;
	url: string;
	user_id: number;
}

interface Initiator {
	email: string;
	full_name: string;
	id: number;
	image_id: string;
	is_premium: boolean;
}
