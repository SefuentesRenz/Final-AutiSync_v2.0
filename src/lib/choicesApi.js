// src/lib/choicesApi.js
import { supabase } from './supabase';

// Create a new choice
export async function createChoice({
  choices_text,
  is_correct,
  Questions_id
}) {
  const { data, error } = await supabase
    .from('Choices')
    .insert([{
      choices_text,
      is_correct,
      Questions_id
    }]);
  return { data, error };
}

// Get all choices
export async function getChoices() {
  const { data, error } = await supabase
    .from('Choices')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a choice by id
export async function getChoiceById(id) {
  const { data, error } = await supabase
    .from('Choices')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get choices by question id
export async function getChoicesByQuestionId(Questions_id) {
  const { data, error } = await supabase
    .from('Choices')
    .select('*')
    .eq('Questions_id', Questions_id)
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get choices with question information
export async function getChoicesWithQuestions() {
  const { data, error } = await supabase
    .from('Choices')
    .select(`
      *,
      Questions(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get choices by question id with question information
export async function getChoicesByQuestionIdWithQuestion(Questions_id) {
  const { data, error } = await supabase
    .from('Choices')
    .select(`
      *,
      Questions(*)
    `)
    .eq('Questions_id', Questions_id)
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get correct choices by question id
export async function getCorrectChoicesByQuestionId(Questions_id) {
  const { data, error } = await supabase
    .from('Choices')
    .select('*')
    .eq('Questions_id', Questions_id)
    .eq('is_correct', true);
  return { data, error };
}

// Get incorrect choices by question id
export async function getIncorrectChoicesByQuestionId(Questions_id) {
  const { data, error } = await supabase
    .from('Choices')
    .select('*')
    .eq('Questions_id', Questions_id)
    .eq('is_correct', false);
  return { data, error };
}

// Update a choice by id
export async function updateChoice(id, updates) {
  const { data, error } = await supabase
    .from('Choices')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Update choice correctness
export async function updateChoiceCorrectness(id, is_correct) {
  const { data, error } = await supabase
    .from('Choices')
    .update({ is_correct })
    .eq('id', id);
  return { data, error };
}

// Delete a choice by id
export async function deleteChoice(id) {
  const { data, error } = await supabase
    .from('Choices')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Delete all choices for a question
export async function deleteChoicesByQuestionId(Questions_id) {
  const { data, error } = await supabase
    .from('Choices')
    .delete()
    .eq('Questions_id', Questions_id);
  return { data, error };
}
