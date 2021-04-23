import '@app/styles/globals.css';

import { ConnectedRouter } from 'connected-next-router';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import store from '@app/app/store';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ConnectedRouter>
        <Component {...pageProps} />
      </ConnectedRouter>
    </Provider>
  );
}

export default MyApp;
