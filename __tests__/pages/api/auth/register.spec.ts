import http from 'http';

import { StatusCodes } from 'http-status-codes';
import Fixtures from 'node-mongodb-fixtures';
import supertest from 'supertest';

import { disconnectDB } from '@app/app/db';
import { registerFactory } from '@app/features/auth/authFactories';
import registerHandler from '@app/pages/api/auth/register';
import { createServer } from '@app/utils/testUtils';

jest.setTimeout(10e3);
const fixtures = new Fixtures({ mute: true, filter: 'users.*' });

describe('[POST] /api/auth/register', () => {
  let server: http.Server;

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
      .expect(StatusCodes.CREATED)
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
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchObject({
      errors: expect.arrayContaining([
        expect.stringMatching(/name/i),
        expect.stringMatching(/email/i),
        expect.stringMatching(/password/i),
      ]),
      message: 'Validation error',
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    });
  });

  it('fails to register a duplicate user', async () => {
    const body = registerFactory.build({ email: 'armando@martin.me' });
    const result = await supertest(server)
      .post('/api/auth/register')
      .send(body)
      .expect(StatusCodes.CONFLICT)
      .expect('Content-Type', /json/);

    expect(result.body).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "email is already taken",
        ],
        "message": "Duplicate data: is already register",
        "statusCode": 409,
      }
    `);
  });
});
