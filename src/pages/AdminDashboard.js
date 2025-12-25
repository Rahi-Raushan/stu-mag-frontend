import React, { useState, useEffect } from 'react';
import { studentAPI, courseAPI, enrollmentAPI } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', age: '', city: '', role: 'student' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchPendingEnrollments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getPendingEnrollments();
      setPendingEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.create(newStudent);
      setNewStudent({ name: '', email: '', password: '', age: '', city: '', role: 'student' });
      fetchStudents();
      alert('Student created successfully!');
    } catch (error) {
      alert('Error creating student');
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.update(editingStudent._id, editingStudent);
      setEditingStudent(null);
      fetchStudents();
      alert('Student updated successfully!');
    } catch (error) {
      alert('Error updating student');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await courseAPI.create(newCourse);
      setNewCourse({ title: '', description: '' });
      fetchCourses();
      alert('Course created successfully!');
    } catch (error) {
      alert('Error creating course');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.delete(id);
        fetchStudents();
        alert('Student deleted successfully!');
      } catch (error) {
        alert('Error deleting student');
      }
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    try {
      await enrollmentAPI.approveEnrollment(enrollmentId);
      fetchPendingEnrollments();
      alert('Enrollment approved!');
    } catch (error) {
      alert('Error approving enrollment');
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    try {
      await enrollmentAPI.rejectEnrollment(enrollmentId);
      fetchPendingEnrollments();
      alert('Enrollment rejected!');
    } catch (error) {
      alert('Error rejecting enrollment');
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">Admin Dashboard</div>
          <div>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
            <button onClick={onLogout} className="btn-login">Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div className="dashboard-tabs">
          <button
            onClick={() => setActiveTab('students')}
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
          >
            Pending Approvals ({pendingEnrollments.length})
          </button>
        </div>

        {activeTab === 'students' && (
          <div>
            <div className="card">
              <h3>Create New Student</h3>
              <form onSubmit={handleCreateStudent}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      placeholder="Password"
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Age"
                      value={newStudent.age}
                      onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="City"
                      value={newStudent.city}
                      onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <select
                      value={newStudent.role}
                      onChange={(e) => setNewStudent({ ...newStudent, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn">Create Student</button>
              </form>
            </div>

            <div className="card">
              <h3>All Students</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>City</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.age}</td>
                      <td>{student.city}</td>
                      <td>{student.role}</td>
                      <td>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="btn"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {editingStudent && (
              <div className="card">
                <h3>Edit Student</h3>
                <form onSubmit={handleUpdateStudent}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Age:</label>
                      <input
                        type="number"
                        value={editingStudent.age}
                        onChange={(e) => setEditingStudent({ ...editingStudent, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>City:</label>
                      <input
                        type="text"
                        value={editingStudent.city}
                        onChange={(e) => setEditingStudent({ ...editingStudent, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role:</label>
                      <select
                        value={editingStudent.role}
                        onChange={(e) => setEditingStudent({ ...editingStudent, role: e.target.value })}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="btn" style={{ marginRight: '1rem' }}>Update Student</button>
                    <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-danger">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="card">
              <h3>Create New Course</h3>
              <form onSubmit={handleCreateCourse}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    required
                    rows="3"
                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                <button type="submit" className="btn">Create Course</button>
              </form>
            </div>

            <div className="card">
              <h3>All Courses</h3>
              <div className="grid">
                {courses.map((course) => (
                  <div key={course._id} className="card">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className="card">
            <h3>Pending Enrollment Approvals</h3>
            {pendingEnrollments.length === 0 ? (
              <p>No pending enrollments</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEnrollments.map((enrollment) => (
                    <tr key={enrollment._id}>
                      <td>{enrollment.student.name}</td>
                      <td>{enrollment.student.email}</td>
                      <td>{enrollment.course.title}</td>
                      <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleApproveEnrollment(enrollment._id)}
                          className="btn"
                          style={{ marginRight: '0.5rem', backgroundColor: '#28a745' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectEnrollment(enrollment._id)}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;