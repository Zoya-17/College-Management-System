import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  grade: { type: String, default: '' },
  examType: { type: String, enum: ['internal', 'final'], default: 'final' }
}, { timestamps: true });

export default mongoose.model('Marks', marksSchema);
