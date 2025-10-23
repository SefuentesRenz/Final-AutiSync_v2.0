// src/lib/studentsApi.js
// UPDATED: Now uses user_profiles directly instead of students table
import { supabase } from './supabase';

// Create a new student profile (same as creating a user profile)
export async function createStudent({ profile_id }) {
  // This function is now deprecated since we work directly with user_profiles
  console.warn('createStudent is deprecated. Use userProfilesApi.createUserProfile instead');
  return { data: null, error: { message: 'This function is deprecated. Use user_profiles directly.' } };
}

// Get all students (now gets all user_profiles)
export async function getStudents() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get student by profile_id (now gets user_profile by user_id)
export async function getStudentByProfileId(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Get student by ID (now gets user_profile by user_id)
export async function getStudentById(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Update student (now updates user_profile)
export async function updateStudent(user_id, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', user_id)
    .select();
  return { data, error };
}

// Delete student (now deletes user_profile)
export async function deleteStudent(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', user_id);
  return { data, error };
}

// Get student by user_id (from auth) - now just gets user_profile directly
export async function getStudentByUserId(user_id) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}
