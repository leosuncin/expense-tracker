import { StatusCodes } from 'http-status-codes';
import connect from 'next-connect';

import { RegisterUser, registerSchema } from '@app/features/auth/authSchemas';
import User, { UserJson } from '@app/features/auth/User';
import {
  ApiHandler,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

const registerHandler: ApiHandler<RegisterUser> = async (request, response) => {
  const user = new User(request.body);

  await user.save();
  request.session.set('user', user.toJSON<UserJson>());
  await request.session.save();

  response.status(StatusCodes.CREATED).json(user.toJSON<UserJson>());
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(validationMiddleware(registerSchema))
  .use(sessionMiddleware)
  .post(registerHandler);
