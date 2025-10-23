// src/lib/difficultiesApi.js
import { supabase } from './supabase';

// Create a new difficulty
export async function createDifficulty({ difficulty }) {
  const { data, error } = await supabase
    .from('Difficulties')
    .insert([{ difficulty }]);
  return { data, error };
}

// Get all difficulties
export async function getDifficulties() {
  const { data, error } = await supabase
    .from('Difficulties')
    .select('*')
    .order('difficulty', { ascending: true });
  return { data, error };
}

// Get a difficulty by id
export async function getDifficultyById(id) {
  const { data, error } = await supabase
    .from('Difficulties')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get a difficulty by name
export async function getDifficultyByName(difficulty) {
  const { data, error } = await supabase
    .from('Difficulties')
    .select('*')
    .eq('difficulty', difficulty)
    .single();
  return { data, error };
}

// Get difficulties with their activities
export async function getDifficultiesWithActivities() {
  const { data, error } = await supabase
    .from('Difficulties')
    .select(`
      *,
      Activities(*)
    `)
    .order('difficulty', { ascending: true });
  return { data, error };
}

// Get difficulty with activities by id
export async function getDifficultyWithActivitiesById(id) {
  const { data, error } = await supabase
    .from('Difficulties')
    .select(`
      *,
      Activities(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

// Update a difficulty by id
export async function updateDifficulty(id, { difficulty }) {
  const { data, error } = await supabase
    .from('Difficulties')
    .update({ difficulty })
    .eq('id', id);
  return { data, error };
}

// Delete a difficulty by id
export async function deleteDifficulty(id) {
  const { data, error } = await supabase
    .from('Difficulties')
    .delete()
    .eq('id', id);
  return { data, error };
}
