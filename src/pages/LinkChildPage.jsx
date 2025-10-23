import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserIcon, HeartIcon, LinkIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

const LinkChildPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [childEmail, setChildEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLinkChild = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(childEmail.trim())) {
        throw new Error('Please enter a valid email address');
      }

      // Find student by email
      const { data: studentProfile, error: findError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', childEmail.trim().toLowerCase())
        .single();

      if (findError || !studentProfile) {
        throw new Error(`Student not found with email "${childEmail}". Please check the email address and ensure the student has created a profile.`);
      }

      // Check if relationship already exists
      const { data: existing } = await supabase
        .from('parent_child_relations')
        .select('id')
        .eq('parent_user_id', user.id)
        .eq('child_user_id', studentProfile.user_id)
        .single();

      if (existing) {
        throw new Error('This child is already linked to your account.');
      }

      // Create the relationship directly using auth UUIDs
      const { data: relationData, error: relationError } = await supabase
        .from('parent_child_relations')
        .insert([{
          parent_user_id: user.id,
          child_user_id: studentProfile.user_id,
          parent_email: user.email,
          child_email: studentProfile.email,
          relationship_type: 'parent',
          linked_at: new Date().toISOString()
        }])
        .select();

      if (relationError) {
        throw new Error('Failed to link child account: ' + relationError.message);
      }

      console.log('Successfully linked child:', relationData);
      setSuccess(true);
      
      console.log('=== REDIRECT DEBUG ===');
      console.log('About to redirect to parent-dashboard in 2 seconds');
      
      // Redirect to dashboard after successful linking
      setTimeout(() => {
        console.log('Executing redirect to /parent-dashboard');
        navigate('/parent-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error linking child:', error);
      
      // Check if the error is about relationship already existing
      const errorMessage = error.message || '';
      console.log('=== ERROR HANDLING DEBUG ===');
      console.log('Error message:', errorMessage);
      console.log('Checking for relationship already exists...');
      
      if (errorMessage.includes('Relationship already exists') || 
          errorMessage.includes('already linked') ||
          errorMessage.includes('already exists')) {
        console.log('Relationship already exists - redirecting to dashboard immediately');
        // If relationship already exists, redirect to dashboard
        navigate('/parent-dashboard');
        return;
      }
      
      console.log('Setting error message:', errorMessage);
      setError(error.message || 'Failed to link child. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHomepage = () => {
    navigate('/parent-homepage');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LinkIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Link Your Child</h1>
          <p className="text-gray-600">
            Connect your account with your child to access the dashboard and monitor their progress
          </p>
        </div>

        {/* Link Child Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {success ? (
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Successfully Linked!</h3>
              <p className="text-gray-600 mb-4">
                Your child has been successfully linked to your account.
              </p>
              <div className="flex items-center justify-center text-blue-600">
                <span className="mr-2">Redirecting to dashboard</span>
                <ArrowRightIcon className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleLinkChild}>
              <div className="mb-6">
                <label htmlFor="childEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Email Address
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="childEmail"
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your child's email address"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !childEmail.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Linking Child...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Link Child
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to Homepage */}
        <div className="text-center">
          <button
            onClick={handleBackToHomepage}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
          >
            ← Back to Homepage
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
              <HeartIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Why Link Your Child?</h4>
              <p className="text-blue-700 text-sm">
                Linking your child's account allows you to monitor their learning progress, 
                track their emotions, and celebrate their achievements together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkChildPage;