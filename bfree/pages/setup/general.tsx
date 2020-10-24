import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Head from '../../components/Head';
import TextField from '@material-ui/core/TextField';
import Title from '../../components/title';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { isValidUnsigned } from '../../lib/validation';
import { useState } from 'react';
import {
	useSetupStyles as useStyles,
	Param
} from '../../components/SetupComponents';
import {
	useGlobalState,
} from '../../lib/global';

export default function Setup() {
	return (
		<Container maxWidth="md">
			<Head title="General" />
			<Box>
				<Title>General</Title>
				<p>General settings.</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
				</Grid>
			</Box>
		</Container>
	);
}
