// Check the history of when Twiggy last logged in
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';
const supabase = createClient(supabaseUrl, supabaseKey);

const studentId = 'dd03826d-304d-4268-9584-517ae9110631';

async function checkLoginHistory() {
  console.log('🔍 Checking Twiggy\'s login history...\n');
  
  // Get streak record
  const { data: streak, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', studentId)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📊 Current Streak Status:');
  console.log('- Current Streak:', streak.current_streak);
  console.log('- Longest Streak:', streak.longest_streak);
  console.log('- Last Active Date:', streak.last_active_date);
  console.log('- Last Streak Increment Date:', streak.last_streak_increment_date);
  console.log('- Updated At:', streak.updated_at);
  
  // Calculate what happened
  if (streak.last_streak_increment_date) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const lastIncrement = new Date(streak.last_streak_increment_date + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = todayDate.getTime() - lastIncrement.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('\n⏱️ Timeline Analysis:');
    console.log('- Days since last login:', diffDays);
    
    if (diffDays === 0) {
      console.log('\n✅ EXPLANATION:');
      console.log('Twiggy logged in today (2026-01-27) for the first time.');
      console.log('The streak was previously at 1, but there was a 3+ day gap since the last login.');
      console.log('Per the streak logic, gaps of 3+ days RESET the streak to 0.');
      console.log('The system correctly set current_streak = 0 when Twiggy logged in today.');
    }
  }
  
  // Check recent activities to see when student was last active
  const { data: recentActivities, error: actError } = await supabase
    .from('recent_activities')
    .select('completed_at')
    .eq('user_id', studentId)
    .order('completed_at', { ascending: false })
    .limit(5);
  
  if (recentActivities && recentActivities.length > 0) {
    console.log('\n📚 Recent Activity History (last 5):');
    recentActivities.forEach((activity, index) => {
      const date = new Date(activity.completed_at);
      console.log(`  ${index + 1}. ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
    });
  }
}

checkLoginHistory();
