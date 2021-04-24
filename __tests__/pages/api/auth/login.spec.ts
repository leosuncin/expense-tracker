import http from 'http';

import Fixtures from 'node-mongodb-fixtures';
import supertest from 'supertest';

import { disconnectDB } from '@app/app/db';
import { loginFactory } from '@app/features/auth/authFactories';
import loginHandler from '@app/pages/api/auth/login';
import { createServer } from '@app/utils/testUtils';

jest.setTimeout(10e3);
const fixtures = new Fixtures({ mute: true, filter: 'users.*' });

describe('[POST] /api/auth/login', () => {
  let server: http.Server;

  beforeAll(async () => {
    await fixtures.connect(process.env.MONGO_URL);
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

  afterAll(() => disconnectDB());

  it('login with existing user', async () => {
    const body = {
      email: 'john@doe.me',
      password: 'appraisal-fretful-roving',
    };
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      _id: expect.any(String),
      __v: expect.any(Number),
      name: expect.any(String),
      email: body.email,
      isAdmin: expect.any(Boolean),
      createdAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
      updatedAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
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
      .expect(422)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      errors: expect.arrayContaining([
        expect.stringMatching(/email/i),
        expect.stringMatching(/password/i),
      ]),
      message: 'Validation error',
      statusCode: 422,
    });
  });

  it('fails with non existing user', async () => {
    const body = loginFactory.build();
    const result = await supertest(server)
      .post('/api/auth/login')
      .send(body)
      .expect(401)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      message: `There isn't any user with email: ${body.email}`,
      statusCode: 401,
    });
  });
});
