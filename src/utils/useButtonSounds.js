import { useRef, useCallback, useState, useEffect } from 'react';

// Import audio files properly for Vite
import hoverSound from '../assets/sounds/button_hover.mp3';
import clickSound from '../assets/sounds/button-click.mp3';

export const useButtonSounds = () => {
  const hoverSoundRef = useRef(null);
  const clickSoundRef = useRef(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Initialize audio objects only after user interaction
  const initializeAudio = useCallback(() => {
    if (!audioInitialized) {
      try {
        // Use imported audio files
        hoverSoundRef.current = new Audio(hoverSound);
        hoverSoundRef.current.volume = 0.5;
        hoverSoundRef.current.preload = 'metadata';
        
        clickSoundRef.current = new Audio(clickSound);
        clickSoundRef.current.volume = 0.6;
        clickSoundRef.current.preload = 'metadata';
        
        setAudioInitialized(true);
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    }
  }, [audioInitialized]);

  // Add click listener to detect user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      setUserInteracted(true);
      initializeAudio();
      document.removeEventListener('click', handleFirstClick);
    };

    if (!userInteracted) {
      document.addEventListener('click', handleFirstClick);
    }

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [userInteracted, initializeAudio]);

  const playHoverSound = useCallback(() => {
    if (!userInteracted || !audioInitialized) {
      return; // Don't try to play until user has interacted
    }
    
    try {
      if (hoverSoundRef.current) {
        hoverSoundRef.current.currentTime = 0;
        const playPromise = hoverSoundRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Silently handle autoplay restrictions
            console.log('Hover sound blocked by browser:', error.message);
          });
        }
      }
    } catch (error) {
      console.log('Error playing hover sound:', error);
    }
  }, [userInteracted, audioInitialized]);

  const playClickSound = useCallback(() => {
    if (!userInteracted || !audioInitialized) {
      return; // Don't try to play until user has interacted
    }
    
    try {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        const playPromise = clickSoundRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Silently handle autoplay restrictions
            console.log('Click sound blocked by browser:', error.message);
          });
        }
      }
    } catch (error) {
      console.log('Error playing click sound:', error);
    }
  }, [userInteracted, audioInitialized]);

  const getButtonSoundHandlers = useCallback((originalOnClick) => ({
    onMouseEnter: () => {
      if (!userInteracted) {
        initializeAudio();
        setUserInteracted(true);
      }
      playHoverSound();
    },
    onClick: (e) => {
      if (!userInteracted) {
        initializeAudio();
        setUserInteracted(true);
      }
      playClickSound();
      if (originalOnClick) {
        originalOnClick(e);
      }
    }
  }), [playHoverSound, playClickSound, userInteracted, initializeAudio]);

  return {
    playHoverSound,
    playClickSound,
    getButtonSoundHandlers,
    audioInitialized,
    userInteracted
  };
};