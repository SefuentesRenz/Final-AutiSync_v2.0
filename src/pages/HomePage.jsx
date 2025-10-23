import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import StudentCharacter from '../components/StudentCharacter';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';


const Emotions = [
  { name: "Happy", image: "/assets/happy.png", color: "from-yellow-400 to-orange-500", bgColor: "bg-yellow-50" },
  { name: "Sad", image: "/assets/sad.png", color: "from-blue-400 to-blue-600", bgColor: "bg-blue-50" },
  { name: "Upset", image: "/assets/Upset.jpg", color: "from-red-400 to-red-600", bgColor: "bg-red-50" },
  { name: "Excited", image: "/assets/excited.png", color: "from-purple-400 to-pink-500", bgColor: "bg-purple-50" },
  { name: "Tired", image: "/assets/tired.jpg", color: "from-green-400 to-teal-500", bgColor: "bg-green-50" },
];

const HomePage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [emotionNote, setEmotionNote] = useState("");
  const [expressions, setExpressions] = useState([
    { emotion: "Happy", image: "/assets/happy.png", time: "2 hours ago", userName: "Emma" },
    { emotion: "Tired", image: "/assets/tired.jpg", time: "5 hours ago", userName: "Alex" },
    { emotion: "Excited",  image: "/assets/excited.png", time: "Yesterday", userName: "Sam" },
    { emotion: "Tired", image: "/assets/tired.jpg", time: "1 hour ago", userName: "Jordan" },
    { emotion: "Sad",  image: "/assets/sad.png", time: "2 hours ago", userName: "Riley" },
    { emotion: "Excited", image: "/assets/excited.png", time: "Yesterday", userName: "Casey" },
  ]);

  const [note, setNote] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const { user } = useAuth();
  

  const navigate = useNavigate();

  // Helper function to get time ago
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

  // Function to create an alert for negative emotions
  const createAlert = async (profileId, emotion, expressionId, note) => {
    try {
      console.log('Creating alert for profile:', profileId);
      
      // Get all admins to notify them
      const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .limit(1); // Get first admin or adjust logic as needed

      if (adminError) {
        console.error('Error fetching admin:', adminError);
      }

      // Create alert with available data (removed intensity)
      const alertData = {
        profile_id: profileId,
        emotion_id: expressionId, // Using expression ID as emotion reference
        status: 'priority',
        created_at: new Date().toISOString(),
        message: `Negative emotion detected: ${emotion}${note ? ` - ${note}` : ''}`,
        ...(admins && admins.length > 0 && { admin_id: admins[0].id })
      };

      const { data: alertResult, error: alertError } = await supabase
        .from('alert')
        .insert([alertData])
        .select();

      if (alertError) {
        console.error('Error creating alert:', alertError);
      } else {
        console.log('Alert created successfully:', alertResult);
        
        // Create notification for admin
        await createNotifications(profileId, emotion, note, null, admins?.[0]?.id);
      }
    } catch (error) {
      console.error('Error in createAlert:', error);
    }
  };

  // Function to create notifications for admin and parent
  const createNotifications = async (profileId, emotion, note, parentId, adminId) => {
    try {
      const studentName = userProfile?.username || userProfile?.full_name?.split(' ')[0] || 'Student';
      const message = `🚨 HIGH PRIORITY ALERT: ${studentName} submitted "${emotion}"${note ? `. Note: "${note}"` : ''}. Please check on the student.`;

      const notifications = [];

      // Create notification for parent if exists
      if (parentId) {
        notifications.push({
          profile_id: profileId,
          message: message,
          type: 'alert',
          priority: 'high',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      // Create notification for admin if exists
      if (adminId) {
        notifications.push({
          profile_id: profileId,
          message: message,
          type: 'alert',
          priority: 'high',
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      if (notifications.length > 0) {
        const { data: notificationResult, error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (notificationError) {
          console.error('Error creating notifications:', notificationError);
        } else {
          console.log('Notifications created successfully:', notificationResult);
        }
      }
    } catch (error) {
      console.error('Error in createNotifications:', error);
    }
  };

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchExpressions();
      
      // Set up auto-refresh for expressions every hour to maintain 24h filter
      const expressionRefreshInterval = setInterval(() => {
        fetchExpressions();
      }, 60 * 60 * 1000); // Refresh every hour
      
      // Cleanup interval on component unmount
      return () => {
        clearInterval(expressionRefreshInterval);
      };
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const fetchExpressions = async () => {
    try {
      setIsRefreshing(true);
      console.log('Fetching expressions...');
      
      // Calculate 24 hours ago timestamp for student homepage filter
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const twentyFourHoursAgoISO = twentyFourHoursAgo.toISOString();
      
      // Fetch expressions from last 24 hours only for student homepage
      const { data, error } = await supabase
        .from('Expressions')
        .select('*')
        .gte('created_at', twentyFourHoursAgoISO) // Only last 24 hours
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('Expressions query result (24h filter):', { data, error, count: data?.length, since: twentyFourHoursAgoISO });

      if (error) {
        console.error('Error fetching expressions:', error);
        // Try a simpler query as fallback with 24-hour filter
        const { data: simpleData, error: simpleError } = await supabase
          .from('Expressions')
          .select('*')
          .gte('created_at', twentyFourHoursAgoISO) // Only last 24 hours
          .order('created_at', { ascending: false })
          .limit(50);
        
        console.log('Fallback simple query (24h filter):', { simpleData, simpleError });
        
        if (!simpleError && simpleData) {
          const simpleExpressions = simpleData.map(expr => {
            // Map database emotion to display emotion
            const displayEmotion = expr.emotion === 'angry' ? 'Upset' : 
                                  expr.emotion === 'calm' ? 'Tired' :
                                  expr.emotion?.charAt(0).toUpperCase() + expr.emotion?.slice(1);
            
            // Map database emotion to correct image file
            const getImageFile = (emotion) => {
              switch(emotion) {
                case 'angry': return 'Upset.jpg';
                case 'calm': return 'tired.jpg';
                case 'happy': return 'happy.png';
                case 'sad': return 'sad.png';
                case 'excited': return 'excited.png';
                default: return `${emotion}.png`;
              }
            };
            const imageFile = getImageFile(expr.emotion);
            
            return {
              emotion: displayEmotion || 'Unknown',
              image: `/assets/${imageFile || 'neutral.png'}`,
              time: getTimeAgo(new Date(expr.created_at)),
              userName: 'Unknown User', // Default fallback since no profile data
              note: expr.note || null
            };
          });
          setExpressions(simpleExpressions);
        }
        return;
      }

      if (data && data.length > 0) {
        // Get unique user IDs from expressions
        const userIds = [...new Set(data.map(expr => expr.user_id).filter(Boolean))];
        
        // Fetch user profiles separately
        let userProfiles = [];
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('user_id, full_name, username')
            .in('user_id', userIds);
          
          if (!profilesError && profilesData) {
            userProfiles = profilesData;
          }
        }
        
        const formattedExpressions = data.map(expr => {
          const profile = userProfiles.find(p => p.user_id === expr.user_id);
          const timeAgo = getTimeAgo(new Date(expr.created_at));
          const displayName = profile ? (
            profile.full_name || profile.username || 'Unknown User'
          ) : 'Unknown User';
          
          // Map database emotion to display emotion
          const displayEmotion = expr.emotion === 'angry' ? 'Upset' : 
                                expr.emotion === 'calm' ? 'Tired' :
                                expr.emotion?.charAt(0).toUpperCase() + expr.emotion?.slice(1);
          
          // Map database emotion to correct image file
          const getImageFile = (emotion) => {
            switch(emotion) {
              case 'angry': return 'Upset.jpg';
              case 'calm': return 'tired.jpg';
              case 'happy': return 'happy.png';
              case 'sad': return 'sad.png';
              case 'excited': return 'excited.png';
              default: return `${emotion}.png`;
            }
          };
          const imageFile = getImageFile(expr.emotion);
          
          return {
            emotion: displayEmotion || 'Unknown',
            image: `/assets/${imageFile || 'neutral.png'}`,
            time: timeAgo,
            userName: displayName,
            note: expr.note || null,
            id: expr.id,
            user_id: expr.user_id
          };
        });
        
        console.log('Formatted expressions:', formattedExpressions);
        setExpressions(formattedExpressions);
      } else {
        console.log('No expressions found');
        setExpressions([]);
      }
    } catch (error) {
      console.error('Error in fetchExpressions:', error);
      setExpressions([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEmotionClick = (emotion) => {
    setSelectedEmotion(emotion);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile?.id) {
      alert('User profile not loaded. Please refresh and try again.');
      return;
    }

    const emotionData = Emotions.find((emotion) => emotion.name === selectedEmotion);
    const userName = userProfile?.full_name || userProfile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
    
    const newExpression = {
      emotion: selectedEmotion,
      image: emotionData?.image,
      time: "Just now",
      userName: userName,
    };

    // Save to Supabase Expressions table
    try {
      console.log('Starting emotion submission...');
      console.log('User profile:', userProfile);
      
      // Now we use user_profiles directly, no need for student lookup
      console.log('Using user profile directly for expressions');

      const currentStudent = userProfile; // userProfile is now our "student"
      
      // Map "Upset" to "angry" for database constraint
      const emotionMapping = {
        'happy': 'happy',
        'sad': 'sad',
        'upset': 'angry',
        'excited': 'excited',
        'tired': 'calm'
      };
      
      const mappedEmotion = emotionMapping[selectedEmotion.toLowerCase()] || selectedEmotion.toLowerCase();
      const isNegativeEmotion = (selectedEmotion.toLowerCase() === 'sad' || selectedEmotion.toLowerCase() === 'upset');
      
      // Prepare expression data for submission (using user_id to match user_profiles)
      const expressionData = {
        user_id: currentStudent.user_id, // Use user_id to match user_profiles table
        emotion: mappedEmotion,
        note: emotionNote.trim() || null
      };

      console.log('Submitting expression:', expressionData);

      const { data: expressionResult, error: expressionError } = await supabase
        .from('Expressions')
        .insert([expressionData])
        .select()
        .single();

      if (expressionError) {
        console.error('Expression creation failed:', expressionError);
        alert(`Failed to save emotion: ${expressionError.message || 'Please try again.'}`);
        return;
      }

      console.log('Expression saved successfully:', expressionResult);

      // Verify the expression was actually saved by querying it back
      const { data: verifyData, error: verifyError } = await supabase
        .from('Expressions')
        .select('*')
        .eq('id', expressionResult.id)
        .single();
      
      console.log('Expression verification:', { verifyData, verifyError });

      // Also create user_emotion record for tracking (keep existing functionality)
      const userEmotionData = {
        profile_id: userProfile.user_id, // Use user_id from user_profiles
        expressions_id: expressionResult.id,
        created_at: new Date().toISOString()
      };

      const { error: userEmotionError } = await supabase
        .from('user_emotion')
        .insert([userEmotionData]);

      if (userEmotionError) {
        console.warn('Warning: Failed to create user_emotion record:', userEmotionError);
      }

      // Check if this is a negative emotion that needs an alert
      if (isNegativeEmotion) {
        await createAlert(userProfile.user_id, selectedEmotion, expressionResult.id, emotionNote);
      }
      
      // Don't add to local state immediately - let the refresh handle it
      // This ensures we're showing data from the database, not local state
      setShowModal(false);
      setEmotionNote('');
      
      // Refresh expressions from database to show the new one
      console.log('Refreshing expressions from database...');
      await fetchExpressions();
      
      console.log('Emotion submitted and refreshed and refreshed successfully!');
    } catch (error) {
      console.error('Unexpected error saving expression:', error);
      alert('An unexpected error occurred. Please try again.');
    }

    // Reset form state (moved outside try-catch)
    setShowModal(false);
    setEmotionNote("");

  };

  const studentPageRoute = () => navigate("/studentpage");
  const studentProfileRoute = () => navigate("/studentprofile");

  const getLevelColor = (level) => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-600'];
    return colors[level - 1] || 'bg-gray-500';
  };

    const goToProfile = () => {
    navigate('/studentprofile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-32 w-48 h-48 bg-purple-200/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-32 h-32 bg-pink-200/20 rounded-full blur-xl animate-bounce-gentle"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-3 py-1">
          <div className="flex justify-between items-center">
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
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/home" className="text-blue-600 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Home
              </a>
              <a href="/flashcardspage" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Activities
              </a>
              <a href="/studentpage" className="text-gray-700  hover:text-blue-600 font-semibold transition-colors duration-200 flex items-center">
                Learning Hub
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              
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
                  {userProfile?.full_name || userProfile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto py-2">
        {/* Video Tutorial Section */}
        <section className="mb-">
          <div className=" bg-white/80  p-6 shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Simplified decorative floating elements - autism-friendly design */}
            {/* Corner elements - well spaced */}
            <div className="absolute top-12 left-38 text-2xl animate-float">⭐</div>
            <div className="absolute top-16 right-8 text-2xl animate-bounce-gentle">🌟</div>
    
            <div className="absolute bottom-12 right-8 text-2xl animate-float-delayed">🎈</div>
            
            {/* Gentle gradient circles - maximum spread */}
            <div className="absolute top-1/6 left-2 w-4 h-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-pulse-gentle opacity-40"></div>
            <div className="absolute top-1/5 right-2 w-5 h-5 bg-gradient-to-r from-teal-300 to-green-300 rounded-full animate-float opacity-35"></div>
            <div className="absolute top-2/5 left-6 4 w-4 h-4 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full animate-bounce-gentle opacity-45"></div>
            <div className="absolute top-3/5 right-64 w-5 h-5 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full animate-float-delayed opacity-40"></div>
            <div className="absolute top-4/5 left-2 w-4 h-4 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full animate-pulse-gentle opacity-50"></div>
            <div className="absolute top-5/6 right-2 w-5 h-5 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full animate-float opacity-45"></div>
            <div className="absolute top-1/2 left-1 w-3 h-3 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full animate-bounce-gentle opacity-40"></div>
            <div className="absolute top-1/2 right-8 w-3 h-3 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full animate-float-delayed opacity-35"></div>
            {/* <div className="absolute top-1/3 left-72 w-4 h-4 bg-gradient-to-r from-lime-300 to-green-300 rounded-full animate-pulse-gentle opacity-42"></div> */}
            <div className="absolute top-2/3 right-72 w-4 h-4 bg-gradient-to-r from-orange-300 to-red-300 rounded-full animate-float opacity-38"></div>
            
            {/* Floating emoji elements - MAXIMUM SPREAD */}
            <div className="absolute top-18 right-34 text-xl animate-float">🚀</div>
            <div className="absolute top-30 left-60 text-2xl animate-float-delayed">✨</div>
            <div className="absolute top-44 right-60 text-xl animate-bounce-gentle">🌟</div>
            <div className="absolute top-58 left-32 text-2xl animate-float">🎨</div>
            <div className="absolute top-72 right-32 text-xl animate-bounce-gentle">🌈</div>
            <div className="absolute top-86 left-26 text-2xl animate-float-delayed">💫</div>
            <div className="absolute top-100 right-56 text-xl animate-pulse-gentle">🦋</div>
            
          
            {/* Additional decorative shapes - WIDE SPREAD */}
            <div className="absolute top-12 left-12 w-3 h-3 bg-yellow-300 rounded-full opacity-70 animate-pulse-gentle"></div>
            <div className="absolute top-22 right-12 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-float"></div>
            <div className="absolute top-34 left-68 w-3 h-3 bg-blue-300 rounded-full opacity-75 animate-bounce-gentle"></div>
            <div className="absolute top-46 right-68 w-2 h-2 bg-green-300 rounded-full opacity-65 animate-float-delayed"></div>
            <div className="absolute top-60 left-80 w-3 h-3 bg-purple-300 rounded-full opacity-70 animate-pulse-gentle"></div>
            <div className="absolute top-74 right-4 w-2 h-2 bg-orange-300 rounded-full opacity-80 animate-float"></div>
            <div className="absolute top-88 left-76 w-3 h-3 bg-cyan-300 rounded-full opacity-60 animate-bounce-gentle"></div>
            <div className="absolute top-102 right-76 w-2 h-2 bg-rose-300 rounded-full opacity-75 animate-float-delayed"></div>
            <div className="absolute top-116 left-6 w-3 h-3 bg-lime-300 rounded-full opacity-70 animate-pulse-gentle"></div>
            <div className="absolute top-130 right-6 w-2 h-2 bg-indigo-300 rounded-full opacity-65 animate-float"></div>
            <div className="absolute top-144 left-80 w-3 h-3 bg-teal-300 rounded-full opacity-80 animate-bounce-gentle"></div>
            <div className="absolute top-158 right-80 w-2 h-2 bg-amber-300 rounded-full opacity-60 animate-float-delayed"></div>
           
            <div className="text-center mb-6 relative z-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                <span className="text-4xl mr-3 animate-bounce-gentle">🎬</span>
                Video Tutorial
              </h2>
              <p className="text-lg text-gray-600">
                Learn about emotions and feelings! Watch and learn together! 📚
              </p>
            </div>
            
            <div className="relative z-10">
              <video
                className="w-150 h-70 mx-auto object-cover"
                controls
                controlsList="nodownload"
                preload="auto"
                playsInline
              >
                <source src="/VideoTutorial.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* How are you feeling today section - moved inside video tutorial container */}
            <div className="mt-8 px-8">
              <div className="text-center mt-18 mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <span className="text-4xl mr-3 animate-wiggle">🌈</span>
                  How are you feeling today?
                </h2>
                
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-15">
                {Emotions.map((emotion, index) => (
                  <div
                    key={index}
                    className={`card-autism-friendly ${emotion.bgColor} p-6 rounded-3xl text-center cursor-pointer border-3 transition-all duration-300 ${
                      selectedEmotion === emotion.name 
                        ? 'border-blue-500 shadow-xl scale-105' 
                        : 'border-white/50 hover:border-blue-300'
                    }`}
                    onClick={() => handleEmotionClick(emotion.name)}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`w-20 h-20 bg-gradient-to-r ${emotion.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-float`}>
                      <img
                        src={emotion.image}
                        alt={emotion.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{emotion.name}</span>
                    <div className="mt-2">
                      <span className="text-2xl animate-bounce-gentle">
                        {emotion.name === 'Happy'}
                        {emotion.name === 'Sad'}
                        {emotion.name === 'Upset'}
                        {emotion.name === 'Excited'}
                        {emotion.name === 'Tired'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Emotion Journal section - moved inside video tutorial container */}
            <div className="mt-18 px-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <span className="text-4xl mr-3 animate-float">📖</span>
                  Community Expression Wall
                  {isRefreshing && (
                    <span className="ml-3 text-sm text-blue-500 animate-spin">🔄</span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 flex items-center justify-center">
                  <span className="text-lg mr-2">🕐</span>
                  Showing expressions from the last 24 hours
                </p>
              </div>
              
              {/* Scrollable container - shows 3 rows, scroll for more */}
              <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-autism-friendly">
                <div className="grid md:grid-cols-4 gap-6">
                  {expressions.map((expr, index) => (
                    <div 
                      key={index} 
                      className="card-autism-friendly bg-gradient-to-r from-blue-100 to-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 w-82"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      {/* Emotions shared container */}
                      <div className="flex items-center space-x-4">                
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                          <img
                            src={expr.image}
                            alt={expr.emotion}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl font-bold text-gray-800">{expr.emotion}</span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{expr.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">👤</span>
                              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg">{expr.userName}</span>
                            </div>
                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{expr.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Your Emotion Journal section - moved inside video tutorial container */}
           
            
            {/* Categories Section */}
        <section className="mb-12 mt-10 ">
          <div className="card-autism-friendly bg-white-500 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                
                Categories
                <span className="text-4xl mr-3 animate-float">📚</span>
              </h2>
              {/* <p className="text-lg text-gray-600">
                Choose what you want to learn today! 🎯
              </p> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Category */}
              <div className=" bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl text-center border-3 border-white/50 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-4xl">🎓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">ACADEMIC</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Learn basic school stuff in fun ways!
                </p>
              </div>

              {/* Social/Daily Life Skills Category */}
              <div className=" bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl text-center border-3 border-white/50 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-4xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">SOCIAL/DAILY LIFE SKILL</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Practice talking, sharing, and feelings.
                </p>
              </div>

             
            </div>
          </div>
        </section>

        

        {/* Difficulty Levels Section */}
        <section className="mb-12">
          <div className=" bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                
               Difficulty Levels
               <span className="text-4xl mr-3 animate-bounce-gentle">⭐</span>
              </h2>
              
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Beginner Level */}
              <div className=" bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl text-center border-3 border-white/50 hover:border-green-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-4xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Beginner</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Start here. Simple and fun!
                </p>
              </div>

              {/* Intermediate Level */}
              <div className="card-autism-friendly bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-3xl text-center  border-3 border-white/50 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-4xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Intermediate</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  A little harder. Let's level up!
                </p>
              </div>

              {/* Proficient Level */}
              <div className="card-autism-friendly bg-gradient-to-br from-red-50 to-rose-50 p-8 rounded-3xl text-center  border-3 border-white/50 hover:border-red-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-4xl">!</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Proficient</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Ready for a challenge? Let's go big!
                </p>
              </div>
            </div>

            {/* Start Learning Button */}
                <div className="text-center mt-8">
                  <button
                    className="cursor-pointer btn-autism-friendly bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto"
                    onClick={() => navigate('/studentpage')}
                  >
                    <span className="cursor-pointer mr-3 text-2xl">🚀</span>
                    Start Learning
                  </button>
                </div>
          </div>
        </section>

      
      {/* Use the character component */}
      {/* <StudentCharacter /> */}
    
    
          </div>
        </section>

      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 animate-fade-in-scale">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg animate-bounce-gentle">
                <img
                  src={Emotions.find((emotion) => emotion.name === selectedEmotion)?.image}
                  alt={selectedEmotion}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                You're feeling <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{selectedEmotion}</span>! 
              </h2>
              {/* <p className="text-gray-600 mb-6 text-lg">Why?</p> */}

              {/* Note Section - Optional for all emotions */}
              <div className="space-y-2 mb-6">
                
                <textarea
                  value={emotionNote}
                  onChange={(e) => setEmotionNote(e.target.value)}
                  placeholder="Why?"
                  className="w-full mt-7 bg-gray-200 h-22 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
                  maxLength={200}
                 
                />
                <div className="text-xs text-gray-500 text-right">
                  {emotionNote.length}/200 characters
                </div>
              </div>

            

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEmotionNote("");
                  }}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="cursor-pointer btn-autism-friendly flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span className="text-2xl animate-bounce-gentle">💫</span>
                  <span>Share My Feeling!</span>
                  <span className="text-xl animate-pulse-gentle">✨</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4">
          <div className="flex justify-around">
            <button onClick={studentPageRoute} className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs font-semibold">Home</span>
            </button>
            <a href="/flashcardspage" className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600">
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-xs font-semibold">Activity</span>
            </a>
            <a href="#emotion-selection" className="flex flex-col items-center p-2 text-blue-600">
              <span className="text-2xl mb-1">😊</span>
              <span className="text-xs font-semibold">Expression</span>
            </a>
          </div>
        </div>
      </div>

      {/* Custom Styles for Autism-Friendly Animations */}
      <style jsx>{`
        /* Gentle floating animations */
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-12px) rotate(2deg); 
            filter: brightness(1.1);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-8px) rotate(-1deg); 
            filter: brightness(1.05);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        /* Gentle bouncing */
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2.5s ease-in-out infinite;
        }
        
        /* Gentle pulsing effects */
        @keyframes pulse-gentle {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.03); 
            opacity: 0.9; 
          }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        /* Wiggle animation */
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        
        /* Fade in scale animation */
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Shimmer animation for selected level */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        /* Autism-friendly scrollbar for Community Expression Wall */
        .scrollbar-autism-friendly::-webkit-scrollbar {
          width: 12px;
        }
        
        .scrollbar-autism-friendly::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #e0f2fe, #ddd6fe);
          border-radius: 10px;
          margin: 4px 0;
        }
        
        .scrollbar-autism-friendly::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
          border: 2px solid #e0f2fe;
          transition: all 0.3s ease;
        }
        
        .scrollbar-autism-friendly::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
          transform: scale(1.1);
        }
        
        /* For Firefox */
        .scrollbar-autism-friendly {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 #e0f2fe;
        }
        
        /* Smooth scrolling behavior */
        .scrollbar-autism-friendly {
          scroll-behavior: smooth;
        }
        
        /* Accessibility: Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .scrollbar-autism-friendly {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;