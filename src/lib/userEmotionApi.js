// src/lib/userEmotionApi.js
import { supabase } from './supabase';

// Create a new user emotion entry
export async function createUserEmotion({
  profile_id,
  emotion_id,
  expressions_id
}) {
  const { data, error } = await supabase
    .from('User_emotion')
    .insert([{
      profile_id,
      emotion_id,
      expressions_id
    }]);
  return { data, error };
}

// Get all user emotions
export async function getUserEmotions() {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a user emotion by entry_id
export async function getUserEmotionById(entry_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('entry_id', entry_id)
    .single();
  return { data, error };
}

// Get user emotions by profile_id (user_profiles foreign key)
export async function getUserEmotionsByProfileId(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions by emotion_id
export async function getUserEmotionsByEmotionId(emotion_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('emotion_id', emotion_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions by expressions_id
export async function getUserEmotionsByExpressionId(expressions_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('*')
    .eq('expressions_id', expressions_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Note: Intensity-related functions removed as intensity column is no longer needed for autistic children

// Get user emotions within a date range
export async function getUserEmotionsByDateRange(startDate, endDate, profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with full details (joined with expressions and user_profiles)
export async function getUserEmotionsWithDetails(profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(*),
      user_profiles(
        *,
        profiles(first_name, last_name, email)
      )
    `);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with expression details only
export async function getUserEmotionsWithExpressions(profile_id) {
  const { data, error } = await supabase
    .from('user_emotion')
    .select(`
      *,
      expressions(
        emotion_name,
        confidence_score,
        detected_at,
        image_path
      )
    `)
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get user emotions with user profile details
export async function getUserEmotionsWithProfiles() {
  const { data, error } = await supabase
    .from('user_emotion')
    .select(`
      *,
      user_profiles(
        *,
        profiles(first_name, last_name, email, date_of_birth)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get emotion statistics for a user profile
export async function getEmotionStatsByProfile(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select('emotion_id, created_at')
    .eq('profile_id', profile_id);
  return { data, error };
}

// Get recent user emotions (last N entries)
export async function getRecentUserEmotions(profile_id, limit = 10) {
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name, confidence_score, detected_at)
    `)
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// Note: High intensity emotions function removed as intensity is no longer needed for autistic children

// Get negative emotions (for monitoring purposes)
export async function getNegativeEmotions(profile_id = null) {
  let query = supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name, confidence_score, detected_at),
      user_profiles(
        profiles(first_name, last_name)
      )
    `);
  
  if (profile_id) {
    query = query.eq('profile_id', profile_id);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  // Filter for negative emotions on the client side
  if (data) {
    const negativeEmotions = data.filter(emotion => {
      const emotionName = emotion.expressions?.emotion_name?.toLowerCase();
      return emotionName && ['sad', 'angry', 'fear', 'disgust'].includes(emotionName);
    });
    return { data: negativeEmotions, error };
  }
  
  return { data, error };
}

// Get emotion trends for a user (grouped by date)
export async function getEmotionTrends(profile_id, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('User_emotion')
    .select(`
      *,
      expressions(emotion_name)
    `)
    .eq('profile_id', profile_id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get emotion count for a user
export async function getUserEmotionCount(profile_id) {
  const { count, error } = await supabase
    .from('User_emotion')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profile_id);
  return { count, error };
}

// Note: Intensity-related analytics functions removed as intensity is no longer needed for autistic children

// Update user emotion entry
export async function updateUserEmotion(entry_id, updates) {
  const { data, error } = await supabase
    .from('User_emotion')
    .update(updates)
    .eq('entry_id', entry_id);
  return { data, error };
}

// Note: Update emotion intensity function removed as intensity is no longer needed

// Delete user emotion entry
export async function deleteUserEmotion(entry_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .eq('entry_id', entry_id);
  return { data, error };
}

// Delete all user emotions for a profile
export async function deleteUserEmotionsByProfile(profile_id) {
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .eq('profile_id', profile_id);
  return { data, error };
}

// Delete old emotion entries (cleanup)
export async function deleteOldEmotionEntries(daysOld = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const { data, error } = await supabase
    .from('User_emotion')
    .delete()
    .lt('created_at', cutoffDate.toISOString());
  return { data, error };
}

// Bulk create user emotions
export async function createBulkUserEmotions(emotions) {
  const { data, error } = await supabase
    .from('User_emotion')
    .insert(emotions);
  return { data, error };
}

// Get emotion pattern analysis (requires custom SQL function)
export async function getEmotionPatterns(profile_id, timeframe = '30 days') {
  const { data, error } = await supabase
    .rpc('analyze_emotion_patterns', { 
      user_profile_id: profile_id,
      time_period: timeframe 
    });
  return { data, error };
}

// Get emotions for children linked to a parent (for parent dashboard)
export async function getChildrenEmotionsForParent(parentAuthId) {
  try {
    // First, get all children linked to this parent
    const { data: relations, error: relationsError } = await supabase
      .from('parent_child_relations')
      .select('child_user_id')
      .eq('parent_user_id', parentAuthId);

    if (relationsError) {
      console.error('Error fetching parent-child relations:', relationsError);
      return { data: null, error: relationsError };
    }

    if (!relations || relations.length === 0) {
      return { data: [], error: null };
    }

    // Get child user IDs
    const childUserIds = relations.map(r => r.child_user_id);

    // Get user profiles for these children
    const { data: childProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, user_id, first_name, last_name, username, email')
      .in('user_id', childUserIds);

    if (profilesError) {
      console.error('Error fetching child profiles:', profilesError);
      return { data: null, error: profilesError };
    }

    if (!childProfiles || childProfiles.length === 0) {
      return { data: [], error: null };
    }

    // Get emotions for all children
    const childProfileIds = childProfiles.map(p => p.id);

    const { data: emotionsData, error: emotionsError } = await supabase
      .from('User_emotion')
      .select(`
        *,
        Expressions!inner(
          id,
          emotion_name,
          confidence_score,
          detected_at,
          image_path
        )
      `)
      .in('profile_id', childProfileIds)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50 emotions across all children

    if (emotionsError) {
      console.error('Error fetching emotions:', emotionsError);
      return { data: null, error: emotionsError };
    }

    // Combine emotions with child profile info
    const enrichedEmotions = emotionsData?.map(emotion => {
      const childProfile = childProfiles.find(p => p.id === emotion.profile_id);
      return {
        ...emotion,
        child_name: childProfile ? `${childProfile.first_name || ''} ${childProfile.last_name || ''}`.trim() || childProfile.username : 'Unknown',
        child_username: childProfile?.username || 'Unknown',
        child_email: childProfile?.email || ''
      };
    }) || [];

    return { data: enrichedEmotions, error: null };
  } catch (error) {
    console.error('Unexpected error in getChildrenEmotionsForParent:', error);
    return { data: null, error };
  }
}

// Get emotions for a specific child (by user_profiles.id)
export async function getChildEmotionsForParent(childProfileId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('User_emotion')
      .select(`
        *,
        Expressions!inner(
          id,
          emotion_name,
          confidence_score,
          detected_at,
          image_path
        )
      `)
      .eq('profile_id', childProfileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching child emotions:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error in getChildEmotionsForParent:', error);
    return { data: null, error };
  }
}

// Get recent emotions summary for all children of a parent
export async function getParentDashboardEmotions(parentAuthId) {
  try {
    console.log('Fetching dashboard emotions for parent auth ID:', parentAuthId);
    
    // Try to get the parent record first
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', parentAuthId)
      .single();

    if (parentError || !parentData) {
      console.log('No parent record found for user_id:', parentAuthId);
      return { data: [], error: null };
    }

    console.log('Found parent ID:', parentData.id);

    // Now get children using the parent ID - simplified query
    const { data: relations, error: relationsError } = await supabase
      .from('parent_child_relations')
      .select(`
        child_user_id,
        relationship_type,
        linked_at
      `)
      .eq('parent_user_id', parentData.id);

    if (relationsError) {
      console.error('Error fetching parent-child relations:', relationsError);
      return { data: null, error: relationsError };
    }

    if (!relations || relations.length === 0) {
      console.log('No children found for this parent');
      return { data: [], error: null };
    }

    console.log('Found relations:', relations);

    // For each child, get their data from the students table
    const childrenWithEmotions = [];
    
    for (const relation of relations) {
      const studentId = relation.child_user_id;
      
      // Get user profile data (studentId is now user_id)
      const { data: studentData, error: studentError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', studentId)
        .single();
      
      if (studentError) {
        console.warn(`Failed to fetch student data for ${studentId}:`, studentError);
        continue;
      }

      // Get emotions for this student from Expressions table directly
      const { data: emotions, error: emotionError } = await supabase
        .from('Expressions')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (emotionError) {
        console.warn(`Failed to fetch emotions for student ${studentId}:`, emotionError);
      }

      // Create child data object
      const childData = {
        firstname: studentData?.full_name?.split(' ')[0] || null,
        lastname: studentData?.full_name?.split(' ').slice(1).join(' ') || null,
        full_name: studentData?.full_name || studentData?.username || `Student ${studentId}`,
        email: studentData?.email || null,
        age: studentData?.age || null,
        user_id: studentId,
        relationship: relation,
        emotions: emotions || [],
        latestEmotion: emotions && emotions.length > 0 ? emotions[0] : null,
        emotionSummary: {
          total: emotions?.length || 0,
          // Simplified emotion categorization based on emotion types instead of intensity
          positive: emotions?.filter(e => ['happy', 'excited', 'proud', 'calm', 'loved'].includes(e.emotion_type?.toLowerCase())).length || 0,
          negative: emotions?.filter(e => ['sad', 'angry', 'frustrated', 'anxious', 'scared', 'overwhelmed'].includes(e.emotion_type?.toLowerCase())).length || 0,
          neutral: emotions?.filter(e => ['neutral', 'confused', 'tired', 'bored'].includes(e.emotion_type?.toLowerCase())).length || 0
        }
      };
      
      childrenWithEmotions.push(childData);
    }

    console.log('Children with emotions:', childrenWithEmotions);
    return { data: childrenWithEmotions, error: null };
  } catch (error) {
    console.error('Unexpected error in getParentDashboardEmotions:', error);
    return { data: null, error };
  }
}
