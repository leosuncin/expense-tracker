import type { Server } from 'http';

import users from 'fixtures/users';
import { StatusCodes } from 'http-status-codes';
import Fixtures from 'node-mongodb-fixtures';
import supertest, { SuperAgentTest } from 'supertest';

import { disconnectDB } from '@app/app/db';
import User from '@app/features/auth/User';
import type { ExpenseJson } from '@app/features/expenses/Expense';
import { createExpenseFactory } from '@app/features/expenses/expenseFactories';
import type { CreateExpense } from '@app/features/expenses/expenseSchemas';
import expensesHandler from '@app/pages/api/expenses/[[...id]]';
import type { ErrorResponse } from '@app/utils/middleware';
import { createCookieFor, createServer } from '@app/utils/testUtils';

jest.setTimeout(10e3);
const fixtures = new Fixtures({ mute: true, filter: 'expenses.*' });
const expenseMatcher = (data?: Partial<CreateExpense>): ExpenseJson => ({
  id: expect.stringMatching(/[\da-f]{24}/) as string,
  name: data?.name ?? (expect.any(String) as string),
  amount: data?.amount ?? (expect.any(Number) as number),
  description: data?.description ?? (expect.any(String) as string),
  author: expect.stringMatching(
    /6083bb0dadd37b9dbd7c45da|6085f5ac58dad1da02aa9fe3/,
  ) as string,
  date: expect.stringMatching(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  ) as string,
  createdAt: expect.stringMatching(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  ) as string,
  updatedAt: expect.stringMatching(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
  ) as string,
});

describe('/api/expenses', () => {
  let server: Server;
  let cookie: string;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    cookie = await createCookieFor(new User(users[1]));
    await fixtures.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await fixtures.unload();
    await fixtures.load();
    await fixtures.disconnect();
  });

  beforeEach(async () => {
    server = createServer(expensesHandler);
    agent = supertest.agent(server);
    void agent.set('Cookie', cookie);
  });

  afterEach(() => {
    server.close();
  });

  afterAll(async () => disconnectDB());

  it('creates a new expense', async () => {
    const body = createExpenseFactory.build();

    await agent
      .post('/api/expenses')
      .send(body)
      .expect(StatusCodes.CREATED)
      .expect((response) => {
        expect(response.body).toMatchObject(expenseMatcher(body));
      });
  });

  it.each([
    {},
    {
      name: '',
      amount: -100,
      description: '',
    },
    {
      name: null,
      amount: '$ 9.99',
      description: 10,
    },
  ])('validates the body %p', async (body: Record<string, unknown>) => {
    await agent
      .post('/api/expenses')
      .send(body)
      .expect(StatusCodes.UNPROCESSABLE_ENTITY)
      .expect((response) => {
        expect(response.body).toMatchObject<ErrorResponse>({
          message: 'Validation error',
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          errors: expect.any(Array) as string[],
        });
      });
  });

  it('lists the expenses', async () => {
    await agent
      .get('/api/expenses')
      .expect(StatusCodes.OK)
      .expect((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });

  it('gets an expense', async () => {
    await agent
      .get('/api/expenses/6084f20f0502be06874d1a7f')
      .expect(StatusCodes.OK)
      .expect((response) => {
        expect(response.body).toMatchObject(expenseMatcher());
      });
  });

  it('fails to get a not-existing expense', async () => {
    await agent
      .get('/api/expenses/6084f20f0502be06874d1a83')
      .expect(StatusCodes.NOT_FOUND)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "There is not any expense with id: 6084f20f0502be06874d1a83",
            "statusCode": 404,
          }
        `);
      });
  });

  it('validates the id', async () => {
    await agent
      .get('/api/expenses/not-a-valid-id')
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "not-a-valid-id is not a valid ID",
            "statusCode": 400,
          }
        `);
      });
  });

  it.each([
    createExpenseFactory.build(),
    {
      name: 'Money goes brrr',
    },
    {
      amount: 999_999.09,
    },
    {
      description: 'Yes',
    },
  ])('updates an expense with %p', async (body: Record<string, unknown>) => {
    await agent
      .put('/api/expenses/6084f20f0502be06874d1a85')
      .send(body)
      .expect(StatusCodes.OK)
      .expect((response) => {
        expect(response.body).toMatchObject(expenseMatcher(body));
      });
  });

  it('removes an expense', async () => {
    await agent
      .delete('/api/expenses/6084f20f0502be06874d1a82')
      .expect(StatusCodes.NO_CONTENT)
      .expect((response) => {
        expect(response.noContent).toBe(true);
      });
  });

  it('requires to be authenticated', async () => {
    await supertest(server)
      .get('/api/expenses')
      .expect(StatusCodes.UNAUTHORIZED)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "You must be logged in order to access",
            "statusCode": 401,
          }
        `);
      });

    await supertest(server)
      .get('/api/expenses/6084f20f0502be06874d1a83')
      .expect(StatusCodes.UNAUTHORIZED)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "You must be logged in order to access",
            "statusCode": 401,
          }
        `);
      });
  });

  it('fails to access an expense from another user', async () => {
    await agent
      .get('/api/expenses/6084f20f0502be06874d1a86')
      .expect(StatusCodes.FORBIDDEN)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "You need to be the author of the expense in order to access it",
            "statusCode": 403,
          }
        `);
      });
  });

  it('fails to modify an expense from another user', async () => {
    await agent
      .put('/api/expenses/6084f20f0502be06874d1a90')
      .send(createExpenseFactory.build())
      .expect(StatusCodes.FORBIDDEN)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "You need to be the author of the expense in order to modify it",
            "statusCode": 403,
          }
        `);
      });
  });

  it('fails to remove an expense from another user', async () => {
    await agent
      .delete('/api/expenses/6084f20f0502be06874d1a8e')
      .expect(StatusCodes.FORBIDDEN)
      .expect((response) => {
        expect(response.body).toMatchInlineSnapshot(`
          Object {
            "message": "You need to be the author of the expense in order to remove it",
            "statusCode": 403,
          }
        `);
      });
  });

  describe('Admin user', () => {
    let cookie: string;
    let agent: SuperAgentTest;

    beforeAll(async () => {
      cookie = await createCookieFor(new User(users[0]));
    });

    beforeEach(async () => {
      agent = supertest.agent(server);
      void agent.set('Cookie', cookie);
    });

    it('can access an expense from another user', async () => {
      await agent
        .get('/api/expenses/6084f20f0502be06874d1a86')
        .expect(StatusCodes.OK)
        .expect((response) => {
          expect(response.body).toMatchObject(expenseMatcher());
        });
    });

    it('can modify an expense from another user', async () => {
      const body = createExpenseFactory.build();
      await agent
        .put('/api/expenses/6084f20f0502be06874d1a90')
        .send(body)
        .expect(StatusCodes.OK)
        .expect((response) => {
          expect(response.body).toMatchObject(body);
        });
    });

    it('can remove an expense from another user', async () => {
      await agent
        .delete('/api/expenses/6084f20f0502be06874d1a8e')
        .expect(StatusCodes.NO_CONTENT)
        .expect((response) => {
          expect(response.noContent).toBe(true);
        });
    });
  });
});
