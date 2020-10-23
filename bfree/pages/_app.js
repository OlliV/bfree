import '../styles/globals.css'
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/core';
import { useEffect } from 'react';

export const cache = createCache();

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
