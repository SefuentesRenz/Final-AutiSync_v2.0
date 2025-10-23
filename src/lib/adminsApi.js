// src/lib/adminsApi.js
import { supabase } from './supabase';

// Create a new admin
export async function createAdmin({ user_id, full_name, email, phone_number, address, department, permissions }) {
  try {
    console.log('adminsApi: Creating admin with data:', { user_id, full_name, email, phone_number, address, department, permissions });
    
    const adminData = {
      user_id: user_id, // Direct reference to auth.users.id
      full_name,
      email,
      phone_number,
      address,
      department,
      permissions: permissions || {} // Default to empty object for jsonb
    };

    // Remove null/undefined values
    Object.keys(adminData).forEach(key => {
      if (adminData[key] === null || adminData[key] === undefined) {
        delete adminData[key];
      }
    });
    
    const { data, error } = await supabase
      .from('admins')
      .insert([adminData])
      .select();
      
    console.log('adminsApi: Insert result:', { data, error });
    return { data, error };
  } catch (e) {
    console.error('adminsApi: Unexpected error:', e);
    return { data: null, error: { message: e.message } };
  }
}

// Get all admins
export async function getAdmins() {
  const { data, error } = await supabase
    .from('admins')
    .select('*');
  return { data, error };
}

// Get all admins with their profile information
export async function getAdminsWithProfiles() {
  const { data, error } = await supabase
    .from('admins')
    .select('*');
  return { data, error };
}

// Get an admin by id
export async function getAdminById(id) {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get an admin by user_id (from auth)
export async function getAdminByUserId(user_id) {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user_id)
    .single();
  return { data, error };
}

// Get admins by department
export async function getAdminsByDepartment(department) {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('department', department);
  return { data, error };
}

// Get admins by specific permission (checks within permissions jsonb)
export async function getAdminsByPermission(permissionKey, permissionValue) {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq(`permissions->>${permissionKey}`, permissionValue);
  return { data, error };
}

// Update an admin by id
export async function updateAdmin(id, updates) {
  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Update admin by user_id
export async function updateAdminByUserId(user_id, updates) {
  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('user_id', user_id);
  return { data, error };
}

// Update admin permissions (jsonb field)
export async function updateAdminPermissions(id, permissions) {
  const { data, error } = await supabase
    .from('admins')
    .update({ permissions })
    .eq('id', id);
  return { data, error };
}

// Update admin department
export async function updateAdminDepartment(id, department) {
  const { data, error } = await supabase
    .from('admins')
    .update({ department })
    .eq('id', id);
  return { data, error };
}

// Delete an admin by id
export async function deleteAdmin(id) {
  const { data, error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Delete an admin by user_id
export async function deleteAdminByUserId(user_id) {
  const { data, error } = await supabase
    .from('admins')
    .delete()
    .eq('user_id', user_id);
  return { data, error };
}
