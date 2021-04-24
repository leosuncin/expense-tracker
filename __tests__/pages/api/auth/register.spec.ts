import http from 'http';

import supertest from 'supertest';

import { disconnectDB } from '@app/app/db';
import { registerFactory } from '@app/features/auth/authFactories';
import registerHandler from '@app/pages/api/auth/register';
import { createServer } from '@app/utils/testUtils';

jest.setTimeout(10e3);

describe('[POST] /api/auth/register', () => {
  let server: http.Server;

  beforeEach(async () => {
    server = createServer(registerHandler);
  });

  afterEach(() => {
    server.close();
  });

  afterAll(() => disconnectDB());

  it('creates a new user', async () => {
    const body = registerFactory.build();
    const result = await supertest(server)
      .post('/api/auth/register')
      .send(body)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      _id: expect.any(String),
      __v: expect.any(Number),
      name: body.name,
      email: body.email,
      isAdmin: false,
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
      name: '',
      email: '',
      password: '',
    },
    {
      name: 'a',
      email: 'email',
      password: '123456',
    },
  ])('validate the body %p', async (body) => {
    const result = await supertest(server)
      .post('/api/auth/register')
      .send(body)
      .expect(422)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      errors: expect.arrayContaining([
        expect.stringMatching(/name/i),
        expect.stringMatching(/email/i),
        expect.stringMatching(/password/i),
      ]),
      message: 'Validation error',
      statusCode: 422,
    });
  });
});
