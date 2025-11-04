import { supabase } from './supabase';

/**
 * Get all pending accounts (account_status = 'pending')
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getPendingAccounts() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, username, full_name, email, role, account_status, created_at')
      .eq('account_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending accounts:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception fetching pending accounts:', err);
    return { data: null, error: err };
  }
}

/**
 * Approve an account (set account_status to 'approved')
 * @param {string} userId - The user_id of the account to approve
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function approveAccount(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ account_status: 'approved' })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error approving account:', error);
      return { data: null, error };
    }

    console.log('Account approved successfully:', data);
    return { data, error: null };
  } catch (err) {
    console.error('Exception approving account:', err);
    return { data: null, error: err };
  }
}

/**
 * Reject an account (set account_status to 'rejected')
 * @param {string} userId - The user_id of the account to reject
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function rejectAccount(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ account_status: 'rejected' })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting account:', error);
      return { data: null, error };
    }

    console.log('Account rejected successfully:', data);
    return { data, error: null };
  } catch (err) {
    console.error('Exception rejecting account:', err);
    return { data: null, error: err };
  }
}

/**
 * Get count of pending accounts
 * @returns {Promise<{count: number, error: object|null}>}
 */
export async function getPendingAccountsCount() {
  try {
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'pending');

    if (error) {
      console.error('Error counting pending accounts:', error);
      return { count: 0, error };
    }

    return { count, error: null };
  } catch (err) {
    console.error('Exception counting pending accounts:', err);
    return { count: 0, error: err };
  }
}
