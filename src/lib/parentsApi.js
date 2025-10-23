// src/lib/parentsApi.js
import { supabase } from './supabase';

// Create a new parent
export async function createParent({ user_id, full_name, email, phone_number, address }) {
  try {
    console.log('parentsApi: Creating parent with data:', { user_id, full_name, email, phone_number, address });
    
    const parentData = {
      user_id: user_id, // Direct reference to auth.users.id
      full_name,
      email,
      phone_number,
      address
    };

    // Remove null/undefined values
    Object.keys(parentData).forEach(key => {
      if (parentData[key] === null || parentData[key] === undefined) {
        delete parentData[key];
      }
    });
    
    const { data, error } = await supabase
      .from('parents')
      .insert([parentData])
      .select();
      
    console.log('parentsApi: Insert result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('parentsApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all parents
export async function getParents() {
  const { data, error } = await supabase
    .from('parents')
    .select('*');
  return { data, error };
}

// Get parent by user_id (from auth)
export async function getParentByUserId(user_id) {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Update parent
export async function updateParent(id, updates) {
  const { data, error } = await supabase
    .from('parents')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

// Delete parent
export async function deleteParent(id) {
  const { data, error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Add child to parent
export async function addChildToParent(parentId, childId) {
  // First get the current children_ids
  const { data: parent, error: getError } = await supabase
    .from('parents')
    .select('children_ids')
    .eq('id', parentId)
    .single();

  if (getError) return { data: null, error: getError };

  const currentChildren = parent.children_ids || [];
  const updatedChildren = [...new Set([...currentChildren, childId])]; // Avoid duplicates

  const { data, error } = await supabase
    .from('parents')
    .update({ children_ids: updatedChildren })
    .eq('id', parentId)
    .select();
  
  return { data, error };
}

// Remove child from parent
export async function removeChildFromParent(parentId, childId) {
  // First get the current children_ids
  const { data: parent, error: getError } = await supabase
    .from('parents')
    .select('children_ids')
    .eq('id', parentId)
    .single();

  if (getError) return { data: null, error: getError };

  const currentChildren = parent.children_ids || [];
  const updatedChildren = currentChildren.filter(id => id !== childId);

  const { data, error } = await supabase
    .from('parents')
    .update({ children_ids: updatedChildren })
    .eq('id', parentId)
    .select();
  
  return { data, error };
}
