import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const NavBar = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile data to get correct username
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('username, full_name')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('NavBar: Error fetching user profile:', error);
        } else if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('NavBar: Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate('/studentprofile');
    }
  };

  const handleExpressionClick = (e) => {
    e.preventDefault();
    navigate('/home#emotion-selection');
  };

  const studentProfileRoute = () => navigate("/studentprofile");

  return (
    <header className="bg-blue-500 text-white  ">
      
      <div className=" container -my-1 mx-auto px-6 flex justify-between items-center">
        
            
        <div className="flex items-center space-x-4">
              <img
                  src="/assets/logo.png"
                  alt="AutiSync Logo"
                  className="w-16 h-16 object-contain"
                />
              <h1 className="text-2xl font-bold text-white bg-clip-text S">
                AutiSync v2.0
              </h1>
            </div>
        <nav className="flex items-center text-lg space-x-6 absolute left-1/2 transform -translate-x-1/2">
          <a href="/home" className="text-white hover:text-blue-900 transition-colors duration-200 flex items-center">
                Home
              </a>
          <a href="/flashcardspage" className="text-white hover:text-blue-900 transition-colors duration-200 flex items-center">
                Activities
              </a>
          <a href="/studentpage" className="text-white  hover:text-blue-900 transition-colors duration-200 flex items-center">
                Learning Hub
              </a>
        </nav>
        
        <div 
            onClick={studentProfileRoute}
            className="cursor-pointer group flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-1 w-23 hover:shadow-lg transition-all duration-300"
          >
            <img
              src="/assets/kidprofile1.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <span className="hidden sm:block text-sm font-semibold text-gray-700">
              {userProfile?.username || userProfile?.full_name || 'User'}
            </span>
          </div>
      </div>
    </header>
  );
};

export default NavBar;
