import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ExclamationTriangleIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';
import { supabase } from '../lib/supabase';

const AlarmingEmotions = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [allEmotions, setAllEmotions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'history'
  const [timeFilter, setTimeFilter] = useState('24h'); // '24h', '7d', '1m', '3m', 'all'

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  // Calculate time range based on filter
  const getTimeRange = (filter) => {
    const now = new Date();
    let startTime;
    
    switch (filter) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return null; // No time filter
    }
    
    return startTime.toISOString();
  };

  // Get display label for time filter
  const getTimeFilterLabel = (filter) => {
    switch (filter) {
      case '24h': return 'last 24 hours';
      case '7d': return 'last 7 days';
      case '1m': return 'last month';
      case '3m': return 'last 3 months';
      case 'all': return 'all time';
      default: return 'last 24 hours';
    }
  };

  // Fetch alerts and notifications from backend
  useEffect(() => {
    fetchAlertsAndNotifications();
    fetchAllEmotions();
  }, [timeFilter]); // Add timeFilter as dependency

  const fetchAlertsAndNotifications = async () => {
    setLoading(true);
    try {
      // Get time range based on filter
      const timeRangeStart = getTimeRange(timeFilter);
      
      // Build query for negative emotions (angry/sad)
      let query = supabase
        .from('Expressions')
        .select('*')
        .in('emotion', ['angry', 'sad'])
        .order('created_at', { ascending: false });
      
      // Apply time filter if not 'all'
      if (timeRangeStart) {
        query = query.gte('created_at', timeRangeStart);
      }
      
      const { data: highPriorityData, error: highPriorityError } = await query;

      if (highPriorityError) {
        console.error('Error fetching high priority emotions:', highPriorityError);
        setError(`Failed to fetch priority alerts: ${highPriorityError.message || 'Unknown database error'}`);
      } else {
        console.log('High priority emotions data:', highPriorityData);
        
        // Get student names for priority alerts
        let alertsWithNames = [];
        if (highPriorityData && highPriorityData.length > 0) {
          const userIds = [...new Set(highPriorityData.map(exp => exp.user_id).filter(Boolean))];
          
          let studentsData = [];
          if (userIds.length > 0) {
            const { data: students, error: studentsError } = await supabase
              .from('user_profiles')
              .select('user_id, full_name, username')
              .in('user_id', userIds);

            if (!studentsError && students) {
              studentsData = students;
            }
          }
          
          // Process high priority emotions as alerts with student names
          alertsWithNames = highPriorityData.map(expression => {
            const student = studentsData.find(s => s.user_id === expression.user_id);
            const studentName = student?.user_profiles?.full_name || 
                               student?.user_profiles?.username || 
                               student?.full_name || 
                               student?.username || 
                               'Unknown Student';
            
            return {
              id: expression.id,
              studentName: studentName,
              emotion: expression.emotion,
              displayEmotion: getEmotionDisplayName(expression.emotion),
              note: expression.note || 'No additional note provided by student',
              timestamp: new Date(expression.created_at),
              status: 'priority',
              priority: 'High'
            };
          });
        }
        
        console.log('Processed high priority alerts:', alertsWithNames);
        setAlerts(alertsWithNames);
        
        // Debug: Log the count for verification
        console.log(`Found ${alertsWithNames.length} high priority alerts (angry/sad level 4-5)`);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'alert')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }

    } catch (error) {
      console.error('Error in fetchAlertsAndNotifications:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch ALL student emotions (positive and negative)
  const fetchAllEmotions = async () => {
    try {
      // Get time range based on filter
      const timeRangeStart = getTimeRange(timeFilter);
      
      // Build query for all expressions
      let query = supabase
        .from('Expressions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Apply time filter if not 'all'
      if (timeRangeStart) {
        query = query.gte('created_at', timeRangeStart);
      }
      
      const { data: expressionsData, error: expressionsError } = await query;

      if (expressionsError) {
        console.error('Error fetching expressions:', expressionsError);
        return;
      }

      console.log(`Expressions data (${timeFilter}):`, expressionsData);

      if (!expressionsData || expressionsData.length === 0) {
        setAllEmotions([]);
        return;
      }

      // Get unique user IDs (now user_id contains user_id directly)
      const userIds = [...new Set(expressionsData.map(exp => exp.user_id).filter(Boolean))];
      
      // Fetch user profile information directly
      let studentsData = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, username')
          .in('user_id', userIds);
          
        if (!profilesError && profiles) {
          studentsData = profiles;
        } else {
          console.error('Error fetching user profiles:', profilesError);
        }
      }

      console.log('User profiles data:', studentsData);

      // Process emotions data with student names
      const processedEmotions = expressionsData.map(expression => {
        // Find student info
        const student = studentsData.find(s => s.user_id === expression.user_id);
        const studentName = student?.full_name || 
                           student?.username || 
                           student?.full_name || 
                           student?.username || 
                           'Unknown Student';

        // Map database emotion to display name
        const displayEmotion = getEmotionDisplayName(expression.emotion);

        return {
          id: expression.id,
          studentName: studentName,
          emotion: expression.emotion, // Keep original for processing
          displayEmotion: displayEmotion, // Display name for UI
          note: expression.note || 'No additional note provided by student',
          timestamp: new Date(expression.created_at),
          isHighPriority: (expression.emotion === 'angry' || expression.emotion === 'sad'),
          emotionType: ['happy', 'excited', 'calm'].includes(expression.emotion) ? 'positive' : 'negative' // calm still represents tired which is positive
        };
      });

      console.log('Processed all emotions:', processedEmotions);
      setAllEmotions(processedEmotions);
      
      // Debug: Log emotion breakdown
      const positiveCount = processedEmotions.filter(e => e.emotionType === 'positive').length;
      const negativeCount = processedEmotions.filter(e => e.emotionType === 'negative').length;
      const highPriorityCount = processedEmotions.filter(e => e.isHighPriority).length;
      console.log(`Emotion breakdown: ${positiveCount} positive, ${negativeCount} negative, ${highPriorityCount} high priority`);
      
    } catch (error) {
      console.error('Error in fetchAllEmotions:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEmotionDisplayName = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'angry': return 'Upset';
      case 'calm': return 'Tired';
      default: return emotion;
    }
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'angry': return '😠';
      case 'sad': return '😢';
      case 'happy': return '😊';
      case 'excited': return '🎉';
      case 'calm': return '😴'; // Changed for tired emotion
      default: return '😐';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-lg text-indigo-600">Loading emotions data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-32 w-32 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600">{error}</p>
          <button 
            onClick={() => {
              fetchAlertsAndNotifications();
              fetchAllEmotions();
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white  rounded-xl">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
                    <a href="/tracking" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Dashboard
                    </a>
                    <a href="/activities" className="text-gray-600 text-lg hover:text-blue-600 font-semibold  transition-colors">
                      Activities
                    </a>
                    <a href="/alarmingemotions" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
                      Expression Wall
                    </a>
                  </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={AdminProfile}
                className="cursor-pointer -my-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <img
                  src="/assets/kidprofile1.jpg"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Student Emotions Dashboard</h1>
              <p className="text-lg text-gray-600">
                Monitor student emotions • 
                {timeFilter === '24h' && ' Showing last 24 hours'}
                {timeFilter === '7d' && ' Showing last 7 days'}
                {timeFilter === '1m' && ' Showing last month'}
                {timeFilter === '3m' && ' Showing last 3 months'}
                {timeFilter === 'all' && ' Showing all time data'}
                {' • Live updates'}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  fetchAlertsAndNotifications();
                  fetchAllEmotions();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🔄 Refresh Data
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('alerts')}
                className={`bg-white py-2 px-1 border-b-2 font-medium text-sm w-45 cursor-pointer ${
                  activeTab === 'alerts'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚨 Priority Alerts
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`-ml-6 bg-white py-2 px-1 border-b-2 font-medium text-sm w-45 cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 All Emotions History
              </button>
            </nav>
          </div>
          
          {/* Time Filter */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Time Range Filter
              </h3>
              <div className="flex space-x-2">
                {[
                  { value: '24h', label: '24 Hours' },
                  { value: '7d', label: '7 Days' },
                  { value: '1m', label: '1 Month' },
                  { value: '3m', label: '3 Months' },
                  { value: 'all', label: 'All Time' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      timeFilter === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <ClockIcon className="h-12 w-12 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-3">😊</div>
              <div className="ml-1">
                <p className="text-sm font-medium text-gray-600">Positive Emotions</p>
                <p className="text-3xl font-bold text-gray-900">{allEmotions.filter(e => e.emotionType === 'positive').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <UserIcon className="h-12 w-12 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emotions</p>
                <p className="text-3xl font-bold text-gray-900">{allEmotions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔔 Unread Notifications</h2>
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-yellow-800 font-medium">{notification.message}</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        {getTimeAgo(new Date(notification.created_at))}
                      </p>
                    </div>
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="ml-4 px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 text-sm"
                    >
                      Mark as Read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Sections */}
        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨 Priority Alerts (Negative Emotions)</h2>
            {alerts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">😊</div>
                <p className="text-xl text-gray-600">No high-priority alerts at this time!</p>
                <p className="text-gray-500 mt-2">All students are doing well emotionally.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {alerts.map(alert => (
                  <div key={alert.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">{getEmotionIcon(alert.emotion)}</div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{alert.studentName}</h3>
                          <p className="text-gray-600 capitalize">{alert.displayEmotion || alert.emotion}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority} Priority
                      </span>
                    </div>
                    
                    {alert.note && alert.note.trim() !== '' ? (
                      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="text-blue-400">💬</div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                              📝 Student's Private Note (Admin/Teacher Only)
                            </p>
                            <p className="text-blue-700 text-sm leading-relaxed bg-white rounded p-2 italic">
                              "{alert.note}"
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              🔒 This note is confidential and only visible to admin/teacher and parents
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                        <p className="text-sm text-gray-500 italic">No additional note provided by student</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {getTimeAgo(alert.timestamp)}
                      </span>
                      <span className="flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Requires Attention
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 All Emotions History</h2>
            {allEmotions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl text-gray-600">No emotions recorded yet!</p>
                <p className="text-gray-500 mt-2">Student emotions will appear here once they start sharing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {allEmotions.map(emotion => (
                  <div key={emotion.id} className={`bg-white rounded-xl shadow-lg p-4 border-l-4 ${
                    emotion.emotionType === 'positive' ? 'border-green-500' : 
                    emotion.isHighPriority ? 'border-red-500' : 'border-orange-400'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{getEmotionIcon(emotion.emotion)}</div>
                        <div>
                          <h3 className="text-md font-bold text-gray-900">{emotion.studentName}</h3>
                          <p className="text-gray-600 capitalize text-sm">{emotion.displayEmotion || emotion.emotion}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          emotion.emotionType === 'positive' 
                            ? 'bg-green-100 text-green-800' 
                            : emotion.isHighPriority 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-orange-100 text-orange-800'
                        }`}>
                          {emotion.emotionType === 'positive' ? '😊 Positive' : 
                           emotion.isHighPriority ? '🚨 High Priority' : '⚠️ Negative'}
                        </span>
                      </div>
                    </div>
                    
                    {emotion.note && emotion.note.trim() !== '' && (
                      <div className="bg-gray-50 rounded-lg p-2 mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1">Note:</p>
                        <p className="text-gray-600 text-xs italic">"{emotion.note}"</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {getTimeAgo(emotion.timestamp)}
                      </span>
                      {emotion.isHighPriority && (
                        <span className="flex items-center text-red-500">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Alert Created
                        </span>
                      )}
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

export default AlarmingEmotions;
