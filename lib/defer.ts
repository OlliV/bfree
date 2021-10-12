export default function defer(): Promise<any> & { resolve: (v: any) => void; reject: (err: Error) => void } {
	let res;
	let rej;
	const promise = new Promise((resolve, reject) => {
		res = resolve;
		rej = reject;
	});

	// @ts-ignore
	promise.resolve = res;
	// @ts-ignore
	promise.reject = rej;

	// @ts-ignore
	return promise;
}
