import connect from 'next-connect';

import { loginHandler } from '@app/features/auth/authApiHandlers';
import { loginSchema } from '@app/features/auth/authSchemas';
import {
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(validationMiddleware(loginSchema))
  .use(sessionMiddleware)
  .post(loginHandler);
