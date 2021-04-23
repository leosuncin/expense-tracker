/* eslint-disable import/no-unassigned-import, import/no-extraneous-dependencies */
import '@testing-library/jest-dom';

import { loadEnvConfig } from '@next/env';

loadEnvConfig(__dirname, true, { info: () => null, error: console.error });
// @ts-expect-error
self.__NEXT_DATA__ = {};
