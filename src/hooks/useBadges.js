// src/hooks/useBadges.js
import { useState, useEffect } from 'react';
import { checkAndAwardBadges, getStudentBadges } from '../lib/badgesApi';
import { supabase } from '../lib/supabase';

export const useBadges = (studentId) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to check and award badges
  const checkBadges = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { data: newBadges, error: badgeError } = await checkAndAwardBadges(studentId);
      if (badgeError) {
        console.error('Error checking badges:', badgeError);
        setError(badgeError.message);
      } else {
        console.log('🏆 New badges awarded:', newBadges);
        // Refresh student badges
        await fetchStudentBadges();
      }
    } catch (err) {
      console.error('Error in badge check:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch student's current badges
  const fetchStudentBadges = async () => {
    if (!studentId) return;
    
    try {
      const { data: studentBadges, error: fetchError } = await getStudentBadges(studentId);
      if (fetchError) {
        console.error('Error fetching student badges:', fetchError);
        setError(fetchError.message);
      } else {
        setBadges(studentBadges || []);
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError(err.message);
    }
  };

  // Fetch badges on mount and when studentId changes
  useEffect(() => {
    if (studentId) {
      fetchStudentBadges();
      
      // Set up real-time subscription for badge updates
      console.log('🔔 Setting up real-time badge subscription for student:', studentId);
      const channel = supabase
        .channel(`badges-${studentId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'student_badges',
            filter: `student_id=eq.${studentId}`
          },
          (payload) => {
            console.log('🔔 Real-time badge update received:', payload);
            // Refresh badges when any change occurs
            fetchStudentBadges();
          }
        )
        .subscribe((status) => {
          console.log('🔔 Real-time badge subscription status:', status);
        });
      
      // Cleanup subscription on unmount
      return () => {
        console.log('🔔 Unsubscribing from badge updates');
        supabase.removeChannel(channel);
      };
    }
  }, [studentId]);

  return {
    badges,
    loading,
    error,
    checkBadges,
    refreshBadges: fetchStudentBadges
  };
};

// Function to call when a student completes an activity
export const triggerBadgeCheck = async (studentId) => {
  try {
    console.log('🏆 Triggering badge check for student:', studentId);
    const { data: newBadges, error } = await checkAndAwardBadges(studentId);
    
    if (error) {
      console.error('Error in badge check:', error);
      return { success: false, error };
    }
    
    if (newBadges && newBadges.length > 0) {
      console.log('🏆 New badges earned:', newBadges);
      return { success: true, newBadges };
    }
    
    return { success: true, newBadges: [] };
  } catch (err) {
    console.error('Error triggering badge check:', err);
    return { success: false, error: err.message };
  }
};