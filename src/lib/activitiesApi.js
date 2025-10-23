// src/lib/activitiesApi.js
import { supabase } from './supabase';

// Create a new activity
export async function createActivity({
  title,
  description,
  category,
  difficulty,
  duration,
  instructions,
  is_active = true,
  badges,
  icon_url,
  criteria
}) {
  const { data, error } = await supabase
    .from('activities')
    .insert([{
      title,
      description,
      category,
      difficulty,
      duration,
      instructions,
      is_active,
      badges,
      icon_url,
      criteria
    }])
    .select();
  return { data, error };
}

// Get all activities
export async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get all activities with category and difficulty information
export async function getActivitiesWithDetails() {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      Categories(*),
      Difficulties(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get an activity by id
export async function getActivityById(id) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get an activity by id with category and difficulty information
export async function getActivityByIdWithDetails(id) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      Categories(*),
      Difficulties(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

// Get activities by category
export async function getActivitiesByCategory(category) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get activities by difficulty
export async function getActivitiesByDifficulty(difficulty) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get activities by category and difficulty
export async function getActivitiesByCategoryAndDifficulty(category, difficulty) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('category', category)
    .eq('difficulty', difficulty)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get activities by active status
export async function getActivitiesByStatus(is_active = true) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', is_active)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get activities by duration range
export async function getActivitiesByDurationRange(minDuration, maxDuration) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('duration', minDuration)
    .lte('duration', maxDuration)
    .order('duration', { ascending: true });
  return { data, error };
}

// Get activities by badges
export async function getActivitiesByBadges(badge) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .contains('badges', [badge])
    .order('created_at', { ascending: false });
  return { data, error };
}

// Search activities by title or description
export async function searchActivities(searchTerm) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Update an activity by id
export async function updateActivity(id, updates) {
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('activities')
    .update(updatedData)
    .eq('id', id);
  return { data, error };
}

// Delete an activity by id
export async function deleteActivity(id) {
  const { data, error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);
  return { data, error };
}
