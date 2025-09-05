import Fees from '../models/Fees.js';

export const getFeesByStudent = async (req, res, next) => {
  try {
    const requester = req.user;
    const targetStudentId = req.params.studentId;
    if (!requester) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (requester.role !== 'admin' && String(requester._id) !== String(targetStudentId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // If fees are stored per semester, we could filter by req.query.semester.
    // Current model stores a single record per student; return that record.
    const fees = await Fees.findOne({ studentId: targetStudentId });
    if (!fees) return res.status(404).json({ success: false, message: 'Fees not found' });
    return res.json({ success: true, message: 'Fees fetched', data: fees });
  } catch (err) {
    next(err);
  }
};

export const addOrUpdateFees = async (req, res, next) => {
  try {
    const { studentId, totalFees, paidAmount } = req.body;
    if (!studentId || totalFees == null) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const balance = totalFees - (paidAmount || 0);
    const fees = await Fees.findOneAndUpdate(
      { studentId },
      { totalFees, paidAmount: paidAmount || 0, balanceAmount: balance },
      { upsert: true, new: true }
    );
    return res.json({ success: true, message: 'Fees saved', data: fees });
  } catch (err) {
    next(err);
  }
};

export const getAllFees = async (req, res, next) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (requester.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const { q, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 20));

    // join fees with students
    const FeesModel = (await import('../models/Fees.js')).default;
    const Student = (await import('../models/Student.js')).default;

    const studentMatch = {};
    if (q) {
      const re = new RegExp(q, 'i');
      studentMatch.$or = [{ name: re }, { rollNumber: re }];
    }

    const totalStudents = await Student.countDocuments(studentMatch);
    const students = await Student.find(studentMatch).select('name rollNumber').skip((pageNum - 1) * limitNum).limit(limitNum);
    const studentIds = students.map(s => String(s._id));

    const fees = await FeesModel.find({ studentId: { $in: studentIds } });
    const feesMap = new Map(fees.map(f => [String(f.studentId), f]));

    const items = students.map(s => {
      const f = feesMap.get(String(s._id));
      return {
        studentId: String(s._id),
        studentName: s.name,
        rollNumber: s.rollNumber,
        totalFees: f ? f.totalFees : 0,
        paidAmount: f ? f.paidAmount : 0,
        balanceAmount: f ? f.balanceAmount : 0,
        paymentStatus: f ? (f.balanceAmount === 0 ? 'Paid' : (f.paidAmount > 0 ? 'Partial' : 'Pending')) : 'Pending'
      };
    });

    return res.json({ success: true, message: 'Fees list', data: { items, total: totalStudents, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
};
