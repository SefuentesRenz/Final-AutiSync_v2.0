// src/lib/notificationsApi.js
import { supabase } from './supabase';

// Create a new notification
export async function createNotification({
  recipient_id,
  alert_id,
  message,
  type,
  priority = 'medium'
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      recipient_id,
      alert_id,
      message,
      type,
      priority
    }]);
  return { data, error };
}

// Get all notifications
export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get a notification by id
export async function getNotificationById(id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Get notifications by recipient (admin/teacher)
export async function getNotificationsByRecipient(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipient_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get unread notifications for a recipient
export async function getUnreadNotifications(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipient_id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get notifications by type
export async function getNotificationsByType(type) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get notifications by priority
export async function getNotificationsByPriority(priority) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('priority', priority)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get high priority unread notifications
export async function getHighPriorityUnreadNotifications(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', recipient_id)
    .eq('is_read', false)
    .eq('priority', 'high')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get emotion alert notifications
export async function getEmotionAlertNotifications(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      alert(*)
    `)
    .eq('recipient_id', recipient_id)
    .eq('type', 'emotion_alert')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get notifications with profile information
export async function getNotificationsWithProfiles(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles(*),
      alert(*)
    `)
    .eq('recipient_id', recipient_id)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Get notification count for recipient
export async function getNotificationCount(recipient_id) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipient_id);
  return { count, error };
}

// Get unread notification count
export async function getUnreadNotificationCount(recipient_id) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipient_id)
    .eq('is_read', false);
  return { count, error };
}

// Mark notification as read
export async function markNotificationAsRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', id);
  return { data, error };
}

// Mark multiple notifications as read
export async function markNotificationsAsRead(notificationIds) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .in('id', notificationIds);
  return { data, error };
}

// Mark all notifications as read for a recipient
export async function markAllNotificationsAsRead(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('recipient_id', recipient_id)
    .eq('is_read', false);
  return { data, error };
}

// Update notification
export async function updateNotification(id, updates) {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id);
  return { data, error };
}

// Delete notification
export async function deleteNotification(id) {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  return { data, error };
}

// Delete all notifications for a recipient
export async function deleteNotificationsByRecipient(recipient_id) {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('recipient_id', recipient_id);
  return { data, error };
}

// Delete old read notifications (cleanup)
export async function deleteOldReadNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('is_read', true)
    .lt('read_at', cutoffDate.toISOString());
  return { data, error };
}

// Create emotion alert notification (helper function)
export async function createEmotionAlertNotification({
  recipient_id,
  alert_id,
  student_name,
  emotion_name
}) {
  const message = `${student_name} is experiencing ${emotion_name} emotion and may need attention`;
  
  return await createNotification({
    recipient_id,
    alert_id,
    message,
    type: 'emotion_alert',
    priority: 'high'
  });
}

// Bulk create notifications for multiple recipients
export async function createBulkNotifications(notifications) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications);
  return { data, error };
}
