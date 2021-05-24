import connect from 'next-connect';

import { logoutHandler } from '@app/features/auth/authApiHandlers';
import { errorMiddleware, sessionMiddleware } from '@app/utils/middleware';

export default connect({ onError: errorMiddleware })
  .use(sessionMiddleware)
  .delete(logoutHandler);
