import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to manage activity unlock status based on student progress
 * 
 * Logic:
 * - Beginner: Always unlocked by default
 * - Intermediate: Unlocked only if student got 100% on the same activity in Beginner
 * - Proficient: Unlocked only if student got 100% on the same activity in Intermediate
 */
export const useActivityUnlock = (userId, category = 'Academic') => {
  const [unlockStatus, setUnlockStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student scores and compute unlock status
  const fetchUnlockStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all completed activities for this student from student_scores
      const { data: scores, error: scoresError } = await supabase
        .from('student_scores')
        .select('activity_name, difficulty_level, score, total_questions')
        .eq('student_id', userId)
        .eq('category', category);

      if (scoresError) {
        console.error('❌ Error fetching student scores:', scoresError);
        console.error('❌ Error details:', {
          code: scoresError.code,
          message: scoresError.message,
          details: scoresError.details,
          hint: scoresError.hint
        });
        
        // If table doesn't exist, provide helpful message
        if (scoresError.code === '42P01' || scoresError.message?.includes('does not exist')) {
          console.error('🚨 CRITICAL: student_scores table does not exist! Please run the SQL migration.');
          console.error('📄 Migration file: database/verify_and_create_student_scores.sql');
        }
        
        setError(scoresError.message);
        setLoading(false);
        return;
      }

      console.log('📊 Fetched scores from database:', scores);

      // Build unlock status map
      const status = {};

      // Process each score record
      scores?.forEach((record) => {
        const activityKey = record.activity_name;
        
        if (!status[activityKey]) {
          status[activityKey] = {
            beginner: true, // Always unlocked
            intermediate: false,
            proficient: false
          };
        }

        // Check for perfect score (100%)
        const isPerfectScore = record.score === record.total_questions && record.score > 0;

        console.log(`🎯 Processing ${activityKey} ${record.difficulty_level}: ${record.score}/${record.total_questions} - Perfect: ${isPerfectScore}`);

        // Unlock logic
        if (record.difficulty_level === 'Beginner' && isPerfectScore) {
          status[activityKey].intermediate = true;
          console.log(`✅ Unlocked Intermediate for ${activityKey}`);
        }
        
        if (record.difficulty_level === 'Intermediate' && isPerfectScore) {
          status[activityKey].proficient = true;
          console.log(`✅ Unlocked Proficient for ${activityKey}`);
        }
      });

      console.log('🔓 Final unlock status:', status);
      setUnlockStatus(status);
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error in fetchUnlockStatus:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUnlockStatus();
  }, [userId, category]);

  /**
   * Check if a specific activity + difficulty is unlocked
   */
  const isUnlocked = (activityName, difficulty) => {
    console.log(`🔍 isUnlocked called for: ${activityName} at ${difficulty}`);
    console.log('📋 Current unlockStatus:', unlockStatus);
    
    // Beginner is always unlocked
    if (difficulty === 'Beginner') {
      console.log('✅ Beginner is always unlocked');
      return true;
    }

    const activityStatus = unlockStatus[activityName];
    if (!activityStatus) {
      console.log(`❌ No status found for ${activityName} - LOCKED`);
      return false; // Not unlocked if no record
    }

    console.log(`📊 Status for ${activityName}:`, activityStatus);

    if (difficulty === 'Intermediate') {
      const unlocked = activityStatus.intermediate === true;
      console.log(`${unlocked ? '✅' : '❌'} Intermediate ${unlocked ? 'UNLOCKED' : 'LOCKED'}`);
      return unlocked;
    }

    if (difficulty === 'Proficient') {
      const unlocked = activityStatus.proficient === true;
      console.log(`${unlocked ? '✅' : '❌'} Proficient ${unlocked ? 'UNLOCKED' : 'LOCKED'}`);
      return unlocked;
    }

    return false;
  };

  /**
   * Manually refresh unlock status (e.g., after completing an activity)
   */
  const refreshUnlockStatus = async () => {
    await fetchUnlockStatus();
  };

  return {
    unlockStatus,
    isUnlocked,
    loading,
    error,
    refreshUnlockStatus
  };
};
