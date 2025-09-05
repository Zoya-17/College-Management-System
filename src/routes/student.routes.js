import express from 'express';
import { body } from 'express-validator';
import { getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import permit from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/:id', authMiddleware, getStudent);
router.post('/', authMiddleware, [body('name').notEmpty(), body('rollNumber').notEmpty(), body('department').notEmpty()], createStudent);
router.put('/:id', authMiddleware, updateStudent);
router.delete('/:id', authMiddleware, permit('admin'), deleteStudent);

export default router;
