import { base64ToString, digestSHA1, stringToBase64 } from './ab';

type WorkoutScript = {
	id: string,
	name: string,
	notes: string,
	ts: number, // ms
	script: string,
};

export function getWorkouts(): WorkoutScript[] {
	const a = [];

	if (typeof window === 'undefined') {
		return [];
	}

	for (let i in localStorage) {
		if (i.startsWith('workout:')) {
			const v = JSON.parse(localStorage[i]);

			a.push({
				id: i,
				name: v.name,
				notes: v.notes,
				ts: v.ts,
				script: base64ToString(v.script)
			});
		}
	}

	return a.sort((a, b) => b.ts - a.ts);
}

export function getWorkoutDate(workout: WorkoutScript) {
	const date = new Date(workout.ts);
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

	return date.toLocaleDateString([navigator.languages[0], 'en-US'], options);
}

export async function saveWorkout(name: string, notes: string, script: string) {
	const digest = await digestSHA1(name);
	const id = `workout:${digest}`;

	localStorage.setItem(
		id,
		JSON.stringify({
			name,
			notes,
			ts: Date.now(),
			script: await stringToBase64(script),
		})
	);

	return id;
}

export function readWorkout(id: string): WorkoutScript {
	const raw = localStorage.getItem(id);

	if (!raw) {
		return null;
	}

	const w = JSON.parse(raw);

	return {
		id,
		name: w.name,
		notes: w.notes,
		ts: w.ts,
		script: base64ToString(w.script),
	};
}

export function deleteWorkout(id: string) {
	if (!id.startsWith('workout:')) {
		throw new Error('The given id is not a workout script id');
	}

	localStorage.removeItem(id);
}
