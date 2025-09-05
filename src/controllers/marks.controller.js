import Marks from '../models/Marks.js';
import Student from '../models/Student.js';

export const getMarksByStudent = async (req, res, next) => {
  try {
    // return marks for a single student (owner or admin)
    const requester = req.user;
    const targetStudentId = req.params.studentId;
    if (!requester) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (requester.role !== 'admin' && String(requester.id) !== String(targetStudentId)) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { semester } = req.query;
    const filter = { studentId: targetStudentId };
    if (semester) filter.semester = semester;

    const marks = await Marks.find(filter).populate('courseId');

    const items = marks.map(m => ({
      id: m._id,
      course: m.courseId,
      internalMarks: m.internalMarks,
      externalMarks: m.externalMarks,
      totalMarks: m.totalMarks,
      grade: m.grade,
      semester: m.semester,
      examType: m.examType
    }));

    return res.json({ success: true, message: 'Student marks fetched', data: items });
  } catch (err) {
    next(err);
  }
};

export const getAllMarks = async (req, res, next) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (requester.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    // params: q (search by name/roll), page, limit, semester
    const { q, page = 1, limit = 20, semester } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 20));

    // Build student match for search
    const studentMatch = {};
    if (q) {
      const re = new RegExp(q, 'i');
      studentMatch.$or = [{ name: re }, { rollNumber: re }];
    }

    const totalStudents = await Student.countDocuments(studentMatch);
    const students = await Student.find(studentMatch).select('name rollNumber').skip((pageNum - 1) * limitNum).limit(limitNum);
    const studentIds = students.map(s => String(s._id));

    // Fetch marks for these students, optionally filter by semester
    const markFilter = { studentId: { $in: studentIds } };
    if (semester) markFilter.semester = semester;
    const marks = await Marks.find(markFilter).populate('courseId');

    // group marks by student
    const grouped = new Map();
    for (const m of marks) {
      const sid = String(m.studentId);
      if (!grouped.has(sid)) grouped.set(sid, []);
      grouped.get(sid).push(m);
    }

    const items = students.map(s => {
      const sid = String(s._id);
      const studentMarks = (grouped.get(sid) || []).map(m => ({
        id: m._id,
        course: m.courseId,
        internalMarks: m.internalMarks,
        externalMarks: m.externalMarks,
        totalMarks: m.totalMarks,
        grade: m.grade,
        semester: m.semester,
        examType: m.examType
      }));

      // compute simple aggregates
      const total = studentMarks.reduce((sum, mm) => sum + (mm.marksObtained || 0), 0);
      const count = studentMarks.length || 1;
      const percentage = ((total / (count * 100)) * 100).toFixed(1);

      return {
        studentId: sid,
        studentName: s.name,
        rollNumber: s.rollNumber,
        marks: studentMarks,
        summary: { total, count, percentage }
      };
    });

    return res.json({ success: true, message: 'Student marks fetched', data: { items, total: totalStudents, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
};

export const addMarks = async (req, res, next) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ success: false, message: 'Not authorized' });
    // only admin or staff can add marks — keep simple: allow admin
    if (requester.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

  const { studentId, courseId, internalMarks = 0, externalMarks = 0, examType = 'final', semester } = req.body;
  if (!studentId || !courseId) return res.status(400).json({ success: false, message: 'Missing fields' });
  const totalMarks = Number(internalMarks) + Number(externalMarks);
  // simple grade mapping
  let grade = 'F';
  const pct = (totalMarks / 100) * 100;
  if (pct >= 90) grade = 'A+';
  else if (pct >= 80) grade = 'A';
  else if (pct >= 70) grade = 'B+';
  else if (pct >= 60) grade = 'B';
  else grade = 'C';

  const created = await Marks.create({ studentId, courseId, internalMarks, externalMarks, totalMarks, grade, examType, semester });
    return res.status(201).json({ success: true, message: 'Marks added', data: created });
  } catch (err) {
    next(err);
  }
};
