import React from 'react';

const SystemInformation = () => {
  const categories = [
    {
      name: "Academic Skills",
      icon: "🎓",
      description: "Educational activities focused on core learning concepts",
      activities: [
        {
          name: "Numbers",
          icon: "🔢",
          description: "Learning numbers, counting, and basic math concepts",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Number Recognition", "Counting Objects", "Number Sequences"]
        },
        {
          name: "Identification",
          icon: "🔍", 
          description: "Recognizing and identifying objects, animals, and actions",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Animal Recognition", "Daily Activities", "Object Naming"]
        },
        {
          name: "Colors",
          icon: "🎨",
          description: "Learning color recognition and color-related concepts",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Color Matching", "Color Naming", "Color Sorting"]
        },
        {
          name: "Shapes",
          icon: "📐",
          description: "Understanding geometric shapes and their properties",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Shape Recognition", "Shape Matching", "Shape Drawing"]
        },
        {
          name: "Letters",
          icon: "📝",
          description: "Alphabet learning and letter recognition",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Letter Recognition", "Letter Sounds", "Letter Writing"]
        }
      ]
    },
    {
      name: "Daily Life Skills",
      icon: "🏠",
      description: "Practical life skills for independence and daily functioning",
      activities: [
        {
          name: "Personal Care",
          icon: "🧼",
          description: "Self-care activities and hygiene routines",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Brushing Teeth", "Washing Hands", "Getting Dressed"]
        },
        {
          name: "Social Skills",
          icon: "👥",
          description: "Interaction and communication with others",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Greetings", "Sharing", "Following Instructions"]
        },
        {
          name: "Safety",
          icon: "🛡️",
          description: "Understanding safety rules and emergency procedures",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Traffic Safety", "Home Safety", "Stranger Awareness"]
        },
        {
          name: "Communication",
          icon: "💬",
          description: "Expressing needs, feelings, and thoughts effectively",
          difficulties: ["Beginner", "Intermediate", "Proficient"],
          sampleActivities: ["Emotion Expression", "Asking for Help", "Making Requests"]
        }
      ]
    }
  ];

  const difficultyLevels = [
    {
      level: "Beginner",
      icon: "🌱",
      color: "from-green-400 to-green-600",
      bgColor: "from-green-50 to-green-100",
      description: "Perfect for beginners and building confidence",
      characteristics: [
        "Simple, clear instructions",
        "Basic concepts and skills",
        "Visual cues and supports",
        "Shorter activity duration",
        "Immediate positive feedback"
      ]
    },
    {
      level: "Intermediate",
      icon: "🔥",
      color: "from-orange-400 to-orange-600", 
      bgColor: "from-orange-50 to-orange-100",
      description: "Challenging activities for skill development",
      characteristics: [
        "Multi-step instructions",
        "Intermediate concepts",
        "Reduced visual supports",
        "Longer activity duration",
        "Problem-solving elements"
      ]
    },
    {
      level: "Proficient",
      icon: "💎",
      color: "from-red-400 to-red-600",
      bgColor: "from-red-50 to-red-100",
      description: "Advanced challenges for mastery",
      characteristics: [
        "Complex instructions",
        "Advanced concepts",
        "Minimal visual supports",
        "Extended activities",
        "Critical thinking required"
      ]
    }
  ];

  const gamificationFeatures = [
    {
      name: "Badge System",
      icon: "🏆",
      description: "Children earn badges for achievements and milestones",
      benefits: [
        "Motivates consistent practice",
        "Celebrates small victories",
        "Tracks progress visually",
        "Builds self-confidence"
      ]
    },
    {
      name: "Progress Tracking",
      icon: "📈",
      description: "Detailed monitoring of learning progress and performance",
      benefits: [
        "Identifies strengths and areas for improvement",
        "Shows learning trajectory over time",
        "Helps parents understand child's development",
        "Enables personalized learning paths"
      ]
    },
    {
      name: "Emotion Sharing",
      icon: "😊",
      description: "Children can express how they feel during activities",
      benefits: [
        "Promotes emotional awareness",
        "Helps parents understand child's experience", 
        "Creates emotional connection with learning",
        "Supports mental health monitoring"
      ]
    },
    {
      name: "Interactive Learning",
      icon: "🎮",
      description: "Engaging multimedia content with videos, images, and sounds",
      benefits: [
        "Maintains attention and focus",
        "Appeals to different learning styles",
        "Makes learning enjoyable",
        "Reinforces concepts through multiple senses"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AutiSync Learning System
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive information about our adaptive learning platform designed specifically for children with autism
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center">
            <span className="text-3xl mr-3">📚</span>
            Learning Categories
          </h3>
          <p className="text-gray-600">Explore the different types of activities available for your child</p>
        </div>
        
        <div className="p-6 space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white rounded-xl shadow-sm mr-4">
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">{category.name}</h4>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        <span className="text-2xl">{activity.icon}</span>
                      </div>
                      <h5 className="text-lg font-bold text-gray-800">{activity.name}</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Difficulty Levels:</div>
                      <div className="flex flex-wrap gap-2">
                        {activity.difficulties.map((difficulty) => (
                          <span key={difficulty} className={`text-xs px-3 py-1 rounded-full font-medium ${
                            difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {difficulty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-2">Sample Activities:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {activity.sampleActivities.map((sample, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-0.5">•</span>
                            {sample}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Levels Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center">
            <span className="text-3xl mr-3">📊</span>
            Difficulty Levels
          </h3>
          <p className="text-gray-600">Understanding how activities are structured for progressive learning</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficultyLevels.map((difficulty, index) => (
              <div key={index} className={`bg-gradient-to-br ${difficulty.bgColor} rounded-2xl p-6 border-2 border-opacity-50 hover:shadow-lg transition-all duration-200`}>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{difficulty.icon}</div>
                  <h4 className={`text-2xl font-bold bg-gradient-to-r ${difficulty.color} bg-clip-text text-transparent mb-2`}>
                    {difficulty.level}
                  </h4>
                  <p className="text-gray-600">{difficulty.description}</p>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-800 mb-3">Characteristics:</div>
                  <ul className="space-y-2">
                    {difficulty.characteristics.map((char, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="text-green-500 mr-2 mt-1 text-lg">✓</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Features Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">🎮</span>
          Motivational Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gamificationFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4">{feature.icon}</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{feature.name}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-800 mb-2">Benefits:</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-500 mr-2 mt-0.5">★</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 border border-green-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-3xl mr-3">🚀</span>
          Getting Started
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">For Your Child:</h4>
            <ol className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                Create a student account with your email as parent contact
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                Choose activities based on interests and current skill level
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                Start with Beginner difficulty and progress gradually
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                Practice regularly for best results
              </li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">For Parents:</h4>
            <ol className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                Create your parent account to access this dashboard
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                Monitor your child's progress and emotional responses
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                Celebrate achievements and earned badges together
              </li>
              <li className="flex items-start">
                <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                Use insights to support learning at home
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInformation;
