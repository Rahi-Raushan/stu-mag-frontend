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
  const [searchCourse, setSearchCourse] = useState('');

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
    return myRequests.some(req => req.course._id === courseId && req.status === 'pending');
  };

  const isAlreadyEnrolled = (courseId) => {
    return myCourses.some(course => course._id === courseId);
  };

  const getRequestStatus = (courseId) => {
    const request = myRequests.find(req => req.course._id === courseId && req.status === 'pending');
    return request ? request.status : null;
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchCourse.toLowerCase()) ||
    course.description.toLowerCase().includes(searchCourse.toLowerCase())
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
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)' }}>Student Dashboard</h1>
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
            {['courses', 'my-courses', 'requests', 'profile'].map(tab => (
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
                {tab.replace('-', ' ')}
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

        {/* Available Courses */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Available Courses</h2>
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
            </div>
            <div style={{ display: 'grid', gap: 'clamp(1rem, 2vw, 1rem)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {filteredCourses.map(course => (
                <div key={course._id} style={{
                  backgroundColor: 'white',
                  padding: 'clamp(1rem, 2.5vw, 1.5rem)',
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
                      backgroundColor: '#ff9800',
                      color: 'white', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      Pending
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
              <div style={{ display: 'grid', gap: 'clamp(1rem, 2vw, 1rem)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {myCourses.map(course => (
                  <div key={course._id} style={{
                    backgroundColor: 'white',
                    padding: 'clamp(1rem, 2.5vw, 1.5rem)',
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
                    padding: 'clamp(1rem, 2.5vw, 1.5rem)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
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
              <h2 style={{ color: '#1e3c72', fontSize: '1.8rem', margin: 0 }}>My Profile</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    backgroundColor: '#1e3c72',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(30, 60, 114, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2a4a8a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1e3c72'}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e1e8ed'
            }}>
              {editingProfile ? (
                <form onSubmit={handleUpdateProfile}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: '#1e3c72',
                        fontSize: '1rem'
                      }}>👤 Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '2px solid #e1e8ed',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: '#1e3c72',
                        fontSize: '1rem'
                      }}>🎂 Age</label>
                      <input
                        type="number"
                        value={profileForm.age}
                        onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '2px solid #e1e8ed',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: '#1e3c72',
                        fontSize: '1rem'
                      }}>🏙️ City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '2px solid #e1e8ed',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: '#1e3c72',
                        fontSize: '1rem'
                      }}>📞 Contact Number</label>
                      <input
                        type="tel"
                        value={profileForm.contactNumber}
                        onChange={(e) => setProfileForm({...profileForm, contactNumber: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '2px solid #e1e8ed',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: '600',
                        color: '#1e3c72',
                        fontSize: '1rem'
                      }}>👨‍👦 Father Name</label>
                      <input
                        type="text"
                        value={profileForm.fatherName}
                        onChange={(e) => setProfileForm({...profileForm, fatherName: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '2px solid #e1e8ed',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.2s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        fontSize: '1rem',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#45a049')}
                      onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
                    >
                      {loading ? '💾 Saving...' : '✅ Save Changes'}
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
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {/* Profile Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    marginBottom: '2rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '2px solid #f0f0f0'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: '#1e3c72',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(30, 60, 114, 0.3)'
                    }}>
                      {profile.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                    <div>
                      <h2 style={{ 
                        margin: '0 0 0.5rem 0', 
                        color: '#1e3c72', 
                        fontSize: '1.8rem',
                        fontWeight: '600'
                      }}>
                        {profile.name}
                      </h2>
                      <p style={{ 
                        margin: '0', 
                        color: '#666', 
                        fontSize: '1.1rem'
                      }}>
                        📧 {profile.email}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#e3f2fd',
                        color: '#1e3c72',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginTop: '0.5rem'
                      }}>
                        🎓 Student
                      </span>
                    </div>
                  </div>
                  
                  {/* Profile Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎂</span>
                        <h4 style={{ margin: 0, color: '#1e3c72', fontSize: '1.1rem' }}>Age</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>
                        {profile.age} years
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🏙️</span>
                        <h4 style={{ margin: 0, color: '#1e3c72', fontSize: '1.1rem' }}>City</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>
                        {profile.city}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📞</span>
                        <h4 style={{ margin: 0, color: '#1e3c72', fontSize: '1.1rem' }}>Contact</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>
                        {profile.contactNumber}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>👨‍👦</span>
                        <h4 style={{ margin: 0, color: '#1e3c72', fontSize: '1.1rem' }}>Father Name</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>
                        {profile.fatherName}
                      </p>
                    </div>
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