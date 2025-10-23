// src/lib/parentChildApi.js
// UPDATED: Now uses the parents table with children_ids array instead of parent_child_relations table
import { supabase } from './supabase';
import { getParentByUserId, addChildToParent, removeChildFromParent } from './parentsApi';

// Create a parent-child relationship using children_ids array
export async function linkParentToChild(parentUserId, childUserId, parentEmail, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child:', { parentUserId, childUserId, parentEmail, childEmail });
    
    // Get parent record
    const { data: parent, error: parentError } = await getParentByUserId(parentUserId);
    if (parentError || !parent) {
      return { data: null, error: { message: 'Parent account not found' } };
    }

    // Find student record by user_id (now directly from user_profiles)
    const { data: student, error: studentError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', childUserId)
      .single();
      
    if (studentError || !student) {
      return { data: null, error: { message: 'Student account not found' } };
    }

    // Add student.user_id (UUID) to parent's children_ids array
    const result = await addChildToParent(parent.id, student.user_id);
    
    if (result.error && !result.error.message.includes('already linked')) {
      return result;
    }

    return {
      data: {
        parent_id: parent.id,
        student_id: student.user_id, // Now using user_id (UUID)
        child_user_id: childUserId,
        child_name: student.full_name,
        child_email: student.email,
        linked_at: new Date().toISOString()
      },
      error: null
    };
      
  } catch (e) {
    console.error('parentChildApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all children for a parent using children_ids array
export async function getChildrenByParentId(parentUserId) {
  try {
    console.log('getChildrenByParentId: Looking for children of parent user_id:', parentUserId);
    
    // Get parent record
    const { data: parent, error: parentError } = await getParentByUserId(parentUserId);
    if (parentError || !parent) {
      return { data: [], error: parentError || { message: 'Parent not found' } };
    }

    const childrenIds = parent.children_ids || [];
    if (childrenIds.length === 0) {
      console.log('getChildrenByParentId: No children found for parent');
      return { data: [], error: null };
    }

    // Get student records with their profiles for these IDs (now from user_profiles directly)
    const { data: students, error: studentsError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', childrenIds);

    if (studentsError) {
      console.error('getChildrenByParentId: Database error:', studentsError);
      return { data: [], error: studentsError };
    }

    if (!students || students.length === 0) {
      console.log('getChildrenByParentId: No student records found');
      return { data: [], error: null };
    }

    // Transform the data to the expected format
    const transformedData = students.map(student => ({
      id: student.user_id, // Use user_id as the main ID
      user_id: student.user_id,
      student_id: student.user_id, // Now same as user_id
      profile_id: student.user_id, // Now same as user_id
      full_name: student.full_name || student.username,
      username: student.username,
      age: student.age,
      email: student.email || 'No email provided',
      gender: student.gender,
      activities_done: student.activities_done || 0,
      starts_earned: student.starts_earned || 0,
      day_streak: student.day_streak || 0,
      profile_picture: "/assets/kidprofile1.jpg"
    }));

    console.log('getChildrenByParentId: Successfully found children:', transformedData);
    return { data: transformedData, error: null };
    
  } catch (e) {
    console.error('getChildrenByParentId: Unexpected error:', e);
    return { data: [], error: { message: e.message } };
  }
}

// Check if parent has any linked children using children_ids array
export async function hasLinkedChildren(parentUserId) {
  try {
    console.log('hasLinkedChildren: Checking for parent user_id:', parentUserId);
    
    // Get parent record
    const { data: parent, error: parentError } = await getParentByUserId(parentUserId);
    if (parentError || !parent) {
      console.error('hasLinkedChildren: Parent not found:', parentError);
      return { hasChildren: false, error: parentError };
    }

    const hasChildren = parent.children_ids && parent.children_ids.length > 0;
    console.log('hasLinkedChildren: Result:', hasChildren);
    
    return { 
      hasChildren, 
      error: null 
    };
    
  } catch (e) {
    console.error('hasLinkedChildren: Unexpected error:', e);
    return { hasChildren: false, error: { message: e.message } };
  }
}

// Get all parents for a child using children_ids array (reverse lookup)
export async function getParentsByStudentId(user_id) {
  try {
    // Find all parents that have this user_id in their children_ids array
    const { data: parents, error } = await supabase
      .from('parents')
      .select('*')
      .contains('children_ids', [user_id]);
      
    return { data: parents || [], error };
  } catch (e) {
    return { data: [], error: { message: e.message } };
  }
}

// Check if parent-child relationship exists using children_ids array
export async function checkParentChildRelationship(parentUserId, user_id) {
  try {
    // Get parent record
    const { data: parent, error: parentError } = await getParentByUserId(parentUserId);
    if (parentError || !parent) {
      return { data: null, error: { message: 'Parent not found' } };
    }

    // Check if user_id is in parent's children_ids array
    const hasRelationship = parent.children_ids && parent.children_ids.includes(user_id);
    
    return { 
      data: hasRelationship ? { exists: true } : null, 
      error: null 
    };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

// Remove parent-child relationship using children_ids array
export async function unlinkParentFromChild(parent_user_id, user_id) {
  try {
    // Get parent record
    const { data: parent, error: parentError } = await getParentByUserId(parent_user_id);
    if (parentError || !parent) {
      return { data: null, error: { message: 'Parent not found' } };
    }

    // Remove child from parent's children_ids array
    const result = await removeChildFromParent(parent.id, user_id);
    return result;
  } catch (e) {
    console.error('unlinkParentFromChild: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Find student by email
export async function findStudentByEmail(email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Link parent to child by child's email using children_ids array
export async function linkParentToChildByEmail(parentUserId, childEmail) {
  try {
    console.log('parentChildApi: Linking parent to child by email:', { parentUserId, childEmail });
    
    // Find the child by email in user_profiles
    const { data: childProfile, error: childError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', childEmail)
      .single();
    
    if (childError || !childProfile) {
      console.error('Child not found by email:', childEmail);
      return { 
        data: null, 
        error: { message: 'Child account not found. Please check the email address.' } 
      };
    }

    console.log('Found child profile:', childProfile);

    // Now link using the existing function
    const linkResult = await linkParentToChild(
      parentUserId, 
      childProfile.user_id, 
      null, // parentEmail not needed
      childEmail
    );

    if (linkResult.error && !linkResult.error.message.includes('already linked')) {
      return linkResult;
    }

    // Return success with child information
    return {
      data: {
        parent_user_id: parentUserId,
        student_id: childProfile.user_id, // Now using user_id (UUID)
        child_user_id: childProfile.user_id,
        child_name: childProfile.full_name || childProfile.username || 'Unknown',
        child_email: childProfile.email,
        linked_at: new Date().toISOString()
      },
      error: null
    };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in linkParentToChildByEmail:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get child's emotional data and progress for parent monitoring
export async function getChildEmotionalData(childUserId) {
  try {
    console.log('parentChildApi: Getting emotional data for child:', childUserId);
    
    // Get recent emotions with expressions (using user_id directly)
    const { data: emotionsData, error: emotionsError } = await supabase
      .from('User_emotion')
      .select(`
        *,
        emotions (emotion_name, description),
        expressions (expression_name, description)
      `)
      .eq('user_id', childUserId) // Now using user_id directly
      .order('created_at', { ascending: false })
      .limit(20);

    if (emotionsError) {
      console.error('Error fetching emotions:', emotionsError);
      return { data: null, error: emotionsError };
    }

    return { data: emotionsData || [], error: null };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildEmotionalData:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get child's academic progress
export async function getChildAcademicProgress(childUserId) {
  try {
    console.log('parentChildApi: Getting academic progress for child:', childUserId);
    
    // Get activity progress directly using user_id (since we removed students table)
    const { data: progressData, error: progressError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (
          title,
          category,
          difficulty,
          instructions
        )
      `)
      .eq('user_id', childUserId) // Now using user_id directly
      .order('date_completed', { ascending: false })
      .limit(50);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return { data: null, error: progressError };
    }

    return { data: progressData || [], error: null };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildAcademicProgress:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get comprehensive child monitoring data (emotions + progress)
export async function getChildMonitoringData(childUserId) {
  try {
    console.log('parentChildApi: Getting comprehensive monitoring data for child:', childUserId);
    
    const [emotionsResult, progressResult] = await Promise.all([
      getChildEmotionalData(childUserId),
      getChildAcademicProgress(childUserId)
    ]);

    return {
      data: {
        emotions: emotionsResult.data || [],
        progress: progressResult.data || [],
        emotionsError: emotionsResult.error,
        progressError: progressResult.error
      },
      error: null
    };

  } catch (e) {
    console.error('parentChildApi: Unexpected error in getChildMonitoringData:', e);
    return { data: null, error: { message: e.message } };
  }
}