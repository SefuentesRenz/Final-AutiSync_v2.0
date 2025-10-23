import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllBadges, getStudentBadges } from '../lib/badgesApi';
import { supabase } from '../lib/supabase';

const StudentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(4);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
        } else if (profile) {
          console.log('👤 User profile loaded:', profile);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Fetch streak data from streaks table
  useEffect(() => {
    const fetchStreakData = async () => {
      if (!user?.id) return;
      
      try {
        const { data: streak, error } = await supabase
          .from('streaks')
          .select('current_streak, longest_streak, last_active_date')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching streak data:', error);
        } else if (streak) {
          console.log('🔥 Streak data loaded:', streak);
          console.log('🔥 Current streak from database:', streak.current_streak);
          setStreakData(streak);
        }
      } catch (error) {
        console.error('Error fetching streak data:', error);
      }
    };

    fetchStreakData();
  }, [user?.id]);

  // Fetch badges data
  useEffect(() => {
    const fetchBadgesData = async () => {
      if (!user?.id) {
        console.log('No user ID available:', user);
        return;
      }
      
      console.log('Current user object:', user);
      console.log('Using user ID for badges:', user.id);
      
      setLoading(true);
      try {
        // Since badges table has permission issues, let's get all available badges 
        // from student_badges and create a comprehensive badge list
        const [allBadgesResult, studentBadgesResult] = await Promise.all([
          getAllBadges(),
          getStudentBadges(user.id)
        ]);

        console.log('All badges result:', allBadgesResult);
        console.log('Student badges result:', studentBadgesResult);

        // If getAllBadges fails but we have student badges, use student badges as base
        const earnedBadges = studentBadgesResult.data || [];
        console.log('Earned badges data:', earnedBadges);
        console.log('Number of badges earned:', earnedBadges.length);

        let allBadges = allBadgesResult.data || [];
        
        // If no badges from badges table, create a comprehensive list from known badges
        if (allBadges.length === 0) {
          console.log('🏆 No badges from badges table, creating comprehensive badge list...');
          allBadges = [
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
        
        const earnedBadgeIds = earnedBadges.map(eb => eb.badge_id);
        console.log('Earned badge IDs:', earnedBadgeIds);

        // Map badges with earned status and UI properties
        const mappedBadges = allBadges.map(badge => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          
          // Map badge properties to UI format
          const iconMap = {
            'First Step': '⭐',
            'Perfect Scorer': '💯',
            'Academic Star': '📖',
            'Color Master': '🎨',
            'Match Finder': '🧩',
            'Shape Explorer': '🔷',
            'Number Ninja': '🔢',
            'Consistency Champ': '📅',
            'High Achiever': '🏆',
            'Daily Life Hero': '🏠',
            'All-Rounder': '🌟'
          };

          const colorMap = {
            'First Step': 'from-yellow-400 to-yellow-600',
            'Perfect Scorer': 'from-green-400 to-green-600',
            'Academic Star': 'from-blue-400 to-blue-600',
            'Color Master': 'from-purple-400 to-purple-600',
            'Match Finder': 'from-pink-400 to-pink-600',
            'Shape Explorer': 'from-blue-400 to-indigo-600',
            'Number Ninja': 'from-green-400 to-green-600',
            'Consistency Champ': 'from-orange-400 to-orange-600',
            'High Achiever': 'from-red-400 to-red-600',
            'Daily Life Hero': 'from-teal-400 to-teal-600',
            'All-Rounder': 'from-gradient-to-r from-purple-400 to-pink-600'
          };

          const bgColorMap = {
            'First Step': 'bg-yellow-50',
            'Perfect Scorer': 'bg-green-50',
            'Academic Star': 'bg-blue-50',
            'Color Master': 'bg-purple-50',
            'Match Finder': 'bg-pink-50',
            'Shape Explorer': 'bg-blue-50',
            'Number Ninja': 'bg-green-50',
            'Consistency Champ': 'bg-orange-50',
            'High Achiever': 'bg-red-50',
            'Daily Life Hero': 'bg-teal-50',
            'All-Rounder': 'bg-purple-50'
          };

          const animationMap = {
            'First Step': 'animate-bounce-gentle',
            'Perfect Scorer': 'animate-pulse-gentle',
            'Academic Star': 'animate-pulse-gentle',
            'Color Master': 'animate-bounce-gentle',
            'Match Finder': 'animate-wiggle',
            'Shape Explorer': 'animate-float',
            'Number Ninja': 'animate-wiggle',
            'Consistency Champ': 'animate-pulse-gentle',
            'High Achiever': 'animate-bounce-gentle',
            'Daily Life Hero': 'animate-float-delayed',
            'All-Rounder': 'animate-float'
          };

          return {
            icon: iconMap[badge.title] || '🏆',
            title: badge.title,
            description: badge.description,
            status: isEarned ? 'EARNED' : 'LOCKED',
            color: isEarned ? (colorMap[badge.title] || 'from-blue-400 to-blue-600') : 'from-gray-400 to-gray-500',
            bgColor: isEarned ? (bgColorMap[badge.title] || 'bg-blue-50') : 'bg-gray-50',
            animation: isEarned ? (animationMap[badge.title] || 'animate-pulse-gentle') : ''
          };
        });

        setBadges(mappedBadges);
      } catch (error) {
        console.error('Error fetching badges data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgesData();
  }, [user?.id]);

  const flashcardspage = (e) => {
    e.preventDefault();
    navigate("/flashcardspage");
  };

  const goToProfile = () => {
    navigate('/studentprofile');
  };

  const motivationalMessages = [
    "You're amazing! 🎨",
    "Keep going! 🚀",
    "You're doing great! 🌟",
    "You're a star! ⭐",
    "Super job! 🎯"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-black/80 shadow-sm h-18 ">
  <div className="container mx-auto px-3 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
              <img
                  src="/assets/logo.png"
                  alt="AutiSync Logo"
                  className="w-16 h-16 object-contain"
                />
              
            </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutiSync
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/home" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Home
              </a>
              <a href="/flashcardspage" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Activities
              </a>
              <a href="/studentpage" className="text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Learning Hub
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 font-medium">
                {currentTime.toLocaleTimeString()}
              </div>
              <div 
                onClick={goToProfile}
                className="cursor-pointer group flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-2 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src="/assets/kidprofile1.jpg"
                  alt="Profile"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <span className="hidden sm:block text-sm font-semibold text-gray-700">
                  {user?.user_metadata?.username || user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <div className="relative z-10 h-48 sm:h-64 overflow-hidden">
        <img
          src="/assets/bg_cover.png"
          alt="Learning Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready for Today's Adventure? 🚀</h2>
          <p className="text-lg opacity-90">{motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}</p>
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome & Streak Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Welcome Card */}
            <div className="card-autism-friendly bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3 animate-wiggle">👋</span>
                <div className="flex">
                  <h2 className="text-2xl font-bold pt-1 text-gray-800">Welcome, </h2>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {user?.user_metadata?.username || user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                These are all your rewards and achievements! You're doing amazing work! 🎨
              </p>
              
            </div>  

            {/* Streak Card */}
            <div className="card-autism-friendly bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-2xl border-2 border-orange-200/50 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between -mb-3 -mt-3">
                  <div className="-mt-5">
                    <span className="text-6xl font-bold text-orange-600">
                      {streakData ? streakData.current_streak : streakDays}
                    </span>
                    <span className="text-4xl font-bold text-gray-800 ml-2">
                      day Streak!
                    </span>
                  </div>
                  <div className="flex items-center justify-center animate-bounce-gentle">
                    <img 
                      src="/assets/firesticker.png" 
                      alt="Streak" 
                      className="w-28 h-28 relative right-10 object-contain -mt-2" 
                      style={{ 
                        mixBlendMode: 'multiply',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                      }}
                    />
                  </div>
                </div>
                <p className="text-gray-600 font-medium -mt-5">
                  You're doing Great, Keep Going! 🌟
                </p>
                
                {/* Progress bar */}
                <div className="mt-4 w-full bg-orange-200/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full animate-progress-fill"
                    style={{width: `${((streakData ? streakData.current_streak : streakDays) / 7) * 100}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{streakData ? streakData.current_streak : streakDays}/7 days to Perfect Week badge!</p>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="lg:col-span-2">
            <div className=" bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="text-4xl mr-3 animate-float">🏆</span>
                    Your Amazing Badges
                  </h2>
                  
                </div>
                <button 
                  onClick={flashcardspage} 
                  className="cursor-pointer btn-autism-friendly bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <span className="mr-2">🎯</span>
                  Collect More Badges!
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-2xl animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : (
                  badges.map((badge, index) => (
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
                          <span className="text-green-500 text-lg animate-bounce-in">🌱</span>
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 bg-gradient-to-r ${badge.color} rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl text-white shadow-lg ${badge.animation}`}>
                        {badge.icon}
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
                  ))
                )}
              </div>

              {/* Progress summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">Progress Summary</h4>
                    <p className="text-sm text-gray-600">
                      {loading ? (
                        "Loading badges..."
                      ) : (
                        `You've earned ${badges.filter(b => b.status === 'EARNED').length} out of ${badges.length} badges!`
                      )}
                    </p>
                  </div>
                  <div className="text-3xl animate-bounce-gentle">
                    🎯
                  </div>
                </div>
                {!loading && (
                  <div className="mt-2 w-full bg-blue-200/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-progress-fill"
                      style={{width: `${badges.length > 0 ? (badges.filter(b => b.status === 'EARNED').length / badges.length) * 100 : 0}%`}}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
            <div className="flex justify-around">
              <a href="/studentpage" className="flex flex-col items-center p-2 text-blue-600">
                <span className="text-2xl mb-1">🏠</span>
                <span className="text-xs font-semibold">Home</span>
              </a>
              <a href="/flashcardspage" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                <span className="text-2xl mb-1">🎯</span>
                <span className="text-xs font-semibold">Activity</span>
              </a>
              <a href="/expression-debug" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
                <span className="text-2xl mb-1">😊</span>
                <span className="text-xs font-semibold">Expression</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPage;
