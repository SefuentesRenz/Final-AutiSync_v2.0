import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getStudentProgressStats } from '../lib/progressApi';
import { getStudentBadges, getAllBadges } from '../lib/badgesApi';
import { getStreakStats } from '../lib/streaksApi';
import { getActivitiesWithDetails } from '../lib/activitiesApi';
import { 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon, 
  HeartIcon, 
  TrophyIcon, 
  LightBulbIcon,
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CheckIcon,
  LockClosedIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import SystemInformation from './SystemInformation';
import MotivationTips from './MotivationTips';
import ParentProfileModal from '../components/ParentProfileModal';
import LinkChildModal from '../components/LinkChildModal';
import ChildActivityProgressModal from '../components/ChildActivityProgressModal';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [showLinkChild, setShowLinkChild] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [childEmotions, setChildEmotions] = useState([]);
  const [loadingEmotions, setLoadingEmotions] = useState(false);
  const [emotionTimeFilter, setEmotionTimeFilter] = useState('24h'); // '24h', '7d', '1m', '3m', 'all'
  const [childProgress, setChildProgress] = useState(null);
  const [childBadges, setChildBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [childStreak, setChildStreak] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [childActivities, setChildActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Load children data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadChildrenData();
    }
  }, [user?.id]);

  // Load emotions when selected child changes
  useEffect(() => {
    console.log('ParentDashboard: useEffect triggered - selectedChild:', selectedChild, 'currentView:', currentView);
    if (selectedChild?.user_id && currentView === 'emotions') {
      console.log('ParentDashboard: Loading emotions for child user_id:', selectedChild.user_id);
      loadChildEmotions(selectedChild.user_id);
    }
    if (selectedChild?.user_id && currentView === 'overview') {
      loadChildProgressData(selectedChild.user_id);
      console.log('ParentDashboard: About to load activities for child user_id:', selectedChild.user_id);
      loadChildActivities(selectedChild.user_id);
    }
  }, [selectedChild, currentView, emotionTimeFilter]); // Added emotionTimeFilter dependency

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
      default: return filter;
    }
  };

  const loadChildrenData = async () => {
    try {
      setLoading(true);
      console.log('ParentDashboard: Loading children for parent user_id:', user?.id);
      
      // Get parent record to access children_ids array
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('children_ids')
        .eq('user_id', user.id)
        .single();

      console.log('ParentDashboard: Parent data result:', { parentData, parentError });

      if (parentError) {
        console.error('ParentDashboard: Error loading parent:', parentError);
        setChildrenData([]);
        return;
      }

      if (!parentData || !parentData.children_ids || parentData.children_ids.length === 0) {
        console.log('ParentDashboard: No children found in parent record');
        setChildrenData([]);
        return;
      }

      // Get user profiles for each child using children_ids array
      const { data: childProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', parentData.children_ids);

      console.log('ParentDashboard: Child profiles result:', { childProfiles, profilesError });
      
      if (profilesError) {
        console.error('ParentDashboard: Error loading child profiles:', profilesError);
        setChildrenData([]);
        return;
      }

      if (childProfiles && childProfiles.length > 0) {
        // Transform profiles to expected format
        const transformedData = childProfiles.map(childProfile => {
          return {
            id: childProfile.user_id,
            user_id: childProfile.user_id,
            full_name: childProfile.full_name || childProfile.username,
            username: childProfile.username,
            age: childProfile.age,
            email: childProfile.email,
            gender: childProfile.gender,
            profile_picture: childProfile.profile_picture || "/assets/kidprofile1.jpg",
            linked_at: new Date().toISOString() // Default since we don't have this in children_ids approach
          };
        });
        
        console.log('ParentDashboard: Transformed children data:', transformedData);
        setChildrenData(transformedData);
        if (transformedData.length > 0) {
          setSelectedChild(transformedData[0]);
        }
      } else {
        console.log('ParentDashboard: No child profiles found');
        setChildrenData([]);
      }
    } catch (error) {
      console.error('Error loading children data:', error);
      setChildrenData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChildEmotions = async (childUserId) => {
    try {
      setLoadingEmotions(true);
      console.log('ParentDashboard: Loading emotions for child user_id:', childUserId);
      console.log('ParentDashboard: Using time filter:', emotionTimeFilter);
      
      // Get emotions from Expressions table for this child directly using user_id
      console.log('ParentDashboard: Getting emotions for user_id:', childUserId);

      let query = supabase
        .from('Expressions')
        .select('*')
        .eq('user_id', childUserId); // Use the passed childUserId directly

      // Apply time filter if not 'all'
      const timeRange = getTimeRange(emotionTimeFilter);
      if (timeRange) {
        query = query.gte('created_at', timeRange);
        console.log('ParentDashboard: Applied time filter:', timeRange);
      }

      const { data: emotions, error: emotionsError } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('ParentDashboard: Raw emotions query result:', { emotions, emotionsError });
      console.log('ParentDashboard: Number of emotions found:', emotions?.length || 0);

      if (emotionsError) {
        console.error('ParentDashboard: Error loading emotions:', emotionsError);
        setChildEmotions([]);
        setLoadingEmotions(false);
        return;
      }

      const transformedEmotions = emotions?.map(expr => ({
        ...expr,
        emotion_name: expr.emotion?.charAt(0).toUpperCase() + expr.emotion?.slice(1) || 'Unknown',
        emotion_description: expr.note || '',
        time: expr.created_at
      })) || [];

      console.log('ParentDashboard: Transformed emotions:', transformedEmotions);
      setChildEmotions(transformedEmotions);
    } catch (error) {
      console.error('ParentDashboard: Error fetching child emotions:', error);
      setChildEmotions([]);
    } finally {
      setLoadingEmotions(false);
    }
  };

  const loadChildActivities = async (childUserId) => {
    try {
      setLoadingActivities(true);
      console.log('ParentDashboard: Loading activities for child user_id:', childUserId);

      // Get all activities using the working API function
      const { data: allActivities, error: activitiesError } = await getActivitiesWithDetails();

      console.log('ParentDashboard: All activities result:', { allActivities, activitiesError });
      console.log('ParentDashboard: Number of activities found:', allActivities?.length || 0);

      if (activitiesError) {
        console.error('ParentDashboard: Error loading activities:', activitiesError);
        setChildActivities([]);
        setLoadingActivities(false);
        return;
      }

      // Get child's progress for all activities
      const { data: childProgressData, error: progressError } = await supabase
        .from('user_activity_progress')
        .select('*')
        .eq('user_id', childUserId);

      console.log('ParentDashboard: Child progress result:', { childProgressData, progressError });
      console.log('ParentDashboard: Number of progress records:', childProgressData?.length || 0);

      if (progressError) {
        console.error('ParentDashboard: Error loading child progress:', progressError);
        setChildActivities([]);
        setLoadingActivities(false);
        return;
      }

      // Combine activities with child's progress
      const activitiesWithProgress = allActivities?.map(activity => {
        const progressRecords = childProgressData?.filter(p => p.activity_id === activity.id) || [];
        const completedCount = progressRecords.length;
        const averageScore = completedCount > 0 
          ? Math.round(progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / completedCount)
          : 0;
        const lastCompleted = progressRecords.length > 0 
          ? progressRecords.sort((a, b) => new Date(b.date_completed) - new Date(a.date_completed))[0].date_completed
          : null;
        const bestScore = progressRecords.length > 0 
          ? Math.max(...progressRecords.map(p => p.score || 0))
          : 0;

        return {
          ...activity,
          progressData: {
            completedCount,
            averageScore,
            bestScore,
            lastCompleted,
            status: completedCount > 0 ? 'completed' : 'not-started'
          }
        };
      }) || [];

      console.log('ParentDashboard: Activities with progress:', activitiesWithProgress);
      console.log('ParentDashboard: Final activities count:', activitiesWithProgress?.length || 0);
      console.log('ParentDashboard: Sample activity with progress:', activitiesWithProgress?.[0]);
      setChildActivities(activitiesWithProgress);

    } catch (error) {
      console.error('ParentDashboard: Error loading child activities:', error);
      setChildActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadChildProgressData = async (childUserId) => {
    try {
      setLoadingProgress(true);
      console.log('ParentDashboard: Loading progress data for child:', childUserId);

      // Get child's profile_id from user_profiles
      const { data: childProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('user_id', childUserId)
        .single();

      if (profileError || !childProfile) {
        console.error('ParentDashboard: Error loading child profile for progress:', profileError);
        setChildProgress(null);
        setChildBadges([]);
        setAllBadges([]);
        setChildStreak(null);
        setLoadingProgress(false);
        return;
      }

      const studentProfileId = childProfile.id;
      console.log('ParentDashboard: Profile found - profile.id:', studentProfileId, 'profile.user_id:', childProfile.user_id);

      // Load progress summary (use user_id as that's what the progress API expects)
      const { data: progressData, error: progressError } = await getStudentProgressStats(childProfile.user_id);
      if (progressError) {
        console.error('Error loading progress summary:', progressError);
      } else {
        console.log('ParentDashboard: Progress data received:', progressData);
        setChildProgress(progressData);
      }

      // Load badges (uses auth user_id)
      const [allBadgesResult, studentBadgesResult] = await Promise.all([
        getAllBadges(),
        getStudentBadges(childUserId)
      ]);

      // Handle all badges
      if (allBadgesResult.error) {
        console.error('Error loading all badges:', allBadgesResult.error);
        // Fallback badge list if badges table has issues
        setAllBadges([
          { id: 'f9aba128-a8e5-4b2c-8b2e-27ad1403faa6', title: 'First Step', description: 'Awarded for completing your first activity.' },
          { id: '97054c4c-4b60-4bae-b1d9-46c5b7d0c99a', title: 'Perfect Scorer', description: 'Awarded for getting a perfect score in any activity.' },
          { id: '2f73958d-d18c-4135-96bd-c65ca554a207', title: 'Academic Star', description: 'Complete 5 academic activities.' },
          { id: 'c0e0441c-0688-4a4c-bd82-fad73c4392c1', title: 'Color Master', description: 'Complete 2 color activities in different difficulty levels.' },
          { id: '55544bd9-53a5-42ac-bee8-c6b05632dfff', title: 'Match Finder', description: 'Finish a matching type activity.' },
          { id: '027f2d92-6a2f-4f07-bda5-aaced096eb00', title: 'Shape Explorer', description: 'Complete 2 shape activities.' },
          { id: 'd1ec22b8-9c28-44a4-9ee6-851b30948140', title: 'Number Ninja', description: 'Complete at least 1 number flashcard activity.' },
          { id: '899d3e1b-6a3f-4c88-b52c-4960bb6f0201', title: 'Consistency Champ', description: 'Complete 3 activities in different types.' },
          { id: '9e1e1566-6aec-479b-9f42-456e0c248386', title: 'High Achiever', description: 'Complete 5 activities with 80%+ average score.' },
          { id: '1d3f149c-6db2-4303-93a0-a75540902e4f', title: 'Daily Life Hero', description: 'Complete 3 social/daily life skill activities.' },
          { id: 'dc7243ea-43fb-48af-86c0-7f6dcd4430dd', title: 'All-Rounder', description: 'Complete 5 different types of activity.' }
        ]);
      } else {
        let allBadgesData = allBadgesResult.data || [];
        if (allBadgesData.length === 0) {
          // Same fallback if empty
          allBadgesData = [
            { id: 'f9aba128-a8e5-4b2c-8b2e-27ad1403faa6', title: 'First Step', description: 'Awarded for completing your first activity.' },
            { id: '97054c4c-4b60-4bae-b1d9-46c5b7d0c99a', title: 'Perfect Scorer', description: 'Awarded for getting a perfect score in any activity.' },
            { id: '2f73958d-d18c-4135-96bd-c65ca554a207', title: 'Academic Star', description: 'Complete 5 academic activities.' },
            { id: 'c0e0441c-0688-4a4c-bd82-fad73c4392c1', title: 'Color Master', description: 'Complete 2 color activities in different difficulty levels.' },
            { id: '55544bd9-53a5-42ac-bee8-c6b05632dfff', title: 'Match Finder', description: 'Finish a matching type activity.' },
            { id: '027f2d92-6a2f-4f07-bda5-aaced096eb00', title: 'Shape Explorer', description: 'Complete 2 shape activities.' },
            { id: 'd1ec22b8-9c28-44a4-9ee6-851b30948140', title: 'Number Ninja', description: 'Complete at least 1 number flashcard activity.' },
            { id: '899d3e1b-6a3f-4c88-b52c-4960bb6f0201', title: 'Consistency Champ', description: 'Complete 3 activities in different types.' },
            { id: '9e1e1566-6aec-479b-9f42-456e0c248386', title: 'High Achiever', description: 'Complete 5 activities with 80%+ average score.' },
            { id: '1d3f149c-6db2-4303-93a0-a75540902e4f', title: 'Daily Life Hero', description: 'Complete 3 social/daily life skill activities.' },
            { id: 'dc7243ea-43fb-48af-86c0-7f6dcd4430dd', title: 'All-Rounder', description: 'Complete 5 different types of activity.' }
          ];
        }
        setAllBadges(allBadgesData);
      }

      // Handle student badges
      if (studentBadgesResult.error) {
        console.error('Error loading student badges:', studentBadgesResult.error);
        setChildBadges([]);
        setAllBadges([]);
      } else {
        setChildBadges(studentBadgesResult.data || []);
      }

      // Load streak (uses auth user_id)
      const { data: streakData, error: streakError } = await getStreakStats(childUserId);
      if (streakError) {
        console.error('Error loading streak:', streakError);
        setChildStreak({ currentStreak: 0, longestStreak: 0 }); // Set default values instead of null
      } else {
        setChildStreak(streakData);
      }

    } catch (error) {
      console.error('ParentDashboard: Error loading child progress data:', error);
      setChildProgress(null);
      setChildBadges([]);
      setAllBadges([]);
      setChildStreak({ currentStreak: 0, longestStreak: 0 });
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    // Clear emotions when switching children
    setChildEmotions([]);
  };

  const handleChildLinked = (linkedChild) => {
    setShowLinkChild(false);
    loadChildrenData(); // Refresh children list
  };

  const getEmotionIcon = (emotionName) => {
    const emotions = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      calm: '😴', // Changed for tired emotion
      anxious: '😰',
      confused: '😕'
    };
    // Convert to lowercase to match the keys
    const lowerEmotionName = emotionName?.toLowerCase();
    return emotions[lowerEmotionName] || '😐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Dashboard...</h2>
          <p className="text-gray-600">Preparing your child's learning insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutiSync Dashboard
                </h1>
              </div>
              
              {/* Child Selector - Show only if multiple children */}
              {childrenData.length > 1 && (
                <div className="ml-6">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Viewing Child:
                  </label>
                  <select
                    value={selectedChild?.id || ''}
                    onChange={(e) => {
                      const child = childrenData.find(c => c.id === e.target.value);
                      handleChildSelect(child);
                    }}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {childrenData.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.full_name || child.username} ({child.age ? `Age ${child.age}` : 'Student'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Navigation Bar - EXACT ORDER: Overview, Children, Emotions, Badges, Tips */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentView('overview')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'overview' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setCurrentView('children')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'children' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Children
              </button>
              <button 
                onClick={() => setCurrentView('emotions')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'emotions' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Emotions
              </button>
              <button 
                onClick={() => setCurrentView('badges')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'badges' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Badges
              </button>
              <button 
                onClick={() => setCurrentView('tips')}
                className={`text-lg font-semibold cursor-pointer transition-colors ${currentView === 'tips' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Tips
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 text-white p-1 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-lg text-gray-600">
              {selectedChild ? 
                `Monitoring ${selectedChild.full_name || selectedChild.username}'s learning journey` : 
                'Monitor your child\'s learning journey and progress'
              }
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['overview', 'children', 'emotions', 'badges', 'tips'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`text-lg font-semibold cursor-pointer transition-colors whitespace-nowrap px-4 py-2 rounded-lg ${
                  currentView === view ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        
        {/* Overview Section - REAL DATA */}
        {currentView === 'overview' && (
          <div className="space-y-8">
            {loadingProgress ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading progress data...</p>
              </div>
            ) : selectedChild ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Overall Accuracy */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl">
                        <div className="text-2xl">🎯</div>
                      </div>
                      <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">ACCURACY</span>
                    </div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">
                      {childProgress?.averageScore ? `${childProgress.averageScore}%` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Average score across all activities</div>
                  </div>

                  {/* Activities Completed */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                        <div className="text-2xl">📚</div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">COMPLETED</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {childProgress ? `${childProgress.completedActivities}/${childProgress.totalActivities}` : '0/0'}
                    </div>
                    <div className="text-sm text-gray-600">Activities completed ({childProgress?.completionRate || 0}%)</div>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl">
                        <div className="text-2xl">{childStreak?.streakEmoji || '🔥'}</div>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">STREAK</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {childStreak?.currentStreak || 0}
                    </div>
                    <div className="text-sm text-gray-600">Days in a row</div>
                  </div>

                  {/* Badges Earned */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl">
                        <div className="text-2xl">🏆</div>
                      </div>
                      <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">BADGES</span>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {childBadges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Badges earned</div>
                  </div>
                </div>

                {/* Student Progress */}
                {childProgress && selectedChild && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Student Progress</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{(selectedChild.full_name || selectedChild.username).charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{selectedChild.full_name || selectedChild.username}</div>
                            <div className="text-sm text-gray-500">{childProgress.completedActivities}/{childProgress.totalActivities} activities completed</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {childProgress.averageScore}%
                          </div>
                          <div className="text-sm text-gray-500">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Progress Section - Box Placeholder */}
                {selectedChild && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <AcademicCapIcon className="w-6 h-6 mr-3 text-blue-600" />
                        Activity Progress
                      </h3>
                      <button
                        onClick={() => setShowActivityModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>View Activity Progress</span>
                      </button>
                    </div>
                    
                    {loadingActivities ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading activity data...</p>
                      </div>
                    ) : childActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No Activities Available</h4>
                        <p className="text-gray-500">No learning activities found in the system.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                          <div className="text-2xl font-bold text-green-800 mb-1">
                            {childActivities.filter(a => a.progressData.status === 'completed').length}
                          </div>
                          <div className="text-sm text-green-600 font-medium">Completed</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                          <div className="text-2xl font-bold text-blue-800 mb-1">
                            {childActivities.filter(a => a.progressData.averageScore > 0).length > 0
                              ? Math.round(
                                  childActivities
                                    .filter(a => a.progressData.averageScore > 0)
                                    .reduce((sum, a) => sum + a.progressData.averageScore, 0) /
                                  childActivities.filter(a => a.progressData.averageScore > 0).length
                                )
                              : 0}%
                          </div>
                          <div className="text-sm text-blue-600 font-medium">Avg Score</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                          <div className="text-2xl font-bold text-purple-800 mb-1">
                            {Math.max(...childActivities.map(a => a.progressData.bestScore), 0)}%
                          </div>
                          <div className="text-sm text-purple-600 font-medium">Best Score</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                          <div className="text-2xl font-bold text-orange-800 mb-1">
                            {childActivities.reduce((sum, a) => sum + a.progressData.completedCount, 0)}
                          </div>
                          <div className="text-sm text-orange-600 font-medium">Total Attempts</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Please select a child to view their progress</div>
              </div>
            )}
          </div>
        )}

        {/* Children Section - REAL DATA */}
        {currentView === 'children' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <UsersIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Linked Children
                </h2>
                <button
                  onClick={() => setShowLinkChild(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                  <span>+ Link Child</span>
                </button>
              </div>

              {childrenData.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Children Linked Yet</h3>
                  <p className="text-gray-500 mb-4">Start by linking your child's account to monitor their progress.</p>
                  <button
                    onClick={() => setShowLinkChild(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Link Child Account
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childrenData.map((child) => (
                    <div 
                      key={child.id} 
                      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedChild?.id === child.id 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-100 hover:border-blue-300'
                      }`}
                      onClick={() => handleChildSelect(child)}
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={child.profile_picture}
                          alt={child.full_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{child.full_name}</h3>
                          <p className="text-sm text-gray-500">@{child.username} • Age {child.age}</p>
                        </div>
                        {selectedChild?.id === child.id && (
                          <CheckIcon className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="space-y-2">

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{child.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Linked:</span>
                          <span className="font-medium">
                            {child.linked_at ? new Date(child.linked_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emotions Section - REAL DATA */}
        {currentView === 'emotions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              {/* Header with description */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <HeartIcon className="w-8 h-8 mr-3 text-pink-600" />
                  Emotion Tracking
                  {selectedChild && (
                    <span className="ml-3 text-lg text-gray-600">
                      - {selectedChild.full_name || selectedChild.username}
                    </span>
                  )}
                </h2>
                <p className="text-lg text-gray-600 ml-11">
                  Monitor your child's emotional expressions and notes • Updated in real-time
                  {emotionTimeFilter !== 'all' && (
                    <span className="text-blue-600 font-medium">
                      {' • Showing ' + getTimeFilterLabel(emotionTimeFilter)}
                    </span>
                  )}
                </p>
              </div>

              {/* Time Filter */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                        onClick={() => setEmotionTimeFilter(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          emotionTimeFilter === option.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {!selectedChild ? (
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Child Selected</h3>
                  <p className="text-gray-500">Please select a child from the Children section to view their emotional data.</p>
                </div>
              ) : loadingEmotions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading emotional data...</p>
                </div>
              ) : childEmotions.length === 0 ? (
                <div className="text-center py-12">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Emotional Data Yet</h3>
                  <p className="text-gray-500">
                    {selectedChild.full_name || selectedChild.username} hasn't recorded any emotions yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">😊</div>
                        <div className="ml-1">
                          <p className="text-sm font-medium text-gray-600">Positive Emotions</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {childEmotions.filter(e => ['happy', 'excited', 'calm'].includes(e.emotion?.toLowerCase())).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {childEmotions.filter(e => ['angry', 'sad'].includes(e.emotion?.toLowerCase())).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                      <div className="flex items-center">
                        <HeartIcon className="h-12 w-12 text-blue-500" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Emotions</p>
                          <p className="text-3xl font-bold text-gray-900">{childEmotions.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emotions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childEmotions.map((emotion, index) => {
                    // Determine emotion type for styling
                    const isPositive = ['happy', 'excited', 'calm'].includes(emotion.emotion?.toLowerCase());
                    const isHighPriority = ['angry', 'sad'].includes(emotion.emotion?.toLowerCase());
                    const borderColor = isPositive ? 'border-green-500' : isHighPriority ? 'border-red-500' : 'border-orange-400';
                    const emotionType = isPositive ? 'positive' : isHighPriority ? 'high-priority' : 'negative';
                    
                    // Map emotion names (angry -> Upset, calm -> Tired)
                    const displayEmotionName = emotion.emotion?.toLowerCase() === 'angry' 
                      ? 'Upset' 
                      : emotion.emotion?.toLowerCase() === 'calm'
                        ? 'Tired'
                        : emotion.emotion_name || 'Unknown';

                    return (
                      <div key={emotion.entry_id || index} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${borderColor} hover:shadow-xl transition-all duration-300`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="text-3xl mr-3">{getEmotionIcon(emotion.emotion_name)}</div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 capitalize">{displayEmotionName}</h3>
                              <p className="text-gray-600 text-sm">
                                {selectedChild.full_name || selectedChild.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isPositive 
                                ? 'bg-green-100 text-green-800' 
                                : isHighPriority 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-orange-100 text-orange-800'
                            }`}>
                              {isPositive ? '😊 Positive' : isHighPriority ? '🚨 Needs Attention' : '⚠️ Negative'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Student's Note Display */}
                        {emotion.note && emotion.note.trim() !== '' ? (
                          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="text-blue-400 text-lg">💬</div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-semibold text-blue-800 mb-1">
                                  📝 {selectedChild.full_name || selectedChild.username}'s Note
                                </p>
                                <p className="text-blue-700 text-sm leading-relaxed bg-white rounded p-3 italic">
                                  "{emotion.note}"
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                  🔒 This note is shared with parents and teachers
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                            <p className="text-sm text-gray-500 italic">No additional note provided</p>
                          </div>
                        )}
                        
                        {/* Timestamp and Priority */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(emotion.created_at).toLocaleDateString()} at {new Date(emotion.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isHighPriority && (
                            <span className="flex items-center text-red-500 font-medium">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              Alert
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Badges Section - Dynamic Data */}
        {currentView === 'badges' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <TrophyIcon className="w-6 h-6 mr-3 text-yellow-600" />
                    {selectedChild ? `${selectedChild.full_name || selectedChild.username}'s Achievement Badges` : 'Achievement Badges'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {childBadges.length} out of {allBadges.length} badges earned
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl mb-1">🏆</div>
                  <div className="text-sm text-gray-600">
                    {Math.round((childBadges.length / Math.max(allBadges.length, 1)) * 100)}% Complete
                  </div>
                </div>
              </div>
              
              {allBadges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-gray-600">Loading badges...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allBadges.map((badge) => {
                    const isEarned = childBadges.some(cb => cb.badge_id === badge.id);
                    const earnedBadge = childBadges.find(cb => cb.badge_id === badge.id);
                    
                    // Map badge properties to UI format
                    const iconMap = {
                      'First Step': '⭐',
                      'Perfect Scorer': '🎯',
                      'Academic Star': '📖',
                      'Color Master': '🎨',
                      'Match Finder': '🧩',
                      'Shape Explorer': '🔷',
                      'Number Ninja': '🔢',
                      'Consistency Champ': '📅',
                      'High Achiever': '🏅',
                      'Daily Life Hero': '🏠',
                      'All-Rounder': '🏆'
                    };

                    const colorMap = {
                      'First Step': isEarned ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Perfect Scorer': isEarned ? 'from-green-50 to-emerald-50 border-green-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Academic Star': isEarned ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Color Master': isEarned ? 'from-purple-50 to-pink-50 border-purple-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Match Finder': isEarned ? 'from-pink-50 to-rose-50 border-pink-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Shape Explorer': isEarned ? 'from-blue-50 to-cyan-50 border-blue-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Number Ninja': isEarned ? 'from-green-50 to-lime-50 border-green-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Consistency Champ': isEarned ? 'from-indigo-50 to-purple-50 border-indigo-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'High Achiever': isEarned ? 'from-orange-50 to-red-50 border-orange-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'Daily Life Hero': isEarned ? 'from-teal-50 to-cyan-50 border-teal-200' : 'from-gray-50 to-gray-100 border-gray-200',
                      'All-Rounder': isEarned ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-gray-50 to-gray-100 border-gray-200'
                    };

                    const statusColor = isEarned ? 'text-green-600' : 'text-gray-500';
                    const icon = iconMap[badge.title] || '🏆';
                    const colors = colorMap[badge.title] || (isEarned ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-gray-50 to-gray-100 border-gray-200');

                    return (
                      <div 
                        key={badge.id}
                        className={`bg-gradient-to-br ${colors} rounded-2xl p-6 border-2 ${isEarned ? 'shadow-lg transform hover:scale-105 transition-all duration-300' : 'opacity-75'} relative`}
                      >
                        {/* Status indicator */}
                        {isEarned && (
                          <div className="absolute top-3 right-3">
                            <span className="text-green-500 text-lg">✅</span>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className={`text-4xl mb-3 ${isEarned ? 'animate-bounce-gentle' : ''}`}>
                            {isEarned ? icon : '🔒'}
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2 text-sm">
                            {badge.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3 leading-tight">
                            {badge.description}
                          </p>
                          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            isEarned ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isEarned ? 'EARNED' : 'LOCKED'}
                          </div>
                          
                          {/* Earned date */}
                          {isEarned && earnedBadge && (
                            <div className="text-xs text-gray-500 mt-2">
                              Earned: {new Date(earnedBadge.earned_at).toLocaleDateString()}
                            </div>
                          )}
                          
                          {/* Sparkle effect for earned badges */}
                          {isEarned && (
                            <div className="absolute bottom-2 right-2">
                              <span className="text-yellow-400 text-sm animate-pulse">✨</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Encouragement message */}
              {childBadges.length < allBadges.length && allBadges.length > 0 && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">�</span>
                    <div>
                      <h4 className="font-bold text-blue-800 text-lg">Keep Going!</h4>
                      <p className="text-blue-600">
                        {selectedChild ? `${selectedChild.full_name || selectedChild.username} can unlock` : 'Your child can unlock'} {allBadges.length - childBadges.length} more badges by completing more activities!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        {currentView === 'tips' && (
          <div className="space-y-8">
            <MotivationTips />
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkChildModal 
        isOpen={showLinkChild}
        onClose={() => setShowLinkChild(false)}
        onChildLinked={handleChildLinked}
      />
      
      <ParentProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ChildActivityProgressModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        child={selectedChild}
        activities={childActivities}
        loading={loadingActivities}
      />
    </div>
  );
};

export default ParentDashboard;
