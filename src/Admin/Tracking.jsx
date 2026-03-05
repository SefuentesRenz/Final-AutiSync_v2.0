import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, AcademicCapIcon, UsersIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { getAllStudentsProgress } from '../lib/progressApi';
import { getActivitiesWithDetails } from '../lib/activitiesApi';
import { getUserProfiles } from '../lib/userProfilesApi';
import { getAllBadges, getStudentBadges } from '../lib/badgesApi';
import { resolveBadgeIcon, BadgeIcon } from '../lib/badgeIcons';

const Tracking = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [studentBadgesData, setStudentBadgesData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [progressResult, activitiesResult, studentsResult, badgesResult] = await Promise.all([
          getAllStudentsProgress(),
          getActivitiesWithDetails(), // Now gets activities with difficulty details
          getUserProfiles(), // Now gets all user_profiles instead of students
          getAllBadges()
        ]);

        if (progressResult.error) {
          console.error('Error fetching progress:', progressResult.error);
        } else {
          console.log('📊 Admin Dashboard - Progress data received:', progressResult.data);
          console.log('📊 Admin Dashboard - Students in progress data:', progressResult.data?.students);
          console.log('📊 Admin Dashboard - Total students:', progressResult.data?.totalStudents);
          setProgressData(progressResult.data);
        }

        if (activitiesResult.error) {
          console.error('Error fetching activities:', activitiesResult.error);
        } else {
          console.log('📊 Admin Dashboard - Activities received:', activitiesResult.data);
          console.log('📊 Admin Dashboard - Number of activities:', activitiesResult.data?.length);
          setActivities(activitiesResult.data || []);
        }

        if (studentsResult.error) {
          console.error('Error fetching students:', studentsResult.error);
        } else {
          setStudents(studentsResult.data || []);
        }

        if (badgesResult.error) {
          console.error('Error fetching badges:', badgesResult.error);
        } else {
          console.log('🏆 Admin Dashboard - Badges received:', badgesResult.data);
          let allBadgesData = badgesResult.data || [];
          
          // If no badges from badges table, create a comprehensive list from known badges
          if (allBadgesData.length === 0) {
            console.log('🏆 No badges from badges table, creating comprehensive badge list...');
            allBadgesData = [
              { id: 'f9aba128-a8e5-4b2c-8b2e-27ad1403faa6', title: 'First Step', description: 'Awarded for completing your first activity.' },
              { id: '97054c4c-4b60-4bae-b1d9-46c5b7d0c99a', title: 'Perfect Scorer', description: 'Awarded for getting a perfect score in any activity.' },
              { id: '2f73958d-d18c-4135-96bd-c65ca554a207', title: 'Academic Star', description: 'Complete 5 academic activities.' },
              { id: 'c0e0441c-0688-4a4c-bd82-fad73c4392c1', title: 'Color Master', description: 'Complete 2 color activities in different difficulty levels.' },
              { id: '55544bd9-53a5-42ac-bee8-c6b05632dfff', title: 'Match Finder', description: 'Finish a matching type activity.' },

              { id: 'd1ec22b8-9c28-44a4-9ee6-851b30948140', title: 'Number Ninja', description: 'Complete at least 1 number flashcard activity.' },
              { id: '899d3e1b-6a3f-4c88-b52c-4960bb6f0201', title: 'Consistency Champ', description: 'Complete 3 activities in different types.' },
              { id: '9e1e1566-6aec-479b-9f42-456e0c248386', title: 'High Achiever', description: 'Complete 5 activities with 80%+ average score.' },
              { id: '1d3f149c-6db2-4303-93a0-a75540902e4f', title: 'Daily Life Hero', description: 'Complete 3 social/daily life skill activities.' },
              { id: 'dc7243ea-43fb-48af-86c0-7f6dcd4430dd', title: 'All-Rounder', description: 'Complete 5 different types of activity.' }
            ];
          }
          
          setAllBadges(allBadgesData);
          
          // Fetch student badges for all students using user_id
          const studentBadges = {};
          for (const student of studentsResult.data || []) {
            // Use user_id from the student profile to match student_badges table
            const { data: badges } = await getStudentBadges(student.user_id);
            studentBadges[student.user_id] = badges || [];
          }
          setStudentBadgesData(studentBadges);
          console.log('🏆 Student badges data:', studentBadges);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics from real data
  const calculateMetrics = () => {
    // Always calculate activity count if we have activities data
    const hasActivities = activities && activities.length > 0;
    const uniqueActivityTitles = hasActivities ? new Set(activities.map(activity => activity.title)) : new Set();
    const totalActivities = uniqueActivityTitles.size;
    
    if (!progressData || !students.length) {
      // Return partial metrics if no progress/student data, but still show activities count
      return [
        {
          title: 'TOTAL ACTIVITIES',
          value: totalActivities,
          change: hasActivities ? 'Unique activities' : 'Loading...',
          icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600'
        },
        {
          title: 'COMPLETION RATE',
          value: '0%',
          change: 'No data yet',
          icon: <div className="w-8 h-8 text-green-600 text-2xl">🎯</div>,
          bgColor: 'bg-green-50',
          textColor: 'text-green-600'
        },
        {
          title: 'AVERAGE ACCURACY',
          value: '0%',
          change: 'No data yet',
          icon: <div className="w-8 h-8 text-purple-600 text-2xl">🎯</div>,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600'
        },
        {
          title: 'AVERAGE SCORE',
          value: '0',
          change: 'No scores yet',
          icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600'
        },
        {
          title: 'ACTIVE STUDENTS',
          value: 0,
          change: 'Loading...',
          icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-600'
        }
      ];
    }

    const activeStudents = students.length;
    
    // Debug logging
    console.log('📊 Dashboard Debug:');
    console.log('Total activities records:', activities.length);
    console.log('Unique activity titles:', totalActivities);
    console.log('Sample activities:', activities.slice(0, 3).map(a => ({ id: a.id, title: a.title })));
    console.log('Unique titles list:', Array.from(uniqueActivityTitles).slice(0, 10));
    
    let totalSessions = 0;
    let totalScore = 0;
    let scoresCount = 0;
    let completedActivities = 0;

    progressData.students.forEach(student => {
      totalSessions += student.totalActivities || 0;
      if (student.averageScore !== null && student.averageScore > 0) {
        totalScore += student.averageScore;
        scoresCount++;
      }
      completedActivities += student.completedActivities || 0;
    });

    const averageScore = scoresCount > 0 ? (totalScore / scoresCount).toFixed(1) : '0';
    const completionRate = activeStudents > 0 && totalActivities > 0 
      ? Math.round((completedActivities / (activeStudents * totalActivities)) * 100)
      : 0;

    return [
      {
        title: 'TOTAL ACTIVITIES',
        value: totalActivities,
        change: 'Unique activities',
        icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        title: 'COMPLETION RATE',
        value: `${completionRate}%`,
        change: `${totalSessions} total sessions`,
        icon: <div className="w-8 h-8 text-green-600 text-2xl">🎯</div>,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        title: 'AVERAGE ACCURACY',
        value: '82.5%',
        change: '+5.2% from last month',
        icon: <div className="w-8 h-8 text-purple-600 text-2xl">🎯</div>,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
      },
      {
        title: 'AVERAGE SCORE',
        value: averageScore,
        change: scoresCount > 0 ? `Based on ${scoresCount} students` : 'No scores yet',
        icon: <StarIcon className="w-8 h-8 text-yellow-600" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600'
      },
      {
        title: 'ACTIVE STUDENTS',
        value: activeStudents,
        change: `${progressData?.students ? progressData.students.length : 0} with progress`,
        icon: <UsersIcon className="w-8 h-8 text-indigo-600" />,
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600'
      },
    ];
  };

  const calculatedMetrics = calculateMetrics();

  // Calculate category progress from real data
  const calculateCategoryProgress = () => {
    if (!progressData?.students) {
      console.log('📊 No progress data available');
      return [];
    }
    
    console.log('📊 Progress data:', progressData);
    console.log('📊 Activities data:', activities);
    
    const categoryStats = {};
    
    // Initialize with the main categories we want to track
    const mainCategories = {
      'Academic Skills': {
        icon: '📚',
        color: 'bg-blue-500',
        keywords: ['academic', 'math', 'reading', 'writing', 'science', 'learning']
      },
      'Social/Daily Life Skills': {
        icon: '🏠',
        color: 'bg-green-500',
        keywords: ['social', 'daily', 'life', 'communication', 'interaction', 'skill']
      }
    };
    
    // Initialize category stats
    Object.keys(mainCategories).forEach(categoryName => {
      categoryStats[categoryName] = {
        total: 0,
        completed: 0,
        totalScore: 0,
        scoreCount: 0
      };
    });
    
    // Count total activities for each category
    activities.forEach(activity => {
      const activityTitle = (activity.title || '').toLowerCase();
      const activityCategory = (activity.Categories?.category_name || activity.category || '').toLowerCase();
      
      console.log(`📊 Categorizing activity: "${activity.title}" (ID: ${activity.id})`);
      console.log(`📊 Activity category field: "${activityCategory}"`);
      
      // Determine which main category this activity belongs to
      let assignedCategory = null;
      
      for (const [categoryName, categoryInfo] of Object.entries(mainCategories)) {
        if (categoryInfo.keywords.some(keyword => 
          activityTitle.includes(keyword) || activityCategory.includes(keyword)
        )) {
          assignedCategory = categoryName;
          break;
        }
      }
      
      // Default to Academic Skills if no specific match
      if (!assignedCategory) {
        assignedCategory = 'Academic Skills';
      }
      
      console.log(`📊 Activity "${activity.title}" assigned to "${assignedCategory}"`);
      categoryStats[assignedCategory].total++;
    });
    
    // Calculate completion and scores from progress data
    progressData.students.forEach(student => {
      console.log('📊 Processing student for accuracy rates:', student);
      if (student.activities) {
        console.log('📊 Student activities for accuracy:', student.activities);
        student.activities.forEach(progressRecord => {
          console.log('📊 Progress record for accuracy:', progressRecord);
          // Find the activity this progress belongs to - use activityId not activity_id
          const activity = activities.find(act => act.id === progressRecord.activityId);
          if (!activity) {
            console.log(`📊 Activity not found for ID: ${progressRecord.activityId}`);
            return;
          }
          
          console.log(`📊 Found activity: ${activity.title}`);
          
          const activityTitle = (activity.title || '').toLowerCase();
          const activityCategory = (activity.Categories?.category_name || activity.category || '').toLowerCase();
          
          // Determine category assignment (same logic as above)
          let assignedCategory = null;
          
          for (const [categoryName, categoryInfo] of Object.entries(mainCategories)) {
            if (categoryInfo.keywords.some(keyword => 
              activityTitle.includes(keyword) || activityCategory.includes(keyword)
            )) {
              assignedCategory = categoryName;
              break;
            }
          }
          
          if (!assignedCategory) {
            assignedCategory = 'Academic Skills';
          }
          
          console.log(`📊 Activity "${activity.title}" assigned to "${assignedCategory}"`);
          
          // Count completion and score - only count completed activities
          if (progressRecord.completionStatus === 'completed') {
            categoryStats[assignedCategory].completed++;
            if (progressRecord.score !== null && progressRecord.score !== undefined) {
              categoryStats[assignedCategory].totalScore += progressRecord.score;
              categoryStats[assignedCategory].scoreCount++;
            }
            console.log(`📊 Counted completion for ${assignedCategory}: now ${categoryStats[assignedCategory].completed} completed`);
          }
        });
      }
    });
    
    // Convert to display format
    return Object.entries(categoryStats).map(([categoryName, stats]) => {
      const categoryInfo = mainCategories[categoryName];
      console.log(`📊 Category: ${categoryName}, Total: ${stats.total}, Completed: ${stats.completed}, Avg Score: ${stats.scoreCount > 0 ? Math.round(stats.totalScore / stats.scoreCount) : 0}`);
      
      return {
        category: categoryName,
        accuracy: stats.scoreCount > 0 ? Math.round(stats.totalScore / stats.scoreCount) : 0,
        completed: `${stats.completed}/${stats.total}`,
        totalActivities: stats.total,
        completedActivities: stats.completed,
        icon: categoryInfo.icon,
        color: categoryInfo.color
      };
    });
  };

  // Calculate difficulty progression from real data
  const calculateDifficultyProgression = () => {
    if (!progressData?.students) {
      console.log('📊 No progress data available for difficulty progression');
      return [];
    }
    
    console.log('📊 Calculating difficulty progression with data:', progressData);
    console.log('📊 Activities for difficulty calculation:', activities);
    
    const difficultyStats = {
      'Beginner': { total: 0, completed: 0 },
      'Intermediate': { total: 0, completed: 0 },
      'Proficient': { total: 0, completed: 0 }
    };

    // Define flashcard activity types
    const flashcardTypes = ['Identification', 'Numbers', 'Colors', 'Academic Puzzles', 'Matching Type', 'Visual Memory Challenge'];

    // Count total activities by difficulty level (only flashcard activities)
    activities.forEach(activity => {
      // Only count flashcard activities
      if (!flashcardTypes.includes(activity.activity_type)) {
        return;
      }
      // Get difficulty from activity object with proper fallbacks
      let difficulty = null;
      
      // Try different possible sources for difficulty
      if (activity.Difficulties?.difficulty) {
        difficulty = activity.Difficulties.difficulty;
      } else if (activity.Difficulties?.name) {
        difficulty = activity.Difficulties.name;
      } else if (activity.difficulty) {
        difficulty = activity.difficulty;
      } else if (activity.difficulty_level) {
        difficulty = activity.difficulty_level;
      } else if (activity.difficulty_name) {
        difficulty = activity.difficulty_name;
      }
      
      // Normalize difficulty names
      if (difficulty) {
        difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      }
      
      // Ensure it's a valid difficulty, default to Beginner
      if (!difficultyStats[difficulty]) {
        difficulty = 'Beginner';
      }
      
      difficultyStats[difficulty].total++;
      console.log(`📊 Activity "${activity.title}" assigned to ${difficulty} difficulty (from: ${activity.Difficulties?.difficulty || activity.difficulty || 'default'})`);
    });

    // Count completed activities by difficulty level - count ALL completions by ALL students
    // Also track unique students per difficulty
    const studentsPerDifficulty = {
      'Beginner': new Set(),
      'Intermediate': new Set(),
      'Proficient': new Set()
    };
    
    progressData.students.forEach(student => {
      if (student.activities) {
        student.activities.forEach(progressRecord => {
          // Count ALL completed activities (including duplicates across students)
          if (progressRecord.completionStatus === 'completed') {
            // Find the activity to check if it's a flashcard type
            const activity = activities.find(act => act.id === progressRecord.activityId);
            if (!activity || !flashcardTypes.includes(activity.activity_type)) {
              return; // Skip non-flashcard activities
            }
            
            // IMPORTANT: Use difficultyId from the progress record (which already contains the difficulty NAME)
            let difficulty = progressRecord.difficultyId;
            
            // If no difficulty in progress record, try to get from activity
            if (!difficulty) {
              if (activity.Difficulties?.difficulty) {
                difficulty = activity.Difficulties.difficulty;
              } else if (activity.Difficulties?.name) {
                difficulty = activity.Difficulties.name;
              } else if (activity.difficulty) {
                difficulty = activity.difficulty;
              }
            }
            
            // Normalize difficulty names
            if (difficulty) {
              difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
            }
            
            // Ensure it's a valid difficulty, default to Beginner
            if (!difficultyStats[difficulty]) {
              difficulty = 'Beginner';
            }
            
            // Count every completion (no Set to prevent counting)
            difficultyStats[difficulty].completed++;
            // Track unique students for this difficulty
            studentsPerDifficulty[difficulty].add(student.studentId);
            console.log(`📊 Counted completion: "${progressRecord.activityTitle}" in ${difficulty} difficulty by student ${student.studentName}`);
          }
        });
      }
    });

    // Calculate total possible completions (activities × students)
    const totalStudents = progressData.students.length;
    Object.keys(difficultyStats).forEach(difficulty => {
      difficultyStats[difficulty].total = difficultyStats[difficulty].total * totalStudents;
      difficultyStats[difficulty].studentCount = studentsPerDifficulty[difficulty].size;
    });

    // Convert to display format
    return Object.entries(difficultyStats).map(([level, stats]) => {
      const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      
      console.log(`📊 Difficulty ${level}: ${stats.completed}/${stats.total} completed (${progressPercentage}%) - ${stats.studentCount} students`);
      
      return {
        level,
        progress: progressPercentage,
        completed: `${stats.studentCount} ${stats.studentCount === 1 ? 'student' : 'students'} completed`,
        totalActivities: stats.total,
        completedActivities: stats.completed,
        studentCount: stats.studentCount,
        icon: level === 'Beginner' ? '🌱' : level === 'Intermediate' ? '🔥' : '💪',
        color: level === 'Beginner' ? 'bg-green-500' : level === 'Intermediate' ? 'bg-orange-500' : 'bg-red-500',
        bgColor: level === 'Beginner' ? 'bg-green-50' : level === 'Intermediate' ? 'bg-orange-50' : 'bg-red-50'
      };
    });
  };

  const calculateLearningCategories = () => {
    if (!progressData?.students) {
      console.log('📊 No progress data available for learning categories');
      return [];
    }
    
    console.log('📊 Calculating learning categories with data:', progressData);
    
    const totalStudents = progressData.students.length;
    
    const categoryStats = {
      'Academic Skills': { studentsCompleted: new Set(), icon: '📚', color: 'bg-blue-500' },
      'Daily Life Skills': { studentsCompleted: new Set(), icon: '🏠', color: 'bg-orange-500' }
    };
    
    // Track which students have completed activities in each category
    progressData.students.forEach(student => {
      console.log('📊 Processing student:', student.studentName);
      if (student.activities) {
        student.activities.forEach(progressRecord => {
          // Only count completed activities
          if (progressRecord.completionStatus === 'completed') {
            // Find the activity this progress belongs to
            const activity = activities.find(act => act.id === progressRecord.activityId);
            if (!activity) {
              return;
            }
            
            const activityCategory = (activity.Categories?.category_name || activity.category || '').toLowerCase();
            
            // Determine category assignment
            if (activityCategory.includes('academic')) {
              categoryStats['Academic Skills'].studentsCompleted.add(student.studentId);
              console.log(`📊 Student ${student.studentName} completed Academic Skills activity`);
            } else if (activityCategory.includes('social') || activityCategory.includes('daily') || activityCategory.includes('life')) {
              categoryStats['Daily Life Skills'].studentsCompleted.add(student.studentId);
              console.log(`📊 Student ${student.studentName} completed Daily Life Skills activity`);
            }
          }
        });
      }
    });
    
    // Convert to display format
    return Object.entries(categoryStats).map(([categoryName, stats]) => {
      const studentsCount = stats.studentsCompleted.size;
      const progressPercentage = totalStudents > 0 ? Math.round((studentsCount / totalStudents) * 100) : 0;
      
      console.log(`📊 Category ${categoryName}: ${studentsCount} students (${progressPercentage}%)`);
      
      return {
        name: categoryName,
        percent: progressPercentage,
        studentsCount: studentsCount,
        totalStudents: totalStudents,
        icon: stats.icon,
        color: stats.color
      };
    });
  };

  const difficultyProgression = loading ? [] : calculateDifficultyProgression();
  const categories = loading ? [] : calculateLearningCategories();

  // Get recent activities from real data
  const getRecentActivities = () => {
    if (!progressData?.students) return [];
    
    const recentActivities = [];
    progressData.students.forEach(student => {
      if (student.activities && student.activities.length > 0) {
        // Process ALL activities from each student, not just first 2
        student.activities.forEach(activity => {
          // Check if this is a Social/Daily Life Skills activity
          const categoryName = (activity.categoryId || activity.categoryName || '').toLowerCase();
          const activityTitle = (activity.activityTitle || '').toLowerCase();
          
          // Known Social/Daily Life activity names
          const socialDailyLifeActivities = [
            'hygiene hero',
            'cashier game',
            'safe street crossing',
            'social greetings',
            'household chores helper',
            'money value game',
            'chores helper',
            'tooth brushing'
          ];
          
          // Robust check for Social/Daily Life Skill or missing difficulty
          const isSocialDailyLife = categoryName.includes('social') || 
                                     categoryName.includes('daily') || 
                                     categoryName.includes('life') ||
                                     socialDailyLifeActivities.some(s => activityTitle === s || activityTitle.startsWith(s + ' -')) ||
                                     !activity.difficultyId ||
                                     activity.difficultyId === null ||
                                     activity.difficultyId === undefined;
          
          // Determine difficulty display
          let difficultyDisplay;
          let difficultyColor;
          
          if (isSocialDailyLife) {
            // Social/Daily Life Skills activities show "Game"
            difficultyDisplay = 'Game';
            difficultyColor = 'bg-purple-100 text-purple-800';
          } else if (activity.difficultyId) {
            // Academic activities show actual difficulty level
            difficultyDisplay = activity.difficultyId;
            difficultyColor = activity.difficultyId === 'Beginner' ? 'bg-green-100 text-green-800' :
                            activity.difficultyId === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            activity.difficultyId === 'Proficient' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'; // default to Beginner color
          } else {
            // Fallback for activities without difficulty
            difficultyDisplay = 'Game';
            difficultyColor = 'bg-purple-100 text-purple-800';
          }

          recentActivities.push({
            title: activity.activityTitle || 'Unknown Activity',
            user: student.studentName || 'Unknown Student',
            category: categoryName || 'Other',
            time: new Date(activity.dateCompleted).toLocaleString(),
            dateCompleted: activity.dateCompleted, // Keep raw date for sorting
            difficulty: difficultyDisplay,
            score: activity.score ? `${Math.min(100, activity.score)}%` : 'No score',
            difficultyColor: difficultyColor,
            avatar: (student.student?.user_profiles?.username || student.studentName || 'U').substring(0, 2).toUpperCase()
          });
        });
      }
    });
    
    // Sort by date (most recent first) and return the 6 most recent activities
    return recentActivities
      .sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))
      .slice(0, 6);
  };

  const recentActivitiesData = loading ? [] : getRecentActivities();

  const navigate = useNavigate();
  const milestones = [
    {
      title: 'First Steps',
      description: 'Complete first 3 activities',
      percent: 100,
      color: 'bg-green-500',
      completed: true,
    },
    {
      title: 'Academic Explorer',
      description: 'Try all 5 academic activity types',
      percent: 85,
      color: 'bg-blue-500',
      completed: false,
    },
    {
      title: 'Daily Life Champion',
      description: 'Complete all 5 daily life activities',
      percent: 60,
      color: 'bg-orange-500',
      completed: false,
    },
    {
      title: 'System Master',
      description: 'Complete all 20 available activities',
      percent: 45,
      color: 'bg-purple-500',
      completed: false,
    },
  ];

  // Calculate dynamic badges based on real progress data and student badges
  const calculateDynamicBadges = () => {
    if (!allBadges || allBadges.length === 0) {
      console.log('🏆 No badges available');
      return [];
    }

    console.log('🏆 Calculating dynamic badges with data:', {
      allBadges: allBadges.length,
      progressData,
      studentBadgesData
    });

    // Calculate system-wide badge statistics
    let totalActivities = 0;
    let totalStudents = progressData?.students?.length || 0;
    let academicActivities = 0;
    let colorActivities = 0;
    let shapeActivities = 0;
    let numberActivities = 0;
    let dailyLifeActivities = 0;
    let categoriesCompleted = new Set();
    let studentsWithMultipleDays = 0;
    let highScorers = 0;
    let perfectScorers = 0;
    let matchingActivities = 0;

    // Count earned badges across all students
    const earnedBadgesByType = {};
    Object.values(studentBadgesData).forEach(studentBadges => {
      studentBadges.forEach(badge => {
        earnedBadgesByType[badge.badge_name] = (earnedBadgesByType[badge.badge_name] || 0) + 1;
      });
    });

    if (progressData?.students) {
      progressData.students.forEach(student => {
        if (student.progress && student.progress.length > 0) {
          totalActivities += student.progress.length;
          
          student.progress.forEach(activity => {
            // Count activities by category and type
            const category = activity.category?.toLowerCase() || '';
            const title = activity.activityTitle?.toLowerCase() || '';
            categoriesCompleted.add(category);
            
            if (category.includes('academic') || category.includes('math') || category.includes('reading')) {
              academicActivities++;
            }
            if (category.includes('color') || title.includes('color')) {
              colorActivities++;
            }
            if (category.includes('shape') || title.includes('shape')) {
              shapeActivities++;
            }
            if (category.includes('number') || title.includes('number')) {
              numberActivities++;
            }
            if (category.includes('daily') || category.includes('life') || category.includes('social')) {
              dailyLifeActivities++;
            }
            if (title.includes('match') || category.includes('match')) {
              matchingActivities++;
            }
            
            // Count high scorers and perfect scorers
            if (activity.score >= 80) {
              highScorers++;
            }
            if (activity.score >= 100) {
              perfectScorers++;
            }
          });

          // Check for multi-day activity (simplified)
          if (student.progress.length > 1) {
            studentsWithMultipleDays++;
          }
        }
      });
    }

      // Map badges to display format with actual student earned status
    const badgesDisplay = allBadges.map(badge => {
      // Count how many students have earned this badge
      let studentsWithThisBadge = 0;
      let totalStudents = students.length;
      
      Object.values(studentBadgesData).forEach(studentBadges => {
        if (studentBadges.some(sb => sb.badge_id === badge.id)) {
          studentsWithThisBadge++;
        }
      });

      // Badge is considered "earned" if at least one student has it
      const status = studentsWithThisBadge > 0 ? 'EARNED' : 'LOCKED';
      const description = `${studentsWithThisBadge}/${totalStudents} students earned this badge`;

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
        description,
        status,
        color,
        bgColor,
        animation
      };
    });

    // Sort badges: earned badges first, then locked badges
    const sortedBadges = badgesDisplay.sort((a, b) => {
      if (a.status === 'EARNED' && b.status === 'LOCKED') return -1;
      if (a.status === 'LOCKED' && b.status === 'EARNED') return 1;
      return 0;
    });

    console.log('🏆 Calculated badges display:', sortedBadges);
    return sortedBadges;
  };

  const badges = loading ? [] : calculateDynamicBadges();

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
              <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center space-x-4">
              <img
                  src="/assets/logo.png"
                  alt="AutiSync Logo"
                  className="w-16 h-16 object-contain"
                />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync v2.0
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
                    <a href="/pending-accounts" className="text-gray-600 text-lg hover:text-blue-600 font-semibold transition-colors flex items-center">
                      Pending Accounts
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

        {/* OVERALL STUDENTS PROGRESS DASHBOARD */}
        <div className="max-w-full mx-auto sm:px-6  py-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
              <p className="text-lg text-gray-600">Monitor student progress and activity analytics</p>
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              <button
                onClick={() => navigate('/admin/students')}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <UsersIcon className="w-5 h-5" />
                <span>Manage Students</span>
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="text-lg text-gray-600">Loading metrics...</div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <div className="text-lg text-red-600">{error}</div>
            </div>
          ) : (
            calculatedMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className={`${metric.bgColor} rounded-xl p-3 w-fit mb-4`}>
                  {metric.icon}
                </div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{metric.title}</p>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{metric.value}</h2>
                <p className="text-sm text-green-600 font-medium">{metric.change}</p>
              </div>
            ))
          )}
        </div>

        {/* Recent Activities - Full Width */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-4 text-gray-600">Loading recent activities...</div>
              ) : recentActivitiesData.length === 0 ? (
                <div className="col-span-full text-center py-4 text-gray-600">No recent activities found</div>
              ) : (
                recentActivitiesData.map((activity, i) => (
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
                          {activity.user} • {activity.time}
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
              ))
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
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <span className="font-semibold text-gray-700">{cat.name}</span>
                        <p className="text-sm text-gray-500">
                          {cat.studentsCount} {cat.studentsCount === 1 ? 'student' : 'students'} completed activities
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{cat.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${cat.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
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

       

        {/* Bottom Section */}
        <div className="grid  xl:grid-cols-1 gap-8">
         

          {/* Badges */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Achievements & Badges</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.values(studentBadgesData).reduce((total, badges) => total + (badges ? badges.length : 0), 0)} total badges earned by all students
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {badges.filter(b => b.status === 'EARNED').length} / {badges.length} Badge Types Awarded
                </span>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-5 gap-4">
              {badges.map((badge, index) => (
                <div 
                  key={index}
                  className={`card-autism-friendly ${badge.bgColor} p-4 rounded-2xl text-center relative overflow-hidden border-2 ${
                    badge.status === 'EARNED' 
                      ? 'border-green-200 shadow-lg transform hover:scale-105 transition-all duration-300' 
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
                  
                  <p className="text-xs text-gray-600 mb-3 leading-tight">
                    {badge.description}
                  </p>
                  
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
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
        </div>
    </div>
  );
};

export default Tracking;
