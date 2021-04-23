/* eslint-disable import/no-unassigned-import */
import '@app/features/auth/User';

import mongoose, { STATES } from 'mongoose';

/**
 * Connect to MongoDB.
 * Connection URI is set with environment variable `MONGODB_URL`.
 *
 * @returns Promise<typeof mongoose>
 */
export function connectDB(): Promise<typeof mongoose> | void {
  const isConnected = mongoose.connection.readyState === STATES.connected;

  if (isConnected) return;

  return mongoose.connect(
    process.env.MONGO_URL ?? 'mongodb://localhost/admin',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      // Buffering means mongoose will queue up operations if it gets
      // disconnected from MongoDB and send them when it reconnects.
      // With serverless, better to fail fast if not connected.
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // And MongoDB driver buffering
    },
  );
}

/**
 * Disconnect from MongoDB.
 *
 * @returns Promise<void>
 */
export function disconnectDB(): Promise<void> | void {
  const isDisconnected = mongoose.connection.readyState === STATES.disconnected;

  if (isDisconnected) return;

  return mongoose.connection.close();
}
