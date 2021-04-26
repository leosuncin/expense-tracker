import http from 'http';

import { render } from '@testing-library/react';
import { ConnectedRouter } from 'connected-next-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import cookie from 'cookie';
// eslint-disable-next-line import/no-extraneous-dependencies
import createStore from 'iron-store';
import type { NextApiHandler } from 'next';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import type { NextRouter } from 'next/router';
import { createRouter } from 'next/router';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { makeStore } from '@app/app/store';
import type { User } from '@app/features/auth/User';
import type { ApiHandler } from '@app/utils/middleware';

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

export function createServer(
  handler: NextApiHandler | ApiHandler,
): http.Server {
  const requestHandler: http.RequestListener = async (request, response) =>
    apiResolver(
      request,
      response,
      undefined,
      handler,
      {} as Parameters<typeof apiResolver>[4],
      true,
    );

  return http.createServer(requestHandler);
}

export async function createCookieFor<U = User>(
  user: U,
  cookieName = 'app-session',
): Promise<string> {
  const cookieOptions: cookie.CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  };
  const store = await createStore({
    password: process.env.SECRET_COOKIE_PASSWORD,
  });

  store.set('user', user);

  return cookie.serialize(cookieName, await store.seal(), cookieOptions);
}
