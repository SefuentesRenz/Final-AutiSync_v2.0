import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { 
  calculateEarnedBadges, 
  saveBadgesToStorage, 
  getBadgeAchievementMessage 
} from '../utils/badgeSystem';
import { useAuth } from '../contexts/AuthContext';

// Optimized Video Component
const OptimizedVideo = memo(({ src, className, autoPlay, loop, muted, controls, style }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      preload="metadata"
      playsInline
      loading="lazy"
      style={style}
      onLoadStart={(e) => {
        e.target.playbackRate = 1.0;
        if (!muted) e.target.volume = 0.7;
      }}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

const Flashcards = ({ category, difficulty, activity, onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs for connection lines
  const leftItemRefs = useRef({});
  const rightItemRefs = useRef({});

  // Debug function to test activity completion
  const testActivityCompletion = async () => {
    console.log('🧪 Testing activity completion manually...');
    console.log('User:', user);

    try {
      if (!user?.id) {
        console.error('No user found!');
        alert('No user logged in!');
        return;
      }

      // Use a real activity ID from our mapping for testing
      const realActivityId = 1; // Basic Colors activity (example)
      const result = await handleActivityCompletion(realActivityId, questions?.length || 0);
      console.log('Test result:', result);
      alert('Test completion simulated. Check console.');
    } catch (error) {
      console.error(error);
      alert('Test failed: ' + (error?.message || String(error)));
    }
  };


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    questionTimes: [],
    firstQuestionCorrect: false
  });
  const [showBadgePreview, setShowBadgePreview] = useState(false);
  const [previewBadge, setPreviewBadge] = useState(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const correctImages = [
    "/assets/GreatJob.png",
    "/assets/NiceWork.png",
    "/assets/WellDone.png"
  ];
  const [currentCorrectImage, setCurrentCorrectImage] = useState(correctImages[0]);

  // Cashier game specific state
  const [cashierScore, setCashierScore] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [gameStep, setGameStep] = useState(1); // 1: order, 2: selecting, 3: feedback
  const [currentSpeaker, setCurrentSpeaker] = useState('customer'); // 'customer' or 'cashier'
  const [speechText, setSpeechText] = useState('');
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);

  // Hygiene game specific state
  const [hygieneScore, setHygieneScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [usedScenarios, setUsedScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [showCharacter, setShowCharacter] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationText, setSuccessAnimationText] = useState('');
  const [isHygieneGameActive, setIsHygieneGameActive] = useState(false);
  const [shuffledHygieneScenarios, setShuffledHygieneScenarios] = useState([]); // Store shuffled scenarios
  const [hygieneScenarioIndex, setHygieneScenarioIndex] = useState(0); // Track current scenario index

  // Safe Street Crossing game specific state
  const [streetScore, setStreetScore] = useState(0);
  const [streetRound, setStreetRound] = useState(1);
  const [streetScenario, setStreetScenario] = useState(null);
  const [isStreetGameActive, setIsStreetGameActive] = useState(false);
  const [showWalkingAnimation, setShowWalkingAnimation] = useState(false);
  const [showStreetFeedback, setShowStreetFeedback] = useState(false);
  const [streetFeedbackMessage, setStreetFeedbackMessage] = useState('');
  const [streetFeedbackType, setStreetFeedbackType] = useState(''); // 'safe' or 'unsafe'
  const [shuffledStreetScenarios, setShuffledStreetScenarios] = useState([]); // Store shuffled scenarios for current game
  const [streetScenarioIndex, setStreetScenarioIndex] = useState(0); // Track which scenario in shuffled array

  // Social Greetings game specific state
  const [greetingsScore, setGreetingsScore] = useState(0);
  const [greetingsRound, setGreetingsRound] = useState(1);
  const [currentGreetingScenario, setCurrentGreetingScenario] = useState(null);
  const [isGreetingsGameActive, setIsGreetingsGameActive] = useState(false);
  const [showGreetingAnimation, setShowGreetingAnimation] = useState(false);
  const [showGreetingFeedback, setShowGreetingFeedback] = useState(false);
  const [greetingFeedbackMessage, setGreetingFeedbackMessage] = useState('');
  const [greetingFeedbackType, setGreetingFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [characterSpeech, setCharacterSpeech] = useState('');
  const [showCharacterThought, setShowCharacterThought] = useState(false);
  const [greetingAnswered, setGreetingAnswered] = useState(false);
  const [greetingSelectedChoice, setGreetingSelectedChoice] = useState(null);
  const [shuffledGreetingScenarios, setShuffledGreetingScenarios] = useState([]); // Store 5 shuffled scenarios for current game
  const [greetingScenarioIndex, setGreetingScenarioIndex] = useState(0); // Track which scenario in shuffled array

  // Money Value Game specific state
  const [moneyScore, setMoneyScore] = useState(0);
  const [moneyRound, setMoneyRound] = useState(1);
  const [currentBudget, setCurrentBudget] = useState(0);
  const [currentMoneyItems, setCurrentMoneyItems] = useState([]);
  const [isMoneyGameActive, setIsMoneyGameActive] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [moneyFeedbackMessage, setMoneyFeedbackMessage] = useState('');
  const [showMoneyFeedback, setShowMoneyFeedback] = useState(false);
  const [moneyFeedbackType, setMoneyFeedbackType] = useState(''); // 'correct' or 'wrong'
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBadgeCompletion, setShowBadgeCompletion] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  
  // Enhanced scoring tracking
  const [moneyCorrectAnswers, setMoneyCorrectAnswers] = useState(0);
  const [moneyWrongAnswers, setMoneyWrongAnswers] = useState(0);
  const [moneyTotalAttempts, setMoneyTotalAttempts] = useState(0);
  const [roundScores, setRoundScores] = useState([]);
  const [currentRoundAttempts, setCurrentRoundAttempts] = useState(0);

  // Matching Game specific state
  const [matchingScore, setMatchingScore] = useState(0);
  const [matchingConnections, setMatchingConnections] = useState([]);
  const [selectedLeftItem, setSelectedLeftItem] = useState(null);
  const [selectedRightItem, setSelectedRightItem] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [showMatchingFeedback, setShowMatchingFeedback] = useState(false);
  const [matchingFeedbackMessage, setMatchingFeedbackMessage] = useState('');
  const [matchingFeedbackType, setMatchingFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [wrongConnections, setWrongConnections] = useState([]);
  
  // New drag-and-drop matching game state
  const [dragConnections, setDragConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isAnswersChecked, setIsAnswersChecked] = useState(false);
  const [correctConnections, setCorrectConnections] = useState([]);
  const [incorrectConnections, setIncorrectConnections] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [shuffledRightItems, setShuffledRightItems] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Academic Puzzle Game specific state
  const [puzzleScore, setPuzzleScore] = useState(0);
  const [puzzleRound, setPuzzleRound] = useState(1);
  const [currentPuzzleType, setCurrentPuzzleType] = useState('math'); // 'math', 'spelling', 'logic', 'sequence'
  const [isPuzzleGameActive, setIsPuzzleGameActive] = useState(false);

  // Household Chores Helper Game specific state
  const [currentChore, setCurrentChore] = useState(null);
  const [currentChoreId, setCurrentChoreId] = useState(null);
  const [currentChoreStep, setCurrentChoreStep] = useState(1);
  const [choreScore, setChoreScore] = useState(0);
  const [isChoreGameActive, setIsChoreGameActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [completedChoreSteps, setCompletedChoreSteps] = useState([]);
  const [showChoreAnimation, setShowChoreAnimation] = useState(false);
  const [choreAnimationType, setChoreAnimationType] = useState(''); // 'success', 'completion'
  const [showChoreThought, setShowChoreThought] = useState(false);
  const [choreCharacterThought, setChoreCharacterThought] = useState('');
  const [characterThought, setCharacterThought] = useState('');
  const [showCharacterSpeech, setShowCharacterSpeech] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedChoreItems, setDraggedChoreItems] = useState([]);
  const [droppedChoreItems, setDroppedChoreItems] = useState([]);
  const [dropZones, setDropZones] = useState({});
  const [choreProgress, setChoreProgress] = useState(0);
  const [showStepFeedback, setShowStepFeedback] = useState(false);
  const [stepFeedbackMessage, setStepFeedbackMessage] = useState('');
  const [isChoreComplete, setIsChoreComplete] = useState(false);
  const [showChoreFeedback, setShowChoreFeedback] = useState(false);
  const [choreFeedbackType, setChoreFeedbackType] = useState('');
  const [choreFeedbackMessage, setChoreFeedbackMessage] = useState('');
  const [choreToolsAvailable, setChoreToolsAvailable] = useState([]);
  const [choreEnvironmentItems, setChoreEnvironmentItems] = useState([]);
  const [showChoreCompletion, setShowChoreCompletion] = useState(false);
  const [earnedChoreBadge, setEarnedChoreBadge] = useState(null);
  const [puzzleFeedbackMessage, setPuzzleFeedbackMessage] = useState('');
  const [showPuzzleFeedback, setShowPuzzleFeedback] = useState(false);
  const [puzzleFeedbackType, setPuzzleFeedbackType] = useState(''); // 'correct' or 'incorrect'
  const [draggedItems, setDraggedItems] = useState([]);
  const [targetPositions, setTargetPositions] = useState([]);
  const [selectedPuzzleAnswers, setSelectedPuzzleAnswers] = useState([]);
  const [showPuzzleHint, setShowPuzzleHint] = useState(false);
  const [puzzleAttempts, setPuzzleAttempts] = useState(0);
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
  const [currentPuzzleData, setCurrentPuzzleData] = useState(null);
  const [showPuzzleAnimation, setShowPuzzleAnimation] = useState(false);

  // Visual Memory Challenge Game specific state
  const [memoryGamePhase, setMemoryGamePhase] = useState('memorize'); // 'memorize', 'shuffle', 'question', 'complete'
  const [memoryCards, setMemoryCards] = useState([]);
  const [memoryCardPositions, setMemoryCardPositions] = useState([0, 1, 2, 3]);
  const [showMemoryCardFronts, setShowMemoryCardFronts] = useState(true);
  const [currentTargetCard, setCurrentTargetCard] = useState(null);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryRound, setMemoryRound] = useState(1);
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false);
  const [memoryTimer, setMemoryTimer] = useState(8);
  const [isShuffling, setIsShuffling] = useState(false);
  const [memoryAttempts, setMemoryAttempts] = useState(0);
  const [memoryCorrectAnswers, setMemoryCorrectAnswers] = useState(0);
  const [memoryWrongAnswers, setMemoryWrongAnswers] = useState(0);
  const [showMemoryFeedback, setShowMemoryFeedback] = useState(false);
  const [memoryFeedbackMessage, setMemoryFeedbackMessage] = useState('');
  const [memoryFeedbackType, setMemoryFeedbackType] = useState(''); // 'correct' or 'wrong'
  const [revealedCardPosition, setRevealedCardPosition] = useState(null);

    const videoRef = useRef(null);
  const audioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const badgeAudioRef = useRef(null);
  const bgMusicRef = useRef(null);
  const gameContainerRef = useRef(null);

  const celebrationSound = "/assets/sounds/Activitycompletion.mp3"; // Place your sound file here
  const correctSound = "/assets/sounds/correct.mp3"; 
  const wrongSound = "/assets/sounds/wrong.mp3";
  const badgeCelebrationSound = "/assets/sounds/Activitycompletion.mp3";
  const jungleBgMusic = "/assets/sounds/Jungle_BGmusic.wav";

  // Background music mapping for different activities
  const getBackgroundMusic = () => {
    // For Academic activities
    if (category === "Academic") {
      if (activity === "Academic Puzzles") {
        return "/assets/sounds/BgMusicc_AcademicPuzzle.mp3";
      } else if (activity === "Matching Type") {
        return "/assets/sounds/BgMusic_MatchingType.mp3";
      } else if (activity === "Numbers" || activity === "Identification") {
        return "/assets/sounds/BgMusic_Numbersidentification.mp3";
      } else if (activity === "Visual Memory Challenge") {
        return "/assets/sounds/Jungle_BGmusic.wav";
      } else if (activity === "Colors") {
        return "/assets/sounds/BgMusic_Numbersidentification.mp3";
      }
    }
    
    // For Social / Daily Life Skills
    if (category === "Social / Daily Life Skill") {
      if (activity === "Hygiene Hero") {
        return "/assets/sounds/Jungle_BGmusic.wav";
      } else if (activity === "Cashier Game" || activity === "Money Value Game") {
        return "/assets/sounds/Jungle_BGmusic.wav";
      } else if (activity === "Safe Street Crossing" || activity === "Social Greetings") {
        return "/assets/sounds/BgMusic_Numbersidentification.mp3";
      } else if (activity === "Household Chores Helper") {
        return "/assets/sounds/BgMusicc_AcademicPuzzle.mp3";
      }
    }
    
    // Default background music
    return "/assets/sounds/Jungle_BGmusic.wav";
  };

  // Play background music when component mounts
  useEffect(() => {
    const bgMusic = getBackgroundMusic();
    if (bgMusicRef.current && bgMusic) {
      bgMusicRef.current.src = bgMusic;
      bgMusicRef.current.volume = 0.3; // Set volume to 30%
      bgMusicRef.current.loop = true;
      
      // Always try to play (not muted by default)
      const playPromise = bgMusicRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Background music autoplay prevented by browser. Music will start on first user interaction:", error);
          // Set up a one-time click handler to start music
          const startMusic = () => {
            if (bgMusicRef.current && !isMusicMuted) {
              bgMusicRef.current.play().catch(e => console.log("Play error:", e));
            }
            document.removeEventListener('click', startMusic);
          };
          document.addEventListener('click', startMusic);
        });
      }
    }

    // Cleanup: pause music when component unmounts
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, [category, activity]);

  // Handle music mute/unmute
  useEffect(() => {
    if (bgMusicRef.current) {
      if (isMusicMuted) {
        bgMusicRef.current.pause();
      } else {
        bgMusicRef.current.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    }
  }, [isMusicMuted]);

  // Toggle music function
  const toggleMusic = () => {
    setIsMusicMuted(!isMusicMuted);
  };

  // Pause video and play sound when modal appears
  useEffect(() => {
    if (showModal) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  }, [showModal]);

    useEffect(() => {
    if (showCorrect && correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play();
      
      // Shuffle and select a random correct image
      const randomIndex = Math.floor(Math.random() * correctImages.length);
      setCurrentCorrectImage(correctImages[randomIndex]);
    }
  }, [showCorrect]);

  useEffect(() => {
    if (showWrong && wrongAudioRef.current) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play();
    }
  }, [showWrong]);

  // Countdown timer for matching game auto-redirect
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown]);

  // Background music for Intermediate Identification activity
  useEffect(() => {
    if (activity === "Identification" && difficulty === "Intermediate") {
      // Play jungle background music
      if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3; // Set volume to 30%
        bgMusicRef.current.loop = true; // Loop the music
        bgMusicRef.current.play().catch(console.error);
      }
    } else {
      // Stop background music for other activities
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    }

    // Cleanup function to stop music when component unmounts or activity changes
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
    };
  }, [activity, difficulty]);

  // 🎤 Text-to-Speech Helper Function - Teacher-like AI Voice
  const speakText = (text, rate = 0.9, pitch = 1.0) => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for clear, teacher-like voice
      utterance.rate = rate;     // Speed: 0.9 (slightly slower for clarity)
      utterance.pitch = pitch;   // Pitch: 1.0 (natural, professional tone)
      utterance.volume = 1.0;    // Volume: Maximum (1.0)
      
      // Select best teacher-like voice (prioritize female voices for warmth)
      const voices = window.speechSynthesis.getVoices();
      
      // Priority order: Google UK/US Female > Microsoft Female > Any English Female > Any English
      const preferredVoice = voices.find(voice => 
        (voice.name.includes('Google UK English Female') || 
         voice.name.includes('Google US English Female') ||
         voice.name.includes('Microsoft Zira') ||
         voice.name.includes('Microsoft Linda') ||
         voice.name.includes('Female') && voice.lang.startsWith('en')) ||
        (voice.lang.startsWith('en-') && voice.name.includes('Female'))
      ) || voices.find(voice => 
        voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('🎤 Using voice:', preferredVoice.name);
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      console.log('🎤 Speaking:', text);
    } else {
      console.warn('⚠️ Text-to-speech not supported in this browser');
    }
  };

  // Button sound/click handler helper
  const getButtonSoundHandlers = (onClick) => {
    return {
      onClick: (e) => {
        // You can add button click sound here if needed
        // For now, just execute the onClick handler
        if (onClick) {
          onClick(e);
        }
      }
    };
  };

  // Handle activity completion (record to database)
  const handleActivityCompletion = async (studentId, activityId, score, status) => {
    try {
      console.log('📝 Recording activity completion:', { studentId, activityId, score, status });
      
      // Import and call the progress API
      const { recordActivityProgress } = await import('../lib/progressApi');
      
      // Map flashcard activity types to correct activity IDs from database
      const activityMapping = {
        'Identification': { Beginner: 95, Intermediate: 96, Proficient: 97 },
        'Numbers': { Beginner: 98, Intermediate: 99, Proficient: 100 },
        'Colors': { Beginner: 101, Intermediate: 102, Proficient: 103 },
        'Academic Puzzles': { Beginner: 104, Intermediate: 105, Proficient: 106 },
        'Matching Type': { Beginner: 107, Intermediate: 108, Proficient: 109 },
        'Visual Memory Challenge': { Beginner: 110, Intermediate: 111, Proficient: 112 }
      };
      
      // Get the correct activity ID based on current activity and difficulty
      let validActivityId = activityId;
      if (activity && difficulty && activityMapping[activity] && activityMapping[activity][difficulty]) {
        validActivityId = activityMapping[activity][difficulty];
      } else {
        // Fallback to a default activity ID if mapping fails
        validActivityId = 95; // Default to Beginner Identification
      }
      
      console.log('🎯 Using activity ID:', validActivityId, 'for', activity, difficulty);
      
      const result = await recordActivityProgress(studentId, validActivityId, score, status);
      
      if (result.error) {
        console.error('❌ Error recording activity progress:', result.error);
        return {
          success: false,
          errors: [result.error.message || 'Failed to record activity progress']
        };
      }
      
      console.log('✅ Activity progress recorded successfully:', result.data);
      return {
        success: true,
        errors: []
      };
    } catch (error) {
      console.error('Error recording activity completion:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  };

  // Load voices when they become available (some browsers load voices asynchronously)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();
      
      // Some browsers fire this event when voices are loaded
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Sample questions data - you can organize this by category, difficulty, and activity
  const questionsData = {
    Academic: {
                                                                //  BEGINNER - LEVEL OF DIFFICULTY
      Beginner: {       
        Identification: [
          {
            questionText: "What are they doing?", 
            videoSrc: "/assets/flashcards/brushyourteeth.mp4",
            answerChoices: ["Sleeping", "Eating", "Reading a Book", "Brushing Teeth"],
            correctAnswer: "Brushing Teeth"   
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/assets/flashcards/dog_academic.mp4",
            answerChoices: ["Dog", "Cat", "Fish", "Bird"],
            correctAnswer: "Dog"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/assets/flashcards/Easy-identificaction/number9.mp4",
            answerChoices: ["Eight (8)", "Seven (7)", "Nine (9)", "Ten (10)"],
            correctAnswer: "Nine (9)"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/assets/flashcards/Easy-identificaction/number4.mp4",
            answerChoices: ["Four (4)", "Eight (8)", "Six (6)", "Ten (10)"],
            correctAnswer: "Four (4)"
          },
          {
            questionText: "What number is this?",
            videoSrc: "/assets/flashcards/Easy-identificaction/number8.mp4",
            answerChoices: ["Six (6)", "Nine (9)", "Eight (8)", "Three (3)"],
            correctAnswer: "Eight (8)"
          }
        ],
        Numbers: [
          {
            questionText: "How many cows are there?",
            imageSrc: "/assets/cow.png",
            answerChoices: ["Six (6)", "Seven (7)", "Eight (8)", "Five (5)"],
            correctAnswer: "Seven (7)"
          },
          {
            questionText: "What number is missing?",
            videoSrc: "/assets/flashcards/Easy-Numbers/numbers-4-easy.mp4",
            answerChoices: ["One (1)", "Two (2)", "Three (3)", "Four (4)"],
            correctAnswer: "Four (4)"
          },
          {
            questionText: "What number is missing?",
            videoSrc: "/assets/flashcards/Easy-Numbers/numbers-1-easy.mp4",
            answerChoices: ["Three (3)", "Four (4)", "Two (2)", "One (1)"],
            correctAnswer: "One (1)"
          },
          {
            questionText: "What numbers are missing?",
            videoSrc: "/assets/flashcards/Easy-Numbers/number6&7-easy.mp4",
            answerChoices: ["Six and Seven (6 & 7)", "Six and Eight (6 & 8)", "Five and Seven (5 & 7)", "Five and Eight (5 & 8)"],
            correctAnswer: "Six and Seven (6 & 7)"
          },
          {
            questionText: "What number is missing?",
            videoSrc: "/assets/flashcards/Easy-Numbers/numbers-2-easy.mp4",
            answerChoices: ["Two (2)", "Five (5)", "Three (3)", "Six (6)"],
            correctAnswer: "Two (2)"
          },
        ],
        Colors: [
          {
            questionText: "What is the Color of the Grass?",
            videoSrc: "/assets/flashcards/Colors-Easy/Green.mp4",
            answerChoices: ["Red", "Blue", "Green", "Yellow"],
            correctAnswer: "Green"
          },
          {
            questionText: "What is the Color of the Sky?",
            videoSrc: "/assets/flashcards/Colors-Easy/Blue.mp4",
            answerChoices: ["Red", "Blue", "Green", "Yellow"],
            correctAnswer: "Blue"
          },
          {
            questionText: "What is the Color of the Flower?",
            videoSrc: "/assets/flashcards/Colors-Easy/Red.mp4",
            answerChoices: ["Red", "Blue", "Green", "Yellow"],
            correctAnswer: "Red"
          },
          {
            questionText: "What is the Color of the Bird?",
            videoSrc: "/assets/flashcards/Colors-Easy/Yellow.mp4",
            answerChoices: ["Red", "Blue", "Green", "Yellow"],
            correctAnswer: "Yellow"
          },
          {
            questionText: "What is the Color of the Grass?",
            videoSrc: "/assets/flashcards/Colors-Easy/Black.mp4",
            answerChoices: ["Red", "Black", "Green", "Yellow"],
            correctAnswer: "Black"
          },
        ],
        "Matching Type": [
          {
            questionText: "Simple Recognition - Match the pairs!",
            gameType: "matching",
            leftItems: [
              // { id: 1, content: "🌞 Sun", type: "text" },
              
              // { id: 3, content: "🐶Dog", type: "text" },
              // { id: 4, content: "😺 Cat", type: "text" },
              { id: 5, content: "🚗 Car", type: "text" },
              { id: 6, content: "🪑 Chair", type: "text" },
              { id: 7, content: "📖 Book", type: "text" },
              
              { id: 9, content: "🏠 House", type: "text" },
              
            ],
            rightItems: [
              
              { id: "b", content: "/assets/flashcards/MatchingType-Easy/Sitting.mp4", type: "video", matchId: 6 },
              // { id: "c", content: "Day", type: "text", matchId: 1 },
              // { id: "d", content: "Meow", type: "text", matchId: 4 },
              { id: "e", content: "/assets/flashcards/MatchingType-Easy/Live.mp4", type: "video", matchId: 9 },
              { id: "f", content: "/assets/flashcards/MatchingType-Easy/Drive.mp4", type: "video", matchId: 5 },
              { id: "i", content: "/assets/flashcards/MatchingType-Easy/Reading.mp4", type: "video", matchId: 7 },
              // { id: "j", content: "Bark", type: "text", matchId: 3 }
            ]
          }
        ],
        "Academic Puzzles": [
          {
            puzzleType: "logic",
            questionText: "Color puzzle",
            instruction: "Which one is RED?",
            options: ["🔵", "🍎", "☀️"],
            correctAnswer: "🍎",
            hint: "Look for the red colored object!"
          },
          {
            puzzleType: "logic",
            questionText: "Circle puzzle",
            instruction: "Find the CIRCLE.",
            options: ["🔺", "🟦", "⚪"],
            correctAnswer: "⚪",
            hint: "A circle is round with no corners!"
          },
          {
            puzzleType: "math",
            questionText: "Apple Counting Puzzle",
            instruction: "How many apples are there?",
            objects: ["🍎", "🍎", "🍎"],
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Count each apple: 1, 2, 3!"
          },
          {
            puzzleType: "logic",
            questionText: "Shape Matching",
            instruction: "Which one is a STAR?",
            options: ["⚪", "⭐", "🔺"],
            correctAnswer: "⭐",
            hint: "Stars have points and shine in the sky!"
          },
          {
            puzzleType: "logic",
            questionText: "",
            instruction: "Which one says MEOW?",
            options: ["🐶", "🐱", "🐮"],
            correctAnswer: "🐱",
            hint: "Cats say meow!"
          }
        ],
        "Visual Memory Challenge": [
          {
            roundId: 1,
            gameType: "memory",
            questionText: "Memorize these cards!",
            
            cards: [
              { id: 1, image: "🐶", name: "Dog" },
              { id: 2, image: "🐱", name: "Cat" },
              { id: 3, image: "🐸", name: "Frog" },
              { id: 4, image: "🐻", name: "Bear" }
            ],
            memorizationTime: 8,
            shuffleCount: 4
          },
          {
            roundId: 2,
            gameType: "memory",
            questionText: "Remember the shapes!",
            
            cards: [
              { id: 1, image: "⭐", name: "Star" },
              { id: 2, image: "❤️", name: "Heart" },
              { id: 3, image: "⚪", name: "Circle" },
              { id: 4, image: "🔺", name: "Triangle" }
            ],
            memorizationTime: 8,
            shuffleCount: 4
          },
          {
            roundId: 3,
            gameType: "memory",
            questionText: "Find the fruits!",
            
            cards: [
              { id: 1, image: "🍎", name: "Apple" },
              { id: 2, image: "🍌", name: "Banana" },
              { id: 3, image: "🍊", name: "Orange" },
              { id: 4, image: "🍇", name: "Grapes" }
            ],
            memorizationTime: 8,
            shuffleCount: 4
          }
        ]
      },


                                            // INTERMEDIATE - LEVEL OF DIFFICULTY
      Intermediate: {
        Identification: [
          {
            questionText: "What is this Animal?", 
            videoSrc: "/assets/flashcards/Animals/Snake.mp4",
            answerChoices: ["Lizard", "Worm", "Snake", "Monkey"],
            correctAnswer: "Snake"   
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/assets/flashcards/Animals/Frog.mp4",
            answerChoices: ["Grasshopper", "Fish", "Bird", "Frog"],
            correctAnswer: "Frog"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/assets/flashcards/Animals/panda.mp4",
            answerChoices: ["Panda", "Monkey", "Cat", "Lion"],
            correctAnswer: "Panda"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/assets/flashcards/Animals/Racoon.mp4",
            answerChoices: ["Dog", "Squirrel", "Cat", "Racoon"],
            correctAnswer: "Racoon"
          },
          {
            questionText: "What animal is this?",
            videoSrc: "/assets/flashcards/Animals/Lion.mp4",
            answerChoices: ["Tiger", "Lion", "Cat", "Dog"],
            correctAnswer: "Lion"
          }
        ],
    
        Numbers: [
          {
            questionText: "How many apples?",
            videoSrc: "/assets/flashcards/Numbers_Medium/7_Numbers.mp4",
            answerChoices: ["Six (6)", "Seven (7)", "Eight (8)", "Five (5)"],
            correctAnswer: "Seven (7)"
          },
          {
            questionText: "How many ducks?",
            videoSrc: "/assets/flashcards/Numbers_Medium/add_6.mp4",
            answerChoices: ["Five (5)", "Four (4)", "Seven (7)", "Six (6)"],
            correctAnswer: "Six (6)"
          },
          {
            questionText: "How many Ice Cream?",
            videoSrc: "/assets/flashcards/Numbers_Medium/5_Numbers.mp4",
            answerChoices: ["Three (3)", "Six (6)", "Four (4)", "Five (5)"],
            correctAnswer: "Five (5)"
          },
          {
            questionText: "How many apples?",
            videoSrc: "/assets/flashcards/Numbers_Medium/add_4.mp4",
            answerChoices: ["Four (4)", "Three (3)", "Six (6)", "Five (5)"],
            correctAnswer: "Four (4)"
          },
          {
            questionText: "How many balls?",
            videoSrc: "/assets/flashcards/Numbers_Medium/11_Numbers.mp4",
            answerChoices: ["Thirteen (13)", "Eleven (11)", "Twelve (12)", "Ten (10)"],
            correctAnswer: "Eleven (11)"
          }
        ],

        Colors: [
          
          {
            questionText: "What is the Color of the Orange?",
            videoSrc: "/assets/flashcards/Colors-Medium/Orange.mp4",
            answerChoices: ["Brown", "Pink", "Orange", "Purple"],
            correctAnswer: "Orange"
          },
          {
            questionText: "What is the Color of the Flower?",
            videoSrc: "/assets/flashcards/Colors-Medium/Purple.mp4",
            answerChoices: ["Brown", "Pink", "Orange", "Purple"],
            correctAnswer: "Purple"
          },
          {
            questionText: "What is the Color of the Flower?",
            videoSrc: "/assets/flashcards/Colors-Medium/Pink.mp4",
            answerChoices: ["Brown", "Pink", "Orange", "Purple"],
            correctAnswer: "Pink"
          },
          {
            questionText: "What is the Color of the Dog?",
            videoSrc: "/assets/flashcards/Colors-Medium/Brown.mp4",
            answerChoices: ["Brown", "Pink", "Orange", "Purple"],
            correctAnswer: "Brown"
          },
          {
            questionText: "What is the Color of the Wolf?",
            videoSrc: "/assets/flashcards/Colors-Medium/Gray.mp4",
            answerChoices: ["Brown", "Pink", "Gray", "Purple"],
            correctAnswer: "Gray"
          }
        ],



        "Matching Type": [
          {
            questionText: "Categories & School Concepts - Match the pairs!",
            gameType: "matching",
            leftItems: [
              // { id: 1, content: "6 + 6 = ?", type: "text" },
              { id: 2, content: "3 + 7 = ?", type: "text" },
              { id: 3, content: "🕒 Clock", type: "text" },
              { id: 4, content: "☀️ Sun", type: "text" },
             
             
              { id: 7, content: "🛏️ Bed", type: "text" },
              { id: 8, content: "✏️ Pencil", type: "text" },
              
            ],
            rightItems: [

              { id: "b", content: "/assets/flashcards/MatchingType-Medium/Time.mp4", type: "video", matchId: 3 },
              // { id: "c", content: "12", type: "text", matchId: 1 },
              { id: "d", content: "/assets/flashcards/MatchingType-Medium/Writing.mp4", type: "video", matchId: 8 },
              { id: "e", content: "/assets/flashcards/MatchingType-Medium/Ten.mp4", type: "video", matchId: 2 },

              { id: "g", content: "/assets/flashcards/MatchingType-Medium/Sleeping.mp4", type: "video", matchId: 7 },

              { id: "i", content: "/assets/flashcards/MatchingType-Medium/Sun.mp4", type: "video", matchId: 4 },
             
            ]
          }
        ],
        "Academic Puzzles": [
          {
            puzzleType: "logic",
            questionText: "Animal Sounds",
            instruction: "Which animal says MOO?",
            options: ["🐷", "🐮", "🐔"],
            correctAnswer: "🐮",
            hint: "Cows say moo - they live on farms!"
          },
          {
            puzzleType: "math",
            questionText: "Simple Math Puzzle",
            instruction: "",
            equation: { first: 2, operator1: "+", second: 1 },
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Add 2 and 1 together!"
          },
          {
            puzzleType: "sequence",
            questionText: "Sequence Puzzle",
            instruction: "What comes next?",
            sequence: ["🟦", "🔺", "⚪", "?"],
            options: ["🔺", "🟦", "⚪"],
            correctAnswer: "🟦",
            hint: "Look at the pattern - it repeats!"
          },
          {
            puzzleType: "sorting",
            questionText: "Sorting Puzzle",
            instruction: "Choose the fruit into the FRUIT basket.",
            items: [{id: 1, content: "🍎 Apple", category: "fruit"}, {id: 2, content: "🚗 Car", category: "vehicle"}, {id: 3, content: "🍌 Banana", category: "fruit"}],
            correctItems: [1, 3],
            hint: "Fruits are things you can eat!"
          },
          {
            puzzleType: "logic",
            questionText: "Pattern Puzzle",
            instruction: "What come's next?",
            options: ["⚪", "⭐", "🔺","⚪"],
            correctAnswer: "⭐",
            hint: ""
          },
        ],
        "Visual Memory Challenge": [
          {
            roundId: 1,
            gameType: "memory",
            questionText: "Track the vehicles!",
            
            cards: [
              { id: 1, image: "🚗", name: "Car" },
              { id: 2, image: "🚌", name: "Bus" },
              { id: 3, image: "🚲", name: "Bicycle" },
              { id: 4, image: "✈️", name: "Airplane" }
            ],
            memorizationTime: 8,
            shuffleCount: 5
          },
          {
            roundId: 2,
            gameType: "memory",
            questionText: "Remember the colors!",
            
            cards: [
              { id: 1, image: "🔴", name: "Red Ball" },
              { id: 2, image: "🔵", name: "Blue Ball" },
              { id: 3, image: "🟢", name: "Green Ball" },
              { id: 4, image: "🟡", name: "Yellow Ball" }
            ],
            memorizationTime: 8,
            shuffleCount: 5
          },
          {
            roundId: 3,
            gameType: "memory",
            questionText: "Track the numbers!",
            
            cards: [
              { id: 1, image: "1️⃣", name: "One" },
              { id: 2, image: "2️⃣", name: "Two" },
              { id: 3, image: "3️⃣", name: "Three" },
              { id: 4, image: "4️⃣", name: "Four" }
            ],
            memorizationTime: 8,
            shuffleCount: 5
          }
        ]
      },


                                            // PROFICIENT - LEVEL OF DIFFICULTY  
      Proficient: {
        "Matching Type": [
          {
            questionText: "Associations & Cause-Effect - Match the pairs!",
            gameType: "matching",
            leftItems: [
              // { id: 1, content: "🔥 Fire", type: "text" },
              { id: 9, content: "🌙 Night", type: "text" },
              { id: 3, content: "🧒 Children", type: "text" },
              { id: 4, content: "👩‍ Chef", type: "text" },
              { id: 5, content: "🌱 Plant", type: "text" },
              { id: 6, content: "🩺 Doctor", type: "text" },
              { id: 7, content: "👩‍🏫 Teacher", type: "text" }
              // { id: 9, content: "36 divided by 6", type: "text" },
              // { id: 10, content: "💧 Water", type: "text" }
            ],
            rightItems: [
              { id: "b", content: "/assets/flashcards/MatchingType-Hard/Teacher.mp4", type: "video", matchId: 7 },
              { id: "d", content: "/assets/flashcards/MatchingType-Hard/Tree.mp4", type: "video", matchId: 5 },
              { id: "e", content: "/assets/flashcards/MatchingType-Hard/Play.mp4", type: "video", matchId: 3 },
              { id: "g", content: "/assets/flashcards/MatchingType-Hard/Doctor.mp4", type: "video", matchId: 6 },
              { id: "h", content: "/assets/flashcards/MatchingType-Hard/Cook.mp4", type: "video", matchId: 4 },
              { id: "j", content: "/assets/flashcards/MatchingType-Hard/Night.mp4", type: "video", matchId: 9 }
            ]
          }
        ],
        
        Numbers: [
          {
            questionText: "How many Apples?",
            videoSrc: "/assets/flashcards/Numbers_Hard/3_Numbers.mp4",
            answerChoices: ["4", "5", "3", "2"],
            correctAnswer: "3"
          },
          {
            questionText: "What is 8 x 4?",
            videoSrc: "/assets/flashcards/Numbers_Hard/32_multiplication.mp4",
            answerChoices: ["32", "34", "33", "31"],
            correctAnswer: "32"
          },
          {
            questionText: "How many ducks ?",
            videoSrc: "/assets/flashcards/Numbers_Hard/1_Numbers.mp4",
            answerChoices: ["3", "1", "2", "4"],
            correctAnswer: "1"
          },
          {
            questionText: "What is 3 x 9?",
            videoSrc: "/assets/flashcards/Numbers_Hard/27_multiplication.mp4",
            answerChoices: ["28", "30", "27", "29"],
            correctAnswer: "27"
          },
          {
            questionText: "What is 5 x 7?",
            videoSrc: "/assets/flashcards/Numbers_Hard/35_multiplication.mp4",
            answerChoices: ["35", "36", "34", "37 "],
            correctAnswer: "35"
          },
          
          
        ],

        Identification: [
          {
            questionText: "What is the national Animal of the Philippines??", 
            videoSrc: "/assets/flashcards/Identification-Hard/Carabao.mp4",
            answerChoices: ["Carabao", "Cow", "Horse", "Goat"],
            correctAnswer: "Carabao"   
          },
          {
            questionText: "What is the national Fruit of the Philippines?",
            videoSrc: "/assets/flashcards/Identification-Hard/Mango.mp4",
            answerChoices: ["Banana", "Watermelon", "Durian", "Mango"],
            correctAnswer: "Mango"
          },
          {
            questionText: "Who is the national hero of the Philippines?",
            videoSrc: "/assets/flashcards/Identification-Hard/Joserizal.mp4",
            answerChoices: ["Andres Bonifacio", "Jose Rizal", "Emilio Aguinaldo", "Apolinario Mabini"],
            correctAnswer: "Jose Rizal"
          },
          {
            questionText: "What is the national sport of the Philippines?",
            videoSrc: "/assets/flashcards/Identification-Hard/Arnis.mp4",
            answerChoices: ["Basketball", "Arnis", "Volleyball", "Soccer"],
            correctAnswer: "Arnis"
          },
          {
            questionText: "What animal is the national flower of the Philippines?",
            videoSrc: "/assets/flashcards/Identification-Hard/Sampaguita.mp4",
            answerChoices: ["Rose", "Orchid", "Sunflower", "Sampaguita"],
            correctAnswer: "Sampaguita"
          }
        ],
      

        "Academic Puzzles": [
          {
            puzzleType: "math",
            questionText: "Advanced Math Puzzle",
            instruction: "",
            equation: { first: 5, operator1: "-", second: 2 },
            options: [2, 3, 4],
            correctAnswer: 3,
            hint: "Take away 2 from 5!"
          },
          {
            puzzleType: "logic",
            questionText: "Color Mixing Puzzle",
            instruction: "Red + Yellow = ?",
            options: ["Orange", "Green", "Purple"],
            correctAnswer: "Orange",
            hint: "When you mix red and yellow, you get orange!"
          },
          {
            puzzleType: "logic",
            questionText: "Word Association Puzzle",
            instruction: "Which one belongs with 'FISH'?",
            options: ["🐟 Water", "🐕 Dog", "🍎 Apple"],
            correctAnswer: "🐟 Water",
            hint: "Where do fish live?"
          },
          {
            puzzleType: "sequence",
            questionText: "Pattern Puzzle",
            instruction: "Complete the pattern:",
            sequence: ["🍎", "🍌", "🍎", "🍌", "...?"],
            options: ["🍌", "🍎", "🍊"],
            correctAnswer: "🍎",
            hint: "Look at the alternating pattern!"
          },
          {
            puzzleType: "logic",
            questionText: "Real-life Puzzle",
            instruction: "The traffic light is 🔴Red. What should you do?",
            options: ["Go", "Stop", "Jump"],
            correctAnswer: "Stop",
            hint: "Red means stop for safety!"
          }
        ],
        "Visual Memory Challenge": [
          {
            roundId: 1,
            gameType: "memory",
            questionText: "Advanced Memory Test!",
            
            cards: [
              { id: 1, image: "📚", name: "Books" },
              { id: 2, image: "✏️", name: "Pencil" },
              { id: 3, image: "🎒", name: "Backpack" },
              { id: 4, image: "📐", name: "Ruler" }
            ],
            memorizationTime: 8,
            shuffleCount: 6
          },
          {
            roundId: 2,
            gameType: "memory",
            questionText: "Sports Memory Challenge!",
            
            cards: [
              { id: 1, image: "⚽", name: "Soccer Ball" },
              { id: 2, image: "🏀", name: "Basketball" },
              { id: 3, image: "🎾", name: "Tennis" },
              { id: 4, image: "🏐", name: "Volleyball" }
            ],
            memorizationTime: 8,
            shuffleCount: 6
          },
          {
            roundId: 3,
            gameType: "memory",
            questionText: "Master Level Memory!",
           
            cards: [
              { id: 1, image: "🌟", name: "Star" },
              { id: 2, image: "🌙", name: "Moon" },
              { id: 3, image: "☀️", name: "Sun" },
              { id: 4, image: "⚡", name: "Lightning" }
            ],
            memorizationTime: 8,
            shuffleCount: 6
          }
        ]
        
      }
    },
    "Social / Daily Life Skill": {
      "Cashier Game": [
          {
            questionText: "I want a burger🍔 and fries🍟, please!",
            orderItems: ["Burger", "Fries"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Fries"],
            gameType: "cashier"
          },
          {
            questionText: "Can I have a pizza slice🍕 and a drink🥤?",
            orderItems: ["Pizza", "Drink"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Pizza", "Drink"],
            gameType: "cashier"
          },
          {
            questionText: "I'll take a hot dog🌭, please!",
            orderItems: ["Hot Dog"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Hot Dog"],
            gameType: "cashier"
          },
          {
            questionText: "I want fries🍟 and ice cream🍦, please!",
            orderItems: ["Fries", "Ice Cream"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              
            ],
            correctAnswer: ["Fries", "Ice Cream"],
            gameType: "cashier"
          },
          {
            questionText: "Can I get a burger🍔, fries🍟, and a drink🥤?",
            orderItems: ["Burger", "Fries", "Drink"],
            menuOptions: [
              { name: "Burger", image: "🍔", price: "$3.99" },
              { name: "Fries", image: "🍟", price: "$2.49" },
              { name: "Pizza", image: "🍕", price: "$4.99" },
              { name: "Drink", image: "🥤", price: "$1.99" },
              { name: "Hot Dog", image: "🌭", price: "$2.99" },
              { name: "Ice Cream", image: "🍦", price: "$2.99" }
            ],
            correctAnswer: ["Burger", "Fries", "Drink"],
            gameType: "cashier"
          }
        ],
        "Shopping Skills": [
          {
            questionText: "You need to buy milk. Where should you go?",
            imageSrc: "/assets/flashcards/grocery_store.jpg",
            answerChoices: ["Grocery Store", "Library", "Bank", "Post Office"],
            correctAnswer: "Grocery Store"
          }
        ],
        "Social Greetings": [
          {
            id: 1,
            title: "Morning Greeting to Parents",
            situation: "",
            context: "morning",
            background: "🏠 Home Kitchen",
            character: "👩‍🍳",
            characterType: "Parent",
            studentThought: "I should greet my parent nicely!",
            otherCharacterSpeech: "Good morning, sweetheart!",
            choices: [
              
              {
                text: "Good night!",
                emoji: "🌙", 
                correct: false,
                feedback: "That's for bedtime! Try a morning greeting instead."
              },
              {
                text: "Good morning, Mom!",
                emoji: "🌅",
                correct: true,
                feedback: "Perfect! Starting the day with a nice greeting makes everyone happy!"
              },
              {
                text: "Goodbye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for when you're leaving. Try a greeting for when you wake up!"
              },
              {
                text: "See you later!",
                emoji: "👀",
                correct: false,
                feedback: "That's for when you're going away. What would you say when you first see someone?"
              }
            ]
          },
          {
            id: 2,
            title: "Morning Greeting to Teacher",
            situation: "",
            context: "morning",
            background: "🏫 School Classroom",
            character: "👩‍🏫",
            characterType: "Teacher",
            studentThought: "I should be polite to my teacher!",
            otherCharacterSpeech: "Hello! Welcome to class today!",
            choices: [
              
              {
                text: "Hi Mom!",
                emoji: "👩",
                correct: false,
                feedback: "That's not your mom - it's your teacher! Try again."
              },
              {
                text: "Bye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for leaving, not arriving! What would you say when you first get to school?"
              },
              {
                text: "Good morning, Teacher!",
                emoji: "📚",
                correct: true,
                feedback: "Excellent! Polite greetings show respect to your teacher!"
              },
              {
                text: "Good night!",
                emoji: "🌙",
                correct: false,
                feedback: "That's for bedtime! Try a morning greeting instead."
              }
            ]
          },
          {
            id: 3,
            title: "Greeting a Friend at Recess",
            situation: "",
            context: "afternoon",
            background: "🛝 School Playground",
            character: "👦",
            characterType: "Friend",
            studentThought: "That looks fun!",
            otherCharacterSpeech: "Hey! Want to play with me?",
            choices: [
              {
                text: "Hi, friend!",
                emoji: "😊",
                correct: true,
                feedback: "Great! Friendly greetings help make strong friendships!"
              },
              {
                text: "Good morning!",
                emoji: "🌅",
                correct: false,
                feedback: "It's recess time, not morning! Try a more casual greeting."
              },
              {
                text: "Goodbye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for leaving, but you just arrived! Try saying hello instead."
              },
              {
                text: "Good night!",
                emoji: "🌙",
                correct: false,
                feedback: "That's for bedtime! What would you say to a friend during playtime?"
              }
            ]
          },
          {
            id: 4,
            title: "Saying Goodbye After School",
            situation: "",
            context: "afternoon",
            background: "🎒 School Classroom",
            character: "👩‍🏫",
            characterType: "Teacher",
            studentThought: "I should say goodbye nicely!",
            otherCharacterSpeech: "See you tomorrow! ",
            choices: [
              {
                text: "Goodbye Teacher! See you tomorrow!",
                emoji: "👋",
                correct: true,
                feedback: "Wonderful! Saying goodbye nicely ends the day on a positive note!"
              },
              {
                text: "Good morning!",
                emoji: "🌅",
                correct: false,
                feedback: "The day is ending, not starting! Try a goodbye greeting."
              },
              {
                text: "Hi!",
                emoji: "😊",
                correct: false,
                feedback: "That's for when you arrive! What do you say when you're leaving?"
              },
              {
                text: "Thank you for the breakfast!",
                emoji: "🍳",
                correct: false,
                feedback: "That's for your parent at home! What would you say to your teacher when leaving?"
              }
            ]
          },
           {
            id: 5,
            title: "Meeting a New Friend",
            situation: "",
            context: "afternoon",
            background: "🏫 School Hallway",
            character: "👧",
            characterType: "New Student",
            studentThought: "I should be friendly!",
            otherCharacterSpeech: "Hi! I'm new here.",
            choices: [
              {
                text: "Hello! Welcome to our school!",
                emoji: "😊",
                correct: true,
                feedback: "Wonderful! Making new friends starts with a warm greeting!"
              },
              {
                text: "Goodbye!",
                emoji: "👋",
                correct: false,
                feedback: "That's for leaving! Try a greeting to make them feel welcome."
              },
              {
                text: "Good night!",
                emoji: "🌙",
                correct: false,
                feedback: "That's for bedtime! What would you say to welcome someone?"
              },
              {
                text: "See you tomorrow!",
                emoji: "📅",
                correct: false,
                feedback: "That's for later! Try greeting them first."
              }
            ]
          },
          // {
          //   id: 6,
          //   title: "Evening Greeting to Neighbor",
          //   situation: "",
          //   context: "evening",
          //   background: "🏡 Neighborhood Garden",
          //   character: "👴",
          //   characterType: "Neighbor",
          //   studentThought: "I should be friendly!",
          //   otherCharacterSpeech: "Good evening! How was your day?",
          //   choices: [
              
          //     {
          //       text: "Good morning!",
          //       emoji: "🌅",
          //       correct: false,
          //       feedback: "It's evening time, not morning! Look at the sky for a clue."
          //     },
          //      {
          //       text: "Good evening! It was great, thank you!",
          //       emoji: "🌃",
          //       correct: true,
          //       feedback: "Perfect! Evening greetings show you're polite and friendly!"
          //     },
          //     {
          //       text: "Good night!",
          //       emoji: "🌜",
          //       correct: false,
          //       feedback: "That's for when you're going to sleep! Try an evening greeting."
          //     },
          //     {
          //       text: "Hello teacher!",
          //       emoji: "👩‍🏫",
          //       correct: false,
          //       feedback: "That's not your teacher - it's your neighbor! Try again."
          //     }
          //   ]
          // },
          // {
          //   id: 6,
          //   title: "Meeting a New Friend",
          //   situation: "",
          //   context: "afternoon",
          //   background: "🏫 School Hallway",
          //   character: "👧",
          //   characterType: "New Student",
          //   studentThought: "I should be friendly!",
          //   otherCharacterSpeech: "Hi! I'm new here.",
          //   choices: [
          //     {
          //       text: "Hello! Welcome to our school!",
          //       emoji: "😊",
          //       correct: true,
          //       feedback: "Wonderful! Making new friends starts with a warm greeting!"
          //     },
          //     {
          //       text: "Goodbye!",
          //       emoji: "👋",
          //       correct: false,
          //       feedback: "That's for leaving! Try a greeting to make them feel welcome."
          //     },
          //     {
          //       text: "Good night!",
          //       emoji: "🌙",
          //       correct: false,
          //       feedback: "That's for bedtime! What would you say to welcome someone?"
          //     },
          //     {
          //       text: "See you tomorrow!",
          //       emoji: "📅",
          //       correct: false,
          //       feedback: "That's for later! Try greeting them first."
          //     }
          //   ]
          // },
          // {
          //   id: 7,
          //   title: "Thanking Someone for Help",
          //   situation: "",
          //   context: "afternoon",
          //   background: "🏫 School Classroom",
          //   character: "👦",
          //   characterType: "Classmate",
          //   studentThought: "They helped me! I should thank them!",
          //   otherCharacterSpeech: "Here, let me help you with that!",
          //   choices: [
          //     {
          //       text: "Thank you so much!",
          //       emoji: "🙏",
          //       correct: true,
          //       feedback: "Perfect! Saying thank you shows you appreciate help!"
          //     },
          //     {
          //       text: "Good morning!",
          //       emoji: "🌅",
          //       correct: false,
          //       feedback: "That's a time greeting! How do you show appreciation?"
          //     },
          //     {
          //       text: "Hi!",
          //       emoji: "😊",
          //       correct: false,
          //       feedback: "That's a hello! What do you say when someone helps you?"
          //     },
          //     {
          //       text: "Goodbye!",
          //       emoji: "👋",
          //       correct: false,
          //       feedback: "That's for leaving! Try expressing gratitude instead."
          //     }
          //   ]
          // },
          // {
          //   id: 8,
          //   title: "Bedtime Greeting to Parents",
          //   situation: "",
          //   context: "night",
          //   background: "🏠 Bedroom",
          //   character: "👨‍👩‍👧",
          //   characterType: "Parents",
          //   studentThought: "Time for bed! I should say goodnight!",
          //   otherCharacterSpeech: "Sweet dreams, dear!",
          //   choices: [
          //     {
          //       text: "Good night, Mom!",
          //       emoji: "🌜",
          //       correct: true,
          //       feedback: "Beautiful! Bedtime greetings help end the day with love!"
          //     },
          //     {
          //       text: "Good morning!",
          //       emoji: "🌅",
          //       correct: false,
          //       feedback: "That's for when you wake up! What do you say before sleep?"
          //     },
          //     {
          //       text: "Hello!",
          //       emoji: "👋",
          //       correct: false,
          //       feedback: "That's for when you meet someone! Try a bedtime greeting."
          //     },
          //     {
          //       text: "Good afternoon!",
          //       emoji: "☀️",
          //       correct: false,
          //       feedback: "That's for the middle of the day! Look at the time - it's nighttime!"
          //     }
          //   ]
          
        ],
        "Hygiene Hero": [
          {
            scenario: "dirty_hands",
            questionText: "Oh no! Your hands are dirty after playing!",
            scenarioImage: "",
            backgroundImage: "🏠",
            characterEmoji: "/assets/flashcards/HygieneHero/DirtyHands.mp4",
            isCharacterVideo: true,
            answerChoices: [
              { text: "Brush my teeth", video: "/assets/flashcards/HygieneHero/BrushMyTeeth.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" }
            ],
            correctAnswer: "Wash my hands",
            gameType: "hygiene",
            successAnimation: "🧼✨",
            successMessage: "Great job! Clean hands are healthy hands!"
          },
          {
            scenario: "messy_hair",
            questionText: "😅 Your hair is messy!",
            scenarioImage: "💇‍♂️",
            backgroundImage: "🪞",
            characterEmoji: "/assets/flashcards/HygieneHero/MessyHair.mp4",
            isCharacterVideo: true,
            answerChoices: [
              { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              // { text: "Brush my teeth", video: "/assets/flashcards/HygieneHero/BrushMyTeeth.mp4" }
            ],
            correctAnswer: "Get a haircut",
            gameType: "hygiene",
            successAnimation: "✂️✨",
            successMessage: "Perfect! You look great now!"
          },
          {
            scenario: "runny_nose",
            questionText: "🤧 Achoo! Your nose is runnings!",
            scenarioImage: "👃",
            backgroundImage: "🏠",
            characterEmoji: "/assets/flashcards/HygieneHero/RunnyNose.mp4",
            isCharacterVideo: true,
            answerChoices: [
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" }
            ],
            correctAnswer: "Wipe my nose",
            gameType: "hygiene",
            successAnimation: "🧻✨",
            successMessage: "Good choice! Keep those germs away!"
          },
          {
            scenario: "dirty_teeth",
            questionText: "🦷 Time to take care of your teeth!",
            scenarioImage: "🪥",
            backgroundImage: "🚿",
            characterEmoji: "/assets/flashcards/HygieneHero/DirtyTeeth.mp4",
            isCharacterVideo: true,
            answerChoices: [
              // { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
              { text: "Brush my teeth", video: "/assets/flashcards/HygieneHero/BrushMyTeeth.mp4" },
              { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" }
            ],
            correctAnswer: "Brush my teeth",
            gameType: "hygiene",
            successAnimation: "🪥✨",
            successMessage: "Fantastic! Healthy teeth make you smile!"
          },
          {
            scenario: "dirty_ears",
            questionText: "Your ears are dirty!👂",
            scenarioImage: "🧽",
            backgroundImage: "🚿",
            characterEmoji: "/assets/flashcards/HygieneHero/DirtyEars.jpg",
            isCharacterVideo: false,
            answerChoices: [
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              // { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
              { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" },
              { text: "Clean my ears", video: "/assets/flashcards/HygieneHero/CleanMyEars.mp4" }
            ],
            correctAnswer: "Clean my ears",
            gameType: "hygiene",
            successAnimation: "🧽✨",
            successMessage: "Excellent! Now you can hear everything clearly!"
          },
          {
            scenario: "sweaty_body",
            questionText: "After playing, you're all sweaty!💦",
            scenarioImage: "🚿",
            backgroundImage: "🛁",
            characterEmoji: "/assets/flashcards/HygieneHero/SweatyBody.mp4",
            isCharacterVideo: true,
            answerChoices: [
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              { text: "Brush my teeth", video: "/assets/flashcards/HygieneHero/BrushMyTeeth.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
              // { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" }
            ],
            correctAnswer: "Take a bath",
            gameType: "hygiene",
            successAnimation: "🚿✨",
            successMessage: "Amazing! You're fresh and clean now!"
          },
          // {
          //   scenario: "sticky_fingers",
          //   questionText: "🍯 Your fingers are sticky after eating!",
          //   scenarioImage: "🤲",
          //   backgroundImage: "🍽️",
          //   characterEmoji: "/assets/flashcards/HygieneHero/WashingHands.mp4",
          //   isCharacterVideo: true,
          //   answerChoices: [
          //     { text: "Brush my teeth", video: "/assets/flashcards/HygieneHero/BrushMyTeeth.mp4" },
          //     // { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
          //     // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
          //     { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" },
          //     { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" }
          //   ],
          //   correctAnswer: "Wash my hands",
          //   gameType: "hygiene",
          //   successAnimation: "🧼✨",
          //   successMessage: "Perfect! No more sticky fingers!"
          // },
          {
            scenario: "after_sneezing",
            questionText: "Achoo!🤧  You just sneezed!",
            scenarioImage: "🤧",
            backgroundImage: "🏠",
            characterEmoji: "/assets/flashcards/HygieneHero/Sneezing.mp4",
            isCharacterVideo: true,
            answerChoices: [
              { text: "Use tissue", video: "/assets/flashcards/HygieneHero/UseTissue.mp4" },
              { text: "Wash my hands", video: "/assets/flashcards/HygieneHero/WashingHands.mp4" },
              { text: "Take a bath", video: "/assets/flashcards/HygieneHero/TakeABath.mp4" },
              // { text: "Get a haircut", video: "/assets/flashcards/HygieneHero/GetAHaircut.mp4" },
              // { text: "Wipe my nose", video: "/assets/flashcards/HygieneHero/WipeMyNose.mp4" }
            ],
            correctAnswer: "Use tissue",
            gameType: "hygiene",
            successAnimation: "🧻✨",
            successMessage: "Smart! Covering sneezes keeps everyone healthy!"
          }
        ],



        "Safe Street Crossing": [
          {
            scenario: "green_walk_signal",
            questionText: "🚦 Look! What should you do?",
            scenarioImage: "🚶‍♂️",
            backgroundImage: "🛣️",
            characterEmoji: "😊",
            trafficLight: "/assets/GoSign.png",
            isTrafficLightImage: true,
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️➡️",
            successMessage: "Great! Green means GO!",
            feedbackMessage: "Perfect choice! The walk signal is green!"
          },
          {
            scenario: "red_traffic_light",
            questionText: "🚦 Stop and look! What should you do?",
            scenarioImage: "🛑",
            backgroundImage: "🛣️",
            characterEmoji: "🤔",
            trafficLight: "🔴",
            lightStatus: "stop",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰✋",
            successMessage: "Smart waiting! Red means STOP!",
            feedbackMessage: "Excellent! Always wait for red lights!"
          },
          {
            scenario: "approaching_car",
            questionText: "🚗 A car is coming! What should you do?",
            scenarioImage: "🚗💨",
            backgroundImage: "🛣️",
            characterEmoji: "😨",
            trafficLight: "🟡",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰🛡️",
            successMessage: "Very safe choice! Let cars pass first!",
            feedbackMessage: "Great thinking! Always let cars pass safely!"
          },
          {
            scenario: "clear_street",
            questionText: "👀 The street is empty and clear! What should you do?",
            scenarioImage: "🛣️",
            backgroundImage: "🏙️",
            characterEmoji: "😄",
            trafficLight: "/assets/GoSign.png",
            isTrafficLightImage: true,
            lightStatus: "clear",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️✨",
            successMessage: "Perfect! Safe to cross now!",
            feedbackMessage: "Wonderful! You checked and it's safe!"
          },
          {
            scenario: "yellow_light_warning",
            questionText: "🚦 Yellow light means be careful! What should you do?",
            scenarioImage: "⚠️",
            backgroundImage: "🛣️",
            characterEmoji: "🤨",
            trafficLight: "🟡",
            lightStatus: "caution",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰⚠️",
            successMessage: "Good choice! Yellow means be careful!",
            feedbackMessage: "Smart! Yellow means slow down and wait!"
          },
          {
            scenario: "busy_intersection",
            questionText: "🚧 Lots of cars and people! What should you do?",
            scenarioImage: "🚗🚶‍♀️🚌",
            backgroundImage: "🏙️",
            characterEmoji: "😰",
            trafficLight: "🔴",
            lightStatus: "busy",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰👥",
            successMessage: "Wise decision! Wait for a safe moment!",
            feedbackMessage: "Excellent patience! Busy times need extra care!"
          },
          {
            scenario: "crosswalk_signal",
            questionText: "🚶‍♂️ The crosswalk shows a walking person! What should you do?",
            scenarioImage: "🚶‍♂️",
            backgroundImage: "🛣️",
            characterEmoji: "😊",
            trafficLight: "/assets/GoSign.png",
            isTrafficLightImage: true,
            lightStatus: "walk",
            safetyLevel: "safe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "CROSS",
            gameType: "street",
            successAnimation: "🚶‍♂️🎉",
            successMessage: "Perfect timing! Cross safely now!",
            feedbackMessage: "Great job reading the crosswalk signal!"
          },
          {
            scenario: "emergency_vehicle",
            questionText: "🚑 An ambulance is coming with sirens! What should you do?",
            scenarioImage: "🚑🔊",
            backgroundImage: "🛣️",
            characterEmoji: "😮",
            trafficLight: "/assets/GoSign.png",
            isTrafficLightImage: true,
            lightStatus: "emergency",
            safetyLevel: "unsafe",
            answerChoices: ["CROSS", "WAIT"],
            correctAnswer: "WAIT",
            gameType: "street",
            successAnimation: "⏰🚑",
            successMessage: "Hero move! Let emergency vehicles go first!",
            feedbackMessage: "Amazing! Emergency vehicles always have the right of way!"
          }
        ],
        "Money Value Game": [
          {
            gameId: 1,
            gameName: "Money Value Adventure",
            description: "Learn the value of Philippine Peso currency through interactive shopping!",
            totalRounds: 3,
            gameType: "money",
            rounds: [
              {
                roundId: 1,
                budget: 150,
                items: [
                  { id: 1, name: "Juice", image: "🥤", price: 10, category: "food", affordable: true },
                  { id: 2, name: "Car", image: "🚗", price: 450000, category: "vehicle", affordable: false },
                  { id: 3, name: "Phone", image: "📱", price: 25000, category: "electronics", affordable: false },
                  { id: 4, name: "Pancake", image: "/assets/pancakes.jpg", price: 15, category: "food", affordable: true, isImagePath: true }
                ]
              },
              {
                roundId: 2,
                budget: 500,
                items: [
                  { id: 5, name: "Book", image: "📚", price: 450, category: "school", affordable: true },
                  { id: 6, name: "House", image: "🏠", price: 2500000, category: "property", affordable: false },
                  { id: 7, name: "Bicycle", image: "🚲", price: 3500, category: "vehicle", affordable: false },
                  { id: 8, name: "Bread", image: "🥐", price: 20, category: "food", affordable: true }
                ]
              },
              {
                roundId: 3,
                budget: 100,
                items: [
                  { id: 9, name: "Ipad", image: "📱", price: 2800, category: "entertainment", affordable: false },
                  { id: 10, name: "Ice Cream", image: "🍦", price: 30, category: "dessert", affordable: true },
                  { id: 11, name: "Pancake", image: "/assets/pancakes.jpg", price: 15, category: "food", affordable: false, isImagePath: true },
                  { id: 12, name: "Pencil", image: "✏️", price: 10, category: "education", affordable: true }
                ]
              }
            ],
            badges: {
              completion: {
                id: "money_master",
                name: "Money Master",
                description: "Completed all 3 rounds of Money Value Adventure!",
                icon: "💰🏆",
                points: 100
              }
            }
          }
        ],

        "Household Chores Helper": [
          {
            choreId: "washing_dishes",
            choreName: "Washing Dishes",
            choreIcon: "🍽️",
            description: "Clean the dishes!",
            steps: [
              {
                stepId: 1,
                instruction: "What do you do first?",
                emoji: "🍽️",
                choices: ["Get the sponge🧽", "Turn on TV📺", "Play games⚽"],
                correctChoice: "Get the sponge🧽",
                feedback: "Great! Now we're ready to clean!"
              },
              {
                stepId: 2,
                instruction: "What do you need?",
                emoji: "💦",
                choices: ["Water and soap💧", "Juice🥤", "Toys🧸"],
                correctChoice: "Water and soap💧",
                feedback: "Perfect! Water and soap clean dishes!"
              },
              {
                stepId: 3,
                instruction: "How do you clean?",
                emoji: "🧽",
                choices: ["Scrub the dishes🧽", "Throw them🗑️", "Hide them"],
                correctChoice: "Scrub the dishes🧽",
                feedback: "Excellent! The dishes are clean now!"
              }
            ],
            gameType: "household_chores",
            totalSteps: 3,
            successMessage: "Great job! You can wash dishes!",
            badge: "🏆 Dish Washing Star!"
          },
          {
            choreId: "making_bed",
            choreName: "Making the Bed",
            choreIcon: "🛏️",
            description: "Make your bed neat!",
            steps: [
              {
                stepId: 1,
                instruction: "What do you do first?",
                emoji: "🛏️",
                choices: ["Pull up the blanket", "Jump on bed", "Leave it messy"],
                correctChoice: "Pull up the blanket",
                feedback: "Good! The bed looks neater!"
              },
              {
                stepId: 2,
                instruction: "What's next after pulling up the blanket?",
                emoji: "🛏️",
                choices: ["Put the pillow on top", "Throw pillow away", "Sleep now"],
                correctChoice: "Put the pillow on top",
                feedback: "Perfect! Your bed looks nice!"
              },
              {
                stepId: 3,
                instruction: "Last step?",
                emoji: "🛏️",
                choices: ["Make it smooth", "Make it messy", "Do nothing"],
                correctChoice: "Make it smooth",
                feedback: "Amazing! Your bed is perfect!"
              }
            ],
            gameType: "household_chores",
            totalSteps: 3,
            successMessage: "Wonderful! You make your bed well!",
            badge: "🏆 Bed Making Pro!"
          },
          {
            choreId: "wiping_table",
            choreName: "Wiping the Table",
            choreIcon: "🧽",
            description: "Clean the table!",
            steps: [
              {
                stepId: 1,
                instruction: "What do you need?",
                emoji: "🧽",
                choices: ["A cloth🧽", "A toy🧸", "A book📚"],
                correctChoice: "A cloth🧽",
                feedback: "Great! You picked the right tool!"
              },
              {
                stepId: 2,
                instruction: "What helps clean better?",
                emoji: "💧",
                choices: ["Wet the cloth🧽", "Keep it dry", "Throw it"],
                correctChoice: "Wet the cloth🧽",
                feedback: "Perfect! Wet cloth cleans better!"
              },
              {
                stepId: 3,
                instruction: "How do you clean?",
                emoji: "✨",
                choices: ["Wipe the dirts", "Ignore the mess", "Make it dirty"],
                correctChoice: "Wipe the dirts",
                feedback: "Excellent! The table is clean!"
              }
            ],
            gameType: "household_chores",
            totalSteps: 3,
            successMessage: "Awesome! You clean tables well!",
            badge: "🏆 Table Cleaning Expert!"
          },
          {
            choreId: "watering_plants",
            choreName: "Watering the Plants",
            choreIcon: "🌱",
            description: "Give plants water!",
            steps: [
              {
                stepId: 1,
                instruction: "What do you need?",
                emoji: "🌱",
                choices: ["A watering can💦", "A ball⚽", "A phone📱"],
                correctChoice: "A watering can💦",
                feedback: "Great choice! Plants need water!"
              },
              {
                stepId: 2,
                instruction: "Where do you pour?",
                emoji: "💧",
                choices: ["On the soil", "On the floor", "On yourself"],
                correctChoice: "On the soil",
                feedback: "Perfect! Plants drink from soil!"
              },
              {
                stepId: 3,
                instruction: "How much water?",
                emoji: "💦",
                choices: ["Just enough", "Too much", "None"],
                correctChoice: "Just enough",
                feedback: "Excellent! Not too much, not too little!"
              }
            ],
            gameType: "household_chores",
            totalSteps: 3,
            successMessage: "Amazing! You take care of plants!",
            badge: "🏆 Plant Care Champion!"
          },
          {
            choreId: "sweeping_floor",
            choreName: "Sweeping the Floor",
            choreIcon: "🧹",
            description: "Clean the floor!",
            steps: [
              {
                stepId: 1,
                instruction: "What do you use?",
                emoji: "🧹",
                choices: ["A broom🧹", "A pillow🛏️", "A toy🧸"],
                correctChoice: "A broom🧹",
                feedback: "Good! A broom cleans floors!"
              },
              {
                stepId: 2,
                instruction: "What do you do?",
                emoji: "🧹",
                choices: ["Sweep the dirt", "Spread the dirt", "Ignore it"],
                correctChoice: "Sweep the dirt",
                feedback: "Nice! You're sweeping well!"
              },
              {
                stepId: 3,
                instruction: "Where does dirt go?",
                emoji: "🗑️",
                choices: ["In the trash🗑️", "On the bed🛏️", "Leave it"],
                correctChoice: "In the trash🗑️",
                feedback: "Perfect! The floor is clean!"
              }
            ],
            gameType: "household_chores",
            totalSteps: 3,
            successMessage: "Fantastic! You sweep very well!",
            badge: "🏆 Sweeping Star!"
          }
        ]
    }
  };

  const questions = questionsData[category]?.[difficulty]?.[activity] || 
                   questionsData[category]?.[activity] || [];
  const total = questions.length;
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Get current question and handle shuffling for matching games
  const originalQuestion = questions[currentQuestionIndex];
  const currentQuestion = (() => {
    if (originalQuestion?.gameType === 'matching' && originalQuestion.rightItems) {
      // Use shuffled items from state or create new shuffled version
      if (shuffledRightItems) {
        return {
          ...originalQuestion,
          rightItems: shuffledRightItems
        };
      }
      // This will be set in useEffect
      return originalQuestion;
    }
    return originalQuestion;
  })();
  
  // Effect to shuffle right items only when question changes
  useEffect(() => {
    if (originalQuestion?.gameType === 'matching' && originalQuestion.rightItems) {
      setShuffledRightItems(shuffleArray(originalQuestion.rightItems));
    } else {
      setShuffledRightItems(null);
    }
    // Reset matching game state when question changes
    setDragConnections([]);
    setIsAnswersChecked(false);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setCanSubmit(false);
  }, [currentQuestionIndex, category, difficulty, activity]);

  // Effect to enable submit button when all items are connected in matching game
  useEffect(() => {
    if (currentQuestion?.gameType === 'matching' && currentQuestion?.leftItems) {
      // Filter out null/undefined entries to get accurate count
      const validLeftItems = currentQuestion.leftItems.filter(item => item != null);
      const totalItems = validLeftItems.length;
      if (dragConnections.length >= totalItems && !isAnswersChecked) {
        setCanSubmit(true);
      } else if (dragConnections.length < totalItems) {
        setCanSubmit(false);
      }
    }
  }, [dragConnections, currentQuestion, isAnswersChecked]);
  
  const isCashierGame = currentQuestion?.gameType === 'cashier';
  const isHygieneGame = currentQuestion?.gameType === 'hygiene';
  const isMatchingGame = currentQuestion?.gameType === 'matching';
  const isPuzzleGame = currentQuestion?.gameType === 'puzzle' || activity === "Academic Puzzles";
  const isStreetGame = activity === "Safe Street Crossing";
  const isGreetingsGame = activity === "Social Greetings";
  const isMoneyGame = activity === "Money Value Game";
  const isChoreGame = activity === "Household Chores Helper";
  const isMemoryGame = currentQuestion?.gameType === 'memory' || activity === "Visual Memory Challenge";

  // Visual Memory Challenge game functions
  const performCardShuffle = () => {
    const shuffleCount = currentQuestion?.shuffleCount || 3;
    let currentShuffle = 0;
    
    const performSingleShuffle = () => {
      if (currentShuffle >= shuffleCount) {
        setIsShuffling(false);
        // Wait a moment before showing the question phase
        setTimeout(() => {
          console.log('🤔 Shuffle complete, entering question phase...');
          setMemoryGamePhase('question');
          // Target card is already set and visible
        }, 500);
        return;
      }
      
      // Select two random positions to swap
      const idx1 = Math.floor(Math.random() * 4);
      let idx2 = Math.floor(Math.random() * 4);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * 4);
      }
      
      console.log(`🔄 Shuffling: Position ${idx1} ↔ Position ${idx2}`);
      
      // Update positions array to trigger visual swap
      setMemoryCardPositions(prev => {
        const newPositions = [...prev];
        // Swap the card indices at these positions
        [newPositions[idx1], newPositions[idx2]] = [newPositions[idx2], newPositions[idx1]];
        console.log('New positions:', newPositions);
        return newPositions;
      });
      
      currentShuffle++;
      // Wait 1.5 seconds for the animation to complete before next shuffle
      setTimeout(performSingleShuffle, 1500);
    };
    
    // Start the shuffle sequence
    performSingleShuffle();
  };

  const startQuestionPhase = (cards) => {
    console.log('🤔 Starting question phase with cards:', cards);
    setMemoryGamePhase('question');
    
    if (cards && cards.length > 0) {
      // Select a random card to ask about
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      console.log('🎯 Target card selected:', randomCard);
      setCurrentTargetCard(randomCard);
    } else {
      console.error('❌ No cards available for question phase');
    }
  };

  const handleMemoryCardClick = (positionIndex) => {
    if (memoryGamePhase !== 'question' || !currentTargetCard) return;
    
    // Reveal the clicked card
    setRevealedCardPosition(positionIndex);
    
    setMemoryAttempts(prev => prev + 1);
    
    // Find which card is at the clicked position
    const cardIndexAtPosition = memoryCardPositions[positionIndex];
    const clickedCard = memoryCards[cardIndexAtPosition];
    
    // Wait for flip animation before showing feedback
    setTimeout(() => {
      if (clickedCard.id === currentTargetCard.id) {
        // Correct answer
        setMemoryCorrectAnswers(prev => prev + 1);
        setMemoryScore(prev => prev + 1);
        setScore(prev => prev + 1);
        setMemoryFeedbackType('correct');
        setMemoryFeedbackMessage(`🎉 Correct! You found the ${currentTargetCard.name}!`);
        setShowCorrect(true);
        
        setTimeout(() => {
          setShowCorrect(false);
          setRevealedCardPosition(null);
          proceedToNextMemoryRound();
        }, 2500);
      } else {
        // Wrong answer
        setMemoryWrongAnswers(prev => prev + 1);
        setMemoryFeedbackType('wrong');
        setMemoryFeedbackMessage(`❌ Oops! That was the ${clickedCard.name}, not the ${currentTargetCard.name}. Try again!`);
        setShowWrong(true);
        
        setTimeout(() => {
          setShowWrong(false);
          setRevealedCardPosition(null);
          proceedToNextMemoryRound();
        }, 2500);
      }
    }, 700); // Wait for flip animation
  };

  const proceedToNextMemoryRound = () => {
    if (memoryRound < 3) {
      setMemoryRound(prev => prev + 1);
      setCurrentQuestionIndex(prev => prev + 1);
      setMemoryGamePhase('memorize');
      setShowMemoryCardFronts(true);
      setMemoryTimer(12);
      setMemoryCardPositions([0, 1, 2, 3]);
      setCurrentTargetCard(null);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setRevealedCardPosition(null);
      
      // The useEffect will handle setting up new cards when currentQuestionIndex changes
    } else {
      completeMemoryGame();
    }
  };

  const completeMemoryGame = () => {
    setMemoryGamePhase('complete');
    setShowModal(true);
    
    const accuracyPercentage = memoryAttempts > 0 ? Math.round((memoryCorrectAnswers / memoryAttempts) * 100) : 0;
    
    const detailedScore = {
      correctAnswers: memoryCorrectAnswers,
      wrongAnswers: memoryWrongAnswers,
      totalAttempts: memoryAttempts,
      accuracyPercentage,
      finalScore: memoryCorrectAnswers,
      maxPossibleScore: 3
    };
    
    // Don't auto-redirect - let user click Continue Adventure button
    // The onComplete will be called when user clicks the button in the modal
  };

  const resetMemoryGame = () => {
    setIsMemoryGameActive(false);
    setMemoryRound(1);
    setMemoryScore(0);
    setMemoryCorrectAnswers(0);
    setMemoryWrongAnswers(0);
    setMemoryAttempts(0);
    setMemoryGamePhase('memorize');
    setShowMemoryCardFronts(true);
    setMemoryTimer(12);
    setMemoryCardPositions([0, 1, 2, 3]);
    setMemoryCards([]);
    setCurrentTargetCard(null);
    setIsShuffling(false);
  };

  // Hygiene game functions
  const getRandomScenario = () => {
    const availableScenarios = questions.filter(q => !usedScenarios.includes(q.scenario));
    if (availableScenarios.length === 0) return questions[0]; // Fallback
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  const handleHygieneAnswer = (choice) => {
    if (isAnswered) return;

    // normalize choice to text if it's an object
    const choiceText = typeof choice === 'string' ? choice : (choice?.text || '');

    // 🎤 Speak the choice text with teacher-like AI voice (clear & loud)
    speakText(choiceText);

    setSelectedAnswer(choiceText);
    setIsAnswered(true);

    if (choiceText === currentQuestion.correctAnswer) {
      setHygieneScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setShowSuccessAnimation(true);
      setSuccessAnimationText(currentQuestion.successAnimation);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setShowCorrect(false);
        // Don't auto-proceed - let handleNextClick handle progression
      }, 2000);
    } else {
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        // Don't auto-proceed - let handleNextClick handle progression
      }, 1500);
    }
  };

  const initializeHygieneGame = () => {
    if (isHygieneGame && !isHygieneGameActive) {
      setIsHygieneGameActive(true);
      setCurrentRound(1);
      setHygieneScore(0);
      setUsedScenarios([]);
      setHygieneScenarioIndex(0);
      
      // Get all hygiene scenarios and shuffle them
      const allHygieneScenarios = questionsData[category]?.["Hygiene Hero"] || [];
      const shuffled = [...allHygieneScenarios].sort(() => Math.random() - 0.5);
      setShuffledHygieneScenarios(shuffled);
      
      // Set up first scenario from shuffled array
      const firstScenario = shuffled[0];
      if (firstScenario) {
        setCurrentScenario(firstScenario);
        setUsedScenarios([firstScenario.scenario]);
        
        // Update current question index to show the first scenario
        const firstIndex = questions.findIndex(q => q.scenario === firstScenario.scenario);
        if (firstIndex !== -1) {
          setCurrentQuestionIndex(firstIndex);
        }
      }
    }
  };

  const resetHygieneState = () => {
    setHygieneScore(0);
    setCurrentRound(1);
    setUsedScenarios([]);
    setShowCharacter(true);
    setShowSuccessAnimation(false);
    setSuccessAnimationText('');
    setCurrentScenario(null);
    setIsHygieneGameActive(false);
    setShuffledHygieneScenarios([]);
    setHygieneScenarioIndex(0);
  };

  // Safe Street Crossing game functions
  const getRandomStreetScenario = () => {
    console.log('Getting random street scenario...');
    const streetQuestions = questionsData[category]?.["Safe Street Crossing"] || [];
    console.log('Available street questions:', streetQuestions.length);
    console.log('Used scenarios:', usedScenarios);
    
    const availableScenarios = streetQuestions.filter(q => !usedScenarios.includes(q.scenario));
    console.log('Available scenarios after filtering:', availableScenarios.length);
    
    if (availableScenarios.length === 0) {
      console.log('⚠️ No more unused scenarios, returning first one as fallback');
      return streetQuestions[0]; // Fallback
    }
    
    const selectedScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    console.log('🎲 Selected scenario:', selectedScenario?.scenario);
    return selectedScenario;
  };

  const handleStreetAnswer = (choice) => {
    console.log('🚶‍♂️ Street answer clicked:', choice);
    console.log('State check - isAnswered:', isAnswered, 'showStreetFeedback:', showStreetFeedback);
    
    if (isAnswered || showStreetFeedback) {
      console.log('❌ Answer blocked - already answered or showing feedback');
      return;
    }
    
    // 🎤 Speak the choice with teacher-like AI voice (clear & loud)
    speakText(choice === 'CROSS' ? 'Cross the street' : 'Wait for safe signal');
    
    console.log('✅ Processing answer:', choice);
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const currentStreetScenario = streetScenario || currentScenario;
    console.log('📋 Current scenario:', currentStreetScenario);
    
    if (!currentStreetScenario) {
      console.error('❌ No current scenario available!');
      console.log('streetScenario:', streetScenario, 'currentScenario:', currentScenario);
      return;
    }

    const isCorrect = choice === currentStreetScenario.correctAnswer;
    console.log('🎯 Answer check - Selected:', choice, 'Expected:', currentStreetScenario.correctAnswer, 'Correct:', isCorrect);

    if (isCorrect) {
      setStreetScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setStreetFeedbackType('safe');
      setStreetFeedbackMessage(currentStreetScenario.feedbackMessage || currentStreetScenario.successMessage);
      
      if (choice === "CROSS") {
        setShowWalkingAnimation(true);
        setTimeout(() => setShowWalkingAnimation(false), 2000);
      }
      
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowCorrect(false);
        setShowStreetFeedback(false);
        setShowWalkingAnimation(false);
        
        // Move to next round or end game
        if (streetRound < 5) {
          setStreetRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          // Get next scenario from shuffled array
          const nextIndex = streetScenarioIndex + 1;
          setStreetScenarioIndex(nextIndex);
          const nextScenario = shuffledStreetScenarios[nextIndex];
          if (nextScenario) {
            console.log('Next scenario:', nextScenario);
            setStreetScenario(nextScenario);
            setCurrentScenario(nextScenario);
          }
        } else {
          // End game after 5 rounds
          console.log('Game complete!');
          setShowModal(true);
        }
      }, 3000);
    } else {
      setStreetFeedbackType('unsafe');
      setStreetFeedbackMessage(currentStreetScenario.feedbackMessage || "Not safe! Always check before crossing.");
      setShowWrong(true);
      
      setTimeout(() => {
        setShowWrong(false);
        setShowStreetFeedback(false);
        
        // Move to next round or end game even on wrong answer
        if (streetRound < 5) {
          setStreetRound(prev => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          
          // Get next scenario from shuffled array
          const nextIndex = streetScenarioIndex + 1;
          setStreetScenarioIndex(nextIndex);
          const nextScenario = shuffledStreetScenarios[nextIndex];
          if (nextScenario) {
            console.log('Next scenario after wrong answer:', nextScenario);
            setStreetScenario(nextScenario);
            setCurrentScenario(nextScenario);
          }
        } else {
          // End game after 5 rounds
          console.log('Game complete after wrong answer!');
          setShowModal(true);
        }
      }, 3000);
    }

    setShowStreetFeedback(true);
  };

  const initializeStreetGame = () => {
    console.log('🚦 Initializing Safe Street Crossing game');
    console.log('Activity:', activity, 'isStreetGameActive:', isStreetGameActive);
    
    // Reset all states first
    setIsStreetGameActive(true);
    setStreetRound(1);
    setStreetScore(0);
    setUsedScenarios([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowStreetFeedback(false);
    setShowWalkingAnimation(false);
    setStreetFeedbackMessage('');
    setStreetFeedbackType('');
    setStreetScenarioIndex(0);
    
    // Get all street scenarios and shuffle them
    const allStreetScenarios = questionsData[category]?.["Safe Street Crossing"] || [];
    console.log('Total street scenarios available:', allStreetScenarios.length);
    
    // Shuffle all scenarios and select first 5
    const shuffled = [...allStreetScenarios].sort(() => Math.random() - 0.5);
    const selectedScenarios = shuffled.slice(0, 5);
    setShuffledStreetScenarios(selectedScenarios);
    console.log('Shuffled and selected 5 scenarios');
    
    // Set up first scenario from shuffled selection
    const firstScenario = selectedScenarios[0];
    console.log('🎯 First scenario loaded:', firstScenario);
    
    if (firstScenario) {
      setStreetScenario(firstScenario);
      setCurrentScenario(firstScenario);
      console.log('✅ Street game initialized successfully');
    } else {
      console.error('❌ Failed to load first scenario');
    }
  };

  const resetStreetState = () => {
    setStreetScore(0);
    setStreetRound(1);
    setStreetScenario(null);
    setIsStreetGameActive(false);
    setShowWalkingAnimation(false);
    setShowStreetFeedback(false);
    setStreetFeedbackMessage('');
    setStreetFeedbackType('');
    setShuffledStreetScenarios([]);
    setStreetScenarioIndex(0);
  };

  // Social Greetings game functions
  const getRandomGreetingScenario = () => {
    const greetingQuestions = questionsData[category]?.[difficulty]?.["Social Greetings"] || 
                              questionsData[category]?.["Social Greetings"] || [];
    const availableScenarios = greetingQuestions.filter(q => !usedScenarios.includes(q.id));
    if (availableScenarios.length === 0) return greetingQuestions[0]; // Fallback
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  const handleGreetingAnswer = (choice) => {
    if (greetingAnswered) return;
    
    // 🎤 Speak the choice text with teacher-like AI voice (clear & loud)
    speakText(choice.text);
    
    setGreetingSelectedChoice(choice);
    setGreetingAnswered(true);

    if (choice.correct) {
      setGreetingsScore(prev => prev + 20);
      setScore(prev => prev + 1);
      setGreetingFeedbackType('correct');
      setGreetingFeedbackMessage(choice.feedback);
      setShowGreetingAnimation(true);
      setShowGreetingFeedback(true);
      setShowCorrect(true);
      
      setTimeout(() => {
        setShowGreetingAnimation(false);
        setShowGreetingFeedback(false);
        setShowCorrect(false);
        
        // Auto-proceed to next greeting scenario
        if (greetingsRound < 5) {
          setGreetingsRound(prev => prev + 1);
          setGreetingAnswered(false);
          setGreetingSelectedChoice(null);
          
          // Get next scenario from shuffled array
          const nextIndex = greetingScenarioIndex + 1;
          setGreetingScenarioIndex(nextIndex);
          const nextScenario = shuffledGreetingScenarios[nextIndex];
          setCurrentGreetingScenario(nextScenario);
          
          setCharacterSpeech(nextScenario.otherCharacterSpeech);
          setShowCharacterThought(true);
        } else {
          setShowModal(true);
        }
      }, 3000);
    } else {
      setGreetingFeedbackType('incorrect');
      setGreetingFeedbackMessage(choice.feedback);
      setShowGreetingFeedback(true);
      setShowWrong(true);
      
      setTimeout(() => {
        setShowGreetingFeedback(false);
        setShowWrong(false);
        
        // Auto-proceed to next greeting scenario even on wrong answer
        if (greetingsRound < 5) {
          setGreetingsRound(prev => prev + 1);
          setGreetingAnswered(false);
          setGreetingSelectedChoice(null);
          
          // Get next scenario from shuffled array
          const nextIndex = greetingScenarioIndex + 1;
          setGreetingScenarioIndex(nextIndex);
          const nextScenario = shuffledGreetingScenarios[nextIndex];
          setCurrentGreetingScenario(nextScenario);
          setCharacterSpeech(nextScenario.otherCharacterSpeech);
          setShowCharacterThought(true);
        } else {
          setShowModal(true);
        }
      }, 2500);
    }
  };

  const initializeGreetingsGame = () => {
    if (isGreetingsGame && !isGreetingsGameActive) {
      setIsGreetingsGameActive(true);
      setGreetingsRound(1);
      setGreetingsScore(0);
      setUsedScenarios([]);
      setGreetingAnswered(false);
      setGreetingSelectedChoice(null);
      setGreetingScenarioIndex(0);
      
      // Get all greeting scenarios
      const allGreetingScenarios = questionsData[category]?.[difficulty]?.["Social Greetings"] || 
                                    questionsData[category]?.["Social Greetings"] || [];
      
      // Shuffle all scenarios and select first 5
      const shuffled = [...allGreetingScenarios].sort(() => Math.random() - 0.5);
      const selectedScenarios = shuffled.slice(0, 5);
      setShuffledGreetingScenarios(selectedScenarios);
      
      // Set up first scenario from shuffled selection
      const firstScenario = selectedScenarios[0];
      setCurrentGreetingScenario(firstScenario);
      if (firstScenario) {
        setCharacterSpeech(firstScenario.otherCharacterSpeech);
        setShowCharacterThought(true);
      }
    }
  };

  const resetGreetingsState = () => {
    setGreetingsScore(0);
    setGreetingsRound(1);
    setCurrentGreetingScenario(null);
    setIsGreetingsGameActive(false);
    setShowGreetingAnimation(false);
    setShowGreetingFeedback(false);
    setGreetingFeedbackMessage('');
    setGreetingFeedbackType('');
    setCharacterSpeech('');
    setShowCharacterThought(false);
    setGreetingAnswered(false);
    setGreetingSelectedChoice(null);
    setUsedScenarios([]);
    setShuffledGreetingScenarios([]);
    setGreetingScenarioIndex(0);
  };

  // Cashier game functions
  const handleItemSelect = (item) => {
    if (!isCashierGame) return;
    
    // 🎤 Speak the item name with teacher-like AI voice (clear & loud)
    speakText(item.name);
    
    const newSelectedItems = [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    
    // Calculate total price
    const newTotal = newSelectedItems.reduce((sum, selectedItem) => {
      const menuItem = currentQuestion.menuOptions.find(option => option.name === selectedItem.name);
      return sum + parseFloat(menuItem.price.replace('$', ''));
    }, 0);
    setOrderTotal(newTotal);
  };

  const handleRemoveItem = (index) => {
    const newSelectedItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newSelectedItems);
    
    // Recalculate total
    const newTotal = newSelectedItems.reduce((sum, selectedItem) => {
      const menuItem = currentQuestion.menuOptions.find(option => option.name === selectedItem.name);
      return sum + parseFloat(menuItem.price.replace('$', ''));
    }, 0);
    setOrderTotal(newTotal);
  };

  const handleCashierSubmit = () => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setGameStep(3);
    
    // Check if order matches
    const selectedItemNames = selectedItems.map(item => item.name).sort();
    const correctItemNames = [...currentQuestion.correctAnswer].sort();
    
    const isCorrect = JSON.stringify(selectedItemNames) === JSON.stringify(correctItemNames);
    
    if (isCorrect) {
      setCashierScore(prev => prev + 10);
      setScore(prev => prev + 1);
      setCurrentSpeaker('customer');
      setSpeechText("Thank you! You got my food right! Good job!");
      setShowThoughtBubble(true);
      setShowCorrect(true);
    } else {
      setCurrentSpeaker('customer');
      setSpeechText("That's not what I asked for. Try again next time!");
      setShowThoughtBubble(true);
      setShowWrong(true);
    }
  };

  // Reset selected items when moving to next question
  const resetCashierState = () => {
    setSelectedItems([]);
    setOrderTotal(0);
    setGameStep(1);
    setShowThoughtBubble(false);
    setCurrentSpeaker('customer');
    setSpeechText('');
  };

  // Money Value Game functions
  const initializeMoneyGame = () => {
    if (isMoneyGame && !isMoneyGameActive) {
      setIsMoneyGameActive(true);
      setMoneyRound(1);
      setMoneyScore(0);
      setSelectedPurchases([]);
      setTotalSpent(0);
      setIsRoundComplete(false);
      setShowBadgeCompletion(false);
      
      // Reset enhanced scoring
      setMoneyCorrectAnswers(0);
      setMoneyWrongAnswers(0);
      setMoneyTotalAttempts(0);
      setRoundScores([]);
      setCurrentRoundAttempts(0);
      
      // Get first round data
      const gameData = questions[0];
      if (gameData && gameData.rounds) {
        const firstRound = gameData.rounds[0];
        setCurrentBudget(firstRound.budget);
        setCurrentMoneyItems(firstRound.items);
      }
    }
  };

  const handlePurchaseItem = (item) => {
    if (!isMoneyGameActive || isRoundComplete) return;

    const isAffordable = item.price <= currentBudget;
    
    // Track attempt
    setMoneyTotalAttempts(prev => prev + 1);
    setCurrentRoundAttempts(prev => prev + 1);
    
    if (isAffordable) {
      // Correct purchase
      setSelectedPurchases(prev => [...prev, item]);
      setTotalSpent(prev => prev + item.price);
      setMoneyScore(prev => prev + 1);
      setMoneyCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 1); // Update main score for progress tracking
      setMoneyFeedbackType('correct');
      setMoneyFeedbackMessage(`✔️ Correct! You can afford the ${item.name} for ₱${item.price.toLocaleString()}`);
      setShowPurchaseAnimation(true);
      setShowCorrect(true);
      setShowMoneyFeedback(true);
      
      // Play correct audio
      if (correctAudioRef.current) {
        correctAudioRef.current.currentTime = 0;
        correctAudioRef.current.play();
      }
      
      setTimeout(() => {
        setShowPurchaseAnimation(false);
        setShowCorrect(false);
        setShowMoneyFeedback(false);
      }, 2000);
    } else {
      // Wrong purchase - too expensive
      setMoneyWrongAnswers(prev => prev + 1);
      setMoneyFeedbackType('wrong');
      setMoneyFeedbackMessage(`❌ Sorry! The ${item.name} costs ₱${item.price.toLocaleString()}, but you only have ₱${currentBudget.toLocaleString()}`);
      setShowWrong(true);
      setShowMoneyFeedback(true);
      
      // Play wrong audio
      if (wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play();
      }
      
      // Auto-advance to next round after wrong answer
      setTimeout(() => {
        setShowWrong(false);
        setShowMoneyFeedback(false);
        
        // Save current round score and proceed
        const roundData = {
          round: moneyRound,
          attempts: currentRoundAttempts + 1,
          correctPurchases: selectedPurchases.length,
          totalPossibleCorrect: currentMoneyItems.filter(i => i.price <= currentBudget).length,
          completed: true
        };
        setRoundScores(prev => [...prev, roundData]);
        
        // Proceed to next round or complete game
        if (moneyRound < 3) {
          proceedToNextMoneyRound();
        } else {
          completeMoneyGame();
        }
      }, 2500);
    }
  };

  const proceedToNextMoneyRound = () => {
    if (moneyRound < 3) {
      // Save current round score before proceeding
      const roundData = {
        round: moneyRound,
        attempts: currentRoundAttempts,
        correctPurchases: selectedPurchases.length,
        totalPossibleCorrect: currentMoneyItems.filter(i => i.price <= currentBudget).length,
        completed: true
      };
      setRoundScores(prev => [...prev, roundData]);
      
      // Move to next round
      const nextRound = moneyRound + 1;
      setMoneyRound(nextRound);
      setSelectedPurchases([]);
      setTotalSpent(0);
      setIsRoundComplete(false);
      setCurrentRoundAttempts(0);
      
      const gameData = questions[0];
      if (gameData && gameData.rounds) {
        const nextRoundData = gameData.rounds[nextRound - 1];
        setCurrentBudget(nextRoundData.budget);
        setCurrentMoneyItems(nextRoundData.items);
      }
    } else {
      completeMoneyGame();
    }
  };
  
  const completeMoneyGame = () => {
    // Save final round score
    const finalRoundData = {
      round: moneyRound,
      attempts: currentRoundAttempts,
      correctPurchases: selectedPurchases.length,
      totalPossibleCorrect: currentMoneyItems.filter(i => i.price <= currentBudget).length,
      completed: true
    };
    setRoundScores(prev => [...prev, finalRoundData]);
    
    // Calculate final statistics
    const totalPossibleCorrect = 6; // 2 affordable items per round × 3 rounds = 6 total possible
    const accuracyPercentage = moneyTotalAttempts > 0 ? Math.round((moneyCorrectAnswers / moneyTotalAttempts) * 100) : 0;
    const completionPercentage = Math.round((moneyCorrectAnswers / totalPossibleCorrect) * 100);
    
    // Update main score for progress tracking
    setScore(moneyCorrectAnswers);
    
    // Game completed - show badge
    setShowBadgeCompletion(true);
    setIsRoundComplete(true);
    
    // Play celebration sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
    
    // Call onComplete with detailed scoring after badge animation
    setTimeout(() => {
      const detailedScore = {
        correctAnswers: moneyCorrectAnswers,
        wrongAnswers: moneyWrongAnswers,
        totalAttempts: moneyTotalAttempts,
        accuracyPercentage,
        completionPercentage,
        roundBreakdown: roundScores,
        finalScore: moneyCorrectAnswers,
        maxPossibleScore: totalPossibleCorrect
      };
      
      onComplete(moneyCorrectAnswers, totalPossibleCorrect, detailedScore);
    }, 3000);
  };

  const resetMoneyGame = () => {
    setIsMoneyGameActive(false);
    setMoneyRound(1);
    setMoneyScore(0);
    setCurrentBudget(0);
    setCurrentMoneyItems([]);
    setSelectedPurchases([]);
    setMoneyFeedbackMessage('');
    setShowMoneyFeedback(false);
    setMoneyFeedbackType('');
    setShowPurchaseAnimation(false);
    setTotalSpent(0);
    setShowBadgeCompletion(false);
    setIsRoundComplete(false);
    
    // Reset enhanced scoring
    setMoneyCorrectAnswers(0);
    setMoneyWrongAnswers(0);
    setMoneyTotalAttempts(0);
    setRoundScores([]);
    setCurrentRoundAttempts(0);
  };

  const restartMoneyGame = () => {
    resetMoneyGame();
    initializeMoneyGame();
  };

  // Initialize cashier game when question starts
  useEffect(() => {
    if (isCashierGame && gameStep === 1) {
      setTimeout(() => {
        setCurrentSpeaker('customer');
        setSpeechText(currentQuestion.questionText);
        setShowThoughtBubble(true);
      }, 1000);
    }
  }, [currentQuestionIndex, isCashierGame]);

  // Initialize hygiene game when activity starts
  useEffect(() => {
    if (isHygieneGame) {
      initializeHygieneGame();
    }
  }, [currentQuestionIndex, isHygieneGame]);

  // Initialize street crossing game when activity starts
  useEffect(() => {
    if (activity === "Safe Street Crossing" && !isStreetGameActive) {
      console.log('Effect: Initializing Street Game');
      initializeStreetGame();
    }
  }, [activity]); // Remove currentQuestionIndex dependency

  // Initialize social greetings game when activity starts
  useEffect(() => {
    if (isGreetingsGame) {
      initializeGreetingsGame();
    }
  }, [currentQuestionIndex, isGreetingsGame]);

  // Initialize money value game when activity starts
  useEffect(() => {
    if (isMoneyGame) {
      initializeMoneyGame();
    }
  }, [currentQuestionIndex, isMoneyGame]);

  // Initialize memory game when activity starts
  useEffect(() => {
    console.log('🔍 Memory Game Effect Triggered', { isMemoryGame, currentQuestionIndex });
    
    if (isMemoryGame && currentQuestion && currentQuestion.cards) {
      console.log('✅ Setting cards:', currentQuestion.cards);
      
      // Set cards first
      setMemoryCards(currentQuestion.cards);
      
      // Reset all game state
      setIsMemoryGameActive(true);
      setMemoryGamePhase('memorize');
      setShowMemoryCardFronts(true);
      setMemoryTimer(12);
      setMemoryCardPositions([0, 1, 2, 3]);
      setRevealedCardPosition(null);
      setIsShuffling(false);
      
      // Select target card immediately
      const randomCard = currentQuestion.cards[Math.floor(Math.random() * currentQuestion.cards.length)];
      console.log('🎯 Target card selected at start:', randomCard);
      setCurrentTargetCard(randomCard);
      
      // Start memorization phase after a brief delay
      const timer = setTimeout(() => {
        console.log('👀 Starting memorization phase...');
        setMemoryGamePhase('memorize');
        setShowMemoryCardFronts(true);
        setMemoryTimer(12);
        
        // Countdown timer
        const countdown = setInterval(() => {
          setMemoryTimer(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              console.log('⏰ Timer finished, starting shuffle...');
              
              // Start shuffle phase (target card already visible)
              setMemoryGamePhase('shuffle');
              setShowMemoryCardFronts(false);
              setIsShuffling(true);
              
              // Perform shuffle animation
              setTimeout(() => {
                performCardShuffle();
              }, 500);
              
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, isMemoryGame]);

  // Initialize puzzle game when activity starts
  useEffect(() => {
    if (isPuzzleGame) {
      initializePuzzleGame();
    }
  }, [currentQuestionIndex, isPuzzleGame]);

  // Initialize household chores game when activity starts
  useEffect(() => {
    if (isChoreGame) {
      initializeChoreGame();
    }
  }, [isChoreGame]);

  // Handle moving to item selection step
  const handleStartSelecting = () => {
    // Keep the original order visible - don't change the speech text
    setGameStep(2);
    // Speech text remains the customer's original order (already set in speechText)
  };

  // Create connection line between matched items
  const createConnectionLine = (leftItemId, rightItemId) => {
    if (!gameContainerRef.current) return null;
    
    const leftElement = leftItemRefs.current[leftItemId];
    const rightElement = rightItemRefs.current[rightItemId];
    
    if (!leftElement || !rightElement) return null;
    
    const containerRect = gameContainerRef.current.getBoundingClientRect();
    const leftRect = leftElement.getBoundingClientRect();
    const rightRect = rightElement.getBoundingClientRect();
    
    // Calculate relative positions
    const x1 = leftRect.right - containerRect.left;
    const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
    const x2 = rightRect.left - containerRect.left;
    const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
    
    return { x1, y1, x2, y2, leftItemId, rightItemId };
  };

  // Academic Puzzle Game Functions
  const initializePuzzleGame = () => {
    const puzzleQuestions = questionsData[category]?.[difficulty]?.["Academic Puzzles"] || [];
    if (puzzleQuestions.length > 0) {
      const currentPuzzle = puzzleQuestions[currentQuestionIndex % puzzleQuestions.length];
      setCurrentPuzzleData(currentPuzzle);
      setCurrentPuzzleType(currentPuzzle.puzzleType);
      setPuzzleAttempts(0);
      setShowPuzzleHint(false);
      setSelectedPuzzleAnswers([]);
      setDraggedItems([]);
      setIsPuzzleComplete(false);
      setIsPuzzleGameActive(true);
    }
  };

  const handlePuzzleAnswer = (answer, isCorrect = null) => {
    console.log("handlePuzzleAnswer called with:", { answer, isCorrect, correctAnswer: currentPuzzleData.correctAnswer });
    setPuzzleAttempts(prev => prev + 1);
    
    // If isCorrect is not provided, check the answer against correctAnswer
    let correct = isCorrect;
    if (correct === null) {
      if (currentPuzzleData.puzzleType === 'matching') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else if (currentPuzzleData.puzzleType === 'logic' || currentPuzzleData.puzzleType === 'math' || currentPuzzleData.puzzleType === 'sequence') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else if (currentPuzzleData.puzzleType === 'spelling') {
        correct = answer === currentPuzzleData.correctAnswer;
      } else {
        correct = answer === currentPuzzleData.correctAnswer;
      }
    }
    
    console.log("Answer check result:", { answer, correctAnswer: currentPuzzleData.correctAnswer, correct });
    
    if (correct) {
      setPuzzleScore(prev => prev + 1);
      setScore(prev => prev + 1);
      setPuzzleFeedbackMessage("🎉 Excellent! You solved the puzzle!");
      setPuzzleFeedbackType("correct");
      setShowPuzzleFeedback(true);
      setShowPuzzleAnimation(true);
      setIsPuzzleComplete(true);
      
      // Show the same correct modal as Identification
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 1500);
      
      // Play success sound
      if (correctAudioRef.current) {
        correctAudioRef.current.play();
      }
      
      // Auto-proceed to next question after showing correct modal
      setTimeout(() => {
        setShowPuzzleAnimation(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setPuzzleAttempts(0);
          setShowPuzzleHint(false);
          setIsPuzzleComplete(false);
          setCurrentPuzzleData(null);
          setSelectedPuzzleAnswers([]);
          setDraggedItems([]);
          setTargetPositions([]);
        } else {
          // If it's the last question, show completion modal
          setShowModal(true);
        }
      }, 1500); // Wait 1.5 seconds after correct answer before proceeding
      
    } else {
      setPuzzleFeedbackMessage("🤔 Not quite right. Try again!");
      setPuzzleFeedbackType("incorrect");
      setShowPuzzleFeedback(true);
      
      // Show the same wrong modal as Identification
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 1500);
      
      // Play wrong sound
      if (wrongAudioRef.current) {
        wrongAudioRef.current.play();
      }
      
      // Auto-proceed to next question after showing wrong modal
      setTimeout(() => {
        setShowPuzzleFeedback(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
          setPuzzleAttempts(0);
          setShowPuzzleHint(false);
          setIsPuzzleComplete(false);
          setCurrentPuzzleData(null);
          setSelectedPuzzleAnswers([]);
          setDraggedItems([]);
          setTargetPositions([]);
        } else {
          // If it's the last question, show completion modal
          setShowModal(true);
        }
      }, 1500); // Wait 1.5 seconds after wrong answer before proceeding
      
    }
  };

  const handlePuzzleDrag = (item, targetPosition) => {
    const newDraggedItems = [...draggedItems];
    const existingIndex = newDraggedItems.findIndex(d => d.id === item.id);
    
    if (existingIndex >= 0) {
      newDraggedItems[existingIndex] = { ...item, position: targetPosition };
    } else {
      newDraggedItems.push({ ...item, position: targetPosition });
    }
    
    setDraggedItems(newDraggedItems);
  };

  const checkPuzzleCompletion = () => {
    if (!currentPuzzleData) return;
    
    switch (currentPuzzleData.puzzleType) {
      case 'sequence':
        const allItemsPlaced = currentPuzzleData.items.every(item => 
          draggedItems.some(dragged => dragged.id === item.id)
        );
        if (allItemsPlaced) {
          const isCorrectOrder = currentPuzzleData.items.every(item => {
            const draggedItem = draggedItems.find(d => d.id === item.id);
            return draggedItem && draggedItem.position === item.order - 1;
          });
          handlePuzzleAnswer(null, isCorrectOrder);
        }
        break;
        
      case 'spelling':
        if (selectedPuzzleAnswers.length === currentPuzzleData.targetWord.length) {
          const isCorrect = selectedPuzzleAnswers.join('') === currentPuzzleData.targetWord;
          handlePuzzleAnswer(selectedPuzzleAnswers.join(''), isCorrect);
        }
        break;
        
      default:
        break;
    }
  };

  const resetPuzzle = () => {
    setSelectedPuzzleAnswers([]);
    setDraggedItems([]);
    setPuzzleAttempts(0);
    setShowPuzzleHint(false);
    setShowPuzzleFeedback(false);
    setIsPuzzleComplete(false);
    setPuzzleFeedbackType('');
    setPuzzleFeedbackMessage('');
  };

  // New Drag-and-Drop Matching Game Functions
  const handleDragStart = (e, item, side) => {
    setDragging({ item, side });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = (e, targetItem, targetSide) => {
    if (!dragging) return;
    
    // Only allow connections from left to right
    if (dragging.side === 'left' && targetSide === 'right') {
      const existingConnection = dragConnections.find(
        conn => conn.leftId === dragging.item.id || conn.rightId === targetItem.id
      );
      
      if (!existingConnection) {
        const newConnection = {
          leftId: dragging.item.id,
          rightId: targetItem.id,
          leftContent: dragging.item.content,
          rightContent: targetItem.content,
          isCorrect: targetItem.matchId === dragging.item.id
        };
        
        setDragConnections(prev => [...prev, newConnection]);
        // canSubmit will be updated by useEffect when dragConnections changes
      }
    }
    
    setDragging(null);
    setDragStart(null);
  };

  const handleCheckAnswers = async () => {
    const correct = dragConnections.filter(conn => conn.isCorrect);
    const incorrect = dragConnections.filter(conn => !conn.isCorrect);
    
    setCorrectConnections(correct.map(conn => ({ leftId: conn.leftId, rightId: conn.rightId })));
    setIncorrectConnections(incorrect.map(conn => ({ leftId: conn.leftId, rightId: conn.rightId })));
    setIsAnswersChecked(true);
    
    // Calculate score (dynamic based on current question)
    const totalItems = currentQuestion?.leftItems?.length || 0;
    const finalScore = correct.length;
    setMatchingScore(finalScore);
    setScore(prev => prev + finalScore);
    
    // Show completion with detailed feedback (dynamic)
    if (finalScore === totalItems) {
      setMatchingFeedbackMessage(`🎉 PERFECT SCORE! All ${totalItems} answers correct! Excellent work! 🎊`);
      setMatchingFeedbackType("correct");
    } else if (finalScore >= Math.ceil(totalItems * 0.7)) {
      setMatchingFeedbackMessage(`🎯 Great job! ${finalScore}/${totalItems} correct. ${totalItems - finalScore} to review.`);
      setMatchingFeedbackType("partial");
    } else {
      setMatchingFeedbackMessage(`💪 Keep trying! ${finalScore}/${totalItems} correct. Review and try again!`);
      setMatchingFeedbackType("incorrect");
    }
    setShowMatchingFeedback(true);
    
    // Record activity completion in database and check for badges
    await handleActivityComplete(finalScore, totalItems);
    
    // Start countdown for auto-redirect
    setRedirectCountdown(5);
    
    // Auto-redirect to activities page after 5 seconds
    setTimeout(() => {
      navigate(-1); // Go back to activities/flashcards page
    }, 5000);
  };

  const handleResetConnections = () => {
    setDragConnections([]);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setIsAnswersChecked(false);
    setCanSubmit(false);
    setShowMatchingFeedback(false);
    setMatchingScore(0);
    setMatchingFeedbackMessage('');
  };

  // Connection visualization function for string-like connections
  const getConnectionPath = (leftId, rightId) => {
    const leftElement = document.getElementById(`left-item-${leftId}`);
    const rightElement = document.getElementById(`right-item-${rightId}`);
    
    if (!leftElement || !rightElement) return '';
    
    const leftRect = leftElement.getBoundingClientRect();
    const rightRect = rightElement.getBoundingClientRect();
    const container = document.getElementById('matching-container')?.getBoundingClientRect();
    
    if (!container) return '';
    
    // Connect from right edge of left container to left edge of right container
    const startX = leftRect.right - container.left;
    const startY = leftRect.top + leftRect.height / 2 - container.top;
    const endX = rightRect.left - container.left;
    const endY = rightRect.top + rightRect.height / 2 - container.top;
    
    // Create straight string line (not curved)
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  const resetMatchingGame = () => {
    // Reset drag-and-drop state
    setDragConnections([]);
    setCorrectConnections([]);
    setIncorrectConnections([]);
    setDragging(null);
    setDragStart(null);
    setIsAnswersChecked(false);
    setCanSubmit(false);
    
    // Reset general matching state
    setMatchingConnections([]);
    setSelectedLeftItem(null);
    setSelectedRightItem(null);
    setMatchedPairs([]);
    setIsMatchingComplete(false);
    setShowMatchingFeedback(false);
    setMatchingFeedbackMessage('');
    setWrongConnections([]);
    setMatchingScore(0);
  };

  // Household Chores Helper Game Functions
  const getRandomChore = () => {
    if (!questions || questions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  const initializeChoreGame = () => {
    if (!questions || questions.length === 0) return;
    
    const choreData = getRandomChore();
    if (!choreData) return;
    
    setCurrentChoreId(choreData.choreId);
    setCurrentChoreStep(0);
    setChoreProgress([]);
    setCompletedChoreSteps([]);
    setCompletedSteps([]);
    setDraggedChoreItems([]);
    setDroppedChoreItems([]);
    setDraggedItem(null);
    setChoreScore(0);
    setIsChoreComplete(false);
    setShowChoreFeedback(false);
    setChoreFeedbackType('');
    setChoreFeedbackMessage('');
    setCharacterThought(`Let's learn how to ${choreData.choreName.toLowerCase()}! Watch carefully and follow the steps.`);
    setShowCharacterSpeech(true);
    
    // Set up the tools and environment for this chore
    const steps = choreData.steps;
    const allTools = [];
    const allEnvironmentItems = [];
    
    steps.forEach(step => {
      if (step.requiredTools) allTools.push(...step.requiredTools);
      if (step.environmentItems) allEnvironmentItems.push(...step.environmentItems);
    });
    
    setChoreToolsAvailable([...new Set(allTools)]);
    setChoreEnvironmentItems([...new Set(allEnvironmentItems)]);
    
    setTimeout(() => setShowCharacterSpeech(false), 3000);
  };

  const handleChoreAction = (actionType, itemId) => {
    if (isChoreComplete || !currentChoreId) return;
    
    const choreData = questions.find(q => q.choreId === currentChoreId);
    if (!choreData) return;
    
    const currentStep = choreData.steps[currentChoreStep];
    if (!currentStep) return;
    
    let isCorrectAction = false;
    
    // Check if this action is correct for the current step
    if (actionType === 'use_tool' && currentStep.requiredTools?.includes(itemId)) {
      isCorrectAction = true;
    } else if (actionType === 'interact' && currentStep.environmentItems?.includes(itemId)) {
      isCorrectAction = true;
    } else if (actionType === 'sequence' && currentStep.actionType === 'sequence') {
      isCorrectAction = true;
    }
    
    if (isCorrectAction) {
      // Add to progress
      const newProgress = [...choreProgress, { step: currentChoreStep, action: actionType, item: itemId }];
      setChoreProgress(newProgress);
      setCompletedChoreSteps([...completedChoreSteps, currentChoreStep]);
      
      // Update character feedback
      const feedbackMessages = [
        "Great job! You're doing it right!",
        "Perfect! Keep going!",
        "Excellent work! That's exactly right!",
        "You're learning so well!"
      ];
      setCharacterThought(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
      setShowCharacterSpeech(true);
      
      // Move to next step or complete
      if (currentChoreStep < choreData.steps.length - 1) {
        setTimeout(() => {
          setCurrentChoreStep(prev => prev + 1);
          setShowCharacterSpeech(false);
        }, 2000);
      } else {
        // Complete the chore
        setIsChoreComplete(true);
        setChoreScore(choreData.steps.length);
        setChoreFeedbackType('correct');
        setChoreFeedbackMessage(`🎉 Amazing! You completed "${choreData.title}"! You've learned an important life skill!`);
        setShowChoreFeedback(true);
        setCharacterThought("You did it! I'm so proud of you! You're becoming very independent!");
        
        // Award badge
        setTimeout(() => {
          setIsAnswered(true);
        }, 3000);
      }
    } else {
      // Incorrect action - provide guidance
      setChoreFeedbackType('incorrect');
      setChoreFeedbackMessage(`Not quite right. Try ${currentStep.instruction}`);
      setShowChoreFeedback(true);
      setCharacterThought(`Remember: ${currentStep.instruction}. You can do it!`);
      setShowCharacterSpeech(true);
      
      setTimeout(() => {
        setShowChoreFeedback(false);
        setShowCharacterSpeech(false);
      }, 3000);
    }
  };

  const handleChoreDrag = (item, isCorrectPlacement) => {
    if (isCorrectPlacement) {
      setDroppedChoreItems([...droppedChoreItems, item]);
      handleChoreAction('drag', item);
    } else {
      setChoreFeedbackType('incorrect');
      setChoreFeedbackMessage('Try placing that item in the right spot!');
      setShowChoreFeedback(true);
      setTimeout(() => setShowChoreFeedback(false), 2000);
    }
  };

  const resetChoreState = () => {
    setCurrentChoreId('');
    setCurrentChoreStep(0);
    setChoreProgress([]);
    setCompletedChoreSteps([]);
    setCompletedSteps([]);
    setChoreToolsAvailable([]);
    setChoreEnvironmentItems([]);
    setDraggedChoreItems([]);
    setDroppedChoreItems([]);
    setDraggedItem(null);
    setChoreScore(0);
    setIsChoreComplete(false);
    setShowChoreFeedback(false);
    setChoreFeedbackType('');
    setChoreFeedbackMessage('');
    setCharacterThought('');
    setShowCharacterSpeech(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  // Handle student answers for chore steps
  const handleChoreStepAnswer = (isCorrect, selectedChoice) => {
    setIsAnswered(true);
    
    if (isCorrect) {
      setCharacterThought("Excellent! That's exactly right!");
      setShowCharacterSpeech(true);
      setTimeout(() => setShowCharacterSpeech(false), 2000);
    } else {
      setCharacterThought("Not quite! Think about what you need to do for this chore.");
      setShowCharacterSpeech(true);
      setTimeout(() => setShowCharacterSpeech(false), 3000);
    }
  };

  // Helper functions for chore game icons
  const getToolIcon = (tool) => {
    const toolIcons = {
      'soap': '🧼',
      'sponge': '🧽',
      'towel': '🪣',
      'broom': '🧹',
      'dustpan': '🗑️',
      'vacuum': '🔌',
      'pillow': '🛏️',
      'sheet': '🛏️',
      'blanket': '🛌',
      'toy box': '📦',
      'basket': '🧺',
      'trash bag': '🗑️'
    };
    return toolIcons[tool] || '🔧';
  };

  const getEnvironmentIcon = (item) => {
    const envIcons = {
      'sink': '🚿',
      'dishes': '🍽️',
      'floor': '🏠',
      'bed': '🛏️',
      'living room': '🛋️',
      'toys': '🧸',
      'trash can': '🗑️',
      'kitchen': '🍳',
      'bedroom': '🛏️',
      'water': '💧',
      'counter': '🏠'
    };
    return envIcons[item] || '🏠';
  };

  // Handle answer selection
  const handleAnswerClick = (choice) => {
    if (isAnswered) return;
    
    // 🎤 Speak the choice text with teacher-like AI voice (clear & loud)
    speakText(choice);
    
    // Track timing for this question
    const questionStartTime = new Date();
    
    setSelectedAnswer(choice);
    setIsAnswered(true);

    const isCorrect = choice === questions[currentQuestionIndex].correctAnswer;
    const isSocialDailyLifeSkill = category === "Social / Daily Life Skill";

    if (isCorrect) {
      setScore(prev => prev + 1);
      setShowCorrect(true);
      
      // Track if first question was correct and show badge preview
      if (currentQuestionIndex === 0) {
        setSessionStats(prev => ({ ...prev, firstQuestionCorrect: true }));
        // Show preview for first try hero badge
        setPreviewBadge({
          name: 'First Try Hero',
          icon: '🎪',
          message: 'Great start! Keep it up!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 2000);
      }
      
      // Show perfect score preview when getting close to end
      if (score + 1 === questions.length && currentQuestionIndex === questions.length - 1) {
        setPreviewBadge({
          name: 'Perfect Score Champion',
          icon: '🏆',
          message: 'Perfect! Amazing work!'
        });
        setShowBadgePreview(true);
        setTimeout(() => setShowBadgePreview(false), 3000);
      }
      
      setTimeout(() => {
        setShowCorrect(false);
        // Auto-proceed for Social / Daily Life Skill activities
        if (isSocialDailyLifeSkill) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            resetCashierState();
            resetStreetState();
            resetMatchingGame();
          } else {
            setShowModal(true);
          }
        }
      }, 1500);
    } else {
      setShowWrong(true);
      setTimeout(() => {
        setShowWrong(false);
        // Auto-proceed for Social / Daily Life Skill activities
        if (isSocialDailyLifeSkill) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            resetCashierState();
            resetStreetState();
            resetMatchingGame();
          } else {
            setShowModal(true);
          }
        }
      }, 1500);
    }
    
    // Update session stats with timing
    const questionTime = (new Date() - questionStartTime) / 1000;
    setSessionStats(prev => ({
      ...prev,
      questionTimes: [...prev.questionTimes, questionTime]
    }));
  };

  const handleNextClick = () => {
    // Always hide overlays when moving to next question
    setShowCorrect(false);
    setShowWrong(false);
    setShowThoughtBubble(false); // Hide the thought bubble only here
    
    // Handle hygiene game progression (5 rounds max)
    if (isHygieneGame && currentRound < 5) {
      setCurrentRound(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      
      // Get next scenario from shuffled array
      const nextIndex = hygieneScenarioIndex + 1;
      setHygieneScenarioIndex(nextIndex);
      const nextScenario = shuffledHygieneScenarios[nextIndex];
      
      if (nextScenario) {
        setCurrentScenario(nextScenario);
        setUsedScenarios(prev => [...prev, nextScenario.scenario]);
        
        // Update current question index to show the new scenario
        const questionIndex = questions.findIndex(q => q.scenario === nextScenario.scenario);
        if (questionIndex !== -1) {
          setCurrentQuestionIndex(questionIndex);
        }
      }
    } else if (isHygieneGame && currentRound >= 5) {
      // End hygiene game after 5 rounds
      setShowModal(true);
    } else if (isStreetGame && streetRound >= 5) {
      // End street game after 5 rounds (handled in handleStreetAnswer)
      // Modal is shown automatically in handleStreetAnswer
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      resetCashierState(); // Reset cashier game state
      resetStreetState(); // Reset street game state
      resetMatchingGame(); // Reset matching game state
    } else {
      setShowModal(true);
    }
  };

  // Calculate badges earned based on performance
  const calculateSessionBadges = (finalScore, totalQuestions) => {
    const endTime = new Date();
    const totalTime = (endTime - sessionStats.startTime) / 1000; // in seconds
    const averageTime = sessionStats.questionTimes.length > 0 
      ? sessionStats.questionTimes.reduce((a, b) => a + b, 0) / sessionStats.questionTimes.length 
      : totalTime / totalQuestions;

    const enhancedStats = {
      ...sessionStats,
      category,
      difficulty,
      activity,
      totalTime,
      averageTime,
      percentage: totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0
    };

    return calculateEarnedBadges(finalScore, totalQuestions, category, difficulty, activity, enhancedStats);
  };

  // Helper function to handle activity completion and record to database
  const handleActivityComplete = async (finalScore, totalQuestions) => {
    console.log('🎯 Activity completion started:', { 
      finalScore, 
      totalQuestions, 
      userId: user?.id,
      category,
      difficulty,
      activity 
    });

    // Record activity completion in database
    if (user?.id) {
      try {
        const scorePercentage = Math.round((finalScore / totalQuestions) * 100);
        
        // Map activity names to IDs (based on actual database activities)
        const getActivityId = (activityName, category, difficulty) => {
          // Map to actual database activity IDs - creating separate IDs for different activity types
          
          const activityMap = {
            // Numbers/Counting activities - ID 1
            'Numbers 1-10': 1,
            'Numbers 11-20': 1,
            'Basic Math': 1,
            'Counting Adventure': 1,
            'Numbers': 1,
            
            // Shape activities - ID 2  
            'Basic Shapes': 2,
            'Shape Recognition': 2,
            'Shape Detective': 2,
            'Shapes': 2,
            
            // Color activities - ID 4 (separate from shapes)
            'Basic Colors': 4,
            'Advanced Colors': 4,
            'Color Mixing': 4,
            'Colors': 4,
            
            // Social/Daily Life activities - ID 3
            'Hygiene Hero': 3,
            'Cashier Game': 3,
            'Safe Street Crossing': 3,
            'Tooth Brushing': 3,
            'Grocery Helper': 3,
            
            // Identification activities - ID 5
            'Identification': 5,
            'Animal Recognition': 5,
            'Object Naming': 5,
            
            // Matching activities - ID 6
            'Matching Type': 6,
            'Matching': 6,
            'Match Finder': 6,
            
            // Memory activities - ID 7
            'Visual Memory Challenge': 7,
            'Memory Game': 7,
            
            // Academic Puzzles - ID 8
            'Academic Puzzles': 8,
            'Puzzles': 8
          };
          
          // Try exact activity name match first
          if (activityMap[activityName]) {
            return activityMap[activityName];
          }
          
          // Try category-based mapping if no exact match
          if (category === 'Academic') {
            if (activityName.toLowerCase().includes('number') || activityName.toLowerCase().includes('count')) {
              return 1; // Numbers
            } else if (activityName.toLowerCase().includes('shape')) {
              return 2; // Shapes
            } else if (activityName.toLowerCase().includes('color')) {
              return 4; // Colors
            } else if (activityName.toLowerCase().includes('identification')) {
              return 5; // Identification
            } else if (activityName.toLowerCase().includes('matching')) {
              return 6; // Matching
            } else if (activityName.toLowerCase().includes('memory')) {
              return 7; // Memory
            } else if (activityName.toLowerCase().includes('puzzle')) {
              return 8; // Puzzles
            }
          } else if (category === 'Social / Daily Life Skill' || category === 'Social/Daily Life') {
            return 3; // Social/Daily Life
          }
          
          return 1; // Default to Numbers if not found
        };
        
        const activityId = getActivityId(activity, category, difficulty);
        
        console.log('🚀 Activity mapping details:', {
          activityName: activity,
          category: category,
          difficulty: difficulty,
          mappedActivityId: activityId
        });
        
        console.log('🚀 Calling handleActivityCompletion with:', {
          studentId: user.id,
          activityId,
          score: scorePercentage,
          status: 'completed'
        });
        
        const result = await handleActivityCompletion(
          user.id, // studentId (using current user's ID)
          activityId, // activityId 
          scorePercentage, // score (as percentage)
          'completed' // completion status
        );
        
        console.log('✅ Activity completion result:', result);
        
        if (result.errors && result.errors.length > 0) {
          console.error('❌ Activity completion errors:', result.errors);
        } else {
          console.log('🎉 Activity completion recorded successfully!');
        }
      } catch (error) {
        console.error('💥 Failed to record activity completion:', error);
      }
    } else {
      console.warn('⚠️ No user ID found, cannot record activity completion');
    }
    
    // Call the original onComplete callback
    onComplete(finalScore, totalQuestions);
  };

  const handleFinish = async () => {
    setShowModal(false);
    
    // Calculate earned badges with enhanced statistics
    let badges = calculateSessionBadges(score, total);
    
    // Add special memory game badges
    if (activity === "Visual Memory Challenge" || isMemoryGame) {
      badges.push({
        name: "Memory Master",
        description: "Completed the Visual Memory Challenge!",
        icon: "🧠",
        rarity: "gold",
        category: "Academic"
      });

      const accuracyPercentage = memoryAttempts > 0 ? Math.round((memoryCorrectAnswers / memoryAttempts) * 100) : 0;
      
      if (accuracyPercentage === 100) {
        badges.push({
          name: "Perfect Memory",
          description: "100% accuracy! Amazing memory skills!",
          icon: "🌟",
          rarity: "legendary",
          category: "Academic"
        });
      } else if (accuracyPercentage >= 80) {
        badges.push({
          name: "Memory Expert",
          description: "Excellent memory performance!",
          icon: "⭐",
          rarity: "gold",
          category: "Academic"
        });
      } else if (accuracyPercentage >= 60) {
        badges.push({
          name: "Memory Pro",
          description: "Great memory tracking!",
          icon: "✨",
          rarity: "silver",
          category: "Academic"
        });
      }
    }
    
    // Add special cashier game badges
    if (activity === "Cashier Game") {
      if (cashierScore >= 80) {
        badges.push({
          name: "Master Cashier",
          description: "Earned 80+ points as a cashier!",
          icon: "🏆",
          rarity: "gold",
          category: "Social Skills"
        });
      } else if (cashierScore >= 60) {
        badges.push({
          name: "Senior Cashier",
          description: "Earned 60+ points as a cashier!",
          icon: "🥈",
          rarity: "silver",
          category: "Social Skills"
        });
      } else if (cashierScore >= 40) {
        badges.push({
          name: "Junior Cashier",
          description: "Earned 40+ points as a cashier!",
          icon: "🥉",
          rarity: "bronze",
          category: "Social Skills"
        });
      }
    }

    // Add special hygiene hero badges
    if (activity === "Hygiene Hero") {
      // Always award the Hygiene Hero badge for completing the game
      badges.push({
        name: "Hygiene Hero",
        description: "Completed the hygiene game and learned healthy habits!",
        icon: "🧼",
        rarity: "gold",
        category: "Daily Life Skills"
      });

      // Award additional badges based on performance
      if (hygieneScore >= 5) {
        badges.push({
          name: "Perfect Hygiene Master",
          description: "Got all 5 hygiene scenarios correct!",
          icon: "✨",
          rarity: "legendary",
          category: "Daily Life Skills"
        });
      } else if (hygieneScore >= 4) {
        badges.push({
          name: "Hygiene Expert",
          description: "Excellent hygiene knowledge!",
          icon: "🌟",
          rarity: "gold",
          category: "Daily Life Skills"
        });
      } else if (hygieneScore >= 3) {
        badges.push({
          name: "Clean & Healthy",
          description: "Good hygiene habits!",
          icon: "🧽",
          rarity: "silver",
          category: "Daily Life Skills"
        });
      }
    }

    // Add special safe street crossing badges
    if (activity === "Safe Street Crossing") {
      // Always award the Brave Crosser badge for completing the game
      badges.push({
        name: "Brave Crosser",
        description: "Completed the street safety game and learned safe crossing!",
        icon: "🚦",
        rarity: "gold",
        category: "Daily Life Skills"
      });

      // Award additional badges based on performance
      if (streetScore >= 5) {
        badges.push({
          name: "Safety Champion",
          description: "Perfect score! You know all the street safety rules!",
          icon: "🏆",
          rarity: "legendary",
          category: "Daily Life Skills"
        });
      } else if (streetScore >= 4) {
        badges.push({
          name: "Street Safety Expert",
          description: "Excellent knowledge of crossing safely!",
          icon: "🛡️",
          rarity: "gold",
          category: "Daily Life Skills"
        });
      } else if (streetScore >= 3) {
        badges.push({
          name: "Careful Walker",
          description: "Good job learning to cross safely!",
          icon: "🚶‍♂️",
          rarity: "silver",
          category: "Daily Life Skills"
        });
      }
    }
    
    setEarnedBadges(badges);
    
    // Save badges to storage (for future persistence)
    if (badges.length > 0) {
      saveBadgesToStorage(badges);
    }
    
    // Show badge modal if badges were earned
    if (badges.length > 0) {
      setTimeout(() => {
        setShowBadgeModal(true);
        if (badgeAudioRef.current) {
          badgeAudioRef.current.currentTime = 0;
          badgeAudioRef.current.play();
        }
      }, 500);
    } else {
      // No badges, proceed to complete

      // For memory game, pass detailed score
      if (isMemoryGame || activity === "Visual Memory Challenge") {
        const accuracyPercentage = memoryAttempts > 0 ? Math.round((memoryCorrectAnswers / memoryAttempts) * 100) : 0;
        const detailedScore = {
          correctAnswers: memoryCorrectAnswers,
          wrongAnswers: memoryWrongAnswers,
          totalAttempts: memoryAttempts,
          accuracyPercentage,
          finalScore: memoryCorrectAnswers,
          maxPossibleScore: 3
        };
        onComplete(score, total, detailedScore);
      } else {
        onComplete(score, total);
      }

      handleActivityComplete(score, total);

    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-600">
          No flashcards available for {category} - {difficulty} - {activity}
        </h2>
        <p className="text-gray-500 mt-2">Please select a different combination.</p>
      </div>
    );
  }

  return (
  <div className="relative">
 
  {/* Flashcard Container */}
  <div className="w-270 bg-white/90 backdrop-blur-xl rounded-3xl mx-auto shadow-2xl border border-white/20 p-6 text-center animate-fade-in-scale">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-3 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-200/20 to-yellow-200/20 rounded-full blur-xl animate-float-delayed"></div>
        
        {/* Music Toggle Button */}
        <button
          onClick={toggleMusic}
          className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 border-2 border-purple-200/50"
          title={isMusicMuted ? "Unmute Music" : "Mute Music"}
        >
          <span className="text-2xl">
            {isMusicMuted ? "🔇" : "🎵"}
          </span>
        </button>

        <div className="relative z-10 ">
          {/* Question Counter with modern design */}
          <div className="-mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6 py-1 border border-blue-200/30 inline-block">
            <div className="text-base font-bold text-gray-700 flex items-center justify-center space-x-2">
              <span className="text-2xl animate-bounce-gentle">
                {isHygieneGame ? "🧼" : isChoreGame ? "🏠" : "🌟"}
              </span>
              <span>
                {isHygieneGame 
                  ? `Round ${currentRound} of 5`
                  : isChoreGame && currentChoreId
                  ? `Learning: ${questions.find(q => q.choreId === currentChoreId)?.choreName || 'Chore'}`
                  : `Question ${currentQuestionIndex + 1} of ${total}`
                }
              </span>
              <span className="text-2xl animate-pulse-gentle">✨</span>
            </div>
          </div>

          {/* Question with improved typography */}
          {!isCashierGame && !isHygieneGame && !isStreetGame && !isGreetingsGame && !isMoneyGame && !isMatchingGame && !isPuzzleGame && !isChoreGame && !isMemoryGame && (
            // <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200/30 shadow-lg">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-relaxed">
                {questions[currentQuestionIndex].questionText}
              </h2>
            // </div>
          )}

          {/* Image/Video with modern container */}
          <div className="flex justify-center flex-wrap gap-4 mb-4">
            {questions[currentQuestionIndex].imageSrc && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200/30 shadow-lg">
                <img
                  src={questions[currentQuestionIndex].imageSrc}
                  alt={questions[currentQuestionIndex].questionText}
                  className="w-full max-w-lg object-contain rounded-xl"
                />
              </div>
            )}
            {questions[currentQuestionIndex].videoSrc && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200/30 shadow-lg">
                <OptimizedVideo
                  ref={videoRef}
                  src={questions[currentQuestionIndex].videoSrc}
                  className="w-full max-w-xl rounded-xl shadow-md"
                  controls={true}
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            )}
          </div>

          {/* Answer Choices with autism-friendly design */}
          {!isCashierGame && !isHygieneGame && !isStreetGame && !isGreetingsGame && !isMoneyGame && !isMatchingGame && !isPuzzleGame && !isChoreGame && !isMemoryGame ? (
            <div className="relative">
              {/* Correct Answer Overlay for Academic Activities */}
              {showCorrect && (
                <div className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                  <audio ref={correctAudioRef} src={correctSound} />
                  <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                </div>
              )}

              {/* Wrong Answer Overlay for Academic Activities */}
              {showWrong && (
                <div className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                  <audio ref={wrongAudioRef} src={wrongSound} />
                  <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
              {questions[currentQuestionIndex].answerChoices.map((choice, index) => (
                <button
                  key={index}
                  className={`
                    w-[500px]
                    ${
                      choice === questions[currentQuestionIndex].correctAnswer && isAnswered
                        ? "h-10 bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-105 shadow-2xl animate-success-pulse"
                        : selectedAnswer === choice && choice !== questions[currentQuestionIndex].correctAnswer
                        ? "h-10 bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-105 shadow-2xl"
                        : "h-10 -mb-2 bg-blue-100 hover:bg-blue-200 text-gray-800 border-blue-200/50 hover:border-purple-300/70"
                    } 
                    text-xl font-bold py-6 px-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 backdrop-blur-sm transform
                    focus:outline-none focus:ring-4 focus:ring-purple-200/50
                    ${!isAnswered ? 'hover:animate-bounce-gentle' : ''}
                    min-h-[4rem] flex items-center justify-center
                  `}
                  {...getButtonSoundHandlers(() => handleAnswerClick(choice))}
                  disabled={isAnswered}
                >
                  <span className="relative z-10">{choice}</span>
                </button>
              ))}
            </div>
            </div>
          ) : isHygieneGame ? (
            /* Modern Interactive Hygiene Game UI */
            <div className="space-y-8">
              {/* Round Indicator */}
              {/* <div className="text-center mb-6">
                <div className="inline-flex bg-gradient-to-r from-blue-100 to-green-100 rounded-full px-8 py-4 border-3 border-blue-300 shadow-lg">
                  <span className="text-2xl font-bold text-blue-800 flex items-center space-x-3">
                    <span className="text-3xl animate-bounce-gentle">🧼</span>
                    <span>Round {currentRound} of 5</span>
                    <span className="text-3xl animate-pulse-gentle">✨</span>
                  </span>
                </div>
              </div> */}

              {/* Main Scenario Area */}
              <div className="bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 rounded-3xl pb-8 border-4 border-blue-200 relative overflow-hidden">
                {/* Correct Answer Overlay */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Background Character */}
                <div className="absolute top-4 right-4 text-6xl opacity-20 animate-float">
                  {currentQuestion?.backgroundImage || "🏠"}
                </div>

                {/* Character Display */}
                <div className="flex flex-col items-center mb-8 relative">
                  {/* Success Animation Overlay */}
                  {showSuccessAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="text-8xl animate-bounce-gentle">
                        {successAnimationText}
                      </div>
                    </div>
                  )}

                  {/* Main Character */}
                  <div className={`text-[8rem] mb-4 -mt-7 transition-all duration-500 ${showSuccessAnimation ? 'scale-110' : ''}`}>
                    {currentQuestion?.isCharacterVideo ? (
                      <OptimizedVideo
                        src={currentQuestion?.characterEmoji}
                        className="w-64 h-64 object-contain rounded-xl mx-auto"
                        autoPlay={true}
                        loop={true}
                        muted={true}
                        style={{ display: 'block' }}
                      />
                    ) : (
                      // Check if it's an image path (starts with / or contains file extension)
                      currentQuestion?.characterEmoji?.startsWith('/') || 
                      currentQuestion?.characterEmoji?.includes('.jpg') || 
                      currentQuestion?.characterEmoji?.includes('.png') || 
                      currentQuestion?.characterEmoji?.includes('.jpeg') ? (
                        <img 
                          src={currentQuestion?.characterEmoji} 
                          alt="Character" 
                          className="w-64 h-64 object-contain rounded-xl mx-auto"
                        />
                      ) : (
                        currentQuestion?.characterEmoji || "😊"
                      )
                    )}
                  </div>

                  {/* Scenario Visual */}
                  <div className="bg-white rounded-2xl p-4 border-3 border-blue-300 shadow-xl -mt-12">
                    <div className="text-4xl -mt-3">{currentQuestion?.scenarioImage}</div>
                    <div className="text-xl font-bold text-gray-800 leading-relaxed">
                      {currentQuestion?.questionText}
                    </div>
                  </div>
                </div>

                {/* Action Choices */}
                <div className="grid grid-cols-3 gap-4 max-w-[1000px] mx-auto">
                  {currentQuestion?.answerChoices.map((choiceRaw, index) => {
                    const choiceText = typeof choiceRaw === 'string' ? choiceRaw : (choiceRaw.text || '');
                    const choiceImage = typeof choiceRaw === 'object' ? choiceRaw.image : null;
                    const choiceVideo = typeof choiceRaw === 'object' ? choiceRaw.video : null;
                    const isCorrect = choiceText === currentQuestion.correctAnswer;
                    const isSelectedWrong = selectedAnswer === choiceText && !isCorrect;

                    return (
                      <button
                        key={choiceVideo || choiceText || index}
                        onClick={() => handleHygieneAnswer(choiceRaw)}
                        disabled={isAnswered}
                        className={`
                          ${
                            isCorrect && isAnswered
                              ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300 scale-105 shadow-2xl animate-success-pulse"
                              : isSelectedWrong
                              ? "bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 scale-105 shadow-2xl"
                              : "bg-white hover:bg-blue-50 text-gray-800 border-blue-200 hover:border-blue-400"
                          } 
                          text-xl font-bold py-2 px-2 rounded-2xl cursor-pointer transition-all duration-300 border-3 backdrop-blur-sm transform
                          focus:outline-none focus:ring-4 focus:ring-blue-300
                          ${!isAnswered ? 'hover:scale-105 hover:shadow-xl' : ''}
                          min-h-[10rem] flex flex-col items-center justify-center gap-3 shadow-lg
                        `}
                      >
                        {/* Render video if provided */}
                        {choiceVideo ? (
                          <video
                            key={choiceVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            className="w-68 h-62 object-contain rounded-lg -m-9 "
                            style={{ display: 'block' }}
                          >
                            <source src={choiceVideo} type="video/mp4" />
                          </video>
                        ) : choiceImage ? (
                          typeof choiceImage === 'string' && choiceImage.startsWith('/') ? (
                            <img src={choiceImage} alt={choiceText} className="w-12 h-12 object-contain" />
                          ) : (
                            <div className="text-4xl">{choiceImage}</div>
                          )
                        ) : null}
                        <span className="-mt-2 relative z-10 text-center">{choiceText}</span>
                      </button>
                    );
                  })}
                </div>

             
                
              </div>
            </div>
          ) : isStreetGame ? (
            /* 🚦 ENHANCED INTERACTIVE SAFE STREET CROSSING GAME 🚦 */
            <div className="space-y-6">
              {/* Game Status Debug Info (remove in production) */}
              {/* <div className="text-xs text-gray-500 text-center">
                Game Active: {isStreetGameActive ? '✅' : '❌'} | 
                Round: {streetRound}/5 | 
                Answered: {isAnswered ? '✅' : '❌'} | 
                Feedback: {showStreetFeedback ? '✅' : '❌'} |
                Scenario: {(streetScenario || currentScenario) ? '✅' : '❌'}
              </div> */}
              
              {/* Round Progress Indicator */}
              <div className="text-center -mt-2 mb-2">
                <div className="inline-flex bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-8 py-2 border-3 border-green-300 shadow-xl">
                  <span className="text-xl font-bold text-green-800 flex items-center space-x-3">
                    <span className="text-3xl animate-bounce-gentle">🚦</span>
                    <span>Street Safety</span>
                    <span className="text-3xl animate-pulse-gentle">🚶‍♂️</span>
                  </span>
                </div>
               
              </div>

              {/* 🏙️ MAIN INTERACTIVE STREET ENVIRONMENT 🏙️ */}
              <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-green-100 rounded-3xl p-8 border-4 border-blue-300 relative overflow-hidden shadow-2xl min-h-[600px]">
                {/* Correct Answer Overlay */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Animated Sky Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-200/30 to-green-200/30 rounded-3xl">
                  <div className="absolute top-4 left-8 text-4xl animate-float">☁️</div>
                  <div className="absolute top-8 right-12 text-3xl animate-float-delayed">☁️</div>
                  <div className="absolute top-12 left-1/3 text-2xl animate-bounce-gentle">🌞</div>
                </div>
                
                {/* City Buildings Background */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-4 opacity-20">
                  <div className="text-8xl">🏢</div>
                  <div className="text-6xl">🏬</div>
                  <div className="text-7xl">🏪</div>
                  <div className="text-9xl">🏢</div>
                  <div className="text-5xl">🏠</div>
                </div>

                {/* 🚶‍♂️ INTERACTIVE STREET CROSSING SCENE 🚶‍♂️ */}
                <div className="flex flex-col items-center mb-8 relative z-10">
                  
                  {/* SUCCESS WALKING ANIMATION OVERLAY */}
                  {showWalkingAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-green-100/90 rounded-3xl backdrop-blur-sm">
                      <div className="text-center">
                        <div className="text-9xl mb-4">
                          <span className="animate-slide-right">🚶‍♂️</span>
                          <span className="animate-pulse text-green-500">➡️</span>
                          <span className="animate-bounce-gentle">🎉</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600 animate-bounce-gentle">
                          ✅ SAFE CROSSING! WELL DONE! 🌟
                        </div>
                        <div className="text-lg text-green-700 mt-2">
                          You made the right choice! 🏆
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🚦 STREET LAYOUT WITH TRAFFIC ELEMENTS 🚦 */}
                  <div className="relative w-full max-w-4xl mx-auto">
                    
                    {/* Street Layout */}
                    <div className="flex items-end justify-between mb-6">
                      
                   
                      
                      {/* Traffic Light Post */}
                      <div className="flex flex-col items-center mx-4">
                        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border-4 border-gray-600 relative">
                          <div className={`text-8xl transition-all duration-500 ${
                            (streetScenario || currentScenario)?.trafficLight === '🟢' || (streetScenario || currentScenario)?.isTrafficLightImage ? 'animate-pulse-gentle drop-shadow-lg scale-110' :
                            (streetScenario || currentScenario)?.trafficLight === '🔴' ? 'animate-pulse drop-shadow-lg scale-110' :
                            (streetScenario || currentScenario)?.trafficLight === '🟡' ? 'animate-bounce-gentle drop-shadow-lg' :
                            'animate-pulse-gentle'
                          }`}>
                            {(streetScenario || currentScenario)?.isTrafficLightImage ? (
                              <img 
                                src={(streetScenario || currentScenario)?.trafficLight} 
                                alt="Go Sign" 
                                className="w-32 h-32 object-contain mx-auto"
                              />
                            ) : (
                              (streetScenario || currentScenario)?.trafficLight || '🚦'
                            )}
                          </div>
                          {/* Light status indicator */}
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                            <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                              (streetScenario || currentScenario)?.lightStatus === 'walk' ? 'bg-green-200 text-green-800 animate-pulse-gentle' :
                              (streetScenario || currentScenario)?.lightStatus === 'stop' ? 'bg-red-200 text-red-800 animate-pulse' :
                              'bg-yellow-200 text-yellow-800 animate-bounce-gentle'
                            }`}>
                              {(streetScenario || currentScenario)?.lightStatus?.toUpperCase() || 'LOOK'}
                            </div>
                          </div>
                        </div>
                        {/* Traffic light pole */}
                        <div className="w-2 h-16 bg-gray-600 shadow-lg"></div>
                      </div>
                      
                      {/* Road with Dynamic Elements */}
                      <div className="flex-1 relative mx-4">
                        {/* Road surface */}
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 h-56 rounded-lg border-4 border-gray-500 shadow-xl relative overflow-hidden">
                          {/* Road markings */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-4 bg-yellow-300 opacity-80 rounded flex space-x-6">
                              <div className="flex-1 bg-yellow-400 rounded"></div>
                              <div className="w-8 bg-transparent"></div>
                              <div className="flex-1 bg-yellow-400 rounded"></div>
                              <div className="w-8 bg-transparent"></div>
                              <div className="flex-1 bg-yellow-400 rounded"></div>
                            </div>
                          </div>
                          
                          {/* Dynamic scenario elements */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-8xl animate-pulse-gentle">
                              {(streetScenario || currentScenario)?.scenarioImage || '🛣️'}
                            </div>
                          </div>
                          
                          {/* Moving cars if scenario has them */}
                          {(streetScenario || currentScenario)?.scenarioImage?.includes('🚗') && (
                            <div className="absolute top-3 left-6 text-5xl animate-slide-right">
                              🚗💨
                            </div>
                          )}
                        </div>
                        
                        {/* Crosswalk stripes */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-white opacity-60 flex space-x-1">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex-1 bg-white"></div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Right Sidewalk (destination) */}
                      {/* <div className="flex flex-col items-center">
                        <div className="bg-gray-300 w-24 h-32 rounded-t-lg relative border-2 border-gray-400 mb-2">
                          <div className="absolute inset-2 bg-gray-200 rounded"></div>
                          
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                            🏁
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">SAFE ZONE</div>
                      </div> */}
                      
                    </div>
                  </div>

                  {/* 💬 ENHANCED QUESTION DISPLAY 💬 */}
                  {/* <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-3xl p-8 border-4 border-blue-300 shadow-2xl mb-8 max-w-4xl relative"> */}
                    {/* <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
                        🤔 What Should You Do?
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-gray-800 text-center leading-relaxed pt-6">
                      {(streetScenario || currentScenario)?.questionText || 'Loading street scenario...'}
                    </div>
                     */}
                    {/* Scenario context */}
                    {/* <div className="mt-4 text-center">
                      <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2">
                        <span className="text-sm font-medium text-blue-700">
                          Safety Level: 
                        </span>
                        <span className={`text-sm font-bold ${
                          (streetScenario || currentScenario)?.safetyLevel === 'safe' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(streetScenario || currentScenario)?.safetyLevel?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </div> */}
                  {/* </div> */}

                  {/* Feedback Message */}
                  {showStreetFeedback && (
                    <div className={`
                      ${streetFeedbackType === 'safe' 
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400' 
                        : 'bg-gradient-to-r from-yellow-100 to-red-100 border-yellow-400'
                      } 
                      rounded-2xl p-6 border-3 shadow-xl mb-6 max-w-2xl animate-fade-in
                    `}>
                      <div className="text-xl font-bold text-center">
                        {streetFeedbackType === 'safe' && <span className="text-4xl mr-3">✅</span>}
                        {streetFeedbackType === 'unsafe' && <span className="text-4xl mr-3">⚠️</span>}
                        {streetFeedbackMessage}
                      </div>
                    </div>
                  )}
                </div>

                {/* 🎮 COMPACT INTERACTIVE ACTION BUTTONS 🎮 */}
                <div className="flex justify-center space-x-6 mb-8">
                  <button
                    onClick={() => {
                      console.log('🚶‍♂️ CROSS button clicked!');
                      handleStreetAnswer('CROSS');
                    }}
                    disabled={isAnswered || showStreetFeedback}
                    className={`
                      group relative overflow-hidden
                      ${
                        selectedAnswer === 'CROSS' && (streetScenario || currentScenario)?.correctAnswer === 'CROSS'
                          ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-green-300 scale-105 shadow-xl animate-success-pulse"
                          : selectedAnswer === 'CROSS' && (streetScenario || currentScenario)?.correctAnswer !== 'CROSS'
                          ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300 scale-105 shadow-xl animate-pulse"
                          : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white border-blue-300 hover:border-blue-400"
                      } 
                      text-xl font-bold py-6 px-12 rounded-2xl transition-all duration-300 border-3 shadow-lg transform
                      focus:outline-none focus:ring-4 focus:ring-blue-300/50
                      ${(!isAnswered && !showStreetFeedback) ? 'hover:scale-105 hover:shadow-xl cursor-pointer active:scale-100' : 'cursor-not-allowed opacity-60'}
                      min-w-[270px] min-h-[180px] flex flex-col items-center justify-center
                    `}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/8 to-transparent opacity-40 rounded-2xl group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Animated walking icon */}
                    <span className="text-4xl mb-2 relative z-10 animate-bounce-gentle group-hover:animate-pulse">
                      🚶‍♂️
                    </span>
                    <span className="relative z-10 text-lg font-black">CROSS NOW</span>
                   
                    
                    {/* Directional arrow */}
                    <div className="absolute top-2 right-2 text-lg opacity-50 group-hover:opacity-80 transition-opacity">
                      ➡️
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('✋ WAIT button clicked!');
                      handleStreetAnswer('WAIT');
                    }}
                    disabled={isAnswered || showStreetFeedback}
                    className={`
                      group relative overflow-hidden
                      ${
                        selectedAnswer === 'WAIT' && (streetScenario || currentScenario)?.correctAnswer === 'WAIT'
                          ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white border-green-300 scale-105 shadow-xl animate-success-pulse"
                          : selectedAnswer === 'WAIT' && (streetScenario || currentScenario)?.correctAnswer !== 'WAIT'
                          ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white border-red-300 scale-105 shadow-xl animate-pulse"
                          : "bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white border-orange-300 hover:border-orange-400"
                      } 
                      text-xl font-bold py-6 px-12 rounded-2xl transition-all duration-300 border-3 shadow-lg transform
                      focus:outline-none focus:ring-4 focus:ring-orange-300/50
                      ${(!isAnswered && !showStreetFeedback) ? 'hover:scale-105 hover:shadow-xl cursor-pointer active:scale-100' : 'cursor-not-allowed opacity-60'}
                       min-w-[270px] min-h-[180px] flex flex-col items-center justify-center
                    `}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/8 to-transparent opacity-40 rounded-2xl group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Animated stop hand icon */}
                    <span className="text-4xl mb-2 relative z-10 animate-pulse-gentle group-hover:animate-bounce">
                      ✋
                    </span>
                    <span className="relative z-10 text-lg font-black">WAIT HERE</span>
                  
                    
                    {/* Safety shield icon */}
                    <div className="absolute top-2 right-2 text-lg opacity-50 group-hover:opacity-80 transition-opacity">
                      🛡️
                    </div>
                  </button>
                </div>

                {/* 🏆 ENHANCED SCORE & PROGRESS DISPLAY 🏆 */}
                <div className="text-center space-y-4">
                  {/* <div className="inline-flex bg-gradient-to-r from-green-100 via-blue-100 to-green-100 rounded-full px-8 py-4 border-3 border-green-300 shadow-xl">
                    <span className="text-2xl font-bold text-green-800 flex items-center space-x-4">
                      <span className="text-4xl animate-bounce-gentle">🏆</span>
                      <span>Safety Score: {streetScore}/5</span>
                      <span className="text-4xl animate-pulse-gentle">🚦</span>
                    </span>
                  </div>
                   */}
                  {/* Encouraging Progress Message */}
                  {/* <div className="mt-4">
                    <span className={`text-lg font-bold px-6 py-2 rounded-full shadow-lg ${
                      streetScore === 5 ? 'bg-gold-100 text-gold-800 border-2 border-gold-300' :
                      streetScore >= 4 ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                      streetScore >= 3 ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                      streetScore >= 2 ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' :
                      'bg-pink-100 text-pink-800 border-2 border-pink-300'
                    }`}>
                      {streetScore === 5 ? "🌟 PERFECT SAFETY CHAMPION! 🌟" :
                       streetScore >= 4 ? "🎉 EXCELLENT STREET SAFETY! 🎉" :
                       streetScore >= 3 ? "💪 GREAT JOB LEARNING! 💪" :
                       streetScore >= 2 ? "📚 KEEP GOING! YOU'RE LEARNING! 📚" :
                       streetScore >= 1 ? "🌱 EVERY STEP MAKES YOU SAFER! 🌱" :
                       "🚀 LET'S LEARN TOGETHER! 🚀"}
                    </span>
                  </div> */}
                  
                  {/* Safety Tips */}
                  {/* <div className="mt-4 max-w-2xl mx-auto">
                    <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                      <div className="text-blue-700 font-semibold text-sm">
                        💡 <strong>Safety Reminder:</strong> Always look both ways, wait for the green light, and watch for cars before crossing!
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          ) : isCashierGame ? (
            <div className="space-y-3">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl p-2 -mt-2 border-2 border-blue-200 relative">
                {/* Correct Answer Overlay */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-40 h-40 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-40 h-40 object-contain" />
                  </div>
                )}
                
                {/* Characters with simplified design */}
                <div className="flex justify-between items-center relative max-h-[260px]">
                  
                  {/* Customer Character */}
                  <div className="flex mt-14 flex-col items-center relative">
                    {/* Thought Bubble for Customer - Always show when there's speech text */}
                    {speechText && (
                      <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-2 border-2 border-pink-300 shadow-lg w-[200px] z-10 animate-bounce-gentle">
                        <div className="text-lg font-bold text-gray-800 text-center leading-tight">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer - Head larger */}
                    <div className="text-center">
                      <div className="text-[10rem] relative bottom-10 -mb-6">👩‍🦱</div>
                      <div className="relative bottom-10 bg-pink-500 text-white px-3 py-2 rounded-full text-base font-bold shadow-md">
                        Customer
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Counter */}
                  <div className="flex-1 mx-4 ">
                    <div className="h-20 bg-gradient-to-t from-amber-400 to-amber-200 rounded-xl border-2 border-amber-500 relative flex items-center justify-center shadow-md">
                      <span className="text-base font-bold text-amber-900">🏪 Restaurant Counter 🏪</span>
                    </div>
                  </div>

                  {/* Cashier Character (You) */}
                  <div className="flex flex-col mt-14 items-center relative">
                    {/* Thought Bubble for Cashier */}
                    {showThoughtBubble && currentSpeaker === 'cashier' && (
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-3 border-2 border-blue-300 shadow-lg max-w-sm z-10 animate-bounce-gentle">
                        <div className="text-md font-bold text-gray-800 text-center leading-tight">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cashier - Head larger */}
                    <div className="text-center">
                      <div className="text-[10rem] relative bottom-10 -mb-6">👨‍💼</div>
                      <div className="relative bottom-10 bg-blue-500 text-white px-3 py-2 rounded-full text-base font-bold shadow-md">
                        You (Cashier)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-3 space-y-3">
                {/* Step 1: Customer speaks */}
                {gameStep === 1 && (
                  <div className="text-center">
                    
                    {showThoughtBubble && (
                      <button
                        onClick={handleStartSelecting}
                        className="bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
                      >
                        ✅ GET ORDER
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Select items */}
                {gameStep === 2 && (
                  <div>
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-3 mb-3 text-center">
                      <h3 className="text-base font-bold text-gray-800">
                        🍽️ Find the food the customer wants
                      </h3>
                    </div>

                    {/* Food Menu - Simple Grid */}
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {currentQuestion.menuOptions.slice(0, 4).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          disabled={isAnswered}
                          className="bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-xl p-4 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
                        >
                          <div className="text-5xl mb-2">{item.image}</div>
                          <div className="font-bold text-gray-800 text-base">{item.name}</div>
                          <div className="text-green-600 font-semibold text-sm">{item.price}</div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Items Display with Submit Button */}
                    {selectedItems.length > 0 && (
                      <div className="flex gap-3 items-start mb-3">
                        {/* Left side - Selected items */}
                        <div className="flex-1 bg-green-100 border-2 border-green-300 rounded-xl p-3">
                          <h3 className="text-sm font-bold text-gray-800 mb-2 text-center">
                            ✅ Food I picked:
                          </h3>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {selectedItems.map((item, index) => (
                              <div key={index} className="bg-white border-2 border-green-400 rounded-lg p-2 flex items-center space-x-2 shadow-sm">
                                <span className="text-2xl">{item.image}</span>
                                <span className="font-semibold text-sm">{item.name}</span>
                                <button
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={isAnswered}
                                  className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-md text-sm cursor-pointer font-bold"
                                >
                                  ❌
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right side - Submit Button */}
                        {!isAnswered && (
                          <div className="flex items-center">
                            <button
                              onClick={handleCashierSubmit}
                              className="bg-purple-500 relative top-7  hover:bg-purple-600 text-white py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md whitespace-nowrap"
                            >
                              🎯 Give food to customer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Complete */}
                {gameStep === 3 && (
                  <div className="text-center">
                    <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        🏆 Good job helping the customer!
                      </h3>
                      <div className="text-base font-bold text-purple-600">
                        You got {cashierScore} points! 🌟
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isCashierGame ? (
            <div className="space-y-6">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-blue-50 to-green-50 rounded-3xl p-4 border-4 border-blue-200 relative">
                
                {/* Characters with simplified design */}
                <div className="flex justify-between items-center relative min-h-[300px]">
                  
                  {/* Customer Character */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Customer */}
                    {showThoughtBubble && currentSpeaker === 'customer' && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-3 border-4 border-pink-300 shadow-2xl w-[250px] z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👩‍🦱</div>
                      
                      {/* Label */}
                      <div className="bg-pink-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        Customer
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Counter */}
                  <div className="flex-1 mx-16 mt-20">
                    <div className="h-32 bg-gradient-to-t from-amber-400 to-amber-200 rounded-2xl border-4 border-amber-500 relative flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-amber-900">🏪 Restaurant Counter 🏪</span>
                    </div>
                  </div>

                  {/* Cashier Character (You) */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Cashier */}
                    {showThoughtBubble && currentSpeaker === 'cashier' && (
                      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-blue-300 shadow-2xl max-w-lg z-10 animate-bounce-gentle">
                        <div className="text-xl font-bold text-gray-800 text-center leading-relaxed">
                          {speechText}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cashier - Head only */}
                    <div className="text-center">
                      {/* Head - larger */}
                      <div className="text-[12rem] mb-4">👨‍💼</div>
                      
                      {/* Label */}
                      <div className="bg-blue-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-lg">
                        You (Cashier)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-8 space-y-6">
                {/* Step 1: Customer speaks */}
                {gameStep === 1 && (
                  <div className="text-center">
                    
                    {showThoughtBubble && (
                      <button
                        onClick={handleStartSelecting}
                        className="bg-green-500 hover:bg-green-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                      >
                        ✅ GET ORDER
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Select items */}
                {gameStep === 2 && (
                  <div>
                    <div className="bg-blue-100 border-4 border-blue-300 rounded-2xl p-6 mb-6 text-center">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🍽️ Find the food the customer wants
                      </h3>
                      {/* <p className="text-xl text-gray-700 leading-relaxed">
                        Click on the food from the menu. Pick what the customer said!
                      </p> */}
                    </div>

                    {/* Food Menu - Simple Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {currentQuestion.menuOptions.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          disabled={isAnswered}
                          className="bg-white hover:bg-blue-50 border-4 border-gray-300 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          <div className="text-5xl mb-3">{item.image}</div>
                          <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                          <div className="text-green-600 font-semibold text-lg">{item.price}</div>
                        </button>
                      ))}
                    </div>

                    {/* Selected Items Display */}
                    {selectedItems.length > 0 && (
                      <div className="bg-green-100 border-4 border-green-300 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                          ✅ Food I picked:
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedItems.map((item, index) => (
                            <div key={index} className="bg-white border-3 border-green-400 rounded-xl p-4 flex items-center space-x-3 shadow-md">
                              <span className="text-3xl">{item.image}</span>
                              <span className="font-semibold text-lg">{item.name}</span>
                              <button
                                onClick={() => handleRemoveItem(index)}
                                disabled={isAnswered}
                                className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-lg cursor-pointer font-bold"
                              >
                                ❌
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    {selectedItems.length > 0 && !isAnswered && (
                      <div className="text-center">
                        <button
                          onClick={handleCashierSubmit}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-12 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                        >
                          🎯 Give food to customer
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Complete */}
                {gameStep === 3 && (
                  <div className="text-center">
                    <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        🏆 Good job helping the customer!
                      </h3>
                      <div className="text-xl font-bold text-purple-600">
                        You got {cashierScore} points! 🌟
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : isGreetingsGame ? (
            <div className="space-y-4">
              {/* Main Game Area */}
              <div className="bg-gradient-to-b from-green-50 to-blue-50 rounded-2xl p-3 -mt-2 border-3 border-green-200 relative">
                {/* Correct Answer Overlay */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-52 h-52 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-52 h-52 object-contain" />
                  </div>
                )}
                
                {/* Social Greetings Adventure UI */}
                <div className="flex justify-between items-center relative min-h-[220px]">
                  
                  {/* Student Character (You) */}
                  <div className="flex flex-col items-center relative">
                    {/* Thought Bubble for Student */}
                    {currentGreetingScenario?.studentThought && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-3 border-3 border-blue-300 shadow-lg w-[220px] z-10 animate-bounce-gentle">
                        <div className="text-base font-bold text-gray-800 text-center leading-snug">
                          {currentGreetingScenario.studentThought}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-6 border-r-6 border-t-10 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}  
                    
                    {/* Student Character - Head bigger */}
                    <div className="text-center">
                      <div className="text-[9rem]">👦</div>
                      <div className="bg-blue-500 text-white px-4 py-2 -mt-3 rounded-full text-base font-bold shadow-lg">
                        You
                      </div>
                    </div>
                  </div>

                  {/* Scene Background */}
                  <div className="flex-1 mx-6 mt-10">
                    <div className="h-25 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-xl border-3 border-yellow-500 relative flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold text-yellow-900">
                        {currentGreetingScenario?.background} 
                        {currentGreetingScenario?.context === 'morning' ? '🌅' : 
                         currentGreetingScenario?.context === 'afternoon' ? '☀️' : 
                         currentGreetingScenario?.context === 'evening' ? '🌆' : '🏫'}
                      </span>
                    </div>
                  </div>

                  {/* Other Character */}
                  <div className="flex flex-col items-center relative">
                    {/* Speech Bubble for Other Character */}
                    {currentGreetingScenario?.otherCharacterSpeech && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-3 border-3 border-pink-300 shadow-lg w-[220px] z-10 animate-bounce-gentle">
                        <div className="text-base font-bold text-gray-800 text-center leading-snug">
                          {currentGreetingScenario.otherCharacterSpeech}
                        </div>
                        {/* Bubble pointer */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="w-0 h-0 border-l-6 border-r-6 border-t-10 border-l-transparent border-r-transparent border-t-white"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Other Character - Head bigger */}
                    <div className="text-center">
                      <div className="text-[9rem]">
                        {currentGreetingScenario?.character}
                      </div>
                      <div className="bg-pink-500 text-white px-4 py-2 -mt-3 rounded-full text-base font-bold shadow-lg">
                        {currentGreetingScenario?.characterType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Title and Context */}
                <div className="text-center mb-3">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-3 border-purple-300 rounded-xl p-3">
                    <p className="text-lg font-bold text-gray-800">
                      {currentGreetingScenario?.title}
                    </p>
                    <p className="text-base text-gray-600">
                      {currentGreetingScenario?.situation}
                    </p>
                  </div>
                </div>

                {/* Greeting Choice Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {currentGreetingScenario?.choices?.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleGreetingAnswer(choice)}
                      disabled={greetingAnswered}
                      className={`
                        p-4 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg border-3
                        ${choice.correct && greetingAnswered 
                          ? 'bg-green-100 border-green-400 text-green-800' 
                          : !choice.correct && greetingAnswered
                          ? 'bg-red-100 border-red-400 text-red-800'
                          : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 text-gray-800'}
                        ${greetingAnswered ? 'cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="text-4xl mb-2">{choice.emoji}</div>
                      <div className="leading-snug text-lg">{choice.text}</div>
                      {choice.correct && greetingAnswered && (
                        <div className="text-green-600 font-bold mt-2 text-sm">✅ Perfect greeting!</div>
                      )}
                      {!choice.correct && greetingAnswered && greetingSelectedChoice === choice && (
                        <div className="text-red-600 font-bold mt-2 text-sm">❌ Try a different approach</div>
                      )}
                    </button>
                  ))}
                </div>

               

              
              </div>
            </div>
          ) : isMoneyGame ? (
            <div className="space-y-6 -mt-5">
              {/* Money Value Game Main Area */}
              <div className="bg-gradient-to-b from-green-50 to-blue-50 rounded-3xl p-4 border-4 border-green-200 relative overflow-hidden">
                {/* Correct Answer Overlay */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                  </div>
                )}
                
                

                {/* Budget Display */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-blue-300 rounded-2xl p-3 mb-6 text-center relative">
                  <div className="absolute -top-3 -left-3 text-5xl animate-pulse-gentle">💳</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Your Budget</h3>
                  <div className="text-4xl font-extrabold text-green-600 bg-white/70 backdrop-blur-sm rounded-xl p-2 border-2 border-green-200">
                    ₱{currentBudget.toLocaleString()}
                  </div>
                  <p className="text-md text-gray-600 mt-3">Choose items you can afford!</p>
                </div>

                {/* Shopping Items - 4 items in 1 horizontal row */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {currentMoneyItems.map((item, index) => {
                    const isPurchased = selectedPurchases.some(p => p.id === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className={`
                          relative bg-white/90 backdrop-blur-xl rounded-lg p-4 border-2 shadow transition-all duration-300
                          border-blue-300 hover:border-blue-500
                          ${isPurchased ? 'ring-2 ring-green-400 bg-green-50' : ''}
                        `}
                      >
                        {/* Item Display */}
                        <div className="text-center">
                          <div className="mb-1" style={{ fontSize: '55px' }}>
                            {item.isImagePath ? (
                              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover mx-auto rounded-lg" />
                            ) : (
                              item.image
                            )}
                          </div>
                          <h4 className="font-bold text-gray-800 mb-1 leading-tight" style={{ fontSize: '23px' }}>{item.name}</h4>
                          <div className="font-bold mb-2 p-1 rounded text-green-600 bg-blue-100" style={{ fontSize: '18px' }}>
                            ₱{item.price.toLocaleString()}
                          </div>
                          
                          {/* Purchase Button - all buttons look the same */}
                          <button
                            onClick={() => handlePurchaseItem(item)}
                            disabled={isPurchased || isRoundComplete}
                            className={`
                              w-full py-1 px-2 rounded font-bold transition-all duration-300 shadow-sm
                              ${isPurchased 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white cursor-pointer'
                              }
                              ${isRoundComplete ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            style={{ fontSize: '18px' }}
                          >
                            {isPurchased ? '✅ Bought!' : '🛒 Buy'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Section */}
                {showMoneyFeedback && (
                  <div className={`rounded-2xl p-6 text-center border-4 mb-6 ${
                    moneyFeedbackType === 'correct' 
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400'
                      : 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
                  }`}>
                    <div className="text-6xl mb-4">
                      {moneyFeedbackType === 'correct' ? '🎉' : '💭'}
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-3">
                      {moneyFeedbackMessage}
                    </div>
                  </div>
                )}

                {/* Progress and Controls */}
                <div className="bg-purple-100 border-4 border-purple-300 rounded-2xl p-2 mb-4">
                  <div className="text-xl font-bold text-purple-800">
                    Correct Purchases: {moneyScore} 🏆
                  </div>
                  {selectedPurchases.length > 0 && (
                    <div className="text-md text-gray-700 ">
                      Total Spent: ₱{totalSpent.toLocaleString()}
                    </div>
                  )}
                </div>

                {(() => {
                  const affordableItems = currentMoneyItems.filter(item => item.price <= currentBudget);
                  const allAffordablePurchased = affordableItems.length > 0 && 
                    affordableItems.every(item => selectedPurchases.some(p => p.id === item.id));
                  
                  return (
                    <button
                      onClick={proceedToNextMoneyRound}
                      disabled={!allAffordablePurchased || isRoundComplete}
                      className={`py-4 px-8 rounded-2xl text-xl font-bold shadow-lg transition-all duration-300 w-full
                        ${allAffordablePurchased && !isRoundComplete
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105 cursor-pointer' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                        }`}
                    >
                      {moneyRound < 3 ? '➡️ Next Round' : '🏆 Complete Game'}
                    </button>
                  );
                })()}

                {/* Badge Completion Modal */}
                {showBadgeCompletion && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/90 via-green-400/90 to-blue-400/90 backdrop-blur-md rounded-3xl flex items-center justify-center z-50">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border-4 border-yellow-300 relative animate-modal-appear">
                      <div className="absolute -top-8 -right-8 text-8xl animate-spin-slow">🏆</div>
                      <div className="absolute -bottom-4 -left-4 text-6xl animate-bounce-gentle">💰</div>
                      
                      <div className="text-8xl mb-6 animate-bounce-gentle">🎉</div>
                      <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-green-600 mb-4">
                        Money Master Achievement!
                      </h3>
                      <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
                        <p className="text-2xl font-bold text-gray-800 mb-3">
                          🏆 Badge Earned: Money Master 💰
                        </p>
                        <p className="text-lg text-gray-700 mb-2">
                          You completed all 3 rounds and learned about Philippine Peso values!
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          Final Score: {moneyScore} correct purchases! 🌟
                        </p>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={restartMoneyGame}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          🔄 Play Again
                        </button>
                        <button
                          onClick={() => handleActivityComplete(moneyScore, 3)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-2xl text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          🚀 Continue Adventure
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isMemoryGame ? (
            /* Visual Memory Challenge Game UI */
            <div className="space-y-6">
              {/* Game Header */}
              <div className="-mb-0 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-4 border-purple-300 rounded-3xl p-2 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-2 right-2 text-6xl animate-bounce-gentle">🧠</div>
                <div className="absolute -bottom-2 -left-2 text-5xl animate-float">💭</div>
                <div className="absolute top-2 left-2 text-4xl animate-pulse-gentle">✨</div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  🧠 Visual Memory Challenge 🧠
                </h2>
                {/* <p className="text-lg text-gray-600">
                  {currentQuestion?.instruction || 'Memorize and track the cards!'}
                </p> */}
              </div>

              {/* Phase Indicator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-200 text-center">
                {memoryGamePhase === 'memorize' && currentTargetCard && (
                  <div className="space-y-2">
                    
                    <h3 className="text-2xl font-bold text-purple-600">Memorize the Cards!👀</h3>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 border-3 border-yellow-300 inline-block my-3">
                      <p className="text-lg font-semibold text-gray-700 mb-2">Remember this card:</p>
                      <div className="text-6xl">{currentTargetCard.image}</div>
                      <p className="text-xl font-bold text-gray-800 mt-1">{currentTargetCard.name}</p>
                    </div>
                    <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 animate-pulse">
                      {memoryTimer}
                    </div>
                    <p className="text-lg text-gray-600">seconds remaining...</p>
                  </div>
                )}
                {memoryGamePhase === 'shuffle' && currentTargetCard && (
                  <div className="space-y-2">
                    <div className="text-5xl animate-spin-slow">🔄</div>
                    <h3 className="text-2xl font-bold text-blue-600">Watch the Shuffle!</h3>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 border-3 border-yellow-300 inline-block ">
                      <p className="text-lg font-semibold text-gray-700 mb-1">Find this card:</p>
                      <div className="text-6xl">{currentTargetCard.image}</div>
                      <p className="text-xl font-bold text-gray-800 mt-2">{currentTargetCard.name}</p>
                    </div>
                    <p className="text-lg text-gray-600">Keep tracking the cards...</p>
                  </div>
                )}
                {memoryGamePhase === 'question' && currentTargetCard && (
                  <div className="space-y-2">
                    
                    <h3 className="-mt-2 text-2xl font-bold text-green-600">Find This Card! <span className="text-4xl animate-bounce-gentle">🤔</span></h3>
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-3 border-3 border-yellow-300 inline-block">
                      <div className="text-6xl">{currentTargetCard.image}</div>
                      <p className="text-xl font-bold text-gray-800 mt-1">{currentTargetCard.name}</p>
                    </div>
                    <p className="text-md text-gray-600">Click where it is now!</p>
                  </div>
                )}
              </div>

              {/* Cards Display - Absolute Positioning for Physical Movement */}
              <div className="relative w-full h-80 max-w-4xl mx-auto">
                {memoryCards && memoryCards.length > 0 ? memoryCards.map((card, cardIndex) => {
                  // Find where this card currently is in the positions array
                  const currentPosition = memoryCardPositions.indexOf(cardIndex);
                  
                  // Calculate physical position (each card is 25% of container width)
                  const cardWidth = 23; // percentage
                  const gap = 2.33; // percentage between cards
                  const leftPosition = currentPosition * (cardWidth + gap);
                  
                  // Check if this card should be revealed
                  const shouldReveal = revealedCardPosition === currentPosition;
                  
                  return (
                    <div
                      key={`card-${cardIndex}`}
                      onClick={() => handleMemoryCardClick(currentPosition)}
                      className={`
                        absolute w-[22%] h-[290px] cursor-pointer
                        ${memoryGamePhase === 'question' ? 'hover:scale-105 hover:shadow-2xl' : ''}
                        ${isShuffling ? 'z-50' : 'z-10'}
                        transition-all duration-[1500ms] ease-in-out
                      `}
                      style={{
                        left: `${leftPosition}%`,
                        transformStyle: 'preserve-3d',
                        transform: isShuffling ? 'translateY(-30px) scale(1.08)' : 'translateY(0) scale(1)',
                      }}
                    >
                      {/* Card Inner Container for 3D Flip */}
                      <div 
                        className="relative w-full h-full transition-transform duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: (showMemoryCardFronts || shouldReveal) ? 'rotateY(0deg)' : 'rotateY(180deg)'
                        }}
                      >
                        {/* Card Front (when showing) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 rounded-2xl border-4 border-blue-300 shadow-xl flex flex-col items-center justify-center p-4"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                          }}
                        >
                          <div className="text-7xl mb-2">{card?.image}</div>
                          <p className="text-lg font-bold text-gray-800">{card?.name}</p>
                        </div>

                        {/* Card Back (when hidden) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-2xl border-4 border-purple-600 shadow-xl flex items-center justify-center"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="text-6xl animate-pulse-gentle">❓</div>
                          <div className="absolute top-2 left-2 text-2xl">✨</div>
                          <div className="absolute bottom-2 right-2 text-2xl">🌟</div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center text-2xl text-gray-500 py-20">
                    Loading cards... 🎴
                  </div>
                )}
              </div>


              {/* Feedback Message - Using same modal as Identification */}
              {showCorrect && (
                <div className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                  <audio ref={correctAudioRef} src={correctSound} />
                  <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                </div>
              )}

              {showWrong && (
                <div className="fixed inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                  <audio ref={wrongAudioRef} src={wrongSound} />
                  <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                </div>
              )}
            </div>
          ) : isMatchingGame ? (
            /* Modern Interactive Matching Game UI */
            <div className="space-y-8">
              {/* Safety check for matching game data */}
              {!currentQuestion?.leftItems || !currentQuestion?.rightItems ? (
                <div className="bg-red-50 border-4 border-red-200 rounded-3xl p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-red-800 mb-2">Oops! Data Missing</h3>
                  <p className="text-lg text-red-600">The matching game data couldn't be loaded. Please try again.</p>
                </div>
              ) : (
                <>
              {/* Game Instructions */}
              <div className="flex flex-col items-center justify-center text-center bg-gradient-to-r -mt-6 from-blue-50 to-purple-50 rounded-2xl p-2 border-3 border-blue-200 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl animate-bounce-gentle">🎯</div>
                <div className="absolute -bottom-2 -left-2 text-4xl animate-float">✨</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center space-x-3">
                  <span className="text-2xl animate-pulse-gentle">🎮</span>
                  <span>Click to Connect!</span>
                </h3>
             
              </div>

              {/* Matching Game Area */}
              <div 
                id="matching-container"
                ref={gameContainerRef}
                className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-4 border-4 border-purple-200 relative overflow-hidden shadow-2xl"
              >
                {/* Correct Answer Overlay for Matching Game */}
                {showCorrect && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={correctAudioRef} src={correctSound} />
                    <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Wrong Answer Overlay for Matching Game */}
                {showWrong && (
                  <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
                    <audio ref={wrongAudioRef} src={wrongSound} />
                    <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
                  </div>
                )}

                {/* Decorative Elements */}
                <div className="absolute top-2 right-2 text-2xl animate-spin-slow">⭐</div>
                <div className="absolute bottom-2 left-2 text-xl animate-float-delayed">🌟</div>
                
                <div className="flex justify-between items-start gap-4 relative">
                  {/* Left Column */}
                  <div className="w-1/3 space-y-2">
                    <h4 className="text-sm font-bold text-center text-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 py-2 rounded-xl border-2 border-blue-200">
                      📋 Click From Here
                    </h4>
                    {currentQuestion.leftItems.map((item, index) => (
                      <button
                        key={item.id}
                        id={`left-item-${item.id}`}
                        ref={el => leftItemRefs.current[item.id] = el}
                        onMouseDown={(e) => handleDragStart(e, item, 'left')}
                        disabled={dragConnections.some(conn => conn.leftId === item.id)}
                        className={`
                          w-full rounded-xl border-2 transition-all duration-300 transform text-lg h-20 min-h-[6rem]
                          ${dragConnections.some(conn => conn.leftId === item.id)
                            ? isAnswersChecked
                              ? correctConnections.some(conn => conn.leftId === item.id)
                                ? 'bg-gradient-to-r from-green-200 to-green-300 border-green-500 border-4 shadow-lg'
                                : 'bg-gradient-to-r from-red-200 to-red-300 border-red-500 border-4 shadow-lg'
                              : 'bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400 cursor-not-allowed opacity-90'
                            : dragging?.item.id === item.id
                            ? 'bg-gradient-to-r from-yellow-200 to-orange-300 border-yellow-400 scale-105 shadow-xl animate-pulse-gentle'
                            : 'bg-gradient-to-r from-white to-blue-50 border-blue-200 hover:border-blue-400 hover:scale-105 hover:shadow-lg cursor-grab active:cursor-grabbing'
                          }
                          ${!dragConnections.some(conn => conn.leftId === item.id) ? 'hover:animate-bounce-gentle' : ''}
                          flex items-center justify-center text-center font-bold
                          focus:outline-none focus:ring-2 focus:ring-blue-300
                        `}
                      >
                        {item.type === 'emoji' ? (
                          <span className="text-5xl">{item.content}</span>
                        ) : (
                          <span className="text-2xl text-gray-800 font-medium">{item.content}</span>
                        )}
                        {dragConnections.some(conn => conn.leftId === item.id) && (
                          <span className="ml-2 text-lg animate-bounce-gentle">
                            {isAnswersChecked 
                              ? correctConnections.some(conn => conn.leftId === item.id) 
                                ? '✅' 
                                : '❌'
                              : '🔗'
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* SVG String Connection Lines */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    style={{ top: 0, left: 0 }}
                  >
                    {/* Drag connections with string-like appearance */}
                    {dragConnections.map((connection, index) => {
                      const path = getConnectionPath(connection.leftId, connection.rightId);
                      const isCorrect = correctConnections.some(
                        conn => conn.leftId === connection.leftId && conn.rightId === connection.rightId
                      );
                      const isIncorrect = incorrectConnections.some(
                        conn => conn.leftId === connection.leftId && conn.rightId === connection.rightId
                      );
                      
                      // Get coordinates for connection points
                      const leftElement = document.getElementById(`left-item-${connection.leftId}`);
                      const rightElement = document.getElementById(`right-item-${connection.rightId}`);
                      const container = document.getElementById('matching-container');
                      
                      let startX = 0, startY = 0, endX = 0, endY = 0;
                      if (leftElement && rightElement && container) {
                        const leftRect = leftElement.getBoundingClientRect();
                        const rightRect = rightElement.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        
                        startX = leftRect.right - containerRect.left;
                        startY = leftRect.top + leftRect.height / 2 - containerRect.top;
                        endX = rightRect.left - containerRect.left;
                        endY = rightRect.top + rightRect.height / 2 - containerRect.top;
                      }
                      
                      return (
                        <g key={`${connection.leftId}-${connection.rightId}`}>
                          {/* Main string line - thicker and light blue */}
                          <path
                            d={path}
                            stroke={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            className="animate-draw-line"
                            strokeDasharray="none"
                          />
                          
                          {/* String texture - secondary light blue line */}
                          <path
                            d={path}
                            stroke={isAnswersChecked ? (isCorrect ? "#059669" : "#dc2626") : "#93C5FD"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            className="animate-draw-line"
                            style={{ animationDelay: '0.1s' }}
                            strokeDasharray="none"
                          />
                          
                          {/* Connection indicator on left column */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="4"
                            fill={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                          
                          {/* Connection indicator on right column */}
                          <circle
                            cx={endX}
                            cy={endY}
                            r="4"
                            fill={isAnswersChecked ? (isCorrect ? "#10b981" : "#ef4444") : "#60A5FA"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Right Column */}
                  <div className="w-1/3 space-y-2 relative z-20">
                    <h4 className="text-sm font-bold text-center text-gray-800 bg-gradient-to-r from-pink-100 to-purple-100 py-2 rounded-xl border-2 border-pink-200">
                      🎯 Drop Here
                    </h4>
                    {currentQuestion.rightItems.map((item, index) => (
                      <button
                        key={item.id}
                        id={`right-item-${item.id}`}
                        ref={el => rightItemRefs.current[item.id] = el}
                        onMouseUp={(e) => handleDragEnd(e, item, 'right')}
                        disabled={dragConnections.some(conn => conn.rightId === item.id)}
                        className={`
                          w-full rounded-xl border-2 transition-all duration-300 transform text-lg min-h-[6rem] h-23
                          ${dragConnections.some(conn => conn.rightId === item.id)
                            ? isAnswersChecked
                              ? correctConnections.some(conn => conn.rightId === item.id)
                                ? 'bg-gradient-to-r from-green-200 to-green-300 border-green-500 border-4 shadow-lg'
                                : 'bg-gradient-to-r from-red-200 to-red-300 border-red-500 border-4 shadow-lg'
                              : 'bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400 cursor-not-allowed opacity-90'
                            : dragging && dragging.side === 'left'
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 hover:scale-105 hover:shadow-lg cursor-crosshair border-dashed border-2'
                            : 'bg-gradient-to-r from-white to-pink-50 border-pink-200 hover:border-pink-400 hover:scale-105 hover:shadow-lg'
                          }
                          ${!dragConnections.some(conn => conn.rightId === item.id) ? 'hover:animate-bounce-gentle' : ''}
                          flex items-center justify-center text-center font-bold overflow-hidden relative
                          focus:outline-none focus:ring-2 focus:ring-pink-300
                        `}
                      >
                        {item.type === 'emoji' ? (
                          <span className="text-2xl">{item.content}</span>
                        ) : item.type === 'video' ? (
                          <OptimizedVideo 
                            src={item.content} 
                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            onError={(e) => {
                              console.error('Video failed to load:', item.content);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-lg text-gray-800 font-medium">{item.content}</span>
                        )}
                        {dragConnections.some(conn => conn.rightId === item.id) && (
                          <span className="ml-2 text-lg animate-bounce-gentle">
                            {isAnswersChecked 
                              ? correctConnections.some(conn => conn.rightId === item.id) 
                                ? '✅' 
                                : '❌'
                              : '🔗'
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Area */}
                {showMatchingFeedback && (
                  <div className={`
                    mt-6 p-4 rounded-2xl border-3 text-center text-xl font-bold animate-fade-in
                    ${matchingFeedbackType === 'correct' 
                      ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-400 text-green-800' 
                      : 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-orange-800'
                    }
                  `}>
                    <div>{matchingFeedbackMessage}</div>
                    {redirectCountdown !== null && redirectCountdown > 0 && (
                      <div className="mt-2 text-lg animate-pulse">
                        ⏰ Returning to activities in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Indicator */}
                

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  {!isAnswersChecked ? (
                    <>
                      <button
                        onClick={handleCheckAnswers}
                        disabled={!canSubmit}
                        className={`
                          flex-1 py-4 px-6 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                          ${canSubmit
                            ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-500 hover:scale-105 hover:shadow-xl cursor-pointer animate-pulse-gentle'
                            : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                          }
                          focus:outline-none focus:ring-4 focus:ring-green-300
                        `}
                      >
                        <span className="text-2xl mr-2">✅</span>
                        Check Answers
                      </button>
                      
                      <button
                        onClick={handleResetConnections}
                        disabled={dragConnections.length === 0}
                        className={`
                          flex-1 py-4 px-6 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                          ${dragConnections.length > 0
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-500 hover:scale-105 hover:shadow-xl cursor-pointer'
                            : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-60'
                          }
                          focus:outline-none focus:ring-4 focus:ring-orange-300
                        `}
                      >
                        <span className="text-2xl mr-2">🔄</span>
                        Reset
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(-1)}
                      className="flex-1 py-4 px-6 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                        bg-gradient-to-r from-blue-400 to-purple-600 text-white border-blue-500 hover:scale-105 hover:shadow-xl cursor-pointer
                        focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      <span className="text-2xl mr-2">🏠</span>
                      Back to Activities
                    </button>
                  )}
                </div>

                {/* Back to Activities Button */}
                {/* <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="
                      py-3 px-8 rounded-2xl border-3 font-bold text-lg transition-all duration-300 transform
                      bg-gradient-to-r from-purple-400 to-blue-500 text-white border-purple-500 
                      hover:scale-105 hover:shadow-xl cursor-pointer hover:from-purple-500 hover:to-blue-600
                      focus:outline-none focus:ring-4 focus:ring-purple-300
                    "
                  >
                    <span className="text-2xl mr-2">⬅️</span>
                    Back to Activities
                  </button>
                </div> */}

                {/* Completion Message */}
                {(isMatchingComplete || (isAnswersChecked && correctConnections.length === 10)) && (
                  <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-3 border-green-400 text-center animate-fade-in">
                    <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Excellent Work!</h3>
                    <p className="text-lg text-green-700">
                      You matched all pairs perfectly! Great job! 🌟
                    </p>
                  </div>
                )}
              </div>
                </>
              )}
            </div>
          ) : isChoreGame ? (
            /* Modern Interactive Household Chores Helper */
            <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 px-4">
              {/* Clean Header with Animation */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 shadow-lg border border-blue-200 text-center relative overflow-hidden"
                   role="banner" aria-live="polite">
                <div className="absolute top-2 right-2 text-2xl md:text-3xl animate-bounce">🏠</div>
                <div className="absolute bottom-2 left-2 text-xl md:text-2xl animate-pulse">✨</div>
                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {questions.find(q => q.choreId === currentChoreId)?.choreName || 'Household Chores'}
                </h3>
                <div className="text-xs md:text-sm font-medium text-gray-600 bg-white rounded-full px-3 md:px-4 py-1 inline-block">
                  Step {currentChoreStep + 1} of {questions.find(q => q.choreId === currentChoreId)?.steps?.length || 0}
                </div>
              </div>

              {/* Interactive Question Card */}
              {(() => {
                const choreData = questions.find(q => q.choreId === currentChoreId);
                const currentStep = choreData?.steps?.[currentChoreStep];
                
                // Better error handling
                if (!currentStep || !choreData) {
                  return (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                      <div className="text-4xl mb-4">⚠️</div>
                      <div className="text-red-800 font-semibold">Oops! Something went wrong.</div>
                      <div className="text-red-600 text-sm mt-2">Unable to load the current step. Please try again.</div>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full -ml-12 -mb-12"></div>
                    
                    {/* Correct Answer Modal Overlay */}
                    {showCorrect && (
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex flex-col justify-center items-center z-50 rounded-xl">
                        <audio ref={correctAudioRef} src={correctSound} />
                        <img src={currentCorrectImage} alt="Correct" className="w-64 h-64 object-contain animate-bounce-gentle" />
                      </div>
                    )}

                    {/* Wrong Answer Modal Overlay */}
                    {showWrong && (
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/50 flex flex-col justify-center items-center z-50 rounded-xl">
                        <audio ref={wrongAudioRef} src={wrongSound} />
                        <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain animate-bounce-gentle" />
                      </div>
                    )}
                    
                    {/* Question Section */}
                    <div className="text-center mb-8 md:mb-10 relative z-10">
                      <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-bounce-gentle">
                        {currentStep.emoji || choreData.choreIcon || '🏠'}
                      </div>
                      <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 leading-relaxed px-4">
                        {currentStep.instruction}
                      </h4>
                      <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
                    </div>

                    {/* Interactive Answer Choices - 3 in 1 row */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 relative z-10 max-w-4xl mx-auto">
                      {currentStep.choices.map((choice, index) => (
                        <button
                          key={index}
                          disabled={showChoreFeedback}
                          onClick={() => {
                            if (showChoreFeedback) return;
                            
                            const isCorrect = choice === currentStep.correctChoice;
                            
                            if (isCorrect) {
                              setScore(prev => prev + 1);
                              setShowCorrect(true);
                              setShowChoreFeedback(true);
                              setChoreFeedbackMessage(currentStep.feedback || "Perfect! Great job! 🌟");
                              setChoreFeedbackType('correct');
                              setCompletedChoreSteps(prev => [...prev, currentChoreStep]);
                              
                              // Only advance to next step if correct
                              setTimeout(() => {
                                if (currentChoreStep < choreData.steps.length - 1) {
                                  setCurrentChoreStep(prev => prev + 1);
                                } else {
                                  setIsChoreComplete(true);
                                }
                                setShowCorrect(false);
                                setShowWrong(false);
                                setShowChoreFeedback(false);
                              }, 2500);
                            } else {
                              setShowWrong(true);
                              setShowChoreFeedback(true);
                              setChoreFeedbackMessage(`The correct answer is: ${currentStep.correctChoice}`);
                              setChoreFeedbackType('incorrect');
                              
                              // Advance to next step even on wrong answer
                              setTimeout(() => {
                                if (currentChoreStep < choreData.steps.length - 1) {
                                  setCurrentChoreStep(prev => prev + 1);
                                } else {
                                  setIsChoreComplete(true);
                                }
                                setShowCorrect(false);
                                setShowWrong(false);
                                setShowChoreFeedback(false);
                              }, 2500);
                            }
                          }}
                          className={`flex-1 group transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-300 relative overflow-hidden rounded-xl p-4 sm:p-6 text-center ${
                            showChoreFeedback 
                              ? 'cursor-not-allowed opacity-60' 
                              : 'hover:scale-105 hover:shadow-lg cursor-pointer bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-100 hover:to-purple-100 border-2 border-gray-200 hover:border-blue-400'
                          }`}
                          aria-label={`Choice ${String.fromCharCode(65 + index)}: ${choice}`}
                        >
                          {!showChoreFeedback && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          )}
                          
                          <div className="relative z-10">
                            <div className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                              showChoreFeedback && choice === currentStep.correctChoice
                                ? 'text-green-800'
                                : showChoreFeedback
                                ? 'text-gray-500'
                                : 'text-gray-800'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div className={`font-semibold text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                              showChoreFeedback && choice === currentStep.correctChoice
                                ? 'text-green-800'
                                : showChoreFeedback
                                ? 'text-gray-500'
                                : 'text-gray-800'
                            }`}>
                              {choice}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Enhanced Progress Section */}
              

              {/* Enhanced Feedback Display with Loading State */}
              {showChoreFeedback && choreFeedbackMessage && (
                <div className={`rounded-xl p-4 md:p-6 text-center shadow-lg border-2 transform transition-all duration-300 animate-fade-in ${
                  choreFeedbackType === 'correct' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800'
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-800'
                }`} role="alert" aria-live="assertive">
                  <div className="text-3xl md:text-4xl mb-2">
                    {choreFeedbackType === 'correct' ? '🎉' : '💡'}
                  </div>
                  <div className="text-base md:text-lg font-semibold mb-2">{choreFeedbackMessage}</div>
                  {choreFeedbackType === 'incorrect' && (
                    <div className="text-xs md:text-sm mt-2 opacity-80 flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Moving to next step...</span>
                    </div>
                  )}
                  {choreFeedbackType === 'correct' && (
                    <div className="text-xs md:text-sm mt-2 opacity-80 flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Great! Moving to next step...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Navigation */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
                {isChoreComplete && currentQuestionIndex > 0 && (
                  <button
                    onClick={() => {
                      // Go back to previous chore
                      const prevIndex = currentQuestionIndex - 1;
                      setCurrentQuestionIndex(prevIndex);
                      
                      // Reset chore state
                      setCurrentChoreStep(0);
                      setChoreProgress([]);
                      setCompletedChoreSteps([]);
                      setCompletedSteps([]);
                      setChoreToolsAvailable([]);
                      setChoreEnvironmentItems([]);
                      setDraggedChoreItems([]);
                      setDroppedChoreItems([]);
                      setDraggedItem(null);
                      setChoreScore(0);
                      setIsChoreComplete(false);
                      setShowChoreFeedback(false);
                      setChoreFeedbackType('');
                      setChoreFeedbackMessage('');
                      
                      // Set the previous chore ID
                      const prevChore = questions[prevIndex];
                      if (prevChore && prevChore.choreId) {
                        setCurrentChoreId(prevChore.choreId);
                      }
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    aria-label="Go back to previous chore"
                  >
                    <span className="text-xl md:text-2xl">⬅️</span>
                    <span className="text-center">Back</span>
                  </button>
                )}
                
                {isChoreComplete && (
                  <button
                    onClick={() => {
                      if (currentQuestionIndex < questions.length - 1) {
                        // Move to next chore
                        const nextIndex = currentQuestionIndex + 1;
                        setCurrentQuestionIndex(nextIndex);
                        
                        // Reset chore state
                        setCurrentChoreStep(0);
                        setChoreProgress([]);
                        setCompletedChoreSteps([]);
                        setCompletedSteps([]);
                        setChoreToolsAvailable([]);
                        setChoreEnvironmentItems([]);
                        setDraggedChoreItems([]);
                        setDroppedChoreItems([]);
                        setDraggedItem(null);
                        setChoreScore(0);
                        setIsChoreComplete(false);
                        setShowChoreFeedback(false);
                        setChoreFeedbackType('');
                        setChoreFeedbackMessage('');
                        
                        // Set the next chore ID
                        const nextChore = questions[nextIndex];
                        if (nextChore && nextChore.choreId) {
                          setCurrentChoreId(nextChore.choreId);
                        }
                      } else {
                        setShowModal(true);
                      }
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    aria-label={currentQuestionIndex < questions.length - 1 ? "Continue to next chore challenge" : "Complete the mission"}
                  >
                    <span className="text-xl md:text-2xl">
                      {currentQuestionIndex < questions.length - 1 ? "🎯" : "🏆"}
                    </span>
                    <span className="text-center">
                      {currentQuestionIndex < questions.length - 1 ? "Next Chore Challenge" : "Complete Mission"}
                    </span>
                  </button>
                )}
                
                {/* {isChoreComplete && (
                  <button
                    onClick={() => {
                      setShowModal(true);
                    }}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    aria-label="Back to Flashcards"
                  >
                    <span className="text-xl md:text-2xl">🏠</span>
                    <span className="text-center">Back to Flashcards</span>
                  </button>
                )} */}
                
               
              </div>

              {/* Enhanced Success Celebration */}
              {showCorrect && isChoreComplete && (
                <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-xl p-8 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 via-blue-100/20 to-purple-100/20 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <div className="text-green-800 text-2xl font-bold mb-2">Fantastic Work!</div>
                    <div className="text-green-700 text-lg">You've mastered this household chore! 🌟</div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

      </div>

      {/* Enhanced Next Button */}
      {isAnswered && (
        <div className="absolute right-7 bottom-90 animate-slide-in-right">
          <button
            {...getButtonSoundHandlers(handleNextClick)}
            className="w-50 relative right-6 top-38 cursor-pointer bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white  py-3 rounded-2xl text-lg font-bold shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 border-2 border-white/30 backdrop-blur-sm animate-pulse-gentle"
          >
            <span className="text-2xl animate-bounce-gentle">
              {currentQuestionIndex < questions.length - 1 ? "➡️" : "🎯"}
            </span>
            <span>{currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish"}</span>
            <span className="text-xl animate-float">✨</span>
          </button>
        </div>
      )}

      {/* Academic Puzzle Game UI */}
      {isPuzzleGame && currentPuzzleData && (
        <div className="space-y-6">
          {/* Puzzle Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border-3 border-indigo-200 text-center relative overflow-hidden">
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce-gentle">🧩</div>
            <div className="absolute -bottom-1 -left-1 text-3xl animate-float">⭐</div>
            <h3 className="text-2xl font-bold text-indigo-800 mb-2 flex items-center justify-center space-x-3">
              <span className="text-3xl animate-pulse-gentle">🎯</span>
              <span>Academic Puzzle</span>
            </h3>
            
            {/* Hint Display */}
            {showPuzzleHint && (
              <div className="mt-3 bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 animate-fade-in">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-lg font-medium text-yellow-800">Hint: {currentPuzzleData.hint}</span>
                </div>
              </div>
            )}
          </div>

          {/* Puzzle Content Area */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border-4 border-indigo-200 relative">
            
            {/* Math Puzzle */}
            {currentPuzzleData.puzzleType === 'math' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-indigo-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Math Problem Display */}
                {currentPuzzleData.objects ? (
                  <div className="text-center">
                    <div className="text-6xl mb-4 space-x-2">
                      {currentPuzzleData.objects.map((obj, index) => (
                        <span key={index} className="inline-block animate-bounce-gentle" style={{animationDelay: `${index * 0.1}s`}}>
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : currentPuzzleData.equation ? (
                  <div className="text-center text-4xl font-bold text-indigo-800 mb-6">
                    {currentPuzzleData.equation.first} {currentPuzzleData.equation.operator1} {currentPuzzleData.equation.second} = ?
                  </div>
                ) : null}
                
                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPuzzleData.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handlePuzzleAnswer(option)}
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-3 border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-3xl font-bold text-indigo-800 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spelling Puzzle */}
            {currentPuzzleData.puzzleType === 'spelling' && (
              <div className="space-y-6">
                {/* Target Word Display */}
                <div className="text-center">
                  <div className="flex justify-center space-x-3 mb-6">
                    {currentPuzzleData.targetWord.split('').map((_, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-yellow-100 border-3 border-yellow-400 rounded-xl flex items-center justify-center text-2xl font-bold text-yellow-800"
                      >
                        {selectedPuzzleAnswers[index] || '?'}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Letter Options */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {currentPuzzleData.letters.map((letter, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (selectedPuzzleAnswers.length < currentPuzzleData.targetWord.length) {
                          const newAnswers = [...selectedPuzzleAnswers, letter];
                          setSelectedPuzzleAnswers(newAnswers);
                        }
                      }}
                      disabled={selectedPuzzleAnswers.includes(letter)}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-3 border-purple-300 hover:border-purple-500 rounded-xl p-4 text-2xl font-bold text-purple-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-purple-300"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                
                {/* Check Answer Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const userAnswer = selectedPuzzleAnswers.join('');
                      handlePuzzleAnswer(userAnswer);
                    }}
                    disabled={selectedPuzzleAnswers.length !== currentPuzzleData.targetWord.length}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl mr-2">✓</span>
                    Check Answer
                  </button>
                </div>
              </div>
            )}

            {/* Matching Puzzle */}
            {currentPuzzleData.puzzleType === 'matching' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-indigo-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Word to Match */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-blue-100 border-4 border-blue-400 rounded-xl p-4 text-2xl font-bold text-blue-800">
                    {currentPuzzleData.word}
                  </div>
                </div>
                
                {/* Objects to Match */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPuzzleData.objects.map((obj, index) => (
                    <button
                      key={obj.id}
                      onClick={() => handlePuzzleAnswer(obj.id)}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 border-3 border-yellow-300 hover:border-yellow-500 rounded-xl p-6 text-xl font-semibold text-gray-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    >
                      {obj.content}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sorting Puzzle */}
            {currentPuzzleData.puzzleType === 'sorting' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-purple-700">{currentPuzzleData.instruction}</p>
                </div>
                
                {/* Fruit Basket (Drop Zone) */}
                <div className="text-center mb-6">
                  <div className="inline-block bg-green-100 border-4 border-green-400 rounded-xl p-6 min-w-[200px] min-h-[100px]">
                    <div className="text-2xl font-bold text-green-800 mb-2">🧺 FRUIT BASKET</div>
                    <div className="text-sm text-green-600">
                      {selectedPuzzleAnswers.length > 0 ? `${selectedPuzzleAnswers.length} item(s) selected` : 'Drag fruits here'}
                    </div>
                  </div>
                </div>
                
                {/* Items to Sort */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {currentPuzzleData.items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (selectedPuzzleAnswers.includes(item.id)) {
                          setSelectedPuzzleAnswers(selectedPuzzleAnswers.filter(id => id !== item.id));
                        } else {
                          setSelectedPuzzleAnswers([...selectedPuzzleAnswers, item.id]);
                        }
                      }}
                      className={`border-3 rounded-xl p-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                        selectedPuzzleAnswers.includes(item.id)
                          ? 'bg-green-200 border-green-500 text-green-800 ring-green-300'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 ring-gray-300'
                      }`}
                    >
                      {item.content}
                    </button>
                  ))}
                </div>
                
                {/* Check Answer Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      const isCorrect = currentPuzzleData.correctItems.every(id => selectedPuzzleAnswers.includes(id)) &&
                                      selectedPuzzleAnswers.every(id => currentPuzzleData.correctItems.includes(id));
                      handlePuzzleAnswer(selectedPuzzleAnswers, isCorrect);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
                  >
                    <span className="text-xl mr-2">✓</span>
                    Check Answer
                  </button>
                </div>
              </div>
            )}

            {/* Logic Puzzle */}
            {currentPuzzleData.puzzleType === 'logic' && (
              <div className="space-y-6">
                {/* Simple Multiple Choice Logic */}
                {currentPuzzleData.options && !currentPuzzleData.sequence && !currentPuzzleData.shapes && (
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-2xl font-bold text-green-700">{currentPuzzleData.instruction}</p>
                      
                      {/* Display objects for counting */}
                      {currentPuzzleData.objects && (
                        <div className="flex justify-center space-x-2 my-4">
                          {currentPuzzleData.objects.map((obj, index) => (
                            <span key={index} className="text-4xl">{obj}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-3 border-green-300 hover:border-green-500 rounded-2xl p-6 text-6xl font-semibold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pattern Display */}
                {currentPuzzleData.sequence && (
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-4 mb-6">
                      {currentPuzzleData.sequence.map((item, index) => (
                        <div key={index} className="text-6xl animate-pulse-gentle" style={{animationDelay: `${index * 0.2}s`}}>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-3 border-green-300 hover:border-green-500 rounded-2xl p-6 text-4xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Shape Sorting */}
                {currentPuzzleData.shapes && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {currentPuzzleData.categories.map((category, index) => (
                        <div key={category} className="bg-gray-100 border-3 border-gray-300 rounded-xl p-4 min-h-[100px] text-center">
                          <div className="font-bold text-lg text-gray-700 mb-2 capitalize">{category}</div>
                          {/* Drop zone for shapes */}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-lg text-gray-600">Drag shapes to the correct category!</div>
                  </div>
                )}
              </div>
            )}

            {/* Sequence Puzzle */}
            {currentPuzzleData.puzzleType === 'sequence' && (
              <div className="space-y-6">
                {/* Pattern Completion Type */}
                {currentPuzzleData.sequence && currentPuzzleData.options && (
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-2xl font-bold text-blue-700">{currentPuzzleData.instruction}</p>
                    </div>
                    
                    {/* Pattern Display */}
                    <div className="flex justify-center items-center space-x-4 mb-6">
                      {currentPuzzleData.sequence.map((item, index) => (
                        <div key={index} className="text-6xl animate-pulse-gentle" style={{animationDelay: `${index * 0.2}s`}}>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentPuzzleData.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePuzzleAnswer(option)}
                          className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border-3 border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-xl font-semibold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Drag and Drop Type */}
                {currentPuzzleData.items && !currentPuzzleData.options && (
                  <div>
                    {/* Sequence Slots */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Array.from({ length: currentPuzzleData.items.length }, (_, index) => (
                        <div
                          key={index}
                          className="bg-yellow-100 border-3 border-yellow-400 rounded-xl p-4 h-24 flex items-center justify-center text-center relative"
                          onDrop={(e) => {
                            e.preventDefault();
                            const item = JSON.parse(e.dataTransfer.getData('text/plain'));
                            handlePuzzleDrag(item, index);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <div className="absolute -top-2 -left-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="text-lg font-medium">
                            {draggedItems.find(item => item.position === index)?.content || 'Drop here'}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Available Items */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentPuzzleData.items.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                          className={`bg-gradient-to-r from-cyan-100 to-blue-100 border-3 border-cyan-300 rounded-xl p-4 text-center cursor-move transition-all duration-300 transform hover:scale-105 ${
                            draggedItems.some(d => d.id === item.id) ? 'opacity-50' : 'hover:shadow-lg'
                          }`}
                        >
                          <div className="text-lg font-medium text-cyan-800">{item.content}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Check Button */}
                    <div className="text-center">
                      <button
                        onClick={checkPuzzleCompletion}
                        disabled={draggedItems.length !== currentPuzzleData.items.length}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300"
                      >
                        <span className="text-2xl mr-2">✅</span>
                        Check Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          

          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-4">
            {/* Next Question Button - only show when puzzle is completed */}
            {isPuzzleComplete && (
              <button
                onClick={() => {
                  const totalQuestions = questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1;
                  if (currentQuestionIndex < totalQuestions - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setShowPuzzleFeedback(false);
                    setIsPuzzleComplete(false);
                    initializePuzzleGame();
                  } else {
                    setShowModal(true);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <span className="text-2xl mr-2">
                  {currentQuestionIndex < (questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1) - 1 ? "➡️" : "🎯"}
                </span>
                {currentQuestionIndex < (questionsData[category]?.[difficulty]?.["Academic Puzzles"]?.length || 1) - 1 ? "Next Puzzle" : "Finish"}
                <span className="text-xl ml-2 animate-float">✨</span>
              </button>
            )}
            
            {/* Hint Button */}
            {!showPuzzleHint && !isPuzzleComplete && (
              <button
                onClick={() => setShowPuzzleHint(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
              >
                <span className="text-xl mr-2">💡</span>
                Get Hint
              </button>
            )}
            
            {/* Reset Button */}
            
          </div>
          
          {/* Correct Overlay for Puzzle Game */}
          {showCorrect && (
            <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
              <audio ref={correctAudioRef} src={correctSound} />
              <img src={currentCorrectImage} alt="Correct" className="w-100 h-100 object-contain" />
            </div>
          )}

          {/* Wrong Overlay for Puzzle Game */}
          {showWrong && (
            <div className="absolute inset-0 backdrop-blur-sm flex flex-col justify-center items-center z-50 rounded-2xl">
              <audio ref={wrongAudioRef} src={wrongSound} />
              <img src="/assets/NiceTry.png" alt="Nice Try" className="w-64 h-64 object-contain" />
            </div>
          )}
        </div>
      )}



      {/* Badge Preview Notification */}
      {showBadgePreview && previewBadge && (
        <div className="fixed top-20 right-4 z-40 animate-slide-in-right">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm flex items-center space-x-3 min-w-[280px]">
            <div className="text-3xl animate-bounce-gentle">{previewBadge.icon}</div>
            <div>
              <div className="font-bold text-lg">{previewBadge.name}</div>
              <div className="text-sm opacity-90">{previewBadge.message}</div>
            </div>
            <div className="text-2xl animate-pulse-gentle">✨</div>
          </div>
        </div>
      )}

      {/* Enhanced Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 via-purple-900/20 to-pink-900/20 backdrop-blur-md z-50 animate-fade-in">
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <audio ref={audioRef} src={celebrationSound} />
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 w-[500px] shadow-2xl text-center relative border border-white/30 overflow-hidden animate-modal-appear">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50"></div>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-transparent rounded-full blur-xl animate-float-delayed"></div>
            
            <div className="relative z-10">
              <div className="relative mb-6">
                <div className="text-8xl animate-bounce-gentle drop-shadow-2xl">🎉</div>
                <div className="absolute -top-2 -right-4 text-4xl animate-spin-slow">⭐</div>
                <div className="absolute -bottom-2 -left-4 text-3xl animate-float">✨</div>
                <div className="absolute top-2 left-8 text-2xl animate-pulse-gentle">🌟</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200/50">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 animate-text-shimmer">
                  Amazing Work!
                </h2>
                <div className="bg-blue/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    You scored <span className="text-3xl text-purple-600">{score}</span> out of <span className="text-3xl text-pink-600">{isHygieneGame || isStreetGame ? 5 : total}</span>!
                  </p>
                  {activity === "Cashier Game" && (
                    <p className="text-xl font-bold text-green-600 mb-2">
                      Cashier Points: <span className="text-2xl">{cashierScore}</span> 🏪
                    </p>
                  )}
                  {/* {activity === "Hygiene Hero" && (
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      Hygiene Score: <span className="text-2xl">{hygieneScore}</span>/5 🧼✨
                    </p>
                  )} */}
                  {activity === "Safe Street Crossing" && (
                    <p className="text-xl font-bold text-green-600 mb-2">
                      Safety Score: <span className="text-2xl">{streetScore}</span>/5 🚦✨
                    </p>
                  )}
                  <div className="flex justify-center items-center space-x-2 mt-3">
                    <span className="text-2xl animate-bounce-gentle">🏆</span>
                    <span className="text-lg font-semibold text-gray-700">
                      {isHygieneGame ? 
                        (hygieneScore === 5 ? "Perfect Hygiene Hero!" : 
                         hygieneScore >= 4 ? "Excellent Hygiene!" : 
                         hygieneScore >= 3 ? "Great Job Learning!" : "Keep Practicing!") :
                       activity === "Safe Street Crossing" ?
                        (streetScore === 5 ? "Perfect Safety Champion!" : 
                         streetScore >= 4 ? "Excellent Street Safety!" : 
                         streetScore >= 3 ? "Great Job Staying Safe!" : "Keep Learning Safety!") :
                        (score === total ? "Perfect Score!" : 
                         score >= total * 0.8 ? "Excellent!" : 
                         score >= total * 0.6 ? "Great Job!" : "Keep Learning!")
                      }
                    </span>
                    <span className="text-2xl animate-bounce-gentle">🌟</span>
                  </div>
                </div>
              </div>
              
              <button
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white px-10 py-4 rounded-2xl cursor-pointer text-xl font-bold transition-all duration-300 shadow-2xl transform hover:scale-110 flex items-center mx-auto space-x-3 border-2 border-white/30 backdrop-blur-sm"
                onClick={handleFinish}
              >
                <span className="text-2xl animate-bounce-gentle">🚀</span>
                <span>Continue Adventure</span>
                <span className="text-xl animate-float">✨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Badge Award Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/40 via-purple-900/30 to-pink-900/30 backdrop-blur-md z-50 animate-fade-in">
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight}
            colors={['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1', '#FF69B4']}
            numberOfPieces={200}
            recycle={true}
            run={showBadgeModal}
          />
          <audio ref={badgeAudioRef} src={badgeCelebrationSound} />
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl text-center relative border border-white/30 overflow-hidden animate-modal-appear max-h-[90vh] overflow-y-auto">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-purple-50/50 to-blue-50/50"></div>
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-bl from-yellow-200/30 to-transparent rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-2xl animate-float-delayed"></div>
            <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-transparent rounded-full blur-xl animate-pulse-gentle"></div>
            
            <div className="relative z-10">
              {/* Dynamic Header Based on Achievement */}
              <div className="mb-8">
                {(() => {
                  const achievement = getBadgeAchievementMessage(earnedBadges);
                  return (
                    <>
                      <div className="relative mb-6">
                        <div className="text-8xl animate-bounce-gentle drop-shadow-2xl">🏅</div>
                        <div className="absolute -top-4 -right-8 text-4xl animate-spin-slow">✨</div>
                        <div className="absolute -bottom-4 -left-8 text-3xl animate-float">{achievement.emotion}</div>
                        <div className="absolute top-8 left-16 text-2xl animate-pulse-gentle">💫</div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-2xl p-2 mb-6 border-2 border-amber-200/50">
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 mb-3 animate-text-shimmer">
                          {achievement.title}
                        </h2>
                        <p className="text-lg text-gray-700 font-semibold mb-2">
                          {achievement.message}
                        </p>
                        
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Badges Grid with Enhanced Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-h-60 overflow-y-auto">
                {earnedBadges.map((badge, index) => (
                  <div 
                    key={badge.id}
                    className={`
                      bg-gradient-to-br ${badge.gradient} p-6 rounded-2xl shadow-2xl transform 
                      hover:scale-105 transition-all duration-300 border-2 border-white/30 
                      backdrop-blur-sm animate-badge-appear relative overflow-hidden group
                      ${badge.rarity === 'legendary' ? 'ring-4 ring-yellow-300/60 shadow-yellow-200/30' : 
                        badge.rarity === 'epic' ? 'ring-3 ring-purple-300/60 shadow-purple-200/30' : 
                        badge.rarity === 'rare' ? 'ring-2 ring-blue-300/60 shadow-blue-200/30' : 
                        'shadow-gray-200/20'}
                    `}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Rarity indicator */}
                    <div className={`
                      absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold uppercase
                      ${badge.rarity === 'legendary' ? 'bg-yellow-200/90 text-yellow-900' : 
                        badge.rarity === 'epic' ? 'bg-purple-200/90 text-purple-900' : 
                        badge.rarity === 'rare' ? 'bg-blue-200/90 text-blue-900' : 
                        'bg-gray-200/90 text-gray-800'}
                      transform group-hover:scale-110 transition-transform duration-300
                    `}>
                      {badge.rarity}
                    </div>
                    
                    {/* Points indicator */}
                    <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs font-bold text-white">+{badge.points}pts</span>
                    </div>
                    
                    {/* Badge shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                    
                    <div className="text-center text-white relative z-10">
                      <div className="text-5xl mb-3 animate-bounce-gentle drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {badge.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 drop-shadow-sm">
                        {badge.name}
                      </h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3 border-2 border-white/30 backdrop-blur-sm group"
                  onClick={() => {
                    setShowBadgeModal(false);

                    // For memory game, pass detailed score
                    if (isMemoryGame || activity === "Visual Memory Challenge") {
                      const accuracyPercentage = memoryAttempts > 0 ? Math.round((memoryCorrectAnswers / memoryAttempts) * 100) : 0;
                      const detailedScore = {
                        correctAnswers: memoryCorrectAnswers,
                        wrongAnswers: memoryWrongAnswers,
                        totalAttempts: memoryAttempts,
                        accuracyPercentage,
                        finalScore: memoryCorrectAnswers,
                        maxPossibleScore: 3
                      };
                      onComplete(score, total, detailedScore);
                    } else {
                      onComplete(score, total);
                    }

                    handleActivityComplete(score, total);

                  }}
                >
                  <span className="text-2xl animate-bounce-gentle group-hover:animate-spin-slow">🚀</span>
                  <span>Continue Adventure</span>
                  <span className="text-xl animate-float">✨</span>
                </button>
                
                <button
                  className="flex-1 bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 hover:from-amber-200 hover:via-yellow-200 hover:to-amber-300 text-amber-800 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 border-2 border-amber-200/50"
                  onClick={() => navigate('/studentpage')}
                >
                  <span className="text-xl animate-bounce-gentle">🏆</span>
                  <span>View Collection</span>
                  <span className="text-lg animate-pulse-gentle">📚</span>
                </button>
              </div>
              
             
              
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Styles for Autism-Friendly Animations */}
      <style>{`
        /* Gentle floating animations */
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-8px) rotate(1deg); 
            filter: brightness(1.05);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: brightness(1);
          }
          50% { 
            transform: translateY(-6px) rotate(-0.5deg); 
            filter: brightness(1.03);
          }
        }
        
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1.2s;
        }
        
        /* Gentle bouncing */
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        /* Gentle pulsing */
        @keyframes pulse-gentle {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.02); 
            opacity: 0.95; 
          }
        }
        
        @keyframes success-pulse {
          0%, 100% { 
            transform: scale(1.05); 
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); 
          }
          50% { 
            transform: scale(1.08); 
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); 
          }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2.5s ease-in-out infinite;
        }
        
        .animate-success-pulse {
          animation: success-pulse 1.5s ease-in-out infinite;
        }
        
        /* Slide and scale animations */
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        /* Badge preview slide animation */
        @keyframes badge-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .animate-slide-in-right {
          animation: badge-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Text effects */
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-text-shimmer {
          background-size: 200% 200%;
          animation: text-shimmer 3s ease-in-out infinite;
        }
        
        /* Slow gentle spin */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        /* Fade in */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        /* Badge specific animations */
        @keyframes badge-appear {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(-12deg);
          }
          to {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-badge-appear {
          animation: badge-appear 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        /* Slide across animation for menu items */
        @keyframes slide-across {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        
        .animate-slide-across {
          animation: slide-across 0.6s ease-in-out;
        }
        
        /* Connection line drawing animation */
        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        
        .animate-draw-line {
          animation: draw-line 0.8s ease-in-out forwards;
        }
        
        /* Memory Game Card Shuffle Animation - Physical Movement */
        @keyframes card-shuffle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          20% {
            transform: translateY(-30px) scale(1.05);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-40px) scale(1.1) rotateZ(5deg);
            opacity: 0.8;
            z-index: 100;
          }
          80% {
            transform: translateY(-30px) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-card-shuffle {
          animation: card-shuffle 1.8s ease-in-out;
        }
        
        /* Card Flip Animation */
        @keyframes flip-card {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        /* Memory Timer Pulse */
        @keyframes timer-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        /* Accessibility: Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Enhanced focus styles for accessibility */
        button:focus-visible {
          outline: 3px solid #8b5cf6;
          outline-offset: 3px;
          box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.2);
        }
      `}</style>

      {/* Background Music - Auto-selected based on activity */}
      <audio ref={bgMusicRef} />
    </div>
  );
};

export default Flashcards;