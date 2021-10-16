import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import '../styles/globals.css'
import CssBaseline from '@mui/material/CssBaseline';
import PropTypes from 'prop-types';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useEffect } from 'react';

export const cache = createCache({
  key: 'bfree',
  prepend: true,
});

// See https://mui.com/guides/migration-v4/
const theme = createTheme();
const useStyles = makeStyles((theme) => {
	root: {
		// some css that access to theme
	}
});

function App({ Component, pageProps }) {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={cache}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} />
    </CacheProvider>
  );
}

export default App

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
