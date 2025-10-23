import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  RocketLaunchIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  ChartBarIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/solid';
import MotivationTips from '../parents/MotivationTips';
import ParentProfileModal from '../components/ParentProfileModal';

const ParentHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleViewDashboard = async () => {
    if (!user?.id) return;

    try {
      console.log('ParentHomepage: Checking for existing children for user:', user.id);
      
      const { data: relations, error } = await supabase
        .from('parent_child_relations')
        .select('id')
        .eq('parent_user_id', user.id)
        .limit(1);
      
      console.log('ParentHomepage: Check result:', { relations, error });
      
      if (!error && relations && relations.length > 0) {
        console.log('ParentHomepage: Found existing children, going to dashboard');
        navigate('/parent-dashboard');
      } else {
        console.log('ParentHomepage: No children found, redirecting to link child page');
        navigate('/link-child');
      }
    } catch (error) {
      console.error('ParentHomepage: Error checking for children:', error);
      // On error, redirect to link child page as fallback
      navigate('/link-child');
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutiSync Parent Portal
                </h1>
              </div>
            </div>
            
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
              <RocketLaunchIcon className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-8 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-8 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to Your 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Parent Portal</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Monitor your child's learning journey, track their emotional wellness, and celebrate their achievements in a supportive, engaging environment designed for children with autism.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewDashboard}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
            >
              <ChartBarIcon className="w-6 h-6" />
              <span>View Dashboard</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-200 flex items-center justify-center space-x-3"
            >
              <UsersIcon className="w-6 h-6 text-blue-600" />
              <span>Manage Profile</span>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Learning Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Track your child's academic achievements, completed activities, and skill development across different learning areas.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <HeartIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Emotional Wellness</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your child's emotional state and responses, helping you understand their feelings and provide better support.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Achievements</h3>
            <p className="text-gray-600 leading-relaxed">
              Celebrate milestones and badges earned by your child, fostering positive reinforcement and motivation.
            </p>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 mb-16">
          <div className="text-center mb-8">
            <LightBulbIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Getting Started</h2>
            <p className="text-gray-600 text-lg">
              Follow these simple steps to begin monitoring your child's journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Set Up Profile</h3>
              <p className="text-gray-600">Complete your parent profile with contact information and preferences.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Link Child Account</h3>
              <p className="text-gray-600">Connect your child's existing student account to start monitoring their progress.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Monitor & Support</h3>
              <p className="text-gray-600">View real-time updates on learning progress and emotional wellness.</p>
            </div>
          </div>
        </div>

        {/* Motivation Tips Section */}
        <MotivationTips />
      </div>

      {/* Profile Modal */}
      <ParentProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default ParentHomepage;
