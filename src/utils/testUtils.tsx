import http from 'http';
import { URL } from 'url';

import { render } from '@testing-library/react';
import { ConnectedRouter } from 'connected-next-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import cookie from 'cookie';
import { seed } from 'faker';
import * as fc from 'fast-check';
// eslint-disable-next-line import/no-extraneous-dependencies
import createStore from 'iron-store';
import type { NextApiHandler } from 'next';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import {
  NextApiRequestQuery,
  apiResolver,
} from 'next/dist/next-server/server/api-utils';
import type { NextRouter } from 'next/router';
import { createRouter } from 'next/router';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import { makeStore } from '@app/app/store';
import type { UserDocument as User } from '@app/features/auth/User';
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

function parseQuery(url: string): NextApiRequestQuery {
  const parameters = new URL(url, 'https://n').searchParams;
  const query: NextApiRequestQuery = {};

  for (const [key, value] of parameters) {
    // Param given multiple times
    if (query[key]) {
      const previousValue = query[key];

      // Param given at least 2x previously
      if (Array.isArray(previousValue)) {
        // Merge
        query[key] = [...previousValue, value];
      } else {
        // Group
        query[key] = [previousValue, value];
      }
    } else {
      // Initial define
      query[key] = value;
    }
  }

  return query;
}

export function createServer(
  handler: NextApiHandler | ApiHandler,
): http.Server {
  const requestHandler: http.RequestListener = async (request, response) => {
    const query = parseQuery(request.url ?? '/');

    return apiResolver(
      request,
      response,
      query,
      handler,
      {
        previewModeEncryptionKey: '',
        previewModeSigningKey: '',
        previewModeId: '',
      },
      true,
    );
  };

  return http.createServer(requestHandler);
}

export async function createCookieFor(
  user: User,
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

  store.set('user', user.toJSON());

  return cookie.serialize(cookieName, await store.seal(), cookieOptions);
}

export const fakerArbitrary = (fakerGenerator: CallableFunction) =>
  fc
    .integer()
    .noBias()
    .noShrink()
    .map((value) => {
      seed(value);

      return fakerGenerator();
    });
