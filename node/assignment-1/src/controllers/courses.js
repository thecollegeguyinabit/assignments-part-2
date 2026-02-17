import { Course } from "../models/courses.js";

export async function getAllCourses(req, res) {
  try {
    const courses = await Course.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.render('index', {courses });
  } catch (error) {
    res.status(500).send('Error fetching courses', error.message);
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.json( course );
  } catch (error) {
    res.status(500).send('Error fetching course', error.message);
  }
}

export async function createCourse(req, res) {
  try {
    const { courseName, courseDuration, courseFees } = req.body;
    
    const course = await Course.create({
      courseName,
      courseDuration,
      courseFees
    });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).send('Error creating course', error.message);
  }
}

export async function updateCourse(req, res) {
  try {
    const { courseName, courseDuration, courseFees } = req.body;
    
    const [updatedRowsCount] = await Course.update({
      courseName,
      courseDuration,
      courseFees
    }, { where: { id: req.params.id } });
    
    if (updatedRowsCount === 0) {
      return res.status(404).send('Course not found');
    }
    
    const updatedCourse = await Course.findByPk(req.params.id);
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).send('Error updating course', error.message);
  }
}

export async function deleteCourse(req, res) {
  try {
    const deleteRowsCount = await Course.destroy({
      where: {id: req.params.id}
    });
    if (deleteRowsCount === 0) {
      return res.status(404).send('Course not found');
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).send('Error deleting course', error.message);
  }
}