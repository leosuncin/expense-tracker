import { StatusCodes } from 'http-status-codes';
import connect from 'next-connect';

import { LoginUser, loginSchema } from '@app/features/auth/authSchemas';
import User, { UserJson } from '@app/features/auth/User';
import {
  ApiHandler,
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

const loginHandler: ApiHandler<LoginUser> = async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email });

  if (!user) {
    response.status(StatusCodes.UNAUTHORIZED).json({
      message: `There isn't any user with email: ${email}`,
      statusCode: StatusCodes.UNAUTHORIZED,
    });
    return;
  }

  if (!(await user.checkPassword(password))) {
    response.status(StatusCodes.UNAUTHORIZED).json({
      message: `Wrong password for user with email: ${email}`,
      statusCode: StatusCodes.UNAUTHORIZED,
    });
    return;
  }

  request.session.set('user', user.toJSON<UserJson>());
  await request.session.save();

  response.json(user.toJSON<UserJson>());
};

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(validationMiddleware(loginSchema))
  .use(sessionMiddleware)
  .post(loginHandler);
