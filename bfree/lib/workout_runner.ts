export default function createWorkoutRunner(script: string) {
	if (typeof script !== 'string') {
		throw new Error('Workout script must be a string');
	}

	const blob = new Blob([script]);
	const blobURL = window.URL.createObjectURL(blob);
	const worker = new Worker(blobURL);

	// Usage
	// Send a message worker.postMessage()
	// Subscribe to messages: worker.onmessage = fn
	// Terminate it: worker.terminate()
	return worker;
}
