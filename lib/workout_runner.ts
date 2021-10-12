export type RunnerMessage = {
	time: number; // sec
	distance: number; // m
	speed: number; // m/s
	// TODO other measurements
};

export type RunnerResponse = {
	time: number; // sec
	basicLoad?: number;
	power?: number;
	slope?: number;
	// TODO wind, road params
};

export default function createWorkoutRunner(script: string) {
	if (typeof script !== 'string') {
		throw new Error('Workout script must be a string');
	}

	const blob = new Blob([script]);
	const blobURL = window.URL.createObjectURL(blob);
	const worker = new Worker(blobURL);

	return {
		terminate: () => worker.terminate(),
		sendMessage: (msg: RunnerMessage) => worker.postMessage(msg),
		onMessage: (cb: (msg: RunnerResponse) => void) => (worker.onmessage = (e) => cb(e.data)),
	};
}
