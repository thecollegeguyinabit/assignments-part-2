import express from 'express';
import {getAllCourses, createCourse, getCourseById, updateCourse, deleteCourse } from '../controllers/courses.js';

const router = express.Router();

router.get("/", getAllCourses);
router.post("/courses", createCourse);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);


export default router;
