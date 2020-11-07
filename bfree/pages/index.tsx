import Grid from '@material-ui/core/Grid';
import Image from 'next/image';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import styles from '../styles/Home.module.css';
import Head from '../components/Head';
import MenuCard from '../components/MenuCard';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		pic: {
			display: 'block',
			border: 0,
			objectFit: 'cover',
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	})
);

export default function Home() {
	const classes = useStyles();

	return (
		<div className={styles.container}>
			<Head title="Cycling App" />

			<Image src="/images/bfree.jpg" alt="Bfree forever" width="1200" height={150} className={classes.pic} />
			<main className={styles.main}>
				<h1 className={styles.title}>Welcome to Bfree!</h1>

				<Grid container direction="row" alignItems="center" spacing={2}>
					<MenuCard title="Ride" href="/ride">
						Start riding.
					</MenuCard>
					<MenuCard title="Previous Rides" href="/history">
						Manage and export previous rides.
					</MenuCard>
					<MenuCard title="Setup" href="/setup">
						Configure parameters and connect to sensors and a trainer.
					</MenuCard>
				</Grid>
			</main>

			<footer className={styles.footer}>
				<b>Bfree</b>&nbsp;2020
			</footer>
		</div>
	);
}
