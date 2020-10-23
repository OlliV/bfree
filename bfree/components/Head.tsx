import Head from 'next/head';

export default function MyHead({ title }) {
	return (
		<Head>
			<title>{`Bfree ${title}`}</title>
			<link rel="icon" href="/favicon.ico" />
		</Head>
	);
}
