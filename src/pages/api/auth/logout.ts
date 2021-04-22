import connect from 'next-connect';

import {
  ApiHandler,
  errorMiddleware,
  sessionMiddleware,
} from '@app/utils/middleware';

const logoutHandler: ApiHandler = async (request, response) => {
  request.session.destroy();

  response.status(204).send(Buffer.alloc(0));
};

export default connect({ onError: errorMiddleware })
  .use(sessionMiddleware)
  .delete(logoutHandler);
