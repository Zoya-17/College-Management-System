import Student from '../models/Student.js';

export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('courses marks fees');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, message: 'Student fetched', data: student });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, department } = req.body;
    if (!name || !rollNumber || !department) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const exists = await Student.findOne({ rollNumber });
    if (exists) return res.status(400).json({ success: false, message: 'Roll number already exists' });
    const student = await Student.create(req.body);
    return res.status(201).json({ success: true, message: 'Student created', data: student });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, message: 'Student updated', data: student });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};
