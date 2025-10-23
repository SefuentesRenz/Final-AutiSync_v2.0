import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, MagnifyingGlassIcon, FunnelIcon, UsersIcon, CheckCircleIcon, UserIcon, ArrowLeftIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { supabase } from '../lib/supabase';
import { getStudentProgressStats } from '../lib/progressApi';

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'individual'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching students from database...');
      
      // First, get ALL male profiles to see what we should have
      const { data: allMaleProfiles, error: allMaleError } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('gender', 'male');
        
      if (!allMaleError && allMaleProfiles) {
        console.log('🔍 ALL MALE PROFILES IN DATABASE:', allMaleProfiles.length);
        allMaleProfiles.forEach(profile => {
          console.log(`  - ${profile.full_name} (ID: ${profile.id}, User ID: ${profile.user_id})`);
        });
      }
      
      // Now get all user_profiles directly since we removed the students table
      const { data: studentsData, error: studentsError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (studentsError) {
        console.error('Error fetching user profiles:', studentsError);
        setError('Failed to load students: ' + studentsError.message);
        setStudents(getFallbackStudents());
        return;
      }
      
      if (!studentsData || studentsData.length === 0) {
        console.log('No user profiles found in database, using fallback data');
        setStudents(getFallbackStudents());
        return;
      }
      
      console.log('User profiles data:', studentsData);
      
      // Transform user_profiles to student format expected by the UI
      const transformedStudents = await Promise.all(studentsData.map(async (profile, index) => {
        
        // Get real progress data for each student using their user_id
        let progressStats = null;
        let lastActivityTime = 'No recent activity';
        
        try {
          console.log(`Fetching progress for student: ${profile?.full_name} (${profile.user_id})`);
          
          // Get recent progress directly from user_activity_progress table
          const { data: recentProgress, error: progressError } = await supabase
            .from('user_activity_progress')
            .select('*')
            .eq('user_id', profile.user_id) // Now using user_id directly
            .order('date_completed', { ascending: false })
            .limit(20);

          if (!progressError && recentProgress && recentProgress.length > 0) {
            console.log(`Found ${recentProgress.length} activities for ${profile?.full_name}`);
            
            const completedActivities = recentProgress.length;
            const totalScore = recentProgress.reduce((sum, activity) => sum + (activity.score || 0), 0);
            const averageScore = completedActivities > 0 ? Math.round(totalScore / completedActivities) : 0;
            
            // Get last activity time
            const lastActivity = recentProgress[0];
            const lastDate = new Date(lastActivity.date_completed);
            const now = new Date();
            const diffInHours = Math.floor((now - lastDate) / (1000 * 60 * 60));
            
            if (diffInHours < 1) {
              lastActivityTime = 'Just now';
            } else if (diffInHours < 24) {
              lastActivityTime = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            } else {
              const diffInDays = Math.floor(diffInHours / 24);
              lastActivityTime = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
            }
            
            progressStats = {
              completedActivities,
              averageScore,
              lastActivityTime
            };
          } else {
            console.log(`No activities found for ${profile?.full_name}`);
          }
        } catch (err) {
          console.log('Could not fetch progress for student:', profile?.full_name, err);
        }
        
        return {
          id: profile.user_id, // Now using user_id as the main ID
          profileId: profile.user_id, // Use the auth user ID for navigation
          profileUUID: profile.user_id, // Same as profileId since we removed students table
          name: profile?.full_name || 'Unknown Student',
          age: profile?.age || 0,
          address: profile?.address || 'No address provided',
          gender: profile?.gender || 'Not specified',
          email: profile?.email || '',
          phone: profile?.phone_number || '',
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          status: 'Active',
          completedActivities: progressStats?.completedActivities || 0,
          averageScore: progressStats?.averageScore || 0,
          lastActive: progressStats?.lastActivityTime || lastActivityTime,
          profileColor: ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'][index % 5]
        };
      }));
      
      console.log('Transformed students:', transformedStudents);
      
      // Debug male students in the final data
      const maleStudents = transformedStudents.filter(s => s.gender && s.gender.toLowerCase() === 'male');
      console.log(`👨 TOTAL MALE STUDENTS LOADED: ${maleStudents.length}`);
      maleStudents.forEach(student => {
        console.log(`  - ${student.name} (Gender: "${student.gender}", Activities: ${student.completedActivities}, Score: ${student.averageScore}%, Last: ${student.lastActive})`);
      });
      
      // Check for the specific students mentioned
      const targetNames = ['isaiah', 'kobe', 'xaian', 'gi'];
      console.log('🎯 Checking for target students:');
      targetNames.forEach(name => {
        const found = transformedStudents.find(s => 
          s.name && s.name.toLowerCase().includes(name.toLowerCase())
        );
        if (found) {
          console.log(`  ${name}: ✅ Found - ${found.name} (${found.gender}) - Activities: ${found.completedActivities}, Score: ${found.averageScore}%, Last: ${found.lastActive}`);
        } else {
          console.log(`  ${name}: ✖ NOT FOUND`);
        }
      });
      
      // Debug students with vs without progress
      const studentsWithProgress = transformedStudents.filter(s => s.completedActivities > 0);
      const studentsWithoutProgress = transformedStudents.filter(s => s.completedActivities === 0);
      console.log(`📊 Students with progress: ${studentsWithProgress.length}, without progress: ${studentsWithoutProgress.length}`);
      
      // Debug gender counting to match the UI counters
      const maleCount = transformedStudents.filter(s => s.gender && s.gender.toLowerCase() === 'male').length;
      const femaleCount = transformedStudents.filter(s => s.gender && s.gender.toLowerCase() === 'female').length;
      console.log(`📊 GENDER COUNTS: Male: ${maleCount}, Female: ${femaleCount}`);
      
      setStudents(transformedStudents);
    } catch (err) {
      console.error('Error in fetchStudents:', err);
      setError('Failed to load students: ' + err.message);
      setStudents(getFallbackStudents());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackStudents = () => [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      address: '123 Main St, Springfield, IL',
      gender: 'Female',
      joinDate: '2024-01-15',
      status: 'Active',
      completedActivities: 24,
      averageScore: 87,
      lastActive: '2 hours ago',
      profileColor: 'bg-pink-500'
    },
    {
      id: 2,
      name: 'Liam Smith',
      age: 7,
      address: '456 Oak Ave, Springfield, IL',
      gender: 'Male',
      joinDate: '2024-02-20',
      status: 'Active',
      completedActivities: 18,
      averageScore: 92,
      lastActive: '1 hour ago',
      profileColor: 'bg-blue-500'
    }
  ];

  // Individual student data structure - similar to what was in Tracking.jsx
  const individualStudentData = {
    metrics: [
      {
        title: 'Activities Completed',
        value: '24',
        change: '+3 this week',
        icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
        bgColor: 'bg-green-100',
      },
      {
        title: 'Average Score',
        value: '87%',
        change: '+5% improvement',
        icon: <AcademicCapIcon className="w-8 h-8 text-white" />,
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Current Streak',
        value: '12 days',
        change: 'Best this month',
        icon: <FireIcon className="w-8 h-8 text-white" />,
        bgColor: 'bg-orange-100',
      },
      {
        title: 'Badges Earned',
        value: '8',
        change: '+2 new badges',
        icon: <StarIcon className="w-8 h-8 text-white" />,
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Time Spent',
        value: '2.5h',
        change: 'Today',
        icon: <UsersIcon className="w-8 h-8 text-white" />,
        bgColor: 'bg-pink-100',
      }
    ],
    categories: [
      {
        name: 'Numbers & Counting',
        accuracy: 92,
        total: 8,
        change: '+5%',
        icon: '🔢',
        color: 'bg-blue-100'
      },
      {
        name: 'Letters & Reading',
        accuracy: 88,
        total: 6,
        change: '+3%',
        icon: '📚',
        color: 'bg-green-100'
      },
      {
        name: 'Colors & Shapes',
        accuracy: 95,
        total: 5,
        change: '+2%',
        icon: '🎨',
        color: 'bg-purple-100'
      },
      {
        name: 'Social Skills',
        accuracy: 81,
        total: 4,
        change: '+7%',
        icon: '👨',
        color: 'bg-yellow-100'
      }
    ],
    recentActivities: [
      {
        activity: 'Count to 10',
        category: 'Numbers',
        score: 95,
        time: '2 hours ago',
        duration: '3 min',
        icon: '🔢',
        bgColor: 'bg-blue-100'
      },
      {
        activity: 'Color Recognition',
        category: 'Visual',
        score: 88,
        time: '4 hours ago',
        duration: '2 min',
        icon: '🎨',
        bgColor: 'bg-purple-100'
      },
      {
        activity: 'Letter Matching',
        category: 'Reading',
        score: 92,
        time: '6 hours ago',
        duration: '4 min',
        icon: '📚',
        bgColor: 'bg-green-100'
      },
      {
        activity: 'Shape Sorting',
        category: 'Logic',
        score: 87,
        time: '8 hours ago',
        duration: '5 min',
        icon: '🔺',
        bgColor: 'bg-orange-100'
      }
    ],
    difficultyProgression: [
      {
        level: 'Beginner',
        completed: 18,
        total: 20,
        avgScore: 94,
        timeSpent: '45 min',
        color: 'bg-green-500'
      },
      {
        level: 'Intermediate',
        completed: 6,
        total: 15,
        avgScore: 87,
        timeSpent: '32 min',
        color: 'bg-yellow-500'
      },
      {
        level: 'Hard',
        completed: 0,
        total: 10,
        avgScore: 0,
        timeSpent: '0 min',
        color: 'bg-red-500'
      }
    ],
    badges: [
      {
        name: 'First Steps',
        description: 'Complete first activity',
        icon: '👶',
        status: 'EARNED',
        bgColor: 'bg-yellow-100'
      },
      {
        name: 'Number Master',
        description: 'Excel at counting',
        icon: '🔢',
        status: 'EARNED',
        bgColor: 'bg-blue-100'
      },
      {
        name: 'Color Expert',
        description: 'Master color recognition',
        icon: '🎨',
        status: 'EARNED',
        bgColor: 'bg-purple-100'
      },
      {
        name: 'Speed Learner',
        description: 'Complete 5 activities in one day',
        icon: '⚡',
        status: 'IN_PROGRESS',
        progress: 60,
        bgColor: 'bg-orange-100'
      },
      {
        name: 'Reading Star',
        description: 'Complete 10 reading activities',
        icon: '⭐',
        status: 'LOCKED',
        progress: 30,
        bgColor: 'bg-green-100'
      },
      {
        name: 'Consistency King',
        description: 'Login 7 days in a row',
        icon: '👑',
        status: 'LOCKED',
        progress: 15,
        bgColor: 'bg-red-100'
      }
    ]
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter;
    const matchesGender = genderFilter === 'all' || student.gender.toLowerCase() === genderFilter;
    
    // Debug male students specifically
    if (genderFilter === 'male') {
      console.log(`🔍 Filtering student: ${student.name}`);
      console.log(`  - Gender: "${student.gender}" (lowercase: "${student.gender.toLowerCase()}")`);
      console.log(`  - Matches gender filter: ${matchesGender}`);
      console.log(`  - Final result: ${matchesSearch && matchesStatus && matchesGender}`);
    }
    
    return matchesSearch && matchesStatus && matchesGender;
  });
  
  // Debug final filtered results
  if (genderFilter === 'male') {
    console.log(`📊 MALE FILTER RESULTS: Found ${filteredStudents.length} male students:`);
    filteredStudents.forEach(student => {
      console.log(`  - ${student.name} (Gender: "${student.gender}")`);
    });
  }

  const handleBackToDashboard = () => {
    navigate('/tracking');
  };

  const AdminProfile = (e) => {
    e.preventDefault();
    navigate("/adminprofile");
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const viewStudentProgress = (student) => {
    // Use the profile UUID for navigation to match the user_activity_progress student_id
    const studentUUID = student.profileId || student.id;
    navigate(`/admin/student-progress/${studentUUID}`);
  };

  const backToStudentList = () => {
    setSelectedStudent(null);
    setViewMode('list');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {viewMode === 'list' ? (
        // STUDENT LIST VIEW
        <>
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

      <div className="max-w-full mx-auto sm:px-6  py-4">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Management</h1>
            <p className="text-lg text-gray-600">Monitor and support student learning journeys</p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.status === 'Active').length}
                </p>
               
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-pink-100 p-3 rounded-xl">
                <UserIcon className="w-8 h-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Female Students</p>
                <p className="text-3xl font-bold text-pink-600">
                  {students.filter(s => s.gender && s.gender.toLowerCase() === 'female').length}
                </p>
                
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Male Students</p>
                <p className="text-3xl font-bold text-blue-600">
                  {students.filter(s => s.gender && s.gender.toLowerCase() === 'male').length}
                </p>
                
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Students Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading students...</h3>
              <p className="text-gray-500">Please wait while we fetch student data</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`${student.profileColor} text-white w-16 h-16 flex items-center justify-center rounded-2xl text-xl font-bold`}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">Student ID: #{student.id}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Age:</span>
                    <span className="text-sm font-medium text-gray-700">{student.age} years old</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Gender:</span>
                    <span className="text-sm font-medium text-gray-700">{student.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Activities:</span>
                    <span className="text-sm font-medium text-blue-600">{student.completedActivities} completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Avg Score:</span>
                    <span className={`text-sm font-bold ${getScoreColor(student.averageScore)}`}>
                      {student.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Active:</span>
                    <span className="text-sm font-medium text-gray-700">{student.lastActive}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 mb-3">📍 {student.address}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewStudentProgress(student)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View Progress
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
        </>
      ) : (
        // INDIVIDUAL STUDENT VIEW
        <div className="max-w-full mx-auto sm:px-6 py-4">
          {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
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
        
          {/* Student Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <button
                onClick={backToStudentList}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-2 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Students List</span>
              </button>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {selectedStudent?.name}'s Progress
              </h1>
              <p className="text-lg text-gray-600">
                Detailed analytics for {selectedStudent?.name} ΓÇó Age {selectedStudent?.age}
              </p>
            </div>
            
            <div className={`w-16 h-16 rounded-full ${selectedStudent?.profileColor} flex items-center justify-center text-white text-2xl`}>
              {selectedStudent?.name?.charAt(0)}
            </div>
          </div>

          {/* Metrics Cards for Individual Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {individualStudentData.metrics.map((metric, index) => (
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

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Accuracy by Category */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Accuracy by Category</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="space-y-4">
                {individualStudentData.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`${category.color} p-2 rounded-lg`}>
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.total} activities</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{category.accuracy}%</p>
                      <p className="text-sm text-green-600 font-medium">{category.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Activities</h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <div className="space-y-4">
                {individualStudentData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`${activity.bgColor} p-2 rounded-lg`}>
                        <span className="text-xl">{activity.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{activity.activity}</p>
                        <p className="text-sm text-gray-500">{activity.category} ΓÇó {activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${activity.score >= 80 ? 'text-green-600' : activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {activity.score}%
                      </p>
                      <p className="text-sm text-gray-500">{activity.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Progression and Badges */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Difficulty Progression</h3>
                <div className="bg-orange-100 p-2 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="space-y-4">
                {individualStudentData.difficultyProgression.map((level, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{level.level}</span>
                      <span className="text-sm text-gray-500">{level.completed}/{level.total} activities</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${level.color}`}
                        style={{ width: `${(level.completed / level.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average Score: {level.avgScore}%</span>
                      <span className="text-gray-600">Time Spent: {level.timeSpent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Achievements & Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Achievements</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {individualStudentData.badges.map((badge, index) => (
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
                      <div className="absolute top-1 right-1">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ✅
                        </span>
                      </div>
                    )}
                    
                    {/* Badge icon */}
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    
                    {/* Badge name */}
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{badge.name}</h4>
                    
                    {/* Badge description */}
                    <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                    
                    {/* Progress for locked badges */}
                    {badge.status === 'LOCKED' && badge.progress && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{badge.progress}% complete</p>
                      </div>
                    )}
                    
                    {/* Sparkle effect for earned badges */}
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
      )}
    </div>
  );
};

export default Students;
