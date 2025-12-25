import React, { useState, useEffect } from 'react';
import { courseAPI, requestAPI, studentAPI } from '../services/api';

const SimpleAdminDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', age: '', city: '', contactNumber: '', fatherName: '', erpNo: '' });
  const [viewingCourses, setViewingCourses] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, requestsRes, studentsRes] = await Promise.all([
        courseAPI.getAll(),
        requestAPI.getAllRequests(),
        studentAPI.getAll()
      ]);
      setCourses(coursesRes.data);
      setRequests(requestsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseAPI.create(newCourse);
      setMessage('Course created successfully!');
      setNewCourse({ title: '', description: '' });
      setShowAddCourse(false);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating course');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await requestAPI.approveRequest(requestId);
      setMessage('Request approved successfully!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error approving request');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      await requestAPI.rejectRequest(requestId);
      setMessage('Request rejected successfully!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error rejecting request');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      name: student.name,
      email: student.email,
      age: student.age,
      city: student.city,
      contactNumber: student.contactNumber,
      fatherName: student.fatherName,
      erpNo: student.erpNo
    });
  };

  const handleViewCourses = async (studentId) => {
    try {
      const response = await studentAPI.getCourses(studentId);
      setStudentCourses(response.data);
      setViewingCourses(studentId);
    } catch (error) {
      setMessage('Error fetching student courses');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentAPI.update(editingStudent, editForm);
      setMessage('Student updated successfully!');
      setEditingStudent(null);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating student');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setLoading(true);
      try {
        await studentAPI.delete(studentId);
        setMessage('Student deleted successfully!');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting student');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1e3c72', 
        color: 'white', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Dashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Welcome, {user.name}</p>
        </div>
        <button 
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #ddd' }}>
        <div style={{ padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['courses', 'requests', 'students'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 0',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab ? '3px solid #1e3c72' : '3px solid transparent',
                  color: activeTab === tab ? '#1e3c72' : '#666',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'requests' ? 'Student Requests' : 
                 tab === 'students' ? 'Manage Students' : 'Manage Courses'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        {message && (
          <div style={{
            backgroundColor: message.includes('Error') ? '#fee' : '#efe',
            color: message.includes('Error') ? '#c33' : '#363',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`
          }}>
            {message}
          </div>
        )}

        {/* Courses Management */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Manage Courses</h2>
              <button
                onClick={() => setShowAddCourse(!showAddCourse)}
                style={{
                  backgroundColor: '#1e3c72',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {showAddCourse ? 'Cancel' : 'Add New Course'}
              </button>
            </div>

            {showAddCourse && (
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #ddd'
              }}>
                <h3>Add New Course</h3>
                <form onSubmit={handleAddCourse}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Course Title:
                    </label>
                    <input
                      type="text"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Description:
                    </label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      required
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {courses.map(course => (
                <div key={course._id} style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #ddd'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1e3c72' }}>{course.title}</h3>
                  <p style={{ margin: '0', color: '#666' }}>{course.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Requests */}
        {activeTab === 'requests' && (
          <div>
            <h2>Student Course Requests</h2>
            {requests.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No pending requests.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {requests.map(request => (
                  <div key={request._id} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72' }}>{request.course.title}</h3>
                        <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{request.course.description}</p>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>
                          <p style={{ margin: '0.25rem 0' }}><strong>Student:</strong> {request.student.name}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {request.student.email}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Age:</strong> {request.student.age}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>City:</strong> {request.student.city}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Management */}
        {activeTab === 'students' && (
          <div>
            <h2>Manage Students</h2>
            {students.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No students found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {students.map(student => (
                  <div key={student._id} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}>
                    {editingStudent === student._id ? (
                      <form onSubmit={handleUpdateStudent}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            placeholder="Name"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder="Email"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="number"
                            value={editForm.age}
                            onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                            placeholder="Age"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                            placeholder="City"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="tel"
                            value={editForm.contactNumber}
                            onChange={(e) => setEditForm({...editForm, contactNumber: e.target.value})}
                            placeholder="Contact Number"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="text"
                            value={editForm.fatherName}
                            onChange={(e) => setEditForm({...editForm, fatherName: e.target.value})}
                            placeholder="Father Name"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                          <input
                            type="text"
                            value={editForm.erpNo}
                            onChange={(e) => setEditForm({...editForm, erpNo: e.target.value})}
                            placeholder="ERP Number"
                            required
                            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(null)}
                            style={{
                              backgroundColor: '#666',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72' }}>{student.name}</h3>
                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {student.email}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>Age:</strong> {student.age}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>City:</strong> {student.city}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>Contact:</strong> {student.contactNumber}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>Father:</strong> {student.fatherName}</p>
                            <p style={{ margin: '0.25rem 0' }}><strong>ERP:</strong> {student.erpNo}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleEditStudent(student)}
                              disabled={loading}
                              style={{
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              disabled={loading}
                              style={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                          <button
                            onClick={() => handleViewCourses(student._id)}
                            style={{
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            View Courses
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Course Details Modal */}
        {viewingCourses && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Student Course Details</h3>
                <button
                  onClick={() => setViewingCourses(null)}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
              {studentCourses.length === 0 ? (
                <p>No course enrollments found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {studentCourses.map(enrollment => (
                    <div key={enrollment._id} style={{
                      padding: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72' }}>{enrollment.course.title}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{enrollment.course.description}</p>
                      <span style={{
                        backgroundColor: enrollment.status === 'pending' ? '#ff9800' : 
                                       enrollment.status === 'approved' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;