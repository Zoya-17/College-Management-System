import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, default: 3 }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
