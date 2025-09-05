import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import User from '../src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cmis';

const mockCourses = [
  { title: 'Intro to Programming', code: 'CS101', description: 'Basics of programming', credits: 3 },
  { title: 'Data Structures', code: 'CS201', description: 'Data structures and algorithms', credits: 4 },
  { title: 'Database Systems', code: 'CS301', description: 'Database design and SQL', credits: 3 }
];

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  // create admin user if not exists
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@college.edu';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const u = new User({ email: adminEmail, password: adminPassword, role: 'admin' });
    await u.save();
    console.log('Created admin user:', adminEmail, 'password:', adminPassword);
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  for (const c of mockCourses) {
    const exists = await Course.findOne({ code: c.code });
    if (!exists) {
      await Course.create(c);
      console.log('Inserted course', c.code);
    } else {
      console.log('Course exists', c.code);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
