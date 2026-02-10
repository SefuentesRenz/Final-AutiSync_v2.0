// Simple script to check all identification activities and Recognition Rookie badge
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkBadgeSystem() {
  console.log('🔍 Checking Badge System for Recognition Rookie\n');
  
  try {
    // 1. Check the activities table for ID 5 (Identification)
    console.log('📚 Checking Identification Activity (ID: 5)...');
    const { data: activity, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', 5)
      .single();
    
    if (actError) {
      console.error('❌ Error:', actError);
    } else {
      console.log('✅ Activity:', {
        id: activity.id,
        title: activity.title,
        category: activity.category,
        difficulty: activity.difficulty
      });
      console.log('');
    }

    // 2. Check Recognition Rookie badge
    console.log('🏆 Checking Recognition Rookie Badge...');
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .ilike('name', '%Recognition Rookie%');
    
    if (badgeError) {
      console.error('❌ Error:', badgeError);
    } else if (badge.length === 0) {
      console.log('❌ Badge not found!');
    } else {
      console.log('✅ Badge:', {
        id: badge[0].id,
        name: badge[0].name,
        description: badge[0].description,
        criteria: badge[0].criteria
      });
      console.log('');
    }

    // 3. Check all progress for identification activities
    console.log('📊 Checking all Intermediate Identification completions...');
    const { data: allProgress, error: progError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (
          title,
          category,
          difficulty
        )
      `)
      .eq('activity_id', 5); // Identification activity ID
    
    if (progError) {
      console.error('❌ Error:', progError);
    } else {
      console.log(`✅ Total Identification completions: ${allProgress.length}`);
      
      // Filter for Intermediate
      const intermediateProgress = allProgress.filter(p => 
        p.activities?.difficulty === 'Intermediate'
      );
      
      console.log(`🔥 Intermediate Identification completions: ${intermediateProgress.length}`);
      
      if (intermediateProgress.length > 0) {
        console.log('\n👥 Students who completed Intermediate Identification:');
        for (const p of intermediateProgress) {
          console.log(`  - Student ID: ${p.user_id}`);
          console.log(`    Score: ${p.score}`);
          console.log(`    Date: ${p.date_completed}`);
          console.log(`    Activity Title: ${p.activities?.title || 'N/A'}`);
          console.log(`    Difficulty: ${p.activities?.difficulty || 'N/A'}`);
          
          // Check if they have the badge
          if (badge.length > 0) {
            const { data: userBadge } = await supabase
              .from('student_badges')
              .select('*')
              .eq('student_id', p.user_id)
              .eq('badge_id', badge[0].id);
            
            if (userBadge && userBadge.length > 0) {
              console.log(`    Badge: ✅ Has Recognition Rookie`);
            } else {
              console.log(`    Badge: ❌ MISSING Recognition Rookie!`);
            }
          }
          console.log('');
        }
      }
      
      // Show all difficulties
      console.log('\n📈 All Identification activity completions by difficulty:');
      const difficultyGroups = {};
      allProgress.forEach(p => {
        const diff = p.activities?.difficulty || 'Unknown';
        if (!difficultyGroups[diff]) {
          difficultyGroups[diff] = 0;
        }
        difficultyGroups[diff]++;
      });
      Object.entries(difficultyGroups).forEach(([diff, count]) => {
        console.log(`  - ${diff}: ${count} completions`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (activity && activity.difficulty !== 'Intermediate') {
      console.log('⚠️  PROBLEM: Activity ID 5 (Identification) has difficulty:', activity.difficulty);
      console.log('   Expected: "Intermediate"');
      console.log('   This is why the badge isn\'t being awarded!');
      console.log('');
      console.log('🔧 SOLUTION: The activities table has the wrong difficulty.');
      console.log('   Identification is a multi-difficulty activity, so it should not');
      console.log('   have a fixed difficulty in the activities table.');
      console.log('   The difficulty should come from the difficulty_id in user_activity_progress.');
    } else {
      console.log('✅ Activity setup looks correct');
      console.log('   If students are missing the badge, it\'s likely a badge');
      console.log('   checking issue. Try completing another activity to trigger');
      console.log('   the badge check again.');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkBadgeSystem();
