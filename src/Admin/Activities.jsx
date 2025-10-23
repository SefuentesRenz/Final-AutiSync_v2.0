import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, PlayIcon, ClockIcon, StarIcon, EyeIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import ActivityDetailsModal from '../components/ActivityDetailsModal';
import { getActivitiesWithDetails } from '../lib/activitiesApi';
import { supabase } from '../lib/supabase';

const ActivitiesPage = ({ isOpen, onClose, activity }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activityStats, setActivityStats] = useState({});

  // Fetch activities and categories on component mount
  useEffect(() => {
    fetchData();
    fetchActivityStats();
  }, []);

  const fetchActivityStatsData = async () => {
    try {
      // Get activity usage statistics
      const { data: progressData, error: progressError } = await supabase
        .from('user_activity_progress')
        .select('activity_id, score, date_completed');

      if (progressError) {
        console.error('Error fetching activity stats:', progressError);
        return {};
      }

      // Calculate stats for each activity
      const stats = {};
      progressData?.forEach(record => {
        const activityId = record.activity_id;
        if (!stats[activityId]) {
          stats[activityId] = {
            totalCompletions: 0,
            totalScore: 0,
            recentCompletions: 0,
            lastCompleted: null
          };
        }
        
        stats[activityId].totalCompletions++;
        stats[activityId].totalScore += record.score || 0;
        
        const completedDate = new Date(record.date_completed);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        if (completedDate > oneDayAgo) {
          stats[activityId].recentCompletions++;
        }
        
        if (!stats[activityId].lastCompleted || completedDate > new Date(stats[activityId].lastCompleted)) {
          stats[activityId].lastCompleted = record.date_completed;
        }
      });

      // Calculate average scores
      Object.keys(stats).forEach(activityId => {
        if (stats[activityId].totalCompletions > 0) {
          stats[activityId].averageScore = Math.round(stats[activityId].totalScore / stats[activityId].totalCompletions);
        }
      });

      return stats;
    } catch (err) {
      console.error('Error in fetchActivityStatsData:', err);
      return {};
    }
  };

  const fetchActivityStats = async () => {
    const stats = await fetchActivityStatsData();
    setActivityStats(stats);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch both activities and stats simultaneously
      const [activitiesResult, statsResult] = await Promise.all([
        getActivitiesWithDetails(),
        fetchActivityStatsData()
      ]);
      
      const { data: activitiesData, error: activitiesError } = activitiesResult;
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        setError('Failed to load activities');
      } else {
        // Transform the data to match the expected format
        const transformedActivities = activitiesData?.map(activity => {
          const stats = statsResult[activity.id] || { 
            totalCompletions: 0, 
            averageScore: 0, 
            recentCompletions: 0, 
            lastCompleted: null 
          };
          
          // Debug: Log the raw difficulty data
          console.log('Activity:', activity.title, 'Raw Difficulties:', activity.Difficulties, 'Difficulty value:', activity.Difficulties?.difficulty);
          
          return {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            category: activity.Categories?.category_name || 'Unknown',
            difficulty: activity.Difficulties?.difficulty || 'Intermediate',
            duration: activity.duration || '10-15 min',
            participants: activity.participants || 0,
            icon: activity.icon || '📝',
            color: activity.color || 'from-blue-400 to-blue-600',
            points: activity.points || 10,
            // Usage tracking data
            totalCompletions: stats.totalCompletions,
            averageScore: stats.averageScore,
            recentCompletions: stats.recentCompletions,
            lastCompleted: stats.lastCompleted
          };
        }) || [];
        console.log('All transformed activities:', transformedActivities);
        setActivities(transformedActivities);
        setActivityStats(statsResult);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };



  const filteredActivities = activities
    .filter(activity => {
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
      console.log('Filtering for category:', selectedCategory, 'Activity:', activity.title, 'Activity category:', activity.category, 'Matches:', matchesCategory);
      return matchesCategory;
    })
    .sort((a, b) => {
      // Sort by total completions (most used first), then by title alphabetically
      const aCompletions = a.totalCompletions || 0;
      const bCompletions = b.totalCompletions || 0;
      
      if (bCompletions !== aCompletions) {
        return bCompletions - aCompletions; // Descending order (most used first)
      }
      
      // If completions are equal, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Proficient': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastCompleted = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      
        {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-600 text-white rounded-xl">
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


        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Learning Activities</h1>
              <p className="text-gray-600 text-lg">Monitor activity usage and student engagement</p>
            </div>
            <button 
              onClick={AdminProfile}
              className="mt-4 md:mt-0 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>👤</span>
              <span>Admin Profile</span>
            </button>
          </div>

          {/* Dynamic Category Filter */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-xl">📚</span>
                  <span className="font-semibold">All Activities</span>
                </button>
                
                <button
                  onClick={() => setSelectedCategory('Academic')}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
                    selectedCategory === 'Academic'
                      ? 'bg-green-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-xl">🎓</span>
                  <span className="font-semibold">Academic</span>
                </button>
                
                <button
                  onClick={() => setSelectedCategory('Daily/Social Life Skill')}
                  className={`p-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
                    selectedCategory === 'Daily/Social Life Skill'
                      ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="text-xl">🤝</span>
                  <span className="font-semibold">Daily/Social Life Skill</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{new Set(activities.map(a => a.title)).size}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Completions</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.reduce((sum, act) => sum + (act.totalCompletions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <StarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(() => {
                    // Calculate average score for unique activities only
                    const uniqueActivities = activities.reduce((acc, activity) => {
                      if (!acc.find(a => a.title === activity.title)) {
                        acc.push(activity);
                      }
                      return acc;
                    }, []);
                    return Math.round(uniqueActivities.reduce((sum, act) => sum + (act.averageScore || 0), 0) / Math.max(uniqueActivities.length, 1));
                  })()}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activities.reduce((sum, act) => sum + (act.recentCompletions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, index) => {
            // Determine if this is a top activity (top 3 most used)
            const isTopActivity = index < 3 && (activity.totalCompletions || 0) > 0;
            const topActivityBadge = index === 0 ? '🥇 Most Used' : 
                                   index === 1 ? '🥈 2nd Most' : 
                                   index === 2 ? '🥉 3rd Most' : '';
            
            return (
              <div
                key={activity.id}
                className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  isTopActivity ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-100'
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${activity.color}`}></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{activity.icon}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{activity.title}</h3>
                          {isTopActivity && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              {topActivityBadge}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>

                {/* Usage Statistics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Completions</span>
                    <span className="font-semibold text-blue-600">{activity.totalCompletions || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-semibold text-green-600">{activity.averageScore || 0}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Recent (24h)</span>
                    <span className="font-semibold text-purple-600">{activity.recentCompletions || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Completed</span>
                    <span className="font-semibold text-gray-600">{formatLastCompleted(activity.lastCompleted)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{activity.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4" />
                      <span>{activity.points} pts</span>
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedActivity(activity);
                      setIsModalOpen(true);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">�</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={selectedActivity}
        isViewOnly={true}
      />
    </div>
  );
};

export default ActivitiesPage;