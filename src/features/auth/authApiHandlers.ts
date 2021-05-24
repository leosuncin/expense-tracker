import { StatusCodes } from 'http-status-codes';

import type { LoginUser, RegisterUser } from '@app/features/auth/authSchemas';
import User, { UserJson } from '@app/features/auth/User';
import type { ApiHandler } from '@app/utils/middleware';

export const loginHandler: ApiHandler<LoginUser> = async (
  request,
  response,
) => {
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

export const registerHandler: ApiHandler<RegisterUser> = async (
  request,
  response,
) => {
  const user = new User(request.body);

  await user.save();
  request.session.set('user', user.toJSON<UserJson>());
  await request.session.save();

  response.status(StatusCodes.CREATED).json(user.toJSON<UserJson>());
};

export const logoutHandler: ApiHandler = async (request, response) => {
  request.session.destroy();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};
