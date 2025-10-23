// src/lib/userProfilesApi.js
import { supabase } from './supabase';

// Create a new user profile
export async function createUserProfile({
  user_id,
  full_name,
  username,
  gender,
  email,
  age,
  birthdate,
  address,
  school,
  phone_number
}) {
  try {
    // Use only essential fields - no firstname/lastname, just full_name
    const profileData = {
      user_id: user_id,
      username,
      full_name,
      email
    };

    // Add optional fields only if they have values
    if (age) profileData.age = age;
    if (birthdate) profileData.birthdate = birthdate;
    if (address) profileData.address = address;
    if (gender) profileData.gender = gender;
    if (school) profileData.school = school;

    // Remove null/undefined values to avoid insert issues
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === null || profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    console.log('Creating profile with cleaned data:', profileData);

    // Add initial delay to allow auth user to be fully committed
    console.log('Waiting for auth user to be fully committed...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Initial 2-second wait

    // Retry mechanism for foreign key constraint violations (timing issues)
    let retryCount = 0;
    const maxRetries = 5; // Increased from 3 to 5
    
    while (retryCount < maxRetries) {
      // Try to verify auth user exists before attempting insert
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser?.user || authUser.user.id !== user_id) {
          console.warn(`Auth user verification failed on attempt ${retryCount + 1}`);
          throw new Error('Auth user not ready');
        }
        console.log(`Auth user verified on attempt ${retryCount + 1}`);
      } catch (authVerifyError) {
        console.warn(`Auth verification failed on attempt ${retryCount + 1}:`, authVerifyError.message);
        if (retryCount < maxRetries - 1) {
          const delay = 2000 * (retryCount + 1); // 2s, 4s, 6s, 8s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select();
      
      if (!error) {
        // Success!
        console.log('Profile created successfully on attempt', retryCount + 1);
        return { data, error };
      }
      
      if (error.code === '23503') {
        // Foreign key constraint violation - retry after a delay
        console.warn(`Foreign key constraint violation on attempt ${retryCount + 1}. Retrying...`);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait longer with each retry (exponential backoff)
          const delay = 2500 * retryCount; // 2.5s, 5s, 7.5s, 10s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Final attempt failed
          console.error('All retry attempts failed. Auth user may not exist:', user_id);
          return { 
            data: null, 
            error: { 
              message: `Account creation failed after multiple attempts. The authentication system may need more time. Please wait a moment and try logging in, or refresh the page and try again.`,
              code: 'FK_CONSTRAINT_VIOLATION_RETRY_FAILED',
              originalError: error
            } 
          };
        }
      } else {
        // Different error, don't retry
        console.error('Non-foreign-key error:', error);
        return { data, error };
      }
    }
  } catch (e) {
    console.error('Unexpected error in createUserProfile:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all user profiles
export async function getUserProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  return { data, error };
}

// Get a user profile by user_id (auth user id)
export async function getUserProfileById(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Get a user profile by email
export async function getUserProfileByEmail(email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return { data, error };
}

// Get a user profile by username
export async function getUserProfileByUsername(username) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single();
  return { data, error };
}

// Get user profiles by parent email
export async function getUserProfilesByParentEmail(parents_email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('parents_email', parents_email); // Use correct column name
  return { data, error };
}

// Update a user profile by user_id
export async function updateUserProfile(user_id, updates) {
  try {
    console.log('updateUserProfile called with:');
    console.log('user_id:', user_id, 'type:', typeof user_id);
    console.log('updates:', updates);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user_id);
      
    console.log('Update result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('Unexpected error in updateUserProfile:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Update user progress (activities_done, starts_earned, day_streak)
export async function updateUserProgress(user_id, { activities_done, starts_earned, day_streak }) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ 
      activities_done,
      starts_earned,
      day_streak,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id);
  return { data, error };
}

// Increment user activities and stars
export async function incrementUserActivity(user_id, starsEarned = 1) {
  const { data: profile, error: fetchError } = await getUserProfileById(user_id);
  
  if (fetchError) return { data: null, error: fetchError };
  
  const newActivitiesDone = (profile.activities_done || 0) + 1;
  const newStarsEarned = (profile.starts_earned || 0) + starsEarned;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ 
      activities_done: newActivitiesDone,
      starts_earned: newStarsEarned,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user_id);
  return { data, error };
}

// Delete a user profile by user_id
export async function deleteUserProfile(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', user_id);
  return { data, error };
}
