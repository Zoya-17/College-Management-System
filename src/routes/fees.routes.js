import express from 'express';
import { getFeesByStudent, addOrUpdateFees, getAllFees } from '../controllers/fees.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllFees);
router.get('/:studentId', authMiddleware, getFeesByStudent);
router.post('/', authMiddleware, addOrUpdateFees);

export default router;
