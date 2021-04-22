import * as Factory from 'factory.ts';
import * as faker from 'faker';

import type { User } from '@app/features/auth/authApi';
import type { LoginUser, RegisterUser } from '@app/features/auth/authSchemas';

export const loginFactory = Factory.Sync.makeFactory<LoginUser>({
  email: Factory.each(() => faker.internet.email().toLowerCase()),
  password: Factory.each(() => faker.internet.password(12, true)),
});

export const registerFactory = Factory.Sync.makeFactory<RegisterUser>({
  email: Factory.each(() => faker.internet.email().toLowerCase()),
  password: Factory.each(() => faker.internet.password(12, true)),
  name: Factory.each(() => faker.name.findName()),
});

export const userFactory = Factory.Sync.makeFactory<User>({
  _id: Factory.each(() => faker.datatype.uuid()),
  __v: 0,
  name: Factory.each(() => faker.name.findName()),
  email: Factory.each(() => faker.internet.email().toLowerCase()),
  isAdmin: Factory.each(() => faker.datatype.boolean()),
  createdAt: Factory.each(() => faker.date.recent().toISOString()),
  updatedAt: Factory.each(() => faker.date.recent().toISOString()),
});
