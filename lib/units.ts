export interface UnitConv {
	[index: string]: {
		name: string;
		convTo: (v: number) => number;
		convToBase: (v: number) => number;
	};
}

export const timeUnitConv: UnitConv = {
	ms: {
		name: 'millisecond',
		convTo: (v) => v * 1000,
		convToBase: (v) => v / 1000,
	},
	sec: {
		name: 'second',
		convTo: (v) => v,
		convToBase: (v) => v,
	},
	min: {
		name: 'minute',
		convTo: (v) => v / 60,
		convToBase: (v) => v * 60,
	},
	hour: {
		name: 'hour',
		convTo: (v) => v / 3600,
		convToBase: (v) => v * 3600,
	},
};

export const speedUnitConv: UnitConv = {
	kmph: {
		name: 'km/h',
		convTo: (v) => v * 3.6,
		convToBase: (v) => v / 3.6, // to m/s
	},
	mph: {
		name: 'mph',
		convTo: (v) => v * 2.237,
		convToBase: (v) => v / 2.237, // to m/s
	},
};

export const distanceUnitConv: UnitConv = {
	km: {
		name: 'km',
		convTo: (d) => d / 1000,
		convToBase: (d) => d * 1000, // to m
	},
	m: {
		name: 'm',
		convTo: (d) => d,
		convToBase: (d) => d,
	},
	mi: {
		name: 'mi',
		convTo: (d) => d * 0.000621,
		convToBase: (d) => d * 1609, // to m
	},
};
