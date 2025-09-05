import express from 'express';
import { getMarksByStudent, addMarks, getAllMarks } from '../controllers/marks.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllMarks);
router.get('/:studentId', authMiddleware, getMarksByStudent);
router.post('/', authMiddleware, addMarks);

export default router;
