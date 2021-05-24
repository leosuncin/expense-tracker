import connect from 'next-connect';

import { registerHandler } from '@app/features/auth/authApiHandlers';
import { registerSchema } from '@app/features/auth/authSchemas';
import {
  databaseMiddleware,
  errorMiddleware,
  sessionMiddleware,
  validationMiddleware,
} from '@app/utils/middleware';

export default connect({ onError: errorMiddleware })
  .use(databaseMiddleware)
  .use(validationMiddleware(registerSchema))
  .use(sessionMiddleware)
  .post(registerHandler);
