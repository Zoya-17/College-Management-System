import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import studentRoutes from './src/routes/student.routes.js';
import courseRoutes from './src/routes/course.routes.js';
import marksRoutes from './src/routes/marks.routes.js';
import feesRoutes from './src/routes/fees.routes.js';
import errorHandler from './src/middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// connect db
connectDB(process.env.MONGO_URI);

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/fees', feesRoutes);

// error handler
app.use(errorHandler);

// export app for tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
