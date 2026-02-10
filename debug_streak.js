// Debug script to check Twiggy's streak record
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';
const supabase = createClient(supabaseUrl, supabaseKey);

const studentId = 'dd03826d-304d-4268-9584-517ae9110631';

async function debugStreak() {
  console.log('🔍 Checking streak for student:', studentId);
  
  // Get streak record
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', studentId)
    .single();
  
  if (error) {
    console.error('❌ Error fetching streak:', error);
    return;
  }
  
  console.log('📊 Streak record:', JSON.stringify(data, null, 2));
  
  // Get current date info
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  console.log('\n📅 Date Info:');
  console.log('Today:', today);
  console.log('Current time:', now.toLocaleString());
  console.log('Current hour:', now.getHours());
  
  // Check if dates match
  console.log('\n🔍 Analysis:');
  console.log('Last streak increment date:', data.last_streak_increment_date);
  console.log('Does last increment match today?', data.last_streak_increment_date === today);
  console.log('Current streak value:', data.current_streak);
  console.log('Longest streak value:', data.longest_streak);
  
  // Calculate days difference if last increment exists
  if (data.last_streak_increment_date) {
    const lastIncrement = new Date(data.last_streak_increment_date);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastIncrement.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('\n⏱️ Time difference:');
    console.log('Days since last increment:', diffDays);
    console.log('Should reset to 0? (>=3 days):', diffDays >= 3);
    console.log('Should reset to 1? (2 days):', diffDays === 2);
    console.log('Should increment? (1 day):', diffDays === 1);
  }
}

debugStreak();
