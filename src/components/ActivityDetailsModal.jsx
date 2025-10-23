import React, { useState } from 'react';
import { 
  XMarkIcon, 
  AcademicCapIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
  TagIcon,
  ChartBarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useButtonSounds } from '../utils/useButtonSounds';
import EditActivityModal from './EditActivityModal';

const ActivityDetailsModal = ({ isOpen, onClose, activity }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  if (!isOpen || !activity) return null;

  const handleSaveEdit = (updatedActivity) => {
    // In a real application, you would update the activity in the database here
    console.log('Saving updated activity:', updatedActivity);
    // For now, we'll just close the edit modal
    setIsEditModalOpen(false);
    // You could also close the details modal or refresh the data
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Proficient': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Academic': return '📚';
      case 'Social/Daily Life': return '👥';
      case 'Objects': return '🧩';
      case 'Creative': return '🎨';
      default: return '📖';
    }
  };

  // Mock data for demonstration - in real app, this would come from the activity prop
  const mockChoices = [
    { title: 'Red', isCorrect: true },
    { title: 'Blue', isCorrect: false },
    { title: 'Green', isCorrect: false },
    { title: 'Yellow', isCorrect: false }
  ];

  const mockQuestion = "What color is this apple?";
  const mockMediaType = "image";
  const mockMediaUrl = "/assets/cow.png"; // Example media

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${activity.color} p-6 rounded-t-3xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl">
              {activity.icon}
            </div>
            <div className="text-white flex-1">
              <h2 className="text-3xl font-bold mb-2">{activity.title}</h2>
              <p className="text-white/90 text-lg mb-3">{activity.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{activity.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{activity.participants} students</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(activity.difficulty)} border`}>
                  {activity.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Activity Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Activity Type</label>
                  <p className="text-gray-800 font-medium">🔍 Identification (What is this?)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                    <p className="text-gray-800 font-medium">{activity.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Difficulty Level</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(activity.difficulty)} border`}>
                    {activity.difficulty}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Completion Rate</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-gray-800 font-medium">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600 text-lg">❓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Question Content</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Question Text</label>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-800 text-lg">{mockQuestion}</p>
                </div>
              </div>
              
              {mockMediaUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Visual Support</label>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-3">
                      {mockMediaType === 'image' ? (
                        <PhotoIcon className="w-5 h-5 text-blue-500" />
                      ) : (
                        <VideoCameraIcon className="w-5 h-5 text-purple-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {mockMediaType === 'image' ? 'Image File' : 'Video File'}
                      </span>
                    </div>
                    {mockMediaType === 'image' ? (
                      <img 
                        src={mockMediaUrl} 
                        alt="Activity visual" 
                        className="max-w-xs rounded-lg shadow-md border border-gray-200"
                      />
                    ) : (
                      <video 
                        src={mockMediaUrl} 
                        controls 
                        className="max-w-xs rounded-lg shadow-md border border-gray-200"
                        style={{ maxHeight: '200px' }}
                      >
                        Your browser does not support video playback.
                      </video>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Answer Choices */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Answer Choices</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockChoices.map((choice, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    choice.isCorrect 
                      ? 'bg-green-50 border-green-200 ring-2 ring-green-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      choice.isCorrect 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium text-gray-800">{choice.title}</span>
                    {choice.isCorrect && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Correct</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Activity Statistics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">{activity.participants}</div>
                <div className="text-sm text-gray-600">Total Participants</div>
              </div>
              
              <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              
              <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="cursor-pointer px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>Edit Activity</span>
            </button>
          
          </div>
        </div>
      </div>
      </div>
      
      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        activity={activity}
        onSave={handleSaveEdit}
      />
    </>
  );
};

export default ActivityDetailsModal;
