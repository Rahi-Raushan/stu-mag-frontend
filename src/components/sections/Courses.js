import React, { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to static courses if API fails
      setCourses([
        {
          _id: '1',
          title: 'Computer Science & Engineering',
          description: 'Comprehensive program covering software development, algorithms, data structures, and emerging technologies.'
        },
        {
          _id: '2',
          title: 'Business Administration',
          description: 'Strategic business management, leadership skills, and entrepreneurship development for future business leaders.'
        },
        {
          _id: '3',
          title: 'Data Science & Analytics',
          description: 'Big data processing, machine learning, artificial intelligence, and statistical analysis methods.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="courses" className="section">
        <div className="container">
          <h2 className="section-title">Our Courses</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>Loading courses...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="section">
      <div className="container">
        <h2 className="section-title">Our Courses</h2>
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;