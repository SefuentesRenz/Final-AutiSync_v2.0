// src/lib/progressApi.js
import { supabase } from './supabase';

// Record activity completion and score
export async function recordActivityProgress(studentId, activityId, score, completionStatus = 'completed') {
  try {
    console.log('Recording activity progress:', { studentId, activityId, score, completionStatus });

    // Check if progress already exists for this student and activity
    const { data: existingProgress, error: checkError } = await supabase
  .from('user_activity_progress')
      .select('*')
      .eq('user_id', studentId)
      .eq('activity_id', activityId)
      .single();

    let result;
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
  .from('user_activity_progress')
        .update({
          score: score,
          completion_status: completionStatus,
          date_completed: new Date().toISOString()
        })
        .eq('user_id', studentId)
        .eq('activity_id', activityId)
        .select();
      
      result = { data, error };
    } else {
      // Insert new progress record
      const { data, error } = await supabase
  .from('user_activity_progress')
        .insert([{
          user_id: studentId,
          activity_id: activityId,
          score: score,
          completion_status: completionStatus,
          date_completed: new Date().toISOString()
        }])
        .select();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('Error recording activity progress:', result.error);
      return { data: null, error: result.error };
    }

    console.log('Activity progress recorded successfully:', result.data);
    return result;
  } catch (error) {
    console.error('Unexpected error recording progress:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Get all progress for a student
export async function getStudentProgress(studentId) {
  try {
    const { data, error } = await supabase
  .from('user_activity_progress')
      .select(`
        *,
        activities (
          id,
          title,
          category,
          difficulty,
          duration
        )
      `)
      .eq('user_id', studentId)
      .order('date_completed', { ascending: false });

    if (error) {
      console.error('Error fetching student progress:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching progress:', error);
    return { data: [], error: { message: error.message } };
  }
}

// Get progress summary for dashboard
export async function getProgressSummary(studentId) {
  try {
    const { data: allProgress, error } = await supabase
  .from('user_activity_progress')
      .select(`
        *,
        activities (
          category,
          difficulty
        )
      `)
      .eq('user_id', studentId);

    if (error) {
      console.error('Error fetching progress summary:', error);
      return { data: null, error };
    }

    // Calculate summary statistics
    const totalActivities = allProgress.length;
    const completedActivities = allProgress.filter(p => p.completion_status === 'completed').length;
    const averageScore = totalActivities > 0 
      ? allProgress.reduce((sum, p) => sum + (p.score || 0), 0) / totalActivities 
      : 0;

    // Group by category
    const categoryProgress = allProgress.reduce((acc, progress) => {
      const category = progress.activities?.category || 'unknown';
      if (!acc[category]) {
        acc[category] = { total: 0, completed: 0, totalScore: 0 };
      }
      acc[category].total++;
      if (progress.completion_status === 'completed') {
        acc[category].completed++;
      }
      acc[category].totalScore += progress.score || 0;
      return acc;
    }, {});

    return {
      data: {
        totalActivities,
        completedActivities,
        averageScore: Math.round(averageScore * 100) / 100,
        completionRate: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0,
        categoryProgress
      },
      error: null
    };
  } catch (error) {
    console.error('Error calculating progress summary:', error);
    return { data: null, error: { message: error.message } };
  }
}
    .order('completed_at', { ascending: false });
  return { data, error };
}

// Get progress for a specific student and activity
export async function getStudentActivityProgress(student_id, activity_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .select(`
      *,
      Activities!inner(*)
    `)
    .eq('student_id', student_id)
    .eq('activity_id', activity_id)
    .order('completed_at', { ascending: false });
  return { data, error };
}

// Check if student has completed an activity
export async function hasStudentCompletedActivity(student_id, activity_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .select('id')
    .eq('student_id', student_id)
    .eq('activity_id', activity_id)
    .limit(1);
  
  return { 
    completed: !error && data && data.length > 0,
    error 
  };
}

// Get progress statistics for a student
export async function getStudentProgressStats(student_id) {
  try {
    // Get total activities completed
    const { data: completedData, error: completedError } = await supabase
      .from('student_activity_progress')
      .select('activity_id')
      .eq('student_id', student_id);

    if (completedError) {
      return { data: null, error: completedError };
    }

    // Get unique activities completed (in case student completed same activity multiple times)
    const uniqueCompleted = [...new Set(completedData.map(item => item.activity_id))];

    // Get total available activities
    const { data: totalActivities, error: totalError } = await supabase
      .from('Activities')
      .select('id')
      .eq('is_activity', true);

    if (totalError) {
      return { data: null, error: totalError };
    }

    // Calculate completion percentage
    const completionPercentage = totalActivities.length > 0 
      ? Math.round((uniqueCompleted.length / totalActivities.length) * 100)
      : 0;

    // Get average score
    const { data: scoresData, error: scoresError } = await supabase
      .from('student_activity_progress')
      .select('score')
      .eq('student_id', student_id)
      .not('score', 'is', null);

    let averageScore = null;
    if (!scoresError && scoresData.length > 0) {
      const totalScore = scoresData.reduce((sum, item) => sum + item.score, 0);
      averageScore = Math.round(totalScore / scoresData.length);
    }

    const stats = {
      total_activities_available: totalActivities.length,
      activities_completed: uniqueCompleted.length,
      completion_percentage: completionPercentage,
      average_score: averageScore,
      total_sessions: completedData.length
    };

    return { data: stats, error: null };
  } catch (e) {
    console.error('progressApi: Error getting stats:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get progress for all children of a parent
export async function getChildrenProgressByParentId(parent_id) {
  try {
    // First get all children for this parent
    const { data: relationships, error: relError } = await supabase
      .from('parent_child_relationships')
      .select(`
        student_id,
        students!inner(
          *,
          user_profiles!inner(*)
        )
      `)
      .eq('parent_id', parent_id);

    if (relError) {
      return { data: null, error: relError };
    }

    // Get progress for each child
    const childrenProgress = await Promise.all(
      relationships.map(async (rel) => {
        const { data: stats, error: statsError } = await getStudentProgressStats(rel.student_id);
        const { data: recentProgress, error: recentError } = await supabase
          .from('student_activity_progress')
          .select(`
            *,
            Activities!inner(*)
          `)
          .eq('student_id', rel.student_id)
          .order('completed_at', { ascending: false })
          .limit(5);

        return {
          student: rel.students,
          stats: stats,
          recent_activities: recentProgress || [],
          errors: {
            stats: statsError,
            recent: recentError
          }
        };
      })
    );

    return { data: childrenProgress, error: null };
  } catch (e) {
    console.error('progressApi: Error getting children progress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all students progress (for admin)
export async function getAllStudentsProgress() {
  try {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        user_profiles!inner(*)
      `);

    if (studentsError) {
      return { data: null, error: studentsError };
    }

    const studentsProgress = await Promise.all(
      students.map(async (student) => {
        const { data: stats, error: statsError } = await getStudentProgressStats(student.id);
        return {
          student: student,
          stats: stats,
          error: statsError
        };
      })
    );

    return { data: studentsProgress, error: null };
  } catch (e) {
    console.error('progressApi: Error getting all students progress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Update activity progress (for editing scores, notes, etc.)
export async function updateActivityProgress(progress_id, updates) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', progress_id)
    .select();
  return { data, error };
}

// Delete activity progress record
export async function deleteActivityProgress(progress_id) {
  const { data, error } = await supabase
    .from('student_activity_progress')
    .delete()
    .eq('id', progress_id);
  return { data, error };
}
