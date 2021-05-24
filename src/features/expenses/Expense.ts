import type { Document, LeanDocument, ToObjectOptions, Types } from 'mongoose';
import mongoose from 'mongoose';

import type { UserDocument as User } from '@app/features/auth/User';
import {
  centsToDollars,
  dollarsToCents,
  transformToJSON,
} from '@app/utils/helpers';

export interface Expense {
  name: string;
  amount: number;
  description?: string;
  date: Date;
  author: User | User['_id'] | string;
}

export interface ExpenseDocument extends Expense, Document<Types.ObjectId> {
  toJSON<Type extends ExpenseJson>(options?: ToObjectOptions): Type;
}

export interface ExpenseJson
  extends Omit<
    LeanDocument<ExpenseDocument>,
    '_id' | '__v' | 'date' | 'createdAt' | 'updatedAt'
  > {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const expenseSchema = new mongoose.Schema<ExpenseDocument>(
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
    date: {
      type: Date,
      default: () => new Date(),
      transform: (value: Date) => value.toISOString(),
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: 'You must supply an author',
    },
  },
  { timestamps: true, toJSON: { transform: transformToJSON } },
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

export default mongoose.model<ExpenseDocument>('Expense', expenseSchema);
