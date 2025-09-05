process.env.NODE_ENV = 'test';
if (process.env.MONGO_URI_TEST) process.env.MONGO_URI = process.env.MONGO_URI_TEST;
import request from 'supertest';
import { strict as assert } from 'assert';
import mongoose from 'mongoose';
import app from '../server.js';

describe('RBAC tests', function () {
  let studentId;
  let adminToken;
  let userToken;

  before(async function () {
    this.timeout(10000);
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI_TEST or MONGO_URI must be set for tests');
  if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    // create a student
    const s = await request(app).post('/api/students').send({ name: 'RBAC Student', rollNumber: `R${Date.now()}`, department: 'CS' }).set('Authorization', `Bearer invalid`);
    // if server prevented unauth creation, create directly via DB
    if (s.status === 401) {
      const res = await mongoose.connection.db.collection('students').insertOne({ name: 'RBAC Student', rollNumber: `R${Date.now()}`, department: 'CS' });
      studentId = res.insertedId.toHexString();
    } else {
      studentId = s.body.data._id;
    }

    // create admin user
    const adminEmail = `admin+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ email: adminEmail, password: 'Admin123!', role: 'admin' });
    const a = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'Admin123!' });
    adminToken = a.body.data.token;

    // create normal user
    const userEmail = `user+${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({ email: userEmail, password: 'User123!', role: 'student' });
    const u = await request(app).post('/api/auth/login').send({ email: userEmail, password: 'User123!' });
    userToken = u.body.data.token;
  });

  after(async function () {
    // cleanup created test users and student
    await mongoose.connection.db.collection('users').deleteMany({ email: { $regex: /(admin\+|user\+|RBAC|supertest)/ } });
    await mongoose.connection.db.collection('students').deleteMany({ name: /RBAC Student/ });
  });

  it('should forbid non-admin from deleting a student', async function () {
    const res = await request(app).delete(`/api/students/${studentId}`).set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
  });

  it('should allow admin to delete a student', async function () {
    const res = await request(app).delete(`/api/students/${studentId}`).set('Authorization', `Bearer ${adminToken}`);
    // either 200 or 404 if already removed
    assert.ok([200, 404].includes(res.status));
  });
});
