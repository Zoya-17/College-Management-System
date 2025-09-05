// Ensure test env is set before importing app or mongoose
process.env.NODE_ENV = 'test';
if (process.env.MONGO_URI_TEST) process.env.MONGO_URI = process.env.MONGO_URI_TEST;
import request from 'supertest';
import { strict as assert } from 'assert';
import mongoose from 'mongoose';
import app from '../server.js';

describe('Auth routes', function () {
  before(async function () {
    this.timeout(10000);
  // Use MONGO_URI_TEST when available to isolate tests
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI_TEST or MONGO_URI must be set for tests');
  if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
  });

  after(async function () {
    // cleanup created user
  await mongoose.connection.db.collection('users').deleteMany({ email: { $regex: /supertest/ } });
  });

  it('should register and login a user', async function () {
    const email = `supertest+${Date.now()}@example.com`;
    const pw = 'Test12345!';
    const reg = await request(app).post('/api/auth/register').send({ email, password: pw });
    assert.equal(reg.body.success, true);

    const login = await request(app).post('/api/auth/login').send({ email, password: pw });
    assert.equal(login.body.success, true);
    assert.ok(login.body.data.token);
  });
});
