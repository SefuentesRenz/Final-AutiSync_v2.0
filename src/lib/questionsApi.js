// src/lib/questionsApi.js
import { supabase } from './supabase';

// Create a new question
export async function createQuestion({
  question_text,
  question_type,
  image_url,
  Activities_id
}) {
  const { data, error } = await supabase
    .from('Questions')
    .insert([{
      question_text,
      question_type,
      image_url,
      Activities_id
    }]);
  return { data, error };
}

// Get all questions
export async function getQuestions() {
  const { data, error } = await supabase
    .from('Questions')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a question by id
export async function getQuestionById(id) {
  const { data, error } = await supabase
    .from('Questions')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get questions by activity id
export async function getQuestionsByActivityId(Activities_id) {
  const { data, error } = await supabase
    .from('Questions')
    .select('*')
    .eq('Activities_id', Activities_id)
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get questions by type
export async function getQuestionsByType(question_type) {
  const { data, error } = await supabase
    .from('Questions')
    .select('*')
    .eq('question_type', question_type)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get questions with activity information
export async function getQuestionsWithActivities() {
  const { data, error } = await supabase
    .from('Questions')
    .select(`
      *,
      Activities(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get questions with choices
export async function getQuestionsWithChoices() {
  const { data, error } = await supabase
    .from('Questions')
    .select(`
      *,
      Choices(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get question by id with choices
export async function getQuestionWithChoicesById(id) {
  const { data, error } = await supabase
    .from('Questions')
    .select(`
      *,
      Choices(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

// Get questions by activity id with choices
export async function getQuestionsByActivityIdWithChoices(Activities_id) {
  const { data, error } = await supabase
    .from('Questions')
    .select(`
      *,
      Choices(*)
    `)
    .eq('Activities_id', Activities_id)
    .order('created_at', { ascending: true });
  return { data, error };
}

// Get questions with activity and choices information
export async function getQuestionsWithActivityAndChoices() {
  const { data, error } = await supabase
    .from('Questions')
    .select(`
      *,
      Activities(*),
      Choices(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Search questions by text
export async function searchQuestions(searchTerm) {
  const { data, error } = await supabase
    .from('Questions')
    .select('*')
    .ilike('question_text', `%${searchTerm}%`)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Update a question by id
export async function updateQuestion(id, updates) {
  const { data, error } = await supabase
    .from('Questions')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Update question type
export async function updateQuestionType(id, question_type) {
  const { data, error } = await supabase
    .from('Questions')
    .update({ question_type })
    .eq('id', id);
  return { data, error };
}

// Delete a question by id
export async function deleteQuestion(id) {
  const { data, error } = await supabase
    .from('Questions')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Delete all questions for an activity
export async function deleteQuestionsByActivityId(Activities_id) {
  const { data, error } = await supabase
    .from('Questions')
    .delete()
    .eq('Activities_id', Activities_id);
  return { data, error };
}
