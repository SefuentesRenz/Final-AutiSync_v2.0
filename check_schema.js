// Check database schema
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  console.log('🔍 Checking Database Schema\n');
  
  try {
    // Check activities table
    console.log('📚 Activities table sample:');
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .limit(5);
    
    if (actError) {
      console.error('❌ Error:', actError);
    } else {
      console.log(`   Found ${activities.length} activities (showing first 5):`);
      activities.forEach(a => {
        console.log(`   - ID: ${a.id}, Title: ${a.title}`);
        console.log(`     Category: ${a.category}, Difficulty: ${a.difficulty || 'N/A'}`);
      });
      console.log('');
      
      // Check if there's an identification activity
      console.log('🔍 Searching for Identification activities...');
      const { data: identActs, error: identError } = await supabase
        .from('activities')
        .select('*')
        .or('title.ilike.%identification%,category.ilike.%identification%');
      
      if (identError) {
        console.error('❌ Error searching:', identError);
      } else {
        console.log(`   Found ${identActs.length} activities matching "identification":`);
        identActs.forEach(a => {
          console.log(`   - ID: ${a.id}, Title: ${a.title}`);
          console.log(`     Category: ${a.category}, Difficulty: ${a.difficulty || 'N/A'}`);
        });
      }
    }
    console.log('');

    // Check badges table
    console.log('🏆 Badges table sample:');
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .limit(5);
    
    if (badgeError) {
      console.error('❌ Error:', badgeError);
    } else {
      console.log(`   Found ${badges.length} badges (showing first 5):`);
      badges.forEach(b => {
        const columns = Object.keys(b);
        console.log(`   - Columns:`, columns);
        console.log(`     Data:`, b);
        console.log('');
      });
      
      // Check for Recognition Rookie
      console.log('🔍 Searching for Recognition Rookie badge...');
      const recognitionBadge = badges.find(b => 
        (b.badge_name || b.title || b.name || '').toLowerCase().includes('recognition')
      );
      if (recognitionBadge) {
        console.log('   ✅ Found:', recognitionBadge);
      } else {
        console.log('   ❌ Not found in first 5 badges');
        // Try getting all badges
        const { data: allBadges } = await supabase
          .from('badges')
          .select('*');
        const foundBadge = allBadges?.find(b => 
          JSON.stringify(b).toLowerCase().includes('recognition')
        );
        if (foundBadge) {
          console.log('   ✅ Found in all badges:', foundBadge);
        }
      }
    }
    console.log('');

    // Check user_activity_progress table
    console.log('📊 User Activity Progress table sample:');
    const { data: progress, error: progError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (*)
      `)
      .limit(5);
    
    if (progError) {
      console.error('❌ Error:', progError);
    } else {
      console.log(`   Found ${progress.length} progress records (showing first 5):`);
      progress.forEach(p => {
        console.log(`   - User ID: ${p.user_id}`);
        console.log(`     Activity ID: ${p.activity_id}`);
        console.log(`     Activity Name: ${p.activity_name || 'N/A'}`);
        console.log(`     Activities join: ${p.activities ? JSON.stringify(p.activities) : 'No join data'}`);
        console.log(`     Score: ${p.score}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkSchema();
