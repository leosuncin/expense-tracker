import { render } from '@testing-library/react';
import { ConnectedRouter } from 'connected-next-router';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import type { NextRouter } from 'next/router';
import { createRouter } from 'next/router';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { makeStore } from '@app/app/store';

function customRender(
  ui: Parameters<typeof render>[0],
  store: Store = makeStore(),
  router: NextRouter = createRouter('/', {}, '/', {
    subscription: jest.fn().mockImplementation(Promise.resolve),
    initialProps: {},
    pageLoader: jest.fn(),
    Component: jest.fn(),
    App: jest.fn(),
    wrapApp: jest.fn(),
    isFallback: false,
  }),
) {
  return render(
    <RouterContext.Provider value={router}>
      <Provider store={store}>
        <ConnectedRouter>{ui}</ConnectedRouter>
      </Provider>
    </RouterContext.Provider>,
  );
}

export { customRender as render };
