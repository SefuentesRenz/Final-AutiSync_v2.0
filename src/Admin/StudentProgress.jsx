import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, AcademicCapIcon, UsersIcon, StarIcon, FireIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { getStudentProgressStats, getStudentProgress } from '../lib/progressApi';
import { getUserProfileById } from '../lib/userProfilesApi';
import { getActivities } from '../lib/activitiesApi';
import { getAllBadges, getStudentBadges } from '../lib/badgesApi';
import { resolveBadgeIcon, BadgeIcon } from '../lib/badgeIcons';
import { supabase } from '../lib/supabase';

const StudentProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [recentProgress, setRecentProgress] = useState([]);
  const [activities, setActivities] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [studentBadges, setStudentBadges] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Get the student profile directly by user_id
        const studentUUID = id; // The ID passed should be the user_id
        
        const [statsResult, progressResult, activitiesResult, profileResult, badgesResult, studentBadgesResult] = await Promise.all([
          getStudentProgressStats(studentUUID),
          getStudentProgress(studentUUID),
          getActivities(),
          getUserProfileById(studentUUID),
          getAllBadges(),
          getStudentBadges(studentUUID)
        ]);

        // Set student profile information
        if (profileResult.data) {
          const profileData = profileResult.data;
          // Transform profile data to match expected student format
          setStudent({
            id: profileData.user_id,
            name: profileData.full_name || 'Unknown Student',
            email: profileData.email,
            age: profileData.age || 0,
            gender: profileData.gender || 'Not specified',
            address: profileData.address || 'No address provided',
            school: profileData.school || '',
            joinDate: new Date(profileData.created_at).toLocaleDateString(),
            status: 'Active'
          });
        } else if (profileResult.error) {
          console.error('Error fetching student profile:', profileResult.error);
          setError('Failed to load student profile');
        }

        if (statsResult.error) {
          console.error('Error fetching progress stats:', statsResult.error);
        } else {
          setProgressStats(statsResult.data);
        }

        if (progressResult.error) {
          console.error('Error fetching progress:', progressResult.error);
        } else {
          setRecentProgress(progressResult.data || []);
        }

        if (activitiesResult.error) {
          console.error('Error fetching activities:', activitiesResult.error);
        } else {
          setActivities(activitiesResult.data || []);
        }

        // Set badges
        if (badgesResult.error) {
          console.error('Error fetching badges:', badgesResult.error);
        } else {
          setAllBadges(badgesResult.data || []);
        }

        if (studentBadgesResult.error) {
          console.error('Error fetching student badges:', studentBadgesResult.error);
        } else {
          setStudentBadges(studentBadgesResult.data || []);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const handleBackToStudents = () => {
    navigate('/admin/students');
  };

  // Students database (should match the one in Students.jsx)
  const studentsDatabase = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      address: '123 Main St, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.emma@email.com',
      joinDate: '2024-01-15',
      status: 'Active',
      completedActivities: 24,
      averageScore: 87,
      lastActive: '2 hours ago',
      profileColor: 'bg-pink-500',
      profileImage: '/assets/kidprofile1.jpg'
    },
    {
      id: 2,
      name: 'Liam Smith',
      age: 7,
      address: '456 Oak Ave, Springfield, IL',
      gender: 'Male',
      parentEmail: 'parent.liam@email.com',
      joinDate: '2024-02-20',
      status: 'Active',
      completedActivities: 18,
      averageScore: 92,
      lastActive: '1 hour ago',
      profileColor: 'bg-blue-500',
      profileImage: '/assets/kidprofile1.jpg'
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: 9,
      address: '789 Pine Rd, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.sophia@email.com',
      joinDate: '2024-01-10',
      status: 'Active',
      completedActivities: 31,
      averageScore: 89,
      lastActive: '3 hours ago',
      profileColor: 'bg-purple-500',
      profileImage: '/assets/kidprofile1.jpg'
    },
    {
      id: 4,
      name: 'Noah Wilson',
      age: 6,
      address: '321 Elm St, Springfield, IL',
      gender: 'Male',
      parentEmail: 'parent.noah@email.com',
      joinDate: '2024-03-05',
      status: 'Inactive',
      completedActivities: 8,
      averageScore: 75,
      lastActive: '2 days ago',
      profileColor: 'bg-green-500',
      profileImage: '/assets/kidprofile1.jpg'
    },
    {
      id: 5,
      name: 'Isabella Brown',
      age: 8,
      address: '654 Maple Dr, Springfield, IL',
      gender: 'Female',
      parentEmail: 'parent.isabella@email.com',
      joinDate: '2024-02-15',
      status: 'Active',
      completedActivities: 22,
      averageScore: 94,
      lastActive: '30 minutes ago',
      profileColor: 'bg-orange-500',
      profileImage: '/assets/kidprofile1.jpg'
    }
  ];

  // Check if student exists and handle redirect in useEffect
  useEffect(() => {
    if (!loading && !student && !error) {
      navigate('/admin/students');
    }
  }, [loading, student, error, navigate]);

  // Generate dynamic data based on real progress stats
  const generateStudentMetrics = () => {
    if (!progressStats) {
      return [
        { title: 'TOTAL ACTIVITIES', value: '0', change: 'Loading...', icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { title: 'COMPLETION RATE', value: '0%', change: 'Loading...', icon: <CheckCircleIcon className="w-8 h-8 text-green-600" />, bgColor: 'bg-green-50', textColor: 'text-green-600' },
        { title: 'AVERAGE SCORE', value: '0%', change: 'Loading...', icon: <StarIcon className="w-8 h-8 text-yellow-600" />, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
        { title: 'RECENT ACTIVITIES', value: '0', change: 'Loading...', icon: <FireIcon className="w-8 h-8 text-red-600" />, bgColor: 'bg-red-50', textColor: 'text-red-600' },
        { title: 'ACTIVE STREAK', value: '0 days', change: 'Loading...', icon: <FireIcon className="w-8 h-8 text-orange-600" />, bgColor: 'bg-orange-50', textColor: 'text-orange-600' }
      ];
    }

    return [
      {
        title: 'COMPLETED ACTIVITIES',
        value: progressStats.completedActivities || 0,
        change: `${progressStats.totalActivities || 0} total activities`,
        icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        title: 'COMPLETION RATE',
        value: `${progressStats.completionRate || 0}%`,
        change: progressStats.completionRate > 75 ? 'Excellent progress!' : progressStats.completionRate > 50 ? 'Good progress' : 'Keep going!',
  icon: <CheckCircleIcon className="w-8 h-8 text-green-600" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        title: 'AVERAGE ACCURACY',
        value: `${Math.min(100, progressStats.averageScore || 0)}%`,
        change: progressStats.averageScore > 85 ? 'Outstanding!' : progressStats.averageScore > 70 ? 'Great work!' : 'Improving',
  icon: <StarIcon className="w-8 h-8 text-purple-600" />,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
      },
      {
        title: 'AVERAGE SCORE',
        value: `${Math.min(100, progressStats.averageScore || 0)}%`,
        change: progressStats.averageScore > 85 ? 'Excellent work!' : progressStats.averageScore > 70 ? 'Good performance' : 'Room for improvement',
        icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600'
      },
      {
        title: 'RECENT ACTIVITIES',
        value: `${progressStats.recentActivities || 0}`,
        change: 'Last 7 days',
        icon: <FireIcon className="w-8 h-8 text-orange-600" />,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600'
      },
    ];
  };

  // Generate recent activities based on student
  const generateRecentActivities = (student) => {
    const activities = [
      'Numbers - Easy Level', 'Color Recognition', 'Shape Matching', 
      'Daily Routine', 'Letter Recognition', 'Pattern Completion',
      'Counting Objects', 'Emotion Recognition', 'Time Telling'
    ];
    
    return activities.slice(0, 5).map((activity, i) => ({
      title: activity,
      category: i % 2 === 0 ? 'Academic' : 'Daily Life',
      time: `${Math.floor(Math.random() * 12) + 1} hours ago`,
      difficulty: ['Beginner', 'Intermediate', 'Proficient'][Math.floor(Math.random() * 3)],
      score: `${Math.max(60, student.averageScore - Math.floor(Math.random() * 20) + Math.floor(Math.random() * 20))}%`,
      difficultyColor: ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'][Math.floor(Math.random() * 3)],
      duration: `${Math.floor(Math.random() * 8) + 2} min`
    }));
  };

  // Generate difficulty progression based on student level
  // Calculate real difficulty progression based on actual completed activities
  const calculateDifficultyProgression = () => {
    if (!recentProgress || recentProgress.length === 0) {
      return [
        { level: 'Beginner', progress: 0, completed: '0/0', icon: '🟢', color: 'bg-green-500', bgColor: 'bg-green-50' },
        { level: 'Intermediate', progress: 0, completed: '0/0', icon: '🟠', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
        { level: 'Proficient', progress: 0, completed: '0/0', icon: '🔴', color: 'bg-red-500', bgColor: 'bg-red-50' }
      ];
    }

    const difficultyStats = {
      'Beginner': { completed: 0 },
      'Intermediate': { completed: 0 },
      'Proficient': { completed: 0 }
    };

    // Count total available activities by difficulty
    const difficultyTotals = {
      'Beginner': 0,
      'Intermediate': 0,
      'Proficient': 0
    };

    // Define flashcard activity types
    const flashcardTypes = ['Identification', 'Numbers', 'Colors', 'Academic Puzzles', 'Matching Type', 'Visual Memory Challenge'];

    // Count available activities (only flashcard activities)
    activities.forEach(activity => {
      // Only count flashcard activities
      if (!flashcardTypes.includes(activity.activity_type)) {
        return;
      }
      const difficulty = activity.Difficulties?.difficulty || activity.difficulty || 'Beginner';
      if (difficultyTotals[difficulty] !== undefined) {
        difficultyTotals[difficulty]++;
      }
    });

    // Count completed activities by difficulty - avoid double counting
    const completedActivityIds = new Set();
    
    recentProgress.forEach(progress => {
      if (progress.completionStatus === 'completed') {
        const activityId = progress.activityId;
        
        // Find the activity to check if it's a flashcard type
        const activity = activities.find(act => act.id === activityId);
        if (!activity || !flashcardTypes.includes(activity.activity_type)) {
          return; // Skip non-flashcard activities
        }
        
        // Only count each activity once
        if (!completedActivityIds.has(activityId)) {
          completedActivityIds.add(activityId);
          
          // Get difficulty from progress data
          const difficulty = progress.difficultyName || 'Beginner';
          
          if (difficultyStats[difficulty] !== undefined) {
            difficultyStats[difficulty].completed++;
          }
        }
      }
    });

    // Return formatted data
    return [
      { 
        level: 'Beginner', 
        progress: difficultyTotals['Beginner'] > 0 ? Math.round((difficultyStats['Beginner'].completed / difficultyTotals['Beginner']) * 100) : 0,
        completed: `${difficultyStats['Beginner'].completed}/${difficultyTotals['Beginner']}`, 
        icon: '🟢', 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50' 
      },
      { 
        level: 'Intermediate', 
        progress: difficultyTotals['Intermediate'] > 0 ? Math.round((difficultyStats['Intermediate'].completed / difficultyTotals['Intermediate']) * 100) : 0,
        completed: `${difficultyStats['Intermediate'].completed}/${difficultyTotals['Intermediate']}`, 
        icon: '🟠', 
        color: 'bg-orange-500', 
        bgColor: 'bg-orange-50' 
      },
      { 
        level: 'Proficient', 
        progress: difficultyTotals['Proficient'] > 0 ? Math.round((difficultyStats['Proficient'].completed / difficultyTotals['Proficient']) * 100) : 0,
        completed: `${difficultyStats['Proficient'].completed}/${difficultyTotals['Proficient']}`, 
        icon: '🔴', 
        color: 'bg-red-500', 
        bgColor: 'bg-red-50' 
      }
    ];
  };

  // Calculate real learning categories based on actual completed activities
  const calculateLearningCategories = () => {
    if (!recentProgress || recentProgress.length === 0) {
      return [
        { name: 'Academic Skills', percent: 0, count: '0/0', icon: '📚', color: 'bg-blue-500' },
        { name: 'Daily Life Skills', percent: 0, count: '0/0', icon: '🏠', color: 'bg-orange-500' }
      ];
    }

    const categoryStats = {
      'Academic Skills': { completed: 0, total: 0 },
      'Daily Life Skills': { completed: 0, total: 0 }
    };

    // Count total available activities by exact category name
    activities.forEach(activity => {
      const activityCategory = (activity.Categories?.category_name || activity.category || '').toLowerCase();
      
      // Only count "academic skills" not just "academic"
      if (activityCategory === 'academic skills') {
        categoryStats['Academic Skills'].total++;
        console.log(`📚 Counted Academic: "${activity.title}" (category: "${activityCategory}")`);
      } else if (activityCategory.includes('social') || activityCategory.includes('daily') || activityCategory.includes('life')) {
        categoryStats['Daily Life Skills'].total++;
        console.log(`🏠 Counted Daily Life: "${activity.title}" (category: "${activityCategory}")`);
      } else {
        console.log(`⚠️ Not counted: "${activity.title}" (category: "${activityCategory}")`);
      }
    });
    
    console.log(`📊 Total Academic Skills activities: ${categoryStats['Academic Skills'].total}`);
    console.log(`📊 Total Daily Life Skills activities: ${categoryStats['Daily Life Skills'].total}`);

    // Count completed activities by category - avoid double counting
    const completedActivityIds = new Set();
    
    recentProgress.forEach(progress => {
      if (progress.completionStatus === 'completed') {
        const activityId = progress.activityId;
        
        // Only count each activity once
        if (!completedActivityIds.has(activityId)) {
          completedActivityIds.add(activityId);
          
          // Find the activity
          const activity = activities.find(act => act.id === activityId);
          if (activity) {
            const activityCategory = (activity.Categories?.category_name || activity.category || '').toLowerCase();
            
            // Only count "academic skills" not just "academic"
            if (activityCategory === 'academic skills') {
              categoryStats['Academic Skills'].completed++;
            } else if (activityCategory.includes('social') || activityCategory.includes('daily') || activityCategory.includes('life')) {
              categoryStats['Daily Life Skills'].completed++;
            }
          }
        }
      }
    });

    // Return formatted data
    return [
      { 
        name: 'Academic Skills', 
        percent: categoryStats['Academic Skills'].total > 0 ? Math.round((categoryStats['Academic Skills'].completed / categoryStats['Academic Skills'].total) * 100) : 0,
        count: `${categoryStats['Academic Skills'].completed}/${categoryStats['Academic Skills'].total}`, 
        icon: '📚', 
        color: 'bg-blue-500' 
      },
      { 
        name: 'Daily Life Skills', 
        percent: categoryStats['Daily Life Skills'].total > 0 ? Math.round((categoryStats['Daily Life Skills'].completed / categoryStats['Daily Life Skills'].total) * 100) : 0,
        count: `${categoryStats['Daily Life Skills'].completed}/${categoryStats['Daily Life Skills'].total}`, 
        icon: '🏠', 
        color: 'bg-orange-500' 
      }
    ];
  };

  const generateDifficultyProgression = (student) => {
    const totalActivities = student.completedActivities;
    const avgScore = student.averageScore;
    
    // Higher performing students have attempted more difficult levels
    const easyCompleted = Math.min(20, totalActivities);
    const mediumCompleted = avgScore > 85 ? Math.min(15, Math.max(0, totalActivities - 15)) : Math.min(10, Math.max(0, totalActivities - 10));
    const hardCompleted = avgScore > 90 ? Math.min(10, Math.max(0, totalActivities - 25)) : 0;

    return [
      { 
        level: 'Beginner', 
        progress: Math.floor((easyCompleted / 20) * 100), 
        completed: `${easyCompleted}/20`, 
  icon: '🟢', 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50' 
      },
      { 
        level: 'Intermediate', 
        progress: Math.floor((mediumCompleted / 15) * 100), 
        completed: `${mediumCompleted}/15`, 
  icon: '🟠', 
        color: 'bg-orange-500', 
        bgColor: 'bg-orange-50' 
      },
      { 
        level: 'Proficient', 
        progress: Math.floor((hardCompleted / 10) * 100), 
        completed: `${hardCompleted}/10`, 
  icon: '🔴', 
        color: 'bg-red-500', 
        bgColor: 'bg-red-50' 
      }
    ];
  };

  // Calculate badges for this specific student from all available badges
  const calculateStudentBadges = () => {
    if (!allBadges || allBadges.length === 0) {
      return [];
    }

    // Get the IDs of badges this student has earned
    const earnedBadgeIds = new Set(studentBadges.map(sb => sb.badge_id));

    // Map all badges to display format
    const badgesDisplay = allBadges.map(badge => {
      const hasEarned = earnedBadgeIds.has(badge.id);
      const status = hasEarned ? 'EARNED' : 'LOCKED';

      // Resolve icon: emoji from DB, title-based fallback, or default 🏆
      let icon = resolveBadgeIcon(badge);
      let color = status === 'EARNED' ? 'from-yellow-400 to-yellow-600' : 'from-gray-400 to-gray-500';
      let bgColor = status === 'EARNED' ? 'bg-yellow-50' : 'bg-gray-50';
      let animation = status === 'EARNED' ? 'animate-bounce-gentle' : '';

      // Assign specific colors based on badge type
      if (badge.title.includes('First Step')) {
        if (status === 'EARNED') { color = 'from-yellow-400 to-yellow-600'; bgColor = 'bg-yellow-50'; }
      } else if (badge.title.includes('Perfect Scorer')) {
        if (status === 'EARNED') { color = 'from-green-400 to-green-600'; bgColor = 'bg-green-50'; }
      } else if (badge.title.includes('Academic Star')) {
        if (status === 'EARNED') { color = 'from-blue-400 to-blue-600'; bgColor = 'bg-blue-50'; }
      } else if (badge.title.includes('Color Master') || badge.title.includes('Color')) {
        if (status === 'EARNED') { color = 'from-purple-400 to-purple-600'; bgColor = 'bg-purple-50'; }
      } else if (badge.title.includes('Match') || badge.title.includes('Matcher')) {
        if (status === 'EARNED') { color = 'from-pink-400 to-pink-600'; bgColor = 'bg-pink-50'; }
      } else if (badge.title.includes('Number')) {
        if (status === 'EARNED') { color = 'from-green-400 to-green-600'; bgColor = 'bg-green-50'; }
      } else if (badge.title.includes('Consistency Champ')) {
        if (status === 'EARNED') { color = 'from-indigo-400 to-indigo-600'; bgColor = 'bg-indigo-50'; }
      } else if (badge.title.includes('High Achiever')) {
        if (status === 'EARNED') { color = 'from-orange-400 to-orange-600'; bgColor = 'bg-orange-50'; }
      } else if (badge.title.includes('Daily Life Hero')) {
        if (status === 'EARNED') { color = 'from-teal-400 to-teal-600'; bgColor = 'bg-teal-50'; }
      } else if (badge.title.includes('All-Rounder')) {
        if (status === 'EARNED') { color = 'from-gradient-400 to-gradient-600'; bgColor = 'bg-gradient-to-br from-yellow-50 to-orange-50'; }
      } else if (badge.title.includes('Puzzle')) {
        if (status === 'EARNED') { color = 'from-indigo-400 to-purple-600'; bgColor = 'bg-indigo-50'; }
      } else if (badge.title.includes('Memory')) {
        if (status === 'EARNED') { color = 'from-violet-400 to-purple-600'; bgColor = 'bg-violet-50'; }
      } else if (badge.title.includes('Recognition') || badge.title.includes('Skill Spotter')) {
        if (status === 'EARNED') { color = 'from-cyan-400 to-blue-600'; bgColor = 'bg-cyan-50'; }
      } else if (badge.title.includes('Cash Register Starter')) {
        if (status === 'EARNED') { color = 'from-emerald-400 to-teal-600'; bgColor = 'bg-emerald-50'; }
      } else if (badge.title.includes('Counter Helper')) {
        if (status === 'EARNED') { color = 'from-green-400 to-emerald-600'; bgColor = 'bg-green-50'; }
      } else if (badge.title.includes('Checkout Champion')) {
        if (status === 'EARNED') { color = 'from-amber-400 to-orange-500'; bgColor = 'bg-amber-50'; }
      } else if (badge.title.includes('Cash Handling Master')) {
        if (status === 'EARNED') { color = 'from-yellow-400 to-amber-600'; bgColor = 'bg-yellow-50'; }
      } else if (badge.title.includes('Trusted Cashier')) {
        if (status === 'EARNED') { color = 'from-rose-400 to-pink-600'; bgColor = 'bg-rose-50'; }
      } else if (badge.title.includes('Dishwashing') || badge.title.includes('Floor Care') || badge.title.includes('Table') || badge.title.includes('Bed') || badge.title.includes('Plant Care')) {
        if (status === 'EARNED') { color = 'from-teal-400 to-emerald-600'; bgColor = 'bg-teal-50'; }
      }

      return {
        icon,
        title: badge.title,
        description: badge.description,
        status,
        color,
        bgColor,
        animation
      };
    });

    // Sort badges: earned badges first, then locked badges
    return badgesDisplay.sort((a, b) => {
      if (a.status === 'EARNED' && b.status === 'LOCKED') return -1;
      if (a.status === 'LOCKED' && b.status === 'EARNED') return 1;
      return 0;
    });
  };

  // Use real progress data instead of generated data
  const metrics = generateStudentMetrics();
  
  // Create simple fallback data for display sections that haven't been updated yet
  const fallbackStudent = {
    completedActivities: progressStats?.completedActivities || 0,
    averageScore: progressStats?.averageScore || 0
  };
  
  // Use dynamic calculations based on real data
  const difficultyProgression = calculateDifficultyProgression();
  const categories = calculateLearningCategories();
  const badges = calculateStudentBadges();

  // Use real recent progress data
  const recentActivitiesDisplay = recentProgress?.slice(0, 6).map((progress, index) => {
    // Get activity title from the progress data
    const activityTitle = progress.activityTitle || 'Unknown Activity';

    // Get student name - use just the name without any UUIDs
    const studentName = progress.studentName ||
      progress.student_name ||
      student?.name ||
      'Unknown Student';

    // Get category name (not the UUID)
    const categoryName = (progress.categoryName || 'Other').toLowerCase();

    // Get difficulty name (not the UUID)
    let difficultyName = progress.difficultyName || 'Beginner';

    // Known Social/Daily Life activity names (for old and new data)
    const socialDailyLifeActivities = [
      'hygiene hero',
      'cashier game',
      'safe street crossing',
      'social greetings',
      'household chores helper',
      'money value game',
      'chores helper',
      'tooth brushing',
      'grocery helper'
    ];

    // Normalize for comparison
    const normalizedActivityTitle = (activityTitle || '').toLowerCase();
    const normalizedDifficulty = (difficultyName || '').toLowerCase();

    // Robust check for Social/Daily Life Skill or missing difficulty
    const isSocialDailyLife = categoryName.includes('social') ||
      categoryName.includes('daily') ||
      socialDailyLifeActivities.some(s => normalizedActivityTitle === s || normalizedActivityTitle.startsWith(s + ' -')) ||
      !difficultyName ||
      normalizedDifficulty === 'n/a' ||
      normalizedDifficulty === 'null' ||
      normalizedDifficulty === 'undefined' ||
      normalizedDifficulty === '';

    if (isSocialDailyLife) {
      difficultyName = 'Game';
    }

    return {
      title: activityTitle,
      user: studentName,
      category: progress.categoryName || 'Other',
      time: new Date(progress.dateCompleted || progress.date_completed).toLocaleString(),
      difficulty: difficultyName,
      score: progress.score ? `${Math.min(100, progress.score)}%` : 'No score',
      difficultyColor: difficultyName === 'Game' ? 'bg-purple-100 text-purple-800' :
        difficultyName === 'Beginner' ? 'bg-green-100 text-green-800' :
        difficultyName === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800',
      avatar: studentName ? studentName.split(' ').map(n => n[0]).join('') : 'S'
    };
  }) || [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white rounded-xl p-2">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/tracking" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
                Dashboard
              </a>
              <a href="/activities" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors">
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

      {/* INDIVIDUAL STUDENT PROGRESS DASHBOARD */}
      <div className="max-w-full mx-auto sm:px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600 mb-4">Loading student progress...</div>
            <div className="text-gray-500">Fetching data from backend APIs</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-xl text-red-600 mb-4">{error}</div>
            <button 
              onClick={handleBackToStudents}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Students
            </button>
          </div>
        ) : (
          <>
        {/* Page Header with Student Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-4 mb-2">
              <img
                src="/assets/kidprofile1.jpg"
                alt={student?.name || 'Student'}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">{student?.name || 'Unknown Student'}</h1>
                
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={handleBackToStudents}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Students</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
              <div className={`${metric.bgColor} rounded-xl p-3 w-fit mb-4`}>
                {metric.icon}
              </div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{metric.title}</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{metric.value}</h2>
              <p className="text-sm text-green-600 font-medium">{metric.change}</p>
            </div>
          ))}
        </div>

        {/* Recent Activities - Full Width */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">🕒</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentActivitiesDisplay.length > 0 ? recentActivitiesDisplay.map((activity, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold">
                        {activity.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{activity.title}</p>
                                <p className="text-sm text-gray-500">
                                  {activity.time}
                                </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${activity.difficultyColor}`}>
                        {activity.difficulty}
                      </span>
                      <span className="font-bold text-green-600 text-lg">{activity.score}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-4 text-gray-600">No recent activities found</div>
              )}
            </div>
          </div>
        </div>

        {/* New Tracking Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Category Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Learning Categories</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
            </div>
            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`${cat.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{cat.percent}% complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level Progression */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Difficulty Level Progression</h3>
              <div className="bg-orange-100 p-2 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
            </div>
            <div className="space-y-4">
              {difficultyProgression.map((level, idx) => (
                <div key={idx} className={`${level.bgColor} rounded-xl p-4 border border-gray-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-700">{level.level} Level</span>
                        <p className="text-sm text-gray-500">{level.completed} activities</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{level.progress}%</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-3">
                    <div
                      className={`${level.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${level.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Personal Badges */}
        <div className="grid xl:grid-cols-1 gap-8">
          {/* Personal Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Achievements & Badges</h3>
            <div className="grid lg:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  className={`card-autism-friendly ${badge.bgColor} p-4 rounded-2xl text-center relative overflow-hidden border-2 ${
                    badge.status === 'EARNED' 
                      ? 'border-green-200 shadow-lg' 
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  {/* Status indicator */}
                  {badge.status === 'EARNED' && (
                    <div className="absolute top-2 right-2">
                      <span className="text-green-500 text-lg animate-bounce-in">✅</span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 bg-gradient-to-r ${badge.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl text-white shadow-lg ${badge.animation}`}>
                    <BadgeIcon icon={badge.icon} alt={badge.title} />
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm mb-2">
                    {badge.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2 leading-tight">
                    {badge.description}
                  </p>
                  
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    badge.status === 'EARNED' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {badge.status}
                  </span>
                  
                  {badge.status === 'EARNED' && (
                    <div className="absolute bottom-1 right-1">
                      <span className="text-yellow-400 text-sm animate-pulse-gentle">✨</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
