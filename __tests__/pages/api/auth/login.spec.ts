import type { Server } from 'http';

import { StatusCodes } from 'http-status-codes';
import Fixtures from 'node-mongodb-fixtures';
import supertest from 'supertest';

import { disconnectDB } from '@app/app/db';
import { loginFactory } from '@app/features/auth/authFactories';
import type { UserJson } from '@app/features/auth/User';
import loginHandler from '@app/pages/api/auth/login';
import type { ErrorResponse } from '@app/utils/middleware';
import { createServer } from '@app/utils/testUtils';

jest.setTimeout(10e3);
const fixtures = new Fixtures({ mute: true, filter: 'users.*' });

describe('[POST] /api/auth/login', () => {
  let server: Server;

  beforeAll(async () => {
    await fixtures.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await fixtures.unload();
    await fixtures.load();
    await fixtures.disconnect();
  });

  beforeEach(async () => {
    server = createServer(loginHandler);
  });

  afterEach(() => {
    server.close();
  });

  afterAll(async () => disconnectDB());

  it('login with existing user', async () => {
    const body = {
      email: 'john@doe.me',
      password: 'appraisal-fretful-roving',
    };
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(StatusCodes.OK)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject<UserJson>({
      id: expect.stringMatching(/[\da-f]{24}/) as string,
      name: expect.any(String) as string,
      email: body.email,
      isAdmin: expect.any(Boolean) as boolean,
      createdAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ) as string,
      updatedAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ) as string,
    });
  });

  it.each([
    {
      email: '',
      password: '',
    },
    {
      email: 'email',
      password: '123456',
    },
  ])('validate the body %p', async (body) => {
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject<ErrorResponse>({
      errors: expect.arrayContaining([
        expect.stringMatching(/email/i),
        expect.stringMatching(/password/i),
      ]) as string[],
      message: 'Validation error',
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    });
  });

  it('fails with non existing user', async () => {
    const body = loginFactory.build();
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      message: `There isn't any user with email: ${body.email}`,
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  });

  it('fails with incorrect password', async () => {
    const body = loginFactory.build({ email: 'armando@martin.me' });
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      message: `Wrong password for user with email: ${body.email}`,
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  });
});
