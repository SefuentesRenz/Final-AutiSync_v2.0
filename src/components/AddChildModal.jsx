import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  XMarkIcon, 
  UserIcon, 
  CalendarIcon, 
  MapPinIcon,
  PhotoIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AddChildModal = ({ isOpen, onClose, onChildAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  console.log('AddChildModal render - isOpen:', isOpen);
  
  const [childData, setChildData] = useState({
    fullName: '',
    username: '',
    age: '',
    address: '',
    gender: '',
    profilePicture: null
  });
  
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChildData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChildData(prev => ({
        ...prev,
        profilePicture: file
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate a unique email for the child using parent's email and child's username
      const parentEmail = user.email;
      const childEmail = `${childData.username}.child.${Date.now()}@${parentEmail.split('@')[1]}`;
      
      // Create a password for the child (parent can change this later)
      const childPassword = `${childData.username}123`;

      // Create the child's Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: childEmail,
        password: childPassword,
        options: {
          data: {
            full_name: childData.fullName,
            username: childData.username,
            age: parseInt(childData.age),
            parent_email: user.email, // Link to parent
            address: childData.address,
            gender: childData.gender,
            user_type: 'student',
            created_by_parent: true,
            parent_managed: true
          }
        }
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Create user profile in user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: childData.username,
          first_name: childData.fullName.split(' ')[0],
          last_name: childData.fullName.split(' ').slice(1).join(' '),
          age: parseInt(childData.age),
          parent_email: user.email,
          address: childData.address,
          gender: childData.gender,
          interests: ["Drawing", "Animals", "Music", "Numbers"], // Default interests
          achievements: 0,
          day_streak: 0,
          activities_done: 0,
          stars_earned: 0,
          favorite_color: "#3B82F6",
          learning_style: {
            visual: true,
            goal_oriented: true,
            routine_loving: true,
            step_by_step: true
          }
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        setError('Account created but profile setup failed. Please contact support.');
        return;
      }

      setSuccess(`Child account created successfully! 
                 Login details:
                 Email: ${childEmail}
                 Password: ${childPassword}
                 (You can help your child login with these credentials)`);
      
      // Reset form
      setChildData({
        fullName: '',
        username: '',
        age: '',
        address: '',
        gender: '',
        profilePicture: null
      });
      setProfilePicturePreview(null);

      // Notify parent dashboard to refresh
      if (onChildAdded) {
        onChildAdded({
          id: authData.user.id,
          name: childData.fullName,
          username: childData.username,
          age: parseInt(childData.age),
          email: childEmail,
          profilePicture: profilePicturePreview || "/assets/kidprofile1.jpg"
        });
      }

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 5000);

    } catch (error) {
      console.error('Child creation error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChildData({
      fullName: '',
      username: '',
      age: '',
      address: '',
      gender: '',
      profilePicture: null
    });
    setProfilePicturePreview(null);
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">
              👶 Add Your Child's Account
            </h2>
            <p className="text-blue-100 text-lg">
              Create a learning account for your child
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm whitespace-pre-line">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div>
              <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <PhotoIcon className="w-5 h-5 mr-2" />
                Child's Profile Picture (Optional)
              </label>
              <div className="flex items-center space-x-4">
                {/* Profile Picture Preview */}
                <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                  {profilePicturePreview ? (
                    <img 
                      src={profilePicturePreview} 
                      alt="Child Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-gray-400">👶</span>
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    type="file"
                    id="childProfilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="childProfilePicture"
                    className="inline-flex items-center px-4 py-2 border-2 border-blue-300 text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 cursor-pointer text-sm font-medium"
                  >
                    <PhotoIcon className="w-4 h-4 mr-2" />
                    Choose Photo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">You can skip this and add a photo later</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <UserIcon className="w-5 h-5 mr-2" />
                Child's Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={childData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                placeholder="Enter your child's full name"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                🎮 Username (for login)
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={childData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                placeholder="Choose a username for your child"
                required
                minLength="3"
                maxLength="20"
              />
              <p className="text-xs text-gray-500 mt-1">This will be used for login (3-20 characters)</p>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={childData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                placeholder="Child's age"
                min="3"
                max="18"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                ⚧️ Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={childData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="flex items-center text-sm font-bold text-gray-700 mb-2">
                <MapPinIcon className="w-5 h-5 mr-2" />
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={childData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base transition-all duration-300 resize-none"
                placeholder="Enter your address"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:transform-none"
              >
                {loading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Create Child Account
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-xl font-bold transition-all duration-200 flex items-center"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChildModal;
