import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from '../src/models/Student.js';
import Course from '../src/models/Course.js';
import Marks from '../src/models/Marks.js';
import Fees from '../src/models/Fees.js';
import User from '../src/models/User.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cmis';

const generateRoll = (i) => `CS2021${String(i).padStart(3, '0')}`;
const names = [ 'Alice Johnson', 'Bob Lee', 'Charlie Kim', 'Dana White', 'Eve Martinez' ];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  const courses = await Course.find({});
  if (!courses || !courses.length) {
    console.error('No courses found. Run scripts/seedCourses.js first.');
    process.exit(1);
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const roll = generateRoll(i+1);
    const email = `${roll.toLowerCase()}@student.college.edu`;

    // create a User account for student if not exists
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password: 'Password@123', role: 'student' });
      await user.save();
      console.log('Created user', email);
    } else {
      console.log('User exists', email);
    }

    let student = await Student.findOne({ rollNumber: roll });
    if (!student) {
      student = new Student({ name, rollNumber: roll, department: 'Computer Science', courses: courses.map(c => c._id) });
      await student.save();
      console.log('Created student', roll);
    } else {
      console.log('Student exists', roll);
    }

    // create marks for each course (internal/external/total/grade)
    for (const c of courses) {
      const exists = await Marks.findOne({ studentId: student._id, courseId: c._id });
      if (!exists) {
        const internal = randomInt(10, 20);
        const external = randomInt(40, 80);
        const total = internal + external;
        let grade = 'C';
        if (total >= 90) grade = 'A+';
        else if (total >= 80) grade = 'A';
        else if (total >= 70) grade = 'B+';
        else if (total >= 60) grade = 'B';
        await Marks.create({ studentId: student._id, courseId: c._id, internalMarks: internal, externalMarks: external, totalMarks: total, grade, examType: 'final' });
      }
    }

    // create fees document
    let fees = await Fees.findOne({ studentId: student._id });
    if (!fees) {
      const totalFees = 50000;
      const paidAmount = randomInt(10000, 50000);
      const balanceAmount = Math.max(0, totalFees - paidAmount);
      fees = new Fees({ studentId: student._id, totalFees, paidAmount, balanceAmount });
      await fees.save();
      console.log('Fees created for', roll);
    }
  }

  await mongoose.disconnect();
  console.log('Seed students done');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
