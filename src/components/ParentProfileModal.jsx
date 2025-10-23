import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  IdentificationIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ParentProfileModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    address: ''
  });

  // Initialize form data when modal opens or user changes
  React.useEffect(() => {
    if (user && isOpen) {
      const userMetadata = user.user_metadata || {};
      setFormData({
        fullName: userMetadata.full_name || '',
        phoneNumber: userMetadata.phone_number || userMetadata.phone || '',
        gender: userMetadata.gender || '',
        address: userMetadata.address || ''
      });
    }
  }, [user, isOpen]);
  const backtoLandingPage = () => {
    navigate('/');
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    // Reset form data to original values
    const userMetadata = user.user_metadata || {};
    setFormData({
      fullName: userMetadata.full_name || '',
      phoneNumber: userMetadata.phone_number || userMetadata.phone || '',
      gender: userMetadata.gender || '',
      address: userMetadata.address || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          gender: formData.gender,
          address: formData.address
        }
      });

      if (updateError) {
        setError('Failed to update profile: ' + updateError.message);
        return;
      }

      // Now create or update the profile in user_profiles table
      // Generate a unique integer user_id since database uses int4
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const integerUserId = parseInt(`${timestamp.toString().slice(-8)}${randomSuffix}`.slice(0, 9));
      
      const profileData = {
        user_id: integerUserId, // Use generated integer instead of UUID
        username: formData.fullName || user.email?.split('@')[0] || 'parent',
        first_name: formData.fullName?.split(' ')[0] || '',
        last_name: formData.fullName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        gender: formData.gender,
        address: formData.address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating/updating parent profile:', profileData);

      // Try to find existing profile first by email (since user_id might not match)
      const { data: existingProfile, error: findError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error checking for existing profile:', findError);
        // Continue anyway, might be a table access issue
      }

      if (existingProfile) {
        // Update existing profile (keep the same user_id)
        const updateData = {
          username: formData.fullName || user.email?.split('@')[0] || 'parent',
          first_name: formData.fullName?.split(' ')[0] || '',
          last_name: formData.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          gender: formData.gender,
          address: formData.address,
          updated_at: new Date().toISOString()
        };
        
        const { error: profileUpdateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('email', user.email);

        if (profileUpdateError) {
          console.error('Error updating profile in user_profiles:', profileUpdateError);
          setError('Profile metadata updated, but failed to update database profile: ' + profileUpdateError.message);
          setLoading(false);
          return;
        }
        
        console.log('Parent profile updated successfully');
      } else {
        // Create new profile
        const { error: profileCreateError } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (profileCreateError) {
          console.error('Error creating profile in user_profiles:', profileCreateError);
          setError('Profile metadata updated, but failed to create database profile: ' + profileCreateError.message);
          setLoading(false);
          return;
        }
        
        console.log('Parent profile created successfully');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const userMetadata = user?.user_metadata || {};
  
  return (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <img
                src="/assets/kidprofile1.jpg"
                alt="Parent Profile"
                className="w-16 h-16 rounded-xl object-cover border-2 border-white"
              />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">
                {formData.fullName || user?.user_metadata?.full_name || 'Parent Account'}
              </h2>
              <p className="text-blue-100 text-lg">
                Parent Portal Access
              </p>
              <div className="flex items-center mt-2 text-blue-100">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Member since {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <IdentificationIcon className="w-6 h-6 mr-3 text-blue-600" />
              Account Information
            </h3>
            
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid md:grid-cols-1 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-2">
                Personal Details
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">
                        {formData.fullName || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-gray-800 font-semibold break-all">
                      {user?.email || 'Not provided'}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+63 912 345 6789"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">
                        {formData.phoneNumber || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    {isEditing ? (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select your gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 font-semibold">
                        {formData.gender || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter your address"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">
                        {formData.address || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 text-center space-x-4">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Close Profile
            </button>
            <button
              onClick={backtoLandingPage}
              className=" cursor-pointer bg-red-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfileModal;
