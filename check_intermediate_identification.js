// Check who completed Intermediate Identification (ID 96)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkIntermediateIdentification() {
  console.log('🔍 Checking Intermediate Identification Completions & Badge Awards\n');
  
  try {
    // Get Recognition Rookie badge ID
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'Recognition Rookie')
      .single();
    
    if (badgeError) {
      console.error('❌ Error finding badge:', badgeError);
      return;
    }
    
    const badgeId = badges.id;
    console.log('🏆 Recognition Rookie Badge ID:', badgeId);
    console.log('📋 Criteria:', badges.criteria);
    console.log('');

    // Check all completions of activity ID 96 (Intermediate Identification)
    console.log('📊 Checking completions of Intermediate Identification (ID: 96)...');
    const { data: completions, error: progError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (*)
      `)
      .eq('activity_id', 96);
    
    if (progError) {
      console.error('❌ Error:', progError);
      return;
    }

    console.log(`✅ Found ${completions.length} completion(s)\n`);

    if (completions.length === 0) {
      console.log('⚠️  NO ONE has completed Intermediate Identification yet!');
      console.log('   Activity ID 96 has not been completed.');
      console.log('');
      console.log('💡 To earn the Recognition Rookie badge:');
      console.log('   1. Go to the Identification activity');
      console.log('   2. Select "Intermediate" difficulty');
      console.log('   3. Complete the activity');
      return;
    }

    // For each completion, check if they have the badge
    console.log('👥 Students who completed Intermediate Identification:\n');
    
    for (const completion of completions) {
      console.log(`Student ID: ${completion.user_id}`);
      console.log(`Score: ${completion.score}`);
      console.log(`Date: ${completion.date_completed}`);
      console.log(`Student Name: ${completion.student_name || 'N/A'}`);
      
      // Check if they have the badge
      const { data: studentBadge, error: badgeCheckError } = await supabase
        .from('student_badges')
        .select('*')
        .eq('student_id', completion.user_id)
        .eq('badge_id', badgeId);
      
      if (badgeCheckError) {
        console.log(`❌ Error checking badge: ${badgeCheckError.message}`);
      } else if (studentBadge && studentBadge.length > 0) {
        console.log(`✅ Has Recognition Rookie badge (awarded: ${studentBadge[0].date_earned})`);
      } else {
        console.log(`❌ MISSING Recognition Rookie badge!`);
        console.log(`💡 This student should have the badge.`);
        console.log('');
        console.log(`🔧 To fix, run this SQL:`);
        console.log(`   INSERT INTO student_badges (student_id, badge_id, date_earned)`);
        console.log(`   VALUES ('${completion.user_id}', '${badgeId}', NOW());`);
      }
      console.log('');
      console.log('-'.repeat(60));
      console.log('');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkIntermediateIdentification();
