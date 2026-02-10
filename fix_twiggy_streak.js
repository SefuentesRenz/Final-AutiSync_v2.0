// Fix Twiggy's streak - set to 1 since he logged in today
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';
const supabase = createClient(supabaseUrl, supabaseKey);

const studentId = 'dd03826d-304d-4268-9584-517ae9110631';

async function fixTwiggyStreak() {
  console.log('🔧 Fixing Twiggy\'s streak...\n');
  
  // Update the streak to 1 (since he logged in today)
  const { data, error } = await supabase
    .from('streaks')
    .update({
      current_streak: 1
    })
    .eq('user_id', studentId)
    .select();
  
  if (error) {
    console.error('❌ Error updating streak:', error);
    return;
  }
  
  console.log('✅ Streak fixed successfully!');
  console.log('📊 Updated record:', JSON.stringify(data[0], null, 2));
  console.log('\n💡 Twiggy should now see a streak of 1 when he refreshes the page.');
}

fixTwiggyStreak();
