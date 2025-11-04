import { supabase } from './supabase';

/**
 * Record a student's score for unlocking logic
 * This is separate from progress tracking and focuses on perfect score completion
 * 
 * @param {string} studentId - The student's user ID
 * @param {string} activityName - The activity name (e.g., "Identification", "Numbers")
 * @param {string} category - The category (e.g., "Academic")
 * @param {string} difficultyLevel - The difficulty level (Beginner, Intermediate, Proficient)
 * @param {number} score - The score achieved
 * @param {number} totalQuestions - Total number of questions
 */
export const recordStudentScore = async (studentId, activityName, category, difficultyLevel, score, totalQuestions) => {
  try {
    console.log('📊 Recording student score:', { 
      studentId, 
      activityName, 
      category, 
      difficultyLevel, 
      score, 
      totalQuestions 
    });

    // Check if record already exists for this student + activity + difficulty
    const { data: existing, error: fetchError } = await supabase
      .from('student_scores')
      .select('id, score, total_questions')
      .eq('student_id', studentId)
      .eq('activity_name', activityName)
      .eq('difficulty_level', difficultyLevel)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('❌ Error checking existing score:', fetchError);
      console.error('❌ Error details:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint
      });
      
      // If table doesn't exist (404), provide helpful message
      if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
        console.error('🚨 CRITICAL: student_scores table does not exist! Please run the SQL migration.');
        console.error('📄 Migration file: database/verify_and_create_student_scores.sql');
      }
      
      return { error: fetchError };
    }

    // If exists and new score is not better, skip update
    if (existing && existing.score >= score) {
      console.log('⏭️ Existing score is equal or better, skipping update');
      return { data: existing, error: null };
    }

    // Insert or update the score
    const scoreData = {
      student_id: studentId,
      activity_name: activityName,
      category: category,
      difficulty_level: difficultyLevel,
      score: score,
      total_questions: totalQuestions,
      completed_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('student_scores')
        .update(scoreData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student score:', error);
        return { error };
      }

      console.log('✅ Student score updated successfully:', data);
      return { data, error: null };
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('student_scores')
        .insert([scoreData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting student score:', error);
        return { error };
      }

      console.log('✅ Student score recorded successfully:', data);
      return { data, error: null };
    }
  } catch (err) {
    console.error('Unexpected error in recordStudentScore:', err);
    return { error: err };
  }
};
