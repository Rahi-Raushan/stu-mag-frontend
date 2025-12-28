import React, { useState, useEffect } from 'react';
import { courseAPI, requestAPI, studentAPI, analyticsAPI } from '../services/api';

const SimpleAdminDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', age: '', city: '', contactNumber: '', fatherName: '', erpNo: '' });
  const [viewingCourses, setViewingCourses] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  
  // Search states
  const [searchCourse, setSearchCourse] = useState('');
  const [searchRequest, setSearchRequest] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

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
      
      const enrollmentStats = [
        { _id: 'pending', count: requestsRes.data.filter(r => r.status === 'pending').length },
        { _id: 'approved', count: requestsRes.data.filter(r => r.status === 'approved').length },
        { _id: 'rejected', count: requestsRes.data.filter(r => r.status === 'rejected').length }
      ];
      
      const courseEnrollmentMap = {};
      const approvedRequests = requestsRes.data.filter(r => r.status === 'approved');
      
      approvedRequests.forEach(request => {
        if (request.course && request.course._id && request.course.title) {
          const courseId = request.course._id;
          const courseTitle = request.course.title;
          if (courseEnrollmentMap[courseId]) {
            courseEnrollmentMap[courseId].enrolledCount++;
          } else {
            courseEnrollmentMap[courseId] = {
              _id: courseId,
              courseTitle: courseTitle,
              enrolledCount: 1
            };
          }
        }
      });
      
      const courseEnrollments = Object.values(courseEnrollmentMap)
        .sort((a, b) => b.enrolledCount - a.enrolledCount);
      
      const recentEnrollments = approvedRequests
        .filter(r => r.student && r.course && r.course.title)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setAnalytics({
        totalStudents: studentsRes.data.length,
        totalCourses: coursesRes.data.length,
        enrollmentStats,
        courseEnrollments,
        recentEnrollments
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading dashboard data');
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

  // Filter functions
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
    course.description.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const filteredRequests = requests.filter(request => {
    if (!request.course) return false;
    
    const studentName = request.studentName || request.student?.name || '';
    const studentEmail = request.studentEmail || request.student?.email || '';
    const courseTitle = request.course?.title || '';
    const search = searchRequest.toLowerCase();
    
    return studentName.toLowerCase().includes(search) ||
           studentEmail.toLowerCase().includes(search) ||
           courseTitle.toLowerCase().includes(search);
  });

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.city.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.erpNo.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1e3c72', 
        color: 'white', 
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>Admin Dashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>Welcome, {user.name}</p>
        </div>
        <button 
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            border: '2px solid white',
            color: 'white',
            padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            whiteSpace: 'nowrap'
          }}
        >
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
        <div style={{ padding: '0 clamp(1rem, 3vw, 2rem)' }}>
          <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', minWidth: 'fit-content' }}>
            {['dashboard', 'courses', 'requests', 'students'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'clamp(0.75rem, 2vw, 1rem) 0',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab ? '3px solid #1e3c72' : '3px solid transparent',
                  color: activeTab === tab ? '#1e3c72' : '#666',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab === 'dashboard' ? 'Analytics Dashboard' :
                 tab === 'requests' ? 'Student Requests' : 
                 tab === 'students' ? 'Manage Students' : 'Manage Courses'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
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

        {/* Analytics Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '2rem', color: '#1e3c72' }}>Analytics Dashboard</h2>
            
            {!analytics ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 'clamp(1rem, 2vw, 1.5rem)', 
                  marginBottom: 'clamp(2rem, 4vw, 3rem)' 
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: 'clamp(1.5rem, 3vw, 2rem)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Total Students</h3>
                    <p style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold' }}>{analytics.totalStudents || 0}</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: 'clamp(1.5rem, 3vw, 2rem)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Total Courses</h3>
                    <p style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold' }}>{analytics.totalCourses || 0}</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: 'clamp(1.5rem, 3vw, 2rem)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Approved Enrollments</h3>
                    <p style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold' }}>
                      {analytics.enrollmentStats?.find(s => s._id === 'approved')?.count || 0}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>Students Approved</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    padding: 'clamp(1.5rem, 3vw, 2rem)',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Pending Requests</h3>
                    <p style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 'bold' }}>
                      {analytics.enrollmentStats?.find(s => s._id === 'pending')?.count || 0}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', opacity: 0.9 }}>Awaiting Approval</p>
                  </div>
                </div>

                {/* Course Enrollment Statistics */}
                <div style={{
                  backgroundColor: 'white',
                  padding: 'clamp(1rem, 3vw, 2rem)',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  marginBottom: '2rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#1e3c72', fontSize: 'clamp(1.2rem, 3vw, 1.4rem)' }}>Course-wise Enrollment Statistics</h3>
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchCourse}
                      onChange={(e) => setSearchCourse(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '2px solid #e1e8ed',
                        borderRadius: '8px',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        width: 'clamp(150px, 30vw, 200px)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                      onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                    />
                  </div>
                  {analytics.courseEnrollments.filter(course => 
                    course.courseTitle.toLowerCase().includes(searchCourse.toLowerCase())
                  ).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '10px',
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                      <h4 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>
                        {searchCourse ? 'No matching courses found' : 'No Course Enrollments Yet'}
                      </h4>
                      <p style={{ color: '#6c757d', margin: 0 }}>
                        {searchCourse ? 'Try adjusting your search terms.' : 'Students haven\'t enrolled in any courses yet. Once they do, statistics will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {analytics.courseEnrollments
                        .filter(course => course.courseTitle.toLowerCase().includes(searchCourse.toLowerCase()))
                        .map((course, index) => (
                        <div key={course._id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'clamp(1rem, 2vw, 1.5rem)',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          borderLeft: `6px solid ${index === 0 ? '#28a745' : index === 1 ? '#ffc107' : '#6c757d'}`,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'pointer'
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>
                              {course.courseTitle}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ 
                                backgroundColor: index === 0 ? '#d4edda' : index === 1 ? '#fff3cd' : '#f8f9fa',
                                color: index === 0 ? '#155724' : index === 1 ? '#856404' : '#6c757d',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {index === 0 ? '🏆 Most Popular' : index === 1 ? '⭐ Popular' : '📚 Regular'}
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: 'clamp(2rem, 4vw, 2.5rem)', 
                              fontWeight: 'bold', 
                              color: '#1e3c72',
                              marginBottom: '0.2rem',
                              fontFamily: 'monospace'
                            }}>
                              {course.enrolledCount}
                            </div>
                            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', color: '#666', fontWeight: '500' }}>Students Enrolled</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Other tabs remain the same but with responsive styling */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Manage Courses</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: 'clamp(150px, 30vw, 200px)'
                  }}
                />
                <button
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  style={{
                    backgroundColor: '#1e3c72',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showAddCourse ? 'Cancel' : 'Add New Course'}
                </button>
              </div>
            </div>

            {showAddCourse && (
              <div style={{
                backgroundColor: 'white',
                padding: 'clamp(1rem, 3vw, 2rem)',
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
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)'
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
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
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
                      opacity: loading ? 0.7 : 1,
                      fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {filteredCourses.map(course => (
                <div key={course._id} style={{
                  backgroundColor: 'white',
                  padding: 'clamp(1rem, 2vw, 1.5rem)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #ddd'
                }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#1e3c72', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)' }}>{course.title}</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{course.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Requests - Simplified for mobile */}
        {activeTab === 'requests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Student Course Requests</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchRequest}
                  onChange={(e) => setSearchRequest(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: 'clamp(150px, 30vw, 200px)'
                  }}
                />
                <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#666' }}>
                  Total: {filteredRequests.length}
                </div>
              </div>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
              }}>
                <p style={{ color: '#666', fontStyle: 'italic', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>No course requests found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {filteredRequests.map(request => (
                  <div key={request._id} style={{
                    backgroundColor: 'white',
                    padding: 'clamp(1rem, 2vw, 2rem)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    borderLeft: `5px solid ${
                      request.status === 'pending' ? '#ff9800' : 
                      request.status === 'approved' ? '#4CAF50' : '#f44336'
                    }`
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)' }}>
                        {request.course?.title || 'Unknown Course'}
                      </h3>
                      <span style={{
                        backgroundColor: request.status === 'pending' ? '#fff3cd' : 
                                       request.status === 'approved' ? '#d4edda' : '#f8d7da',
                        color: request.status === 'pending' ? '#856404' : 
                               request.status === 'approved' ? '#155724' : '#721c24',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p><strong>Student:</strong> {request.studentName || request.student?.name}</p>
                      <p><strong>Email:</strong> {request.studentEmail || request.student?.email}</p>
                      <p><strong>Phone:</strong> {request.studentPhone || request.student?.contactNumber || 'Not provided'}</p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleApproveRequest(request._id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                            flex: 1,
                            minWidth: '100px'
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                            flex: 1,
                            minWidth: '100px'
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Management - Simplified for mobile */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>Manage Students</h2>
              <input
                type="text"
                placeholder="Search students..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: 'clamp(150px, 30vw, 200px)'
                }}
              />
            </div>
            
            {filteredStudents.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No students found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredStudents.map(student => (
                  <div key={student._id} style={{
                    backgroundColor: 'white',
                    padding: 'clamp(1rem, 2vw, 1.5rem)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)' }}>{student.name}</h3>
                        <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#666' }}>
                          <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {student.email}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Age:</strong> {student.age}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>City:</strong> {student.city}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>Contact:</strong> {student.contactNumber}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditStudent(student)}
                          style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;