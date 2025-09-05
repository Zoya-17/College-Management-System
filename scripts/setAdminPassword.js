import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cmis';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@college.edu';
  const adminPassword = process.env.NEW_ADMIN_PASSWORD || 'Password@123';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ email: adminEmail, password: adminPassword, role: 'admin' });
    await admin.save();
    console.log('Created admin user with email:', adminEmail);
  } else {
    admin.password = adminPassword;
    await admin.save();
    console.log('Updated admin password for:', adminEmail);
  }

  await mongoose.disconnect();
  console.log('Done');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
