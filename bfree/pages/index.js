import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Bfree!
        </h1>
	  </main>

      <footer className={styles.footer}>
        <b>Bfree</b>&nbsp;2020
      </footer>
    </div>
  )
}
