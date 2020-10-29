export interface UnitConv {
	[index: string]: {
		name: string;
		convTo: (v: number) => number
	}
}

export const speedUnitConv: UnitConv = {
	kmph: {
		name: 'km/h',
		convTo: (v) => v * 3.6,
	},
	mph: {
		name: 'mph',
		convTo: (v) => v * 2.237,
	},
};

export const distanceUnitConv: UnitConv = {
	km: {
		name: 'km',
		convTo: (d) => d / 1000,
	},
	m: {
		name: 'm',
		convTo: (d) => d,
	},
	mi: {
		name: 'mi',
		convTo: (d) => d * 0.000621,
	},
}
