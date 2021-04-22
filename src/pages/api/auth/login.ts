import connect from 'next-connect';

import { User } from '@app/features/auth/User';
import {
  ApiHandler,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
} from '@app/utils/middleware';

const loginHandler: ApiHandler = async (request, response) => {
  const { email, password }: Pick<User, 'email' | 'password'> = request.body;
  const user = await User.findOne({ email });

  if (!user) {
    response.status(401).json({
      message: `There isn't any user with email: ${email}`,
      statusCode: 401,
    });
    return;
  }

  if (!(await user.checkPassword(password))) {
    response.status(401).json({
      message: `Wrong password for user with email: ${email}`,
    });
    return;
  }

  request.session.set('user', user.toJSON());
  await request.session.save();

  response.json(user.toJSON());
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(sessionMiddleware)
  .post(loginHandler);
