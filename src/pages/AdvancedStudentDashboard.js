import React, { useState, useEffect } from 'react';
import { courseAPI, enrollmentAPI, studentAPI } from '../services/api';

const AdvancedStudentDashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState({});
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [editProfile, setEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchProfile(),
        fetchCourses(),
        fetchMyCourses(),
        fetchPendingEnrollments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await studentAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const fetchMyCourses = async () => {
    try {
      const response = await enrollmentAPI.getMyCourses();
      setMyCourses(response.data);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyPending();
      setPendingEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await studentAPI.updateProfile(profile);
      setEditProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll(courseId);
      fetchPendingEnrollments();
      alert('Enrollment request submitted! Waiting for admin approval.');
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    }
  };

  const isEnrolled = (courseId) => myCourses.some(course => course._id === courseId);
  const isPending = (courseId) => pendingEnrollments.some(enrollment => enrollment.course._id === courseId);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">Student Portal</div>
          <div>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
            <button onClick={onLogout} className="btn-login">Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div className="dashboard-tabs">
          <button onClick={() => setActiveTab('dashboard')} className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('profile')} className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}>
            Profile
          </button>
          <button onClick={() => setActiveTab('courses')} className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}>
            Courses
          </button>
          <button onClick={() => setActiveTab('mycourses')} className={`tab-btn ${activeTab === 'mycourses' ? 'active' : ''}`}>
            My Courses ({myCourses.length})
          </button>
          <button onClick={() => setActiveTab('pending')} className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}>
            Pending ({pendingEnrollments.length})
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <h2>Academic Dashboard</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Course Status</h3>
                <div className="stat-item">
                  <span className="stat-label">Enrolled Courses:</span>
                  <span className="stat-value">{myCourses.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pending Requests:</span>
                  <span className="stat-value">{pendingEnrollments.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>My Profile</h3>
              <button onClick={() => setEditProfile(!editProfile)} className="btn">
                {editProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            {editProfile ? (
              <form onSubmit={handleUpdateProfile} style={{ marginTop: '2rem' }}>
                <div className="form-group">
                  <label>Name:</label>
                  <input type="text" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Age:</label>
                  <input type="number" value={profile.age || ''} onChange={(e) => setProfile({ ...profile, age: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>City:</label>
                  <input type="text" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} required />
                </div>
                <button type="submit" className="btn">Update Profile</button>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item"><strong>Name:</strong> {profile.name}</div>
                <div className="info-item"><strong>Email:</strong> {profile.email}</div>
                <div className="info-item"><strong>Age:</strong> {profile.age}</div>
                <div className="info-item"><strong>City:</strong> {profile.city}</div>
                <div className="info-item"><strong>Role:</strong> {profile.role}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h3>Available Courses</h3>
            <div className="grid">
              {courses.map(course => (
                <div key={course._id} className="course-card">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="btn"
                    disabled={isEnrolled(course._id) || isPending(course._id)}
                  >
                    {isEnrolled(course._id) ? 'Enrolled' : 
                     isPending(course._id) ? 'Pending' : 'Enroll'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mycourses' && (
          <div>
            <h3>My Enrolled Courses</h3>
            <div className="grid">
              {myCourses.map(course => (
                <div key={course._id} className="course-card enrolled">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <span className="enrolled-badge">Enrolled</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <h3>Pending Enrollments</h3>
            <div className="grid">
              {pendingEnrollments.map(enrollment => (
                <div key={enrollment._id} className="course-card pending">
                  <h4>{enrollment.course.title}</h4>
                  <p>{enrollment.course.description}</p>
                  <span className="pending-badge">Waiting for Approval</span>
                  <div className="request-date">
                    Requested: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedStudentDashboard;