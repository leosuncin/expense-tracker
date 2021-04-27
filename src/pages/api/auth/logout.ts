import { StatusCodes } from 'http-status-codes';
import connect from 'next-connect';

import {
  ApiHandler,
  errorMiddleware,
  sessionMiddleware,
} from '@app/utils/middleware';

const logoutHandler: ApiHandler = async (request, response) => {
  request.session.destroy();

  response.status(StatusCodes.NO_CONTENT).send(Buffer.alloc(0));
};

export default connect({ onError: errorMiddleware })
  .use(sessionMiddleware)
  .delete(logoutHandler);
