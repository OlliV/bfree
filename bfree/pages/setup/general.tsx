import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../components/Head';
import Title from '../../components/title';
import { EnumConfigParam, UnsignedConfigParam } from '../../components/SetupComponents';
import { UnitConv, distanceUnitConv, speedUnitConv } from '../../lib/units';

const gen = (uc: UnitConv): [string, string][] => Object.keys(uc).map((k) => [k, uc[k].name]);
const speedUnits: [string, string][] = gen(speedUnitConv);
const distanceUnits: [string, string][] = gen(distanceUnitConv);

export default function SetupGeneral() {
	return (
		<Container maxWidth="md">
			<Head title="General" />
			<Box>
				<Title href="/setup">General</Title>
				<p>Configure measurement units and UX settings.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<UnsignedConfigParam
						title="Sampling Rate"
						image="/images/cards/tic_tac.jpg"
						label="Hz"
						configName="samplingRate"
					/>
					<EnumConfigParam
						title="Speed"
						image="/images/cards/limit.jpg"
						idPrefix="speed-unit"
						label="unit"
						items={speedUnits}
						configName="unitSpeed"
					/>
					<EnumConfigParam
						title="Distance"
						image="/images/cards/road.jpg"
						idPrefix="distance-unit"
						label="unit"
						items={distanceUnits}
						configName="unitDistance"
					/>
				</Grid>
			</Box>
		</Container>
	);
}
