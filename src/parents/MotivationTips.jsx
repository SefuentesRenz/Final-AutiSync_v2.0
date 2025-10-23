import React from 'react';
import { 
  LightBulbIcon,
  HeartIcon,
  StarIcon,
  AcademicCapIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/solid';

const MotivationTips = () => {
  const tips = [
    {
      id: 1,
      icon: '💙',
      iconComponent: HeartIcon,
      color: 'blue',
      title: 'Celebrate Small Wins',
      description: 'Every completed activity is a step forward. Acknowledge your child\'s effort and progress, no matter how small.',
      tips: [
        'Use positive reinforcement when they complete an activity',
        'Create a reward system for consistent engagement',
        'Share their achievements with family members'
      ]
    },
    {
      id: 2,
      icon: '⭐',
      iconComponent: StarIcon,
      color: 'yellow',
      title: 'Consistent Routine',
      description: 'Children with autism thrive on predictability. Establish a regular learning schedule.',
      tips: [
        'Set specific times for learning activities each day',
        'Use visual schedules to help them anticipate activities',
        'Be flexible but maintain core routine elements'
      ]
    },
    {
      id: 3,
      icon: '🎯',
      iconComponent: AcademicCapIcon,
      color: 'purple',
      title: 'Break Tasks Down',
      description: 'Complex tasks can be overwhelming. Break activities into smaller, manageable steps.',
      tips: [
        'Focus on one skill at a time',
        'Provide clear, simple instructions',
        'Allow extra time for processing and responses'
      ]
    },
    {
      id: 4,
      icon: '✨',
      iconComponent: LightBulbIcon,
      color: 'indigo',
      title: 'Use Their Interests',
      description: 'Incorporate your child\'s special interests into learning activities for better engagement.',
      tips: [
        'Connect lessons to topics they love',
        'Use their favorite characters or themes as examples',
        'Let them choose activities when possible'
      ]
    },
    {
      id: 5,
      icon: '💪',
      iconComponent: HandThumbUpIcon,
      color: 'green',
      title: 'Monitor Emotions',
      description: 'Pay attention to your child\'s emotional state. The emotion tracking feature helps identify patterns.',
      tips: [
        'Check the Emotions section regularly',
        'Respond promptly to negative emotions',
        'Discuss their feelings in a safe, supportive way'
      ]
    },
    {
      id: 6,
      icon: '🌟',
      iconComponent: StarIcon,
      color: 'orange',
      title: 'Create a Calm Environment',
      description: 'A sensory-friendly learning space can significantly improve focus and reduce anxiety.',
      tips: [
        'Minimize distractions and loud noises',
        'Ensure good lighting (natural light is best)',
        'Provide sensory tools if needed (fidget toys, headphones)'
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        iconBg: 'from-blue-500 to-cyan-600',
        text: 'text-blue-600'
      },
      yellow: {
        bg: 'from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        iconBg: 'from-yellow-500 to-amber-600',
        text: 'text-yellow-600'
      },
      purple: {
        bg: 'from-purple-50 to-violet-50',
        border: 'border-purple-200',
        iconBg: 'from-purple-500 to-violet-600',
        text: 'text-purple-600'
      },
      indigo: {
        bg: 'from-indigo-50 to-blue-50',
        border: 'border-indigo-200',
        iconBg: 'from-indigo-500 to-blue-600',
        text: 'text-indigo-600'
      },
      green: {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        iconBg: 'from-green-500 to-emerald-600',
        text: 'text-green-600'
      },
      orange: {
        bg: 'from-orange-50 to-red-50',
        border: 'border-orange-200',
        iconBg: 'from-orange-500 to-red-600',
        text: 'text-orange-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <LightBulbIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Parenting Tips & Guidance
        </h2>
        <p className="text-lg text-gray-600 ml-11">
          Expert advice to support your child's learning journey • Evidence-based strategies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip) => {
          const colors = getColorClasses(tip.color);
          const IconComponent = tip.iconComponent;

          return (
            <div 
              key={tip.id} 
              className={`bg-gradient-to-br ${colors.bg} rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${colors.border}`}
            >
              <div className="flex items-start mb-4">
                <div className={`p-3 bg-gradient-to-br ${colors.iconBg} rounded-xl shadow-lg mr-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {tip.icon} {tip.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {tip.description}
                  </p>
                </div>
              </div>

              <div className="ml-2">
                <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>
                  💡 Practical Tips:
                </h4>
                <ul className="space-y-2">
                  {tip.tips.map((item, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className={`${colors.text} mr-2 font-bold`}>•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Resources Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
          <HeartIcon className="w-6 h-6 mr-2 text-blue-600" />
          Remember: You're Doing Great!
        </h3>
        <p className="text-gray-700 leading-relaxed">
          Every child learns at their own pace. Your consistent support and patience make all the difference. 
          Use the dashboard to monitor progress, celebrate achievements, and stay connected with your child's 
          emotional wellbeing. Don't hesitate to reach out to teachers or specialists if you notice concerning patterns.
        </p>
        <div className="mt-4 flex items-start space-x-2 bg-white rounded-lg p-4">
          <div className="text-2xl">📞</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Need Additional Support?</p>
            <p className="text-sm text-gray-600">
              Contact your child's teacher through the school portal or consult with specialists for personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationTips;
