import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  marks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Marks' }],
  fees: { type: mongoose.Schema.Types.ObjectId, ref: 'Fees' }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
