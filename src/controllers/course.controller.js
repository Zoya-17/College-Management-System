import Course from '../models/Course.js';

export const listCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    return res.json({ success: true, message: 'Courses fetched', data: courses });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, code } = req.body;
    if (!title || !code) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const exists = await Course.findOne({ code });
    if (exists) return res.status(400).json({ success: false, message: 'Course code already exists' });
    const course = await Course.create(req.body);
    return res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, message: 'Course updated', data: course });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};
