import { useEffect, useState } from 'react';
import { getElapsedTimeStr } from '../../lib/format';

export default function Stopwatch({
	startTime,
	isStopped,
	className,
}: {
	startTime: number;
	isStopped?: boolean;
	className?: any;
}) {
	const [time, setTime] = useState(() => Date.now() - startTime);
	const [reset, setReset] = useState(false);

	// Reset time if startTime changes
	useEffect(() => {
		setReset(true);
	}, [startTime]);

	useEffect(() => {
		if (isStopped) {
			return;
		}

		let offset = Date.now();
		let t = time;

		if (reset) {
			t = 0;
			setTime(t);
			setReset(false);
		}

		const intervalId = setInterval(() => {
			const delta = () => {
				const now = Date.now();
				const d = now - offset;

				offset = now;
				return d;
			};

			t += delta();
			setTime(t);
		}, 50);

		return () => {
			clearInterval(intervalId);
		};
	}, [startTime, isStopped, reset]);

	return <div className={className}>{getElapsedTimeStr(time)}</div>;
}
