import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import Image from 'next/image';
import MenuCard from '../components/MenuCard';
import MyHead from '../components/MyHead';
import Title from '../components/Title';
import styles from '../styles/Home.module.css';

export default function Home() {
	return (
		<Container maxWidth="md">
			<MyHead title="Cycling App" />
			<Box sx={{ left: 0, width: '100%', height: '15%' }} overflow="hidden" position="absolute">
				<Image src="/images/bfree.jpg" alt="Bfree forever" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
			</Box>
			<Box position="relative">
				<Title disableBack className={styles.title}>Bfree</Title>
				<p>&nbsp;</p>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="Ride" href="/ride">
						Start riding.
					</MenuCard>
					<MenuCard title="Previous Rides" href="/history">
						Manage and export previous rides.
					</MenuCard>
					<MenuCard title="Setup" href="/setup">
						Configure parameters and connect to a trainer and sensors.
					</MenuCard>
				</Grid>
			</Box>

			<footer className={styles.footer}>
				<b>Bfree</b>&nbsp;2022
			</footer>
		</Container>
	);
}
