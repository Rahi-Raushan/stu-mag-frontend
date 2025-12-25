import React from 'react';

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: 'Computer Science & Engineering',
      description: 'Comprehensive program covering software development, algorithms, data structures, and emerging technologies.'
    },
    {
      id: 2,
      title: 'Business Administration',
      description: 'Strategic business management, leadership skills, and entrepreneurship development for future business leaders.'
    },
    {
      id: 3,
      title: 'Mechanical Engineering',
      description: 'Advanced mechanical systems, design engineering, and manufacturing technologies with hands-on experience.'
    },
    {
      id: 4,
      title: 'Electronics & Communication',
      description: 'Modern communication systems, embedded technologies, and digital signal processing expertise.'
    },
    {
      id: 5,
      title: 'Civil Engineering',
      description: 'Infrastructure development, construction management, and sustainable engineering solutions.'
    },
    {
      id: 6,
      title: 'Data Science & Analytics',
      description: 'Big data processing, machine learning, artificial intelligence, and statistical analysis methods.'
    }
  ];

  return (
    <section id="courses" className="section">
      <div className="container">
        <h2 className="section-title">Our Courses</h2>
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
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