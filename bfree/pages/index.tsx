import styles from '../styles/Home.module.css'
import Grid from '@material-ui/core/Grid';
import Head from '../components/Head'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MenuCard from '../components/MenuCard';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		pic: {
			display: 'block',
			border: 0,
			width: "100%",
			height: '150px',
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
		<Head title='Cycling App' />

		<img src="images/bfree.jpg" className={classes.pic} />
		<main className={styles.main}>
			<h1 className={styles.title}>
				Welcome to Bfree!
			</h1>

			<Grid container direction="row" alignItems="center" spacing={2}>
				<MenuCard title="Ride" href="/ride">
					Start riding.
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
	)
}
