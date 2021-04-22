import bcrypt from 'bcryptjs';
import mongoose, { Document, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  checkPassword(plainPassword: string): Promise<boolean>;
}

const userSchema = new Schema<User>(
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
  },
);

userSchema.plugin(
  uniqueValidator as Parameters<typeof userSchema['plugin']>[0],
  { message: 'is already taken' },
);

/**
 * Check if plain password matchs with encrypted password
 *
 * @param {String} plainPassword Plain password
 * @returns {Promise<boolean>}
 */
userSchema.methods.checkPassword = async function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const object = this.toObject();
  const user = JSON.parse(JSON.stringify(object));

  delete user.password;

  return user;
};

userSchema.pre('save', async function (next) {
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

// eslint-disable-next-line no-redeclare
export const User = mongoose.model<User>('User', userSchema);
