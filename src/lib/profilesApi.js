// src/lib/profilesApi.js
// DEPRECATED: This file uses a generic 'profiles' table that doesn't exist in the schema.
// Use the specific APIs instead:
// - userProfilesApi.js for student profiles
// - adminsApi.js for admin profiles  
// - parentsApi.js for parent profiles

import { supabase } from './supabase';

// DEPRECATED: Use createUserProfile from userProfilesApi.js for students
export async function createProfile({ name, email, role }) {
  console.warn('DEPRECATED: createProfile() - Use specific APIs for user_profiles, admins, or parents');
  // This function is deprecated - use the correct table-specific APIs
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}

// DEPRECATED: Use specific table APIs
export async function getProfiles() {
  console.warn('DEPRECATED: getProfiles() - Use specific APIs for user_profiles, admins, or parents');
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}

// DEPRECATED: Use specific table APIs
export async function getProfileById(id) {
  console.warn('DEPRECATED: getProfileById() - Use specific APIs for user_profiles, admins, or parents');
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}

// DEPRECATED: Use specific table APIs
export async function getProfileByEmail(email) {
  console.warn('DEPRECATED: getProfileByEmail() - Use specific APIs for user_profiles, admins, or parents');
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}

// DEPRECATED: Use specific table APIs
export async function updateProfile(id, updates) {
  console.warn('DEPRECATED: updateProfile() - Use specific APIs for user_profiles, admins, or parents');
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}

// DEPRECATED: Use specific table APIs
export async function deleteProfile(id) {
  console.warn('DEPRECATED: deleteProfile() - Use specific APIs for user_profiles, admins, or parents');
  return { data: null, error: { message: 'Use specific APIs for user_profiles, admins, or parents' } };
}
