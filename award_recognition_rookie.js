// Award Recognition Rookie badge to students who earned it
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function awardMissingBadges() {
  console.log('🏆 Awarding Recognition Rookie Badge to Eligible Students\n');
  
  try {
    const badgeId = '2e562416-c7f0-4499-9f52-f15de35e1694';
    const students = [
      { id: '681d70a1-2de1-4709-97aa-a23c2c2b9859', name: 'Enrico Burgos' },
      { id: '0c946a86-8071-4ff7-9b6c-da04c05cc0ff', name: 'Isaiah Royce G. Valdez' }
    ];

    for (const student of students) {
      console.log(`Processing ${student.name}...`);
      
      // Check if they already have the badge (just to be safe)
      const { data: existingBadge, error: checkError } = await supabase
        .from('student_badges')
        .select('*')
        .eq('student_id', student.id)
        .eq('badge_id', badgeId);
      
      if (checkError) {
        console.error(`  ❌ Error checking: ${checkError.message}`);
        continue;
      }

      if (existingBadge && existingBadge.length > 0) {
        console.log(`  ✅ Already has the badge!`);
        continue;
      }

      // Award the badge
      const { data, error } = await supabase
        .from('student_badges')
        .insert({
          student_id: student.id,
          badge_id: badgeId,
          badge_name: 'Recognition Rookie',
          badge_icon: '🧩',
          badge_rarity: 'Common',
          earned_at: new Date().toISOString(),
          activity_name: 'Identification',
          activity_category: 'Academic Skills',
          activity_difficulty: 'Intermediate',
          session_score: '80'
        })
        .select();
      
      if (error) {
        console.error(`  ❌ Error awarding badge: ${error.message}`);
      } else {
        console.log(`  🎉 Badge awarded successfully!`);
      }
      console.log('');
    }

    console.log('✅ Done! Both students should now have the Recognition Rookie badge.');
    console.log('   Refresh your page to see the badge!');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

awardMissingBadges();
