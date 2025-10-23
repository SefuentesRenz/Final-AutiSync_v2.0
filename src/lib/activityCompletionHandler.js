// src/lib/activityCompletionHandler.js
import { recordActivityProgress } from './progressApi';
import { checkAndAwardBadges } from './badgesApi';
import { updateStreak, testStreakSystem } from './streaksApi';

// Main function to handle activity completion
export async function handleActivityCompletion(studentId, activityId, score, completionStatus = 'completed') {
  try {
    console.log('Handling activity completion:', { studentId, activityId, score, completionStatus });

    const results = {
      progress: null,
      badges: [],
      streak: null,
      errors: []
    };

    // 1. Record the activity progress
    console.log('Recording activity progress...');
    const { data: progressData, error: progressError } = await recordActivityProgress(
      studentId, 
      activityId, 
      score, 
      completionStatus
    );

    if (progressError) {
      console.error('Error recording progress:', progressError);
      results.errors.push('Failed to record progress: ' + progressError.message);
    } else {
      results.progress = progressData;
      console.log('Progress recorded successfully');
    }

    // 2. Update streak (only if activity was completed successfully)
    if (completionStatus === 'completed') {
      console.log('🔥 Updating streak for student:', studentId);
      
      // First test the streak system
      console.log('🧪 Running streak system test...');
      const testResult = await testStreakSystem(studentId);
      console.log('🧪 Test result:', testResult);
      
      const { data: streakData, error: streakError } = await updateStreak(studentId);
      
      if (streakError) {
        console.error('❌ Error updating streak:', streakError);
        results.errors.push('Failed to update streak: ' + streakError.message);
      } else {
        results.streak = streakData;
        console.log('✅ Streak updated successfully:', streakData);
      }

      // 3. Check and award badges
      console.log('Checking for new badges...');
      const { data: newBadges, error: badgesError } = await checkAndAwardBadges(studentId);
      
      if (badgesError) {
        console.error('Error checking badges:', badgesError);
        results.errors.push('Failed to check badges: ' + badgesError.message);
      } else {
        results.badges = newBadges || [];
        if (newBadges && newBadges.length > 0) {
          console.log('New badges awarded:', newBadges.length);
        }
      }
    }

    console.log('Activity completion handled successfully:', results);
    return {
      data: results,
      error: results.errors.length > 0 ? { message: results.errors.join('; ') } : null
    };

  } catch (error) {
    console.error('Unexpected error handling activity completion:', error);
    return {
      data: null,
      error: { message: error.message }
    };
  }
}

// Function to get student's overall dashboard data
export async function getStudentDashboardData(studentId) {
  try {
    console.log('Fetching dashboard data for student:', studentId);

    // Import here to avoid circular dependencies
    const { getProgressSummary } = await import('./progressApi');
    const { getStudentBadges } = await import('./badgesApi');
    const { getStreakStats } = await import('./streaksApi');

    const [progressResult, badgesResult, streakResult] = await Promise.all([
      getProgressSummary(studentId),
      getStudentBadges(studentId),
      getStreakStats(studentId)
    ]);

    const dashboardData = {
      progress: progressResult.data,
      badges: badgesResult.data || [],
      streak: streakResult.data,
      errors: []
    };

    // Collect any errors
    if (progressResult.error) dashboardData.errors.push('Progress: ' + progressResult.error.message);
    if (badgesResult.error) dashboardData.errors.push('Badges: ' + badgesResult.error.message);
    if (streakResult.error) dashboardData.errors.push('Streak: ' + streakResult.error.message);

    return {
      data: dashboardData,
      error: dashboardData.errors.length > 0 ? { message: dashboardData.errors.join('; ') } : null
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      data: null,
      error: { message: error.message }
    };
  }
}