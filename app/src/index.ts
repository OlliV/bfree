import createLogger from './logger';

const logger = createLogger();

logger.lapSplit(0, 'Manual');
logger.addTrackPoint({
	time: 1,
	speed: 420,
	power: 666,
});
logger.addTrackPoint({
	time: 2,
	speed: 420,
	power: 666,
});
logger.tcx((line) => process.stdout.write(line));
