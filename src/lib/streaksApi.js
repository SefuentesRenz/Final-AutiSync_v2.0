// src/lib/streaksApi.js
import { supabase } from './supabase';

// Check if current time is within streak increment window (6:00 AM - 3:00 PM)
function isWithinStreakWindow() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes; // Convert to minutes since midnight
  
  const startTime = 6 * 60; // 6:00 AM in minutes
  const endTime = 15 * 60; // 3:00 PM (15:00) in minutes
  
  const isWithin = currentTime >= startTime && currentTime <= endTime;
  console.log('🕐 Time check:', { 
    currentHour: hours, 
    currentMinute: minutes,
    isWithinWindow: isWithin,
    window: '6:00 AM - 3:00 PM'
  });
  
  return isWithin;
}

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
          last_active_date: null,
          last_streak_increment_date: null
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

// Update streak on login - with time window and 3-day reset logic
export async function updateStreakOnLogin(studentId) {
  try {
    console.log('🔥 updateStreakOnLogin called for student:', studentId);

    const { data: currentStreak, error: getError } = await getStudentStreak(studentId);
    if (getError) {
      console.error('❌ Error getting current streak:', getError);
      return { data: null, error: getError };
    }

    console.log('🔥 Current streak data:', currentStreak);

    // Get local date in YYYY-MM-DD format (no timezone conversion)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const lastStreakIncrementDate = currentStreak.last_streak_increment_date;
    const lastActiveDate = currentStreak.last_active_date;

    console.log('🔥 Streak calculation:', {
      today,
      todayFormatted: new Date().toLocaleString(),
      lastStreakIncrementDate,
      lastActiveDate,
      currentStreak: currentStreak.current_streak,
      longestStreak: currentStreak.longest_streak,
      datesMatch: lastStreakIncrementDate === today
    });

    // First, check if streak needs to be reset due to 3+ day gap
    let needsReset = false;
    let gapDays = 0;
    if (lastStreakIncrementDate) {
      const lastIncrement = new Date(lastStreakIncrementDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastIncrement.getTime();
      gapDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      console.log('🔥 Checking for gap:', {
        lastStreakIncrementDate,
        today,
        diffDays: gapDays
      });

      if (gapDays >= 3) {
        needsReset = true;
        console.log('🔥 3+ days gap detected, streak will reset to 1 when logging in during window');
      }
    }

    // Check if within time window (6:00 AM - 3:00 PM)
    if (!isWithinStreakWindow()) {
      console.log('⏰ Outside streak window (6AM-3PM), no streak increment');
      
      // If there was a 3+ day gap, reset to 0 (will become 1 when they log in during window)
      if (needsReset) {
        const { data: resetData, error: resetError } = await supabase
          .from('streaks')
          .update({
            current_streak: 0,
            last_active_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentStreak.id)
          .select()
          .single();

        if (resetError) {
          console.error('❌ Error resetting streak:', resetError);
        } else {
          console.log('✅ Streak reset to 0 due to 3+ day gap (outside window)');
          currentStreak.current_streak = 0;
        }
      } else {
        // Just update last_active_date
        await supabase
          .from('streaks')
          .update({
            last_active_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', studentId);
      }
      
      return { data: currentStreak, error: null, message: 'Outside streak window' };
    }

    // Check if already incremented today
    if (lastStreakIncrementDate === today) {
      console.log('✅ Streak already incremented today, no change');
      // Still update last_active_date to track they logged in
      await supabase
        .from('streaks')
        .update({
          last_active_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', studentId);
      
      return { data: currentStreak, error: null, message: 'Already incremented today' };
    }

    let newCurrentStreak = currentStreak.current_streak;
    let newLongestStreak = currentStreak.longest_streak;

    if (lastStreakIncrementDate) {
      const lastIncrement = new Date(lastStreakIncrementDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastIncrement.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      console.log('🔥 Date comparison:', {
        lastIncrement: lastIncrement.toISOString(),
        todayDate: todayDate.toISOString(),
        diffTime,
        diffDays
      });

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newCurrentStreak += 1;
        console.log('🔥 Consecutive day detected, incrementing streak to:', newCurrentStreak);
      } else if (diffDays >= 3) {
        // 3 or more days gap - reset to 0, then increment to 1 for today's login
        newCurrentStreak = 1;
        console.log('🔥 3+ days gap detected, resetting and starting fresh at 1');
      } else if (diffDays > 1) {
        // 2 days gap - reset to 1 (starting fresh)
        newCurrentStreak = 1;
        console.log('🔥 2 days gap detected, resetting streak to 1');
      }
    } else {
      // First time incrementing - start at 1
      newCurrentStreak = 1;
      console.log('🔥 First time incrementing, setting streak to 1');
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

    // Update the streak record using the ID (not user_id to avoid duplicate issues)
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: today,
        last_streak_increment_date: today, // Track when streak was last incremented
        updated_at: new Date().toISOString()
      })
      .eq('id', currentStreak.id) // Use ID instead of user_id
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating streak in database:', error);
      return { data: null, error };
    }

    console.log('✅ Streak updated successfully in database:', data);
    return { data, error: null, message: 'Streak incremented' };
  } catch (error) {
    console.error('Unexpected error updating streak:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Legacy function for backward compatibility (activities)
export async function updateStreak(studentId) {
  return updateStreakOnLogin(studentId);
}

// Get streak statistics for dashboard
export async function getStreakStats(studentId) {
  try {
    const { data: streak, error } = await getStudentStreak(studentId);
    if (error) {
      return { data: null, error };
    }

    // Get local date in YYYY-MM-DD format (no timezone conversion)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
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