// src/lib/progressApi.js
import { supabase } from './supabase';
import { checkAndAwardBadges } from './badgesApi';

// Record activity completion and score
export async function recordActivityProgress(studentId, activityId, score, completionStatus = 'completed') {
  try {
    console.log('🔄 Recording activity progress:', { studentId, activityId, score, completionStatus });

    // Validate inputs
    if (!studentId) {
      console.error('❌ No studentId provided');
      return { data: null, error: { message: 'Student ID is required' } };
    }
    if (!activityId) {
      console.error('❌ No activityId provided');
      return { data: null, error: { message: 'Activity ID is required' } };
    }

    // Get student's full name
    console.log('👤 Getting student full name...');
    const { data: studentProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', studentId)
      .single();

    if (profileError) {
      console.error('❌ Error getting student profile:', profileError);
      return { data: null, error: profileError };
    }

    const studentName = studentProfile?.full_name || 'Unknown Student';
    console.log('👤 Student name:', studentName);

    // Since we no longer use the students table, we work directly with user_profiles
    // Verify that the studentId exists in user_profiles
    console.log('🔍 Verifying studentId exists in user_profiles...');
    if (!studentProfile) {
      console.error('❌ Student profile not found in user_profiles');
      return { data: null, error: { message: 'Student profile not found' } };
    }
    console.log('✅ Student profile verified:', studentProfile);

    // Check if progress already exists for this student and activity
    console.log('🔍 Checking for existing progress...');
    const { data: existingProgress, error: checkError } = await supabase
  .from('user_activity_progress')
      .select('*')
      .eq('user_id', studentId) // Use user_id not student_id
      .eq('activity_id', activityId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing progress:', checkError);
      return { data: null, error: checkError };
    }

    console.log('📊 Existing progress:', existingProgress);

    let result;
    if (existingProgress) {
      // Update existing progress
      console.log('📝 Updating existing progress...');
      const { data, error } = await supabase
  .from('user_activity_progress')
        .update({
          score: score,
          completion_status: completionStatus,
          student_name: studentName,
          date_completed: new Date().toISOString()
        })
        .eq('user_id', studentId) // Use user_id not student_id
        .eq('activity_id', activityId)
        .select();
      
      result = { data, error };
      console.log('📝 Update result:', result);
    } else {
      // Insert new progress record
      console.log('➕ Inserting new progress record...');
      const progressRecord = {
        user_id: studentId, // Use user_id not student_id
        activity_id: activityId,
        score: score,
        completion_status: completionStatus,
        student_name: studentName,
        date_completed: new Date().toISOString()
      };
      console.log('📋 Progress record to insert:', progressRecord);
      
      const { data, error } = await supabase
  .from('user_activity_progress')
        .insert([progressRecord])
        .select();
      
      result = { data, error };
      console.log('➕ Insert result:', result);
    }

    if (result.error) {
      console.error('❌ Error recording activity progress:', result.error);
      console.error('❌ Error details:', JSON.stringify(result.error, null, 2));
      return { data: null, error: result.error };
    }

    console.log('✅ Activity progress recorded successfully!', result.data);
    
    // Check for badges after successful progress recording
    try {
      console.log('🏆 Checking for badges after activity completion...');
      const { data: newBadges, error: badgeError } = await checkAndAwardBadges(studentId);
      if (badgeError) {
        console.error('❌ Error checking badges:', badgeError);
        // Don't fail the main operation if badge checking fails
      } else if (newBadges && newBadges.length > 0) {
        console.log('🏆 New badges earned:', newBadges);
        // You could add the badges to the result if needed
        result.newBadges = newBadges;
      }
    } catch (badgeCheckError) {
      console.error('❌ Unexpected error checking badges:', badgeCheckError);
      // Don't fail the main operation if badge checking fails
    }
    
    return result;
  } catch (error) {
    console.error('Unexpected error recording progress:', error);
    return { data: null, error: { message: error.message } };
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
      .eq('user_id', studentId); // Use user_id not student_id

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
    const categoryStats = allProgress.reduce((acc, progress) => {
      const category = progress.activities?.category || 'Unknown';
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

    // Convert to array format expected by the dashboard
    const categoryProgress = Object.keys(categoryStats).map(categoryName => ({
      categoryName,
      totalActivities: categoryStats[categoryName].total,
      completedActivities: categoryStats[categoryName].completed,
      averageScore: categoryStats[categoryName].total > 0 
        ? Math.round((categoryStats[categoryName].totalScore / categoryStats[categoryName].total) * 100) / 100
        : 0
    }));

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

// Get activity progress for specific activity
export async function getActivityProgress(studentId, activityId) {
  try {
    const { data, error } = await supabase
  .from('user_activity_progress')
      .select('*')
      .eq('user_id', studentId) // Use user_id not student_id
      .eq('activity_id', activityId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching activity progress:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Get progress data for all students (for admin tracking)
export async function getAllStudentsProgress() {
  try {
    console.log('📊 Fetching all students progress...');
    
    // Get all progress records first
    const { data: progressRecords, error: progressError } = await supabase
  .from('user_activity_progress')
      .select('*')
      .order('date_completed', { ascending: false });

    console.log('📊 Raw progress records:', progressRecords);
    console.log('📊 Progress error (if any):', progressError);

    if (progressError) {
      console.error('Error fetching all students progress:', progressError);
      return { data: null, error: progressError };
    }

    if (!progressRecords || progressRecords.length === 0) {
      return { 
        data: {
          students: [],
          totalStudents: 0,
          totalActivitiesCompleted: 0
        }, 
        error: null 
      };
    }

    // Get unique user IDs from progress records
    const userIds = [...new Set(progressRecords.map(record => record.user_id))]; // Use user_id not student_id
    
    // Get user profiles separately
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, username')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      // Continue without profile data
    }

    console.log('📊 User IDs to fetch:', userIds);
    console.log('📊 User profiles fetched:', userProfiles);

    // Get activities separately
    const activityIds = [...new Set(progressRecords.map(record => record.activity_id))];
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, title, category_id')
      .in('id', activityIds);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      // Continue without activity data
    }

    // Get categories separately
    const categoryIds = activities ? [...new Set(activities.map(activity => activity.category_id).filter(Boolean))] : [];
    let categories = [];
    if (categoryIds.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('"Categories"')
        .select('id, category_name')
        .in('id', categoryIds);
      
      if (!categoriesError) {
        categories = categoriesData || [];
      }
    }

    // Process the data to group by student
    const studentProgressMap = {};
    
    progressRecords.forEach(record => {
      const studentId = record.user_id; // Use user_id not student_id
      const userProfile = userProfiles?.find(p => p.user_id === studentId);
      const activity = activities?.find(a => a.id === record.activity_id);
      const category = categories?.find(c => c.id === activity?.category_id);
      
      console.log('🔍 Processing record for student:', studentId);
      console.log('🔍 Found user profile:', userProfile);
      
      const studentName = userProfile ? 
        userProfile.full_name || userProfile.username :
        `Student ${studentId.slice(0, 8)}`;
        
      console.log('🔍 Student name resolved to:', studentName);
      
      if (!studentProgressMap[studentId]) {
        studentProgressMap[studentId] = {
          studentId,
          studentName,
          activities: [],
          totalActivities: 0,
          completedActivities: 0,
          averageScore: 0,
          totalScore: 0,
          lastActivity: null
        };
      }

      const student = studentProgressMap[studentId];
      student.activities.push({
        activityId: record.activity_id,
        activityTitle: activity?.title || 'Unknown Activity',
        categoryId: category?.category_name || 'Other',
        score: record.score,
        completionStatus: record.completion_status,
        dateCompleted: record.date_completed
      });

      student.totalActivities++;
      if (record.completion_status === 'completed') {
        student.completedActivities++;
        student.totalScore += record.score || 0;
      }

      // Update last activity date
      if (!student.lastActivity || new Date(record.date_completed) > new Date(student.lastActivity)) {
        student.lastActivity = record.date_completed;
      }
    });

    // Calculate averages
    Object.values(studentProgressMap).forEach(student => {
      if (student.completedActivities > 0) {
        student.averageScore = Math.round(student.totalScore / student.completedActivities);
      }
      student.completionRate = student.totalActivities > 0 ? 
        Math.round((student.completedActivities / student.totalActivities) * 100) : 0;
    });

    const studentsProgressArray = Object.values(studentProgressMap);
    
    return { 
      data: {
        students: studentsProgressArray,
        totalStudents: studentsProgressArray.length,
        totalActivitiesCompleted: studentsProgressArray.reduce((sum, s) => sum + s.completedActivities, 0)
      }, 
      error: null 
    };

  } catch (error) {
    console.error('Error fetching all students progress:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Get detailed progress statistics for a specific student
export async function getStudentProgressStats(studentId) {
  try {
    console.log('Getting student progress stats for:', studentId);

    // Get all progress records for this student
    const { data: progressRecords, error: progressError } = await supabase
  .from('user_activity_progress')
      .select('*')
      .eq('user_id', studentId) // Use user_id not student_id
      .order('date_completed', { ascending: false });

    if (progressError) {
      console.error('Error fetching student progress stats:', progressError);
      return { data: null, error: progressError };
    }

    console.log('Progress API: Found', progressRecords?.length || 0, 'progress records for student', studentId);

    // Get activities separately if we have activity IDs
    let activities = [];
    let categories = [];
    if (progressRecords && progressRecords.length > 0) {
      const activityIds = [...new Set(progressRecords.map(record => record.activity_id))];
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, category_id')
        .in('id', activityIds);
      
      if (!activitiesError) {
        activities = activitiesData || [];
        console.log('Progress API: Found', activities.length, 'activities:', activities);
        
        // Get unique category IDs from activities
        const categoryIds = [...new Set(activities.map(a => a.category_id).filter(Boolean))];
        console.log('Progress API: Category IDs:', categoryIds);
        if (categoryIds.length > 0) {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('Categories')
            .select('id, name')
            .in('id', categoryIds);
          
          if (!categoriesError) {
            categories = categoriesData || [];
            console.log('Progress API: Found categories:', categories);
          } else {
            console.error('Progress API: Error fetching categories:', categoriesError);
          }
        }
      } else {
        console.error('Progress API: Error fetching activities:', activitiesError);
      }
    }

    // Calculate statistics
    const totalActivities = progressRecords?.length || 0;
    const completedActivities = progressRecords?.filter(r => r.completion_status === 'completed').length || 0;
    const totalScore = progressRecords?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
    const averageScore = completedActivities > 0 ? Math.round(totalScore / completedActivities) : 0;
    const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivities = progressRecords?.filter(r => 
      new Date(r.date_completed) >= sevenDaysAgo
    ).length || 0;

    // Category breakdown
    const categoryStats = {};
    progressRecords?.forEach(record => {
      const activity = activities.find(a => a.id === record.activity_id);
      const categoryId = activity?.category_id || 'unknown';
      const category = categories.find(c => c.id === categoryId);
      
      // Better fallback logic for category name
      let categoryName;
      if (category?.name) {
        categoryName = category.name;
      } else if (activity?.title) {
        // If no category name found, use a generic name based on activity
        categoryName = 'General Activities';
      } else {
        categoryName = 'Unknown Category';
      }
      
      console.log('Progress API: Activity', record.activity_id, 'Category ID:', categoryId, 'Category Name:', categoryName);
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          total: 0,
          completed: 0,
          totalScore: 0
        };
      }
      categoryStats[categoryName].total++;
      if (record.completion_status === 'completed') {
        categoryStats[categoryName].completed++;
        categoryStats[categoryName].totalScore += record.score || 0;
      }
    });

    const stats = {
      totalActivities,
      completedActivities,
      averageScore,
      completionRate,
      recentActivities,
      categoryStats
    };

    return { data: stats, error: null };

  } catch (error) {
    console.error('Error getting student progress stats:', error);
    return { data: null, error: { message: error.message } };
  }
}

// Get detailed progress records for a specific student
export async function getStudentProgress(studentId, limit = 50) {
  try {
    console.log('Getting student progress for:', studentId);

    const { data: progressRecords, error } = await supabase
  .from('user_activity_progress')
      .select('*')
      .eq('user_id', studentId) // Use user_id not student_id
      .order('date_completed', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching student progress:', error);
      return { data: null, error };
    }

    // Get activities separately if we have records
    let activities = [];
    if (progressRecords && progressRecords.length > 0) {
      const activityIds = [...new Set(progressRecords.map(record => record.activity_id))];
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title, category_id, difficulty_id')
        .in('id', activityIds);
      
      if (!activitiesError) {
        activities = activitiesData || [];
      }
    }

    // Transform the data for frontend consumption
    const transformedRecords = progressRecords?.map(record => {
      const activity = activities.find(a => a.id === record.activity_id);
      return {
        id: record.id,
        activityId: record.activity_id,
        activityTitle: activity?.title || 'Unknown Activity',
        categoryId: activity?.category_id,
        difficultyId: activity?.difficulty_id,
        score: record.score,
        completionStatus: record.completion_status,
        dateCompleted: record.date_completed,
        studentName: record.student_name,
        student_id: record.student_id,
        timeSpent: record.time_spent || null
      };
    }) || [];

    return { data: transformedRecords, error: null };

  } catch (error) {
    console.error('Error getting student progress:', error);
    return { data: null, error: { message: error.message } };
  }
}