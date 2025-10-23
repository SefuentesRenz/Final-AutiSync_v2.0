import React from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  LockClosedIcon, 
  StarIcon, 
  TrophyIcon, 
  ClockIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/solid';

const ChildActivityProgressModal = ({ isOpen, onClose, child, activities, loading }) => {
  if (!isOpen) return null;

  const completedActivities = activities?.filter(a => a.progressData.status === 'completed') || [];
  const averageScore = activities?.filter(a => a.progressData.averageScore > 0).length > 0
    ? Math.round(
        activities
          .filter(a => a.progressData.averageScore > 0)
          .reduce((sum, a) => sum + a.progressData.averageScore, 0) /
        activities.filter(a => a.progressData.averageScore > 0).length
      )
    : 0;
  const bestScore = Math.max(...(activities?.map(a => a.progressData.bestScore) || [0]), 0);
  const totalAttempts = activities?.reduce((sum, a) => sum + a.progressData.completedCount, 0) || 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <AcademicCapIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Activity Progress</h2>
                <p className="text-blue-100 text-lg">
                  {child?.full_name || child?.username}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-all duration-200 p-2 rounded-lg hover:bg-white/20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-indigo-400 rounded-full"></div>
            <div className="absolute bottom-40 right-32 w-14 h-14 bg-pink-400 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activity data...</p>
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Activities Available</h3>
              <p className="text-gray-500">No learning activities found in the system.</p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-lg shadow-md">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-800">
                        {completedActivities.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                      <StarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Average Score</p>
                      <p className="text-2xl font-bold text-blue-800">{averageScore}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                      <TrophyIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Best Score</p>
                      <p className="text-2xl font-bold text-purple-800">{bestScore}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-500 rounded-lg shadow-md">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Total Attempts</p>
                      <p className="text-2xl font-bold text-orange-800">{totalAttempts}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">All Activities</h3>
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.progressData.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <h3 className="text-lg font-semibold text-gray-800">{activity.title}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {activity.Categories?.name || activity.Categories?.category_name || 'General'}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {activity.Difficulties?.name || activity.Difficulties?.level_name || 'Easy'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{activity.instructions}</p>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <CheckIcon className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">
                              Completed: <span className="font-medium">{activity.progressData.completedCount} times</span>
                            </span>
                          </div>
                          
                          {activity.progressData.averageScore > 0 && (
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-600" />
                              <span className="text-gray-600">
                                Avg Score: <span className="font-medium">{activity.progressData.averageScore}%</span>
                              </span>
                            </div>
                          )}
                          
                          {activity.progressData.bestScore > 0 && (
                            <div className="flex items-center space-x-1">
                              <TrophyIcon className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-600">
                                Best: <span className="font-medium">{activity.progressData.bestScore}%</span>
                              </span>
                            </div>
                          )}
                          
                          {activity.progressData.lastCompleted && (
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">
                                Last: <span className="font-medium">
                                  {new Date(activity.progressData.lastCompleted).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {activity.progressData.status === 'completed' ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckIcon className="w-5 h-5" />
                            <span className="font-medium">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <LockClosedIcon className="w-5 h-5" />
                            <span className="font-medium">Not Started</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildActivityProgressModal;