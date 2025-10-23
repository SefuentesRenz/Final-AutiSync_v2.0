// src/lib/categoriesApi.js
import { supabase } from './supabase';

// Create a new category
export async function createCategory({
  category_name,
  icon,
  description
}) {
  const { data, error } = await supabase
    .from('Categories')
    .insert([{
      category_name,
      icon,
      description
    }]);
  return { data, error };
}

// Get all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('Categories')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a category by id
export async function getCategoryById(id) {
  const { data, error } = await supabase
    .from('Categories')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get a category by name
export async function getCategoryByName(category_name) {
  const { data, error } = await supabase
    .from('Categories')
    .select('*')
    .eq('category_name', category_name)
    .single();
  return { data, error };
}

// Get categories with their activities
export async function getCategoriesWithActivities() {
  const { data, error } = await supabase
    .from('Categories')
    .select(`
      *,
      Activities(*)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get category with activities by id
export async function getCategoryWithActivitiesById(id) {
  const { data, error } = await supabase
    .from('Categories')
    .select(`
      *,
      Activities(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
}

// Search categories by name or description
export async function searchCategories(searchTerm) {
  const { data, error } = await supabase
    .from('Categories')
    .select('*')
    .or(`category_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Update a category by id
export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from('Categories')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Update category name
export async function updateCategoryName(id, category_name) {
  const { data, error } = await supabase
    .from('Categories')
    .update({ category_name })
    .eq('id', id);
  return { data, error };
}

// Delete a category by id
export async function deleteCategory(id) {
  const { data, error } = await supabase
    .from('Categories')
    .delete()
    .eq('id', id);
  return { data, error };
}
