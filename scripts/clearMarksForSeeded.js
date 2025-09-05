import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Marks from '../src/models/Marks.js';
import Student from '../src/models/Student.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cmis';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  const students = await Student.find({ rollNumber: { $regex: '^CS2021' } });
  for (const s of students) {
    await Marks.deleteMany({ studentId: s._id });
    console.log('Deleted marks for', s.rollNumber);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
