import mongoose from 'mongoose';

const feesSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
  totalFees: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Fees', feesSchema);
