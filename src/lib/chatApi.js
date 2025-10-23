// src/lib/chatApi.js
import { supabase } from './supabase';

/**
 * Get or create a chat room by room number
 * @param {string} roomNumber - The room number to join
 * @param {string} userId - Optional user ID of the creator
 * @returns {Promise<{room: object, error: object}>}
 */
export async function getOrCreateRoomByNumber(roomNumber, userId = null) {
  try {
    // First try to find existing room
    const { data: existing, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_number', roomNumber)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding room:', findError);
      return { room: null, error: findError };
    }

    if (existing) {
      console.log('Found existing room:', existing);
      return { room: existing, error: null };
    }

    // Room doesn't exist, create it
    console.log('Creating new room:', roomNumber);
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ room_number: roomNumber, created_by: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return { room: null, error };
    }

    console.log('Created new room:', data);
    return { room: data, error: null };
  } catch (e) {
    console.error('Unexpected error in getOrCreateRoomByNumber:', e);
    return { room: null, error: { message: e.message } };
  }
}

/**
 * Fetch message history for a room
 * @param {string} roomId - UUID of the room
 * @param {number} limit - Max messages to fetch
 * @returns {Promise<{data: array, error: object}>}
 */
export async function fetchMessages(roomId, limit = 200) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user_profiles!inner(
          id,
          username,
          full_name
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return { data: null, error };
    }

    console.log('Fetched messages:', data?.length || 0);
    return { data, error: null };
  } catch (e) {
    console.error('Unexpected error fetching messages:', e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Send a message to a room
 * @param {string} roomId - UUID of the room
 * @param {string} userId - UUID of the sender (from user_profiles)
 * @param {string} text - Message text
 * @param {object} metadata - Optional metadata
 * @returns {Promise<{data: object, error: object}>}
 */
export async function sendMessage(roomId, userId, text, metadata = {}) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ 
        room_id: roomId, 
        user_id: userId, 
        text: text.trim(), 
        metadata 
      }])
      .select(`
        *,
        user_profiles!inner(
          id,
          username,
          full_name
        )
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }

    console.log('Message sent:', data);
    return { data, error: null };
  } catch (e) {
    console.error('Unexpected error sending message:', e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Subscribe to realtime message inserts for a room
 * @param {string} roomId - UUID of the room
 * @param {function} onMessage - Callback when new message arrives
 * @returns {RealtimeChannel} - Subscription channel
 */
export function subscribeToRoomMessages(roomId, onMessage) {
  console.log('📡 Setting up Realtime subscription for room:', roomId);
  
  // Create a unique channel name
  const channelName = `room:${roomId}:${Date.now()}`;
  console.log('   Channel name:', channelName);
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `room_id=eq.${roomId}` 
      },
      async (payload) => {
        console.log('🔔 ========== REALTIME EVENT TRIGGERED ==========');
        console.log('🔔 INSERT detected on messages table!');
        console.log('🔔 Event payload:', JSON.stringify(payload, null, 2));
        console.log('🔔 New message ID:', payload.new.id);
        console.log('🔔 Room ID:', payload.new.room_id);
        console.log('🔔 User ID:', payload.new.user_id);
        console.log('🔔 Text:', payload.new.text);
        
        // Small delay to ensure database commit
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch full message with user profile data
        console.log('📥 Fetching full message details...');
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            user_profiles!inner(
              id,
              username,
              full_name
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (error) {
          console.error('❌ Error fetching message details:', error);
          return;
        }

        if (!data) {
          console.warn('⚠️ No data returned for message ID:', payload.new.id);
          return;
        }

        console.log('✅ Full message fetched successfully!');
        console.log('   Message:', data.text);
        console.log('   From:', data.user_profiles?.full_name || data.user_profiles?.username);
        console.log('   Profile data:', data.user_profiles);
        
        console.log('🚀 Calling onMessage callback...');
        if (onMessage) {
          onMessage(data);
          console.log('✅ Callback executed');
        } else {
          console.error('❌ No callback function provided!');
        }
        
        console.log('🔔 ========== END REALTIME EVENT ==========');
      }
    )
    .subscribe((status, err) => {
      console.log('📡 Subscription status changed:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ ========== SUBSCRIPTION ACTIVE ==========');
        console.log('✅ Listening for messages in room:', roomId);
        console.log('✅ Channel:', channelName);
        console.log('✅ ==========================================');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error:', err);
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Subscription timed out');
      } else if (status === 'CLOSED') {
        console.warn('⚠️ Channel closed');
      }
    });

  console.log('📡 Subscription setup complete, waiting for SUBSCRIBED status...');
  return channel;
}

/**
 * Unsubscribe from a realtime channel
 * @param {RealtimeChannel} channel - The channel to unsubscribe
 */
export async function unsubscribeChannel(channel) {
  if (!channel) return;
  
  console.log('🔌 Unsubscribing from channel');
  await supabase.removeChannel(channel);
  console.log('✅ Channel unsubscribed');
}

/**
 * Test function to verify Realtime is working
 * Call this from console: window.testRealtime()
 */
export async function testRealtimeConnection() {
  console.log('🧪 Testing Realtime connection...');
  
  const testChannel = supabase
    .channel('test-connection')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => {
        console.log('✅ Realtime is working! Received:', payload);
      }
    )
    .subscribe((status) => {
      console.log('Test subscription status:', status);
    });
    
  console.log('Test channel created. Try inserting a message in Supabase.');
  return testChannel;
}

// Expose test function globally for debugging
if (typeof window !== 'undefined') {
  window.testRealtime = testRealtimeConnection;
}
