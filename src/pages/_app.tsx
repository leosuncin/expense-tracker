import '@app/styles/globals.css';

import { ConnectedRouter } from 'connected-next-router';
import type { AppProps } from 'next/app';

import { wrapper } from '@app/app/store';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConnectedRouter>
      <Component {...pageProps} />
    </ConnectedRouter>
  );
}

export default wrapper.withRedux(MyApp);
