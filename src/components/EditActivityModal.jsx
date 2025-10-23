import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  AcademicCapIcon, 
  PlusIcon, 
  PhotoIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  VideoCameraIcon 
} from '@heroicons/react/24/solid';

const EditActivityModal = ({ isOpen, onClose, activity, onSave }) => {
  const [activityType, setActivityType] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [choices, setChoices] = useState([
    { title: '', isCorrect: false },
    { title: '', isCorrect: false },
    { title: '', isCorrect: false },
    { title: '', isCorrect: false }
  ]);

  useEffect(() => {
    if (activity && isOpen) {
      setActivityType('Identification');
      setCategory(activity.category || '');
      setDifficulty(activity.difficulty || '');
      setQuestion("What color is this apple?");
      setChoices([
        { title: 'Red', isCorrect: true },
        { title: 'Blue', isCorrect: false },
        { title: 'Green', isCorrect: false },
        { title: 'Yellow', isCorrect: false }
      ]);
      // Set mock media
      setPreview("/assets/cow.png");
      setMediaType("image");
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedActivity = {
      ...activity,
      activityType,
      category,
      difficulty,
      question,
      choices,
      media,
      mediaType
    };
    onSave(updatedActivity);
    onClose();
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...choices];
    updated[index][field] = value;
    setChoices(updated);
  };

  const addChoice = () => {
    if (choices.length < 6) {
      setChoices([...choices, { title: '', isCorrect: false }]);
    }
  };

  const removeChoice = (index) => {
    if (choices.length > 2) {
      const updated = choices.filter((_, i) => i !== index);
      setChoices(updated);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${activity?.color || 'from-blue-400 to-blue-600'} p-6 rounded-t-3xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl">
              {activity?.icon || '📝'}
            </div>
            <div className="text-white flex-1">
              <h2 className="text-3xl font-bold mb-2">Edit Activity</h2>
              <p className="text-white/90 text-lg">Update the activity details and settings</p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Settings */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <AcademicCapIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Basic Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm"
                  required
                >
                  <option value="">Select activity type</option>
                  <option value="Identification">🔍 Identification (What is this?)</option>
                  <option value="Matching">🔗 Matching (Match items)</option>
                  <option value="Counting">🔢 Counting (How many?)</option>
                  <option value="Colors">🎨 Colors (Color recognition)</option>
                  <option value="Shapes">📐 Shapes (Shape recognition)</option>
                  <option value="Letters">📝 Letters (Letter learning)</option>
                  <option value="Numbers">🔢 Numbers (Number learning)</option>
                  <option value="Daily Life">🏠 Daily Life Skills</option>
                  <option value="Emotions">😊 Emotions (Feeling recognition)</option>
                  <option value="Social">👥 Social Skills</option>
                  <option value="Sequence">📋 Sequencing (Order activities)</option>
                  <option value="Memory">🧠 Memory Games</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Academic">📚 Academic Skills</option>
                    <option value="Social/Daily Life">👥 Social & Daily Life</option>
                    <option value="Objects">🧸 Object Recognition</option>
                    <option value="Creative">🎨 Creative Activities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm"
                    required
                  >
                    <option value="">Select difficulty level</option>
                    <option value="Beginner">🟢 Beginner</option>
                    <option value="Intermediate">🟡 Intermediate</option>
                    <option value="Proficient">🔴 Proficient</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl">❓</span>
              <h3 className="text-xl font-bold text-gray-800">Question Content</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-none bg-white shadow-sm"
                  placeholder="What question do you want to ask the students?"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visual Support (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-white shadow-sm">
                  {preview ? (
                    <div className="space-y-4">
                      {mediaType === 'image' ? (
                        <img src={preview} alt="Preview" className="max-w-xs mx-auto rounded-lg shadow-md" />
                      ) : mediaType === 'video' ? (
                        <video 
                          src={preview} 
                          controls 
                          className="max-w-xs mx-auto rounded-lg shadow-md"
                          style={{ maxHeight: '200px' }}
                        >
                          Your browser does not support video playback.
                        </video>
                      ) : null}
                      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                        {mediaType === 'image' ? '🖼️ Image' : '🎬 Video'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {setPreview(null); setMedia(null); setMediaType(null);}}
                        className="text-red-500 hover:text-red-700 font-medium bg-red-50 px-4 py-2 rounded-lg transition-colors block mx-auto"
                      >
                        🗑️ Remove {mediaType === 'image' ? 'Image' : 'Video'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMediaChange}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
                      >
                        <PhotoIcon className="w-5 h-5" />
                        <span>Choose Image</span>
                      </label>
                      
                      <span className="text-gray-400 hidden sm:inline">or</span>
                      
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleMediaChange}
                        className="hidden"
                        id="edit-video-upload"
                      />
                      <label
                        htmlFor="edit-video-upload"
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
                      >
                        <VideoCameraIcon className="w-5 h-5" />
                        <span>Choose Video</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Answer Choices */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Answer Choices</h3>
                  <p className="text-gray-600 text-sm">Update possible answers and mark the correct ones</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addChoice}
                disabled={choices.length >= 6}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  choices.length >= 6 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg transform hover:scale-105'
                }`}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Choice</span>
              </button>
            </div>

            <div className="space-y-4">
              {choices.map((choice, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <label className="text-sm font-medium text-gray-700">Choice {index + 1}</label>
                      </div>
                      <input
                        type="text"
                        value={choice.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        placeholder={`Enter choice ${String.fromCharCode(65 + index)}...`}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg border-2 border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={choice.isCorrect}
                          onChange={(e) => handleChange(index, 'isCorrect', e.target.checked)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <CheckCircleIcon className={`w-5 h-5 ${choice.isCorrect ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-700">Correct</span>
                      </label>

                      {choices.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all border border-red-200 hover:border-red-300"
                          title="Remove this choice"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityModal;
