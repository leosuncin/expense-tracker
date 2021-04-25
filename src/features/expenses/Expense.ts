import mongoose, { Document, Schema } from 'mongoose';

import type { User } from '@app/features/auth/User';
import { centsToDollars, dollarsToCents } from '@app/utils/helpers';

export interface Expense extends Document {
  name: string;
  amount: number;
  description?: string;
  author: User;
}

const expenseSchema = new Schema<Expense>(
  {
    name: {
      type: String,
      trim: true,
      required: 'Please enter a spend name!',
    },
    amount: {
      type: Number,
      trim: true,
      required: 'Please enter an amount!',
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'You must supply an author',
    },
  },
  { timestamps: true },
);

expenseSchema.pre('save', function (next) {
  this.amount = dollarsToCents(this.amount);
  next();
});

expenseSchema.post('save', function () {
  this.amount = centsToDollars(this.amount);
});

expenseSchema.post('init', function () {
  this.amount = centsToDollars(this.amount);
});

if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('Expense')
) {
  mongoose.deleteModel('Expense');
}

// eslint-disable-next-line no-redeclare
export const Expense = mongoose.model<Expense>('Expense', expenseSchema);
