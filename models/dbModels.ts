import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'EMPLOYEE';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' },
  createdAt: { type: Date, default: Date.now },
});

// Client Account Schema
export interface IClientAccount extends Document {
  name: string;
  employeeId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ClientAccountSchema = new Schema<IClientAccount>({
  name: { type: String, required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});
// Ensure uniqueness: An employee cannot have duplicate client account names
ClientAccountSchema.index({ name: 1, employeeId: 1 }, { unique: true });

// Submission Schema
export interface ISubmission extends Document {
  url: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK';
  clientAccountId: mongoose.Types.ObjectId;
  submittedById: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>({
  url: { type: String, required: true, unique: true, trim: true, index: true },
  platform: { type: String, enum: ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK'], required: true },
  clientAccountId: { type: Schema.Types.ObjectId, ref: 'ClientAccount', required: true },
  submittedById: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ClientAccountModel = mongoose.models.ClientAccount || mongoose.model<IClientAccount>('ClientAccount', ClientAccountSchema);
export const SubmissionModel = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
