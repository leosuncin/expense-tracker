// eslint-disable-next-line import/no-extraneous-dependencies
import { ObjectID } from 'mongodb';

export function dollarsToCents(dollars: number) {
  return dollars * 100;
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function transformToJSON(_: unknown, returned: Record<string, any>) {
  returned.id = returned._id.toHexString();

  if (returned.author instanceof ObjectID)
    returned.author = returned.author.toHexString();

  if (returned.createdAt instanceof Date)
    returned.createdAt = returned.createdAt.toISOString();

  if (returned.updatedAt instanceof Date)
    returned.updatedAt = returned.updatedAt.toISOString();

  delete returned._id;
  delete returned.__v;

  if (returned.password) delete returned.password;

  return returned;
}
