import React, { useState, useEffect } from 'react';
import { courseAPI, requestAPI, studentAPI } from '../services/api';

const StudentDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', age: '', city: '', contactNumber: '', fatherName: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, myCoursesRes, requestsRes, profileRes] = await Promise.all([
        courseAPI.getAll(),
        studentAPI.getMyCourses(),
        studentAPI.getMyRequests(),
        studentAPI.getProfile()
      ]);
      setCourses(coursesRes.data);
      setMyCourses(myCoursesRes.data);
      setMyRequests(requestsRes.data);
      setProfile(profileRes.data);
      setProfileForm({
        name: profileRes.data.name,
        age: profileRes.data.age,
        city: profileRes.data.city,
        contactNumber: profileRes.data.contactNumber,
        fatherName: profileRes.data.fatherName
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCourseRequest = async (courseId) => {
    setLoading(true);
    try {
      await requestAPI.sendRequest(courseId);
      setMessage('Course request sent successfully!');
      fetchData(); // Refresh data
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending request');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentAPI.updateProfile(profileForm);
      setMessage('Profile updated successfully!');
      setEditingProfile(false);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyRequested = (courseId) => {
    return myRequests.some(req => req.course._id === courseId);
  };

  const isAlreadyEnrolled = (courseId) => {
    return myCourses.some(course => course._id === courseId);
  };

  const getRequestStatus = (courseId) => {
    const request = myRequests.find(req => req.course._id === courseId);
    return request ? request.status : null;
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
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Student Dashboard</h1>
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
            {['courses', 'my-courses', 'requests', 'profile'].map(tab => (
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
                {tab.replace('-', ' ')}
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

        {/* Available Courses */}
        {activeTab === 'courses' && (
          <div>
            <h2>Available Courses</h2>
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
                  <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{course.description}</p>
                  
                  {isAlreadyEnrolled(course._id) ? (
                    <span style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      Enrolled
                    </span>
                  ) : isAlreadyRequested(course._id) ? (
                    <span style={{ 
                      backgroundColor: getRequestStatus(course._id) === 'pending' ? '#ff9800' : 
                                     getRequestStatus(course._id) === 'approved' ? '#4CAF50' : '#f44336',
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      textTransform: 'capitalize'
                    }}>
                      {getRequestStatus(course._id)}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCourseRequest(course._id)}
                      disabled={loading}
                      style={{
                        backgroundColor: '#1e3c72',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? 'Requesting...' : 'Request Enrollment'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses */}
        {activeTab === 'my-courses' && (
          <div>
            <h2>My Approved Courses</h2>
            {myCourses.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No approved courses yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {myCourses.map(course => (
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
            )}
          </div>
        )}

        {/* Request Status */}
        {activeTab === 'requests' && (
          <div>
            <h2>My Course Requests</h2>
            {myRequests.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No course requests yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {myRequests.map(request => (
                  <div key={request._id} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3c72' }}>{request.course.title}</h3>
                      <p style={{ margin: '0', color: '#666' }}>{request.course.description}</p>
                    </div>
                    <span style={{ 
                      backgroundColor: request.status === 'pending' ? '#ff9800' : 
                                     request.status === 'approved' ? '#4CAF50' : '#f44336',
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      textTransform: 'capitalize',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Profile Management */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>My Profile</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    backgroundColor: '#1e3c72',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #ddd',
              maxWidth: '500px'
            }}>
              {editingProfile ? (
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Age:</label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>City:</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contact Number:</label>
                    <input
                      type="tel"
                      value={profileForm.contactNumber}
                      onChange={(e) => setProfileForm({...profileForm, contactNumber: e.target.value})}
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Father Name:</label>
                    <input
                      type="text"
                      value={profileForm.fatherName}
                      onChange={(e) => setProfileForm({...profileForm, fatherName: e.target.value})}
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileForm({
                          name: profile.name,
                          age: profile.age,
                          city: profile.city,
                          contactNumber: profile.contactNumber,
                          fatherName: profile.fatherName
                        });
                      }}
                      style={{
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>Name:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.name}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>Email:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.email}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>Age:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.age}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>City:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.city}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>Contact Number:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.contactNumber}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>Father Name:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.fatherName}</p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e3c72' }}>ERP Number:</strong>
                    <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{profile.erpNo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;