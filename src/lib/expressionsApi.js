// src/lib/expressionsApi.js
import { supabase } from './supabase';

// Create a new expression
export async function createExpression({
  user_profiles_id,
  emotion,
  emoji,
  severity,
  note
}) {
  const { data, error } = await supabase
    .from('Expressions')
    .insert([{
      user_profiles_id,
      emotion,
      emoji,
      severity,
      note
    }]);
  return { data, error };
}

// Get all expressions
export async function getExpressions() {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get an expression by id
export async function getExpressionById(id) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get expressions by user profile id
export async function getExpressionsByUserProfileId(user_id) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get expressions by emotion
export async function getExpressionsByEmotion(emotion) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('emotion', emotion)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get expressions by severity level
export async function getExpressionsBySeverity(severity) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('severity', severity)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get expressions by user profile and emotion
export async function getExpressionsByUserProfileAndEmotion(user_profiles_id, emotion) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('user_profiles_id', user_profiles_id)
    .eq('emotion', emotion)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get expressions by date range
export async function getExpressionsByDateRange(user_profiles_id, startDate, endDate) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('user_profiles_id', user_profiles_id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get recent expressions for a user profile (last 7 days)
export async function getRecentExpressionsByUserProfile(user_id, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('Expressions')
    .select('*')
    .eq('user_id', user_id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
  return { data, error };
}// Get expressions with user profile information
export async function getExpressionsWithUserProfiles() {
  const { data, error } = await supabase
    .from('Expressions')
    .select(`
      *,
      user_profiles(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get expression statistics for a user profile
export async function getExpressionStats(user_id) {
  const { data, error } = await supabase
    .from('Expressions')
    .select('emotion, severity')
    .eq('user_id', user_id);
  return { data, error };
}

// Update an expression by id
export async function updateExpression(id, updates) {
  const { data, error } = await supabase
    .from('Expressions')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Update expression severity
export async function updateExpressionSeverity(id, severity) {
  const { data, error } = await supabase
    .from('Expressions')
    .update({ severity })
    .eq('id', id);
  return { data, error };
}

// Delete an expression by id
export async function deleteExpression(id) {
  const { data, error } = await supabase
    .from('Expressions')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Delete all expressions for a user profile
export async function deleteExpressionsByUserProfileId(user_id) {
  const { data, error } = await supabase
    .from('Expressions')
    .delete()
    .eq('user_id', user_id);
  return { data, error };
}
