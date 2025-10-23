// src/lib/streaksApi.js
import { supabase } from './supabase';

// Get or create streak record for a student
export async function getStudentStreak(studentId) {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No streak record exists, create one
      const { data: newStreak, error: createError } = await supabase
        .from('streaks')
        .insert([{
          user_id: studentId,
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        }])
        .select()
        .single();

      return { data: newStreak, error: createError };
    }

    return { data, error };
  } catch (error) {
    console.error('Error getting student streak:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Update streak when student is active
export async function updateStreak(studentId) {
  try {
    console.log('🔥 updateStreak called for student:', studentId);

    const { data: currentStreak, error: getError } = await getStudentStreak(studentId);
    if (getError) {
      console.error('❌ Error getting current streak:', getError);
      return { data: null, error: getError };
    }

    console.log('🔥 Current streak data:', currentStreak);

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const lastActiveDate = currentStreak.last_active_date;

    console.log('🔥 Streak calculation:', {
      today,
      lastActiveDate,
      currentStreak: currentStreak.current_streak,
      longestStreak: currentStreak.longest_streak
    });

    let newCurrentStreak = currentStreak.current_streak;
    let newLongestStreak = currentStreak.longest_streak;

    if (lastActiveDate) {
      const lastActive = new Date(lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastActive.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log('🔥 Date comparison:', {
        lastActive: lastActive.toISOString(),
        todayDate: todayDate.toISOString(),
        diffTime,
        diffDays
      });

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newCurrentStreak += 1;
        console.log('🔥 Consecutive day detected, incrementing streak to:', newCurrentStreak);
      } else if (diffDays === 0) {
        // Same day - no change to streak
        newCurrentStreak = currentStreak.current_streak;
        console.log('🔥 Same day activity, keeping streak at:', newCurrentStreak);
      } else {
        // Gap in days - reset streak to 1
        newCurrentStreak = 1;
        console.log('🔥 Gap in days detected, resetting streak to 1');
      }
    } else {
      // First time active
      newCurrentStreak = 1;
      console.log('🔥 First time active, setting streak to 1');
    }

    // Update longest streak if current streak is higher
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
      console.log('🔥 New longest streak record:', newLongestStreak);
    }

    console.log('🔥 About to update streak in database:', {
      newCurrentStreak,
      newLongestStreak,
      today,
      studentId
    });

    // Update the streak record
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', studentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating streak in database:', error);
      return { data: null, error };
    }

    console.log('✅ Streak updated successfully in database:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating streak:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Get streak statistics for dashboard
export async function getStreakStats(studentId) {
  try {
    const { data: streak, error } = await getStudentStreak(studentId);
    if (error) {
      return { data: null, error };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = streak.last_active_date;
    
    let isActiveToday = false;
    if (lastActiveDate) {
      isActiveToday = lastActiveDate === today;
    }

    // Calculate days until perfect week badge (7 days)
    const daysTowards7Day = Math.min(streak.current_streak, 7);
    const daysUntilPerfectWeek = Math.max(0, 7 - streak.current_streak);

    return {
      data: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        isActiveToday,
        lastActiveDate: streak.last_active_date,
        daysTowards7Day,
        daysUntilPerfectWeek,
        streakEmoji: getStreakEmoji(streak.current_streak)
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting streak stats:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Test function to debug streak functionality
export async function testStreakSystem(studentId) {
  console.log('🧪 Testing streak system for student:', studentId);
  
  try {
    // Test 1: Try to get/create streak record
    console.log('🧪 Test 1: Getting streak record...');
    const { data: streak, error: getError } = await getStudentStreak(studentId);
    if (getError) {
      console.error('🧪 Test 1 FAILED:', getError);
      return { success: false, error: getError };
    }
    console.log('🧪 Test 1 PASSED: Streak record:', streak);

    // Test 2: Try to update streak
    console.log('🧪 Test 2: Updating streak...');
    const { data: updated, error: updateError } = await updateStreak(studentId);
    if (updateError) {
      console.error('🧪 Test 2 FAILED:', updateError);
      return { success: false, error: updateError };
    }
    console.log('🧪 Test 2 PASSED: Updated streak:', updated);

    return { success: true, data: updated };
  } catch (error) {
    console.error('🧪 Test CRASHED:', error);
    return { success: false, error: { message: error.message } };
  }
}

// Helper function to get appropriate emoji for streak
function getStreakEmoji(streakDays) {
  if (streakDays >= 30) return '🔥🔥🔥';
  if (streakDays >= 14) return '🔥🔥';
  if (streakDays >= 7) return '🔥';
  if (streakDays >= 3) return '⚡';
  if (streakDays >= 1) return '💪';
  return '🌟';
}