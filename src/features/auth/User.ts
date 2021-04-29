import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import type { Document, LeanDocument, ToObjectOptions, Types } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import { transformToJSON } from '@app/utils/helpers';

export interface User {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, Document<Types.ObjectId> {
  checkPassword(plainPassword: string): Promise<boolean>;
  toJSON<Type extends UserJson>(options?: ToObjectOptions): Type;
}

export interface UserJson
  extends Omit<
    LeanDocument<UserDocument>,
    'password' | '_id' | '__v' | 'createdAt' | 'updatedAt' | 'checkPassword'
  > {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: transformToJSON,
    },
  },
);

UserSchema.plugin(
  uniqueValidator as Parameters<typeof UserSchema['plugin']>[0],
  { message: 'is already taken' },
);

/**
 * Check if plain password matchs with encrypted password
 *
 * @param {String} plainPassword Plain password
 * @returns {Promise<boolean>}
 */
UserSchema.methods.checkPassword = async function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(16);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('User')
) {
  mongoose.deleteModel('User');
}

export default mongoose.model<UserDocument>('User', UserSchema);
