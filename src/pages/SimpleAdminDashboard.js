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
      
      // Calculate analytics from existing data
      console.log('Requests data:', requestsRes.data);
      
      const enrollmentStats = [
        { _id: 'pending', count: requestsRes.data.filter(r => r.status === 'pending').length },
        { _id: 'approved', count: requestsRes.data.filter(r => r.status === 'approved').length },
        { _id: 'rejected', count: requestsRes.data.filter(r => r.status === 'rejected').length }
      ];
      
      console.log('Enrollment stats:', enrollmentStats);
      
      // Course-wise enrollment count
      const courseEnrollmentMap = {};
      const approvedRequests = requestsRes.data.filter(r => r.status === 'approved');
      console.log('Approved requests:', approvedRequests);
      
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
      
      console.log('Course enrollments:', courseEnrollments);
      
      // Recent enrollments (approved requests)
      const recentEnrollments = approvedRequests
        .filter(r => r.student && r.course && r.course.title)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      console.log('Recent enrollments:', recentEnrollments);
      
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
    // Skip requests with null/undefined course
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
            {['dashboard', 'courses', 'requests', 'students'].map(tab => (
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
                {tab === 'dashboard' ? 'Analytics Dashboard' :
                 tab === 'requests' ? 'Student Requests' : 
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem', 
                  marginBottom: '3rem' 
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Total Students</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.totalStudents || 0}</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Total Courses</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics.totalCourses || 0}</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Approved Enrollments</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
                      {analytics.enrollmentStats?.find(s => s._id === 'approved')?.count || 0}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>Students Approved</p>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '15px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Pending Requests</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
                      {analytics.enrollmentStats?.find(s => s._id === 'pending')?.count || 0}
                    </p>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>Awaiting Approval</p>
                  </div>
                </div>

                {/* Course Enrollment Statistics */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  marginBottom: '2rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, color: '#1e3c72', fontSize: '1.4rem' }}>Course-wise Enrollment Statistics</h3>
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchCourse}
                      onChange={(e) => setSearchCourse(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '2px solid #e1e8ed',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        width: '200px',
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
                          padding: '1.5rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          borderLeft: `6px solid ${index === 0 ? '#28a745' : index === 1 ? '#ffc107' : '#6c757d'}`,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: '1.2rem' }}>
                              {course.courseTitle}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ 
                                backgroundColor: index === 0 ? '#d4edda' : index === 1 ? '#fff3cd' : '#f8f9fa',
                                color: index === 0 ? '#155724' : index === 1 ? '#856404' : '#6c757d',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
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
                              fontSize: '2.5rem', 
                              fontWeight: 'bold', 
                              color: '#1e3c72',
                              marginBottom: '0.2rem',
                              fontFamily: 'monospace'
                            }}>
                              {course.enrolledCount}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Students Enrolled</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Enrollments */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 2rem 0', color: '#1e3c72', fontSize: '1.4rem' }}>Recent Enrollments</h3>
                  {analytics.recentEnrollments.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '10px',
                      border: '2px dashed #dee2e6'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                      <h4 style={{ color: '#6c757d', margin: '0 0 0.5rem 0' }}>No Recent Enrollments</h4>
                      <p style={{ color: '#6c757d', margin: 0 }}>No students have been approved for courses yet. Recent enrollments will appear here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {analytics.recentEnrollments.map((enrollment, index) => (
                        <div key={enrollment._id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.5rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          border: '1px solid #e9ecef',
                          borderLeft: '4px solid #28a745',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              backgroundColor: '#1e3c72',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '1.2rem'
                            }}>
                              {enrollment.student?.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <h4 style={{ margin: '0 0 0.3rem 0', color: '#1e3c72', fontSize: '1.1rem' }}>
                                {enrollment.student?.name || 'Unknown Student'}
                              </h4>
                              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                {enrollment.student?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: '#1e3c72', 
                              fontSize: '1.1rem',
                              marginBottom: '0.3rem'
                            }}>
                              {enrollment.course?.title || 'Unknown Course'}
                            </div>
                            <div style={{ 
                              fontSize: '0.8rem', 
                              color: '#666',
                              backgroundColor: '#e9ecef',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              display: 'inline-block'
                            }}>
                              {new Date(enrollment.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
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

        {/* Courses Management */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Manage Courses</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchCourse}
                  onChange={(e) => setSearchCourse(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '200px'
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
                    cursor: 'pointer'
                  }}
                >
                  {showAddCourse ? 'Cancel' : 'Add New Course'}
                </button>
              </div>
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
              {filteredCourses.map(course => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Student Course Requests</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchRequest}
                  onChange={(e) => setSearchRequest(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '200px'
                  }}
                />
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Total Requests: {filteredRequests.length}
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
                <p style={{ color: '#666', fontStyle: 'italic', fontSize: '1.1rem' }}>No course requests found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {filteredRequests.map(request => (
                  <div key={request._id} style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    borderLeft: `5px solid ${
                      request.status === 'pending' ? '#ff9800' : 
                      request.status === 'approved' ? '#4CAF50' : '#f44336'
                    }`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <h3 style={{ margin: 0, color: '#1e3c72', fontSize: '1.3rem' }}>{request.course?.title || 'Unknown Course'}</h3>
                          <span style={{
                            backgroundColor: request.status === 'pending' ? '#fff3cd' : 
                                           request.status === 'approved' ? '#d4edda' : '#f8d7da',
                            color: request.status === 'pending' ? '#856404' : 
                                   request.status === 'approved' ? '#155724' : '#721c24',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {request.status}
                          </span>
                        </div>
                        
                        <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
                          {request.course?.description || 'No description available'}
                        </p>
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                          gap: '1rem',
                          backgroundColor: '#f8f9fa',
                          padding: '1.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: '1rem' }}>Student Information</h4>
                            <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '60px' }}>Name:</span>
                                <span style={{ color: '#212529' }}>{request.studentName || request.student?.name}</span>
                              </p>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '60px' }}>Email:</span>
                                <span style={{ color: '#212529' }}>{request.studentEmail || request.student?.email}</span>
                              </p>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '60px' }}>Phone:</span>
                                <span style={{ color: '#212529', fontWeight: '500' }}>{request.studentPhone || request.student?.contactNumber || 'Not provided'}</span>
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72', fontSize: '1rem' }}>Additional Details</h4>
                            <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '50px' }}>Age:</span>
                                <span style={{ color: '#212529' }}>{request.student?.age || 'N/A'} years</span>
                              </p>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '50px' }}>City:</span>
                                <span style={{ color: '#212529' }}>{request.student?.city || 'N/A'}</span>
                              </p>
                              <p style={{ margin: '0.3rem 0', display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#495057', minWidth: '50px' }}>Date:</span>
                                <span style={{ color: '#212529' }}>{new Date(request.createdAt).toLocaleDateString()}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                          <button
                            onClick={() => handleApproveRequest(request._id)}
                            disabled={loading}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.7 : 1,
                              fontWeight: '600',
                              fontSize: '0.95rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
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
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.7 : 1,
                              fontWeight: '600',
                              fontSize: '0.95rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                      
                      {request.status === 'approved' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.75rem',
                            backgroundColor: '#d4edda',
                            borderRadius: '8px',
                            justifyContent: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ 
                              color: '#155724',
                              fontWeight: 'bold',
                              fontSize: '0.95rem'
                            }}>
                              ✓ Approved
                            </span>
                          </div>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={loading}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1.5rem',
                              borderRadius: '8px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              opacity: loading ? 0.7 : 1,
                              fontWeight: '600',
                              fontSize: '0.95rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                          >
                            ✗ Revoke Access
                          </button>
                        </div>
                      )}
                      
                      {request.status === 'rejected' && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '1rem',
                          backgroundColor: '#f8d7da',
                          borderRadius: '8px',
                          minWidth: '140px',
                          justifyContent: 'center'
                        }}>
                          <span style={{ 
                            color: '#721c24',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            ✗ Rejected
                          </span>
                        </div>
                      )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
                  width: '200px'
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
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
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
                      {enrollment.status === 'approved' && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to revoke access to this course?')) {
                              try {
                                await requestAPI.rejectRequest(enrollment._id);
                                setMessage('Course access revoked successfully!');
                                handleViewCourses(viewingCourses);
                                fetchData();
                                setTimeout(() => setMessage(''), 3000);
                              } catch (error) {
                                setMessage('Error revoking course access');
                                setTimeout(() => setMessage(''), 3000);
                              }
                            }
                          }}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            marginLeft: '1rem'
                          }}
                        >
                          Revoke Access
                        </button>
                      )}
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