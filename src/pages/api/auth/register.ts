import connect from 'next-connect';

import { User } from '@app/features/auth/User';
import {
  ApiHandler,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
} from '@app/utils/middleware';

const registerHandler: ApiHandler = async (request, response) => {
  const user = new User(request.body);

  await user.save();
  request.session.set('user', user.toJSON());
  await request.session.save();

  response.status(201).json(user.toJSON());
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .post(registerHandler);
