// Debug script to check Recognition Rookie badge issue
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugRecognitionRookie(userId) {
  console.log('🔍 Debugging Recognition Rookie Badge Issue\n');
  
  if (!userId) {
    console.error('❌ Please provide a user ID as an argument');
    console.error('   Usage: node debug_recognition_rookie.js <user_id>');
    console.error('   Or check your user ID in the browser console when logged in');
    return;
  }
  
  try {
    console.log('👤 User ID:', userId);
    console.log('');

    // Check activity ID 5 (Identification)
    console.log('📚 Checking Identification Activity (ID: 5)...');
    const { data: activity, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', 5)
      .single();
    
    if (actError) {
      console.error('❌ Error fetching activity:', actError);
    } else {
      console.log('✅ Activity data:', {
        id: activity.id,
        title: activity.title,
        category: activity.category,
        difficulty: activity.difficulty
      });
    }
    console.log('');

    // Check user's progress for identification activities
    console.log('📊 Checking your progress for Identification activities...');
    const { data: progress, error: progError } = await supabase
      .from('user_activity_progress')
      .select(`
        *,
        activities (
          title,
          category,
          difficulty
        )
      `)
      .eq('user_id', userId);
    
    if (progError) {
      console.error('❌ Error fetching progress:', progError);
    } else {
      console.log(`✅ Total activities completed: ${progress.length}\n`);
      
      // Filter for identification activities
      const identificationActivities = progress.filter(p => 
        p.activities?.title?.toLowerCase().includes('identification') ||
        p.activities?.category?.toLowerCase().includes('identification') ||
        p.activity_name?.toLowerCase().includes('identification')
      );
      
      console.log(`🎯 Identification activities found: ${identificationActivities.length}`);
      identificationActivities.forEach(p => {
        console.log(`  - Activity ID: ${p.activity_id}`);
        console.log(`    Title: ${p.activities?.title || 'N/A'}`);
        console.log(`    Category: ${p.activities?.category || 'N/A'}`);
        console.log(`    Difficulty: ${p.activities?.difficulty || 'N/A'}`);
        console.log(`    Score: ${p.score}`);
        console.log(`    Date: ${p.date_completed}`);
        console.log('');
      });
      
      // Check for Intermediate identification activities specifically
      const intermediateIdentification = identificationActivities.filter(p => 
        p.activities?.difficulty === 'Intermediate'
      );
      
      console.log(`🔥 Intermediate Identification activities: ${intermediateIdentification.length}`);
      if (intermediateIdentification.length > 0) {
        console.log('✅ You SHOULD have the Recognition Rookie badge!');
        intermediateIdentification.forEach(p => {
          console.log(`  - ${p.activities?.title} (Score: ${p.score})`);
        });
      } else {
        console.log('❌ No Intermediate Identification activities found.');
        console.log('💡 Checking what difficulties exist:');
        identificationActivities.forEach(p => {
          console.log(`  - Difficulty: "${p.activities?.difficulty}" (type: ${typeof p.activities?.difficulty})`);
        });
      }
    }
    console.log('');

    // Check Recognition Rookie badge
    console.log('🏆 Checking Recognition Rookie Badge...');
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('name', 'Recognition Rookie')
      .single();
    
    if (badgeError) {
      console.error('❌ Error fetching badge:', badgeError);
    } else {
      console.log('✅ Badge data:', {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        criteria: badge.criteria
      });
    }
    console.log('');

    // Check if user has the badge
    console.log('🎖️ Checking if you have this badge...');
    const { data: userBadge, error: userBadgeError } = await supabase
      .from('student_badges')
      .select('*')
      .eq('student_id', userId)
      .eq('badge_id', badge.id);
    
    if (userBadgeError) {
      console.error('❌ Error checking user badge:', userBadgeError);
    } else if (userBadge.length > 0) {
      console.log('✅ You already have this badge!');
      console.log('   Earned on:', userBadge[0].date_earned);
    } else {
      console.log('❌ You do not have this badge yet.');
    }
    console.log('');

    // Summary and recommendation
    console.log('=' .repeat(60));
    console.log('📋 SUMMARY & RECOMMENDATION');
    console.log('=' .repeat(60));
    
    if (intermediateIdentification && intermediateIdentification.length > 0 && (!userBadge || userBadge.length === 0)) {
      console.log('⚠️  ISSUE FOUND: You completed an Intermediate Identification activity but didn\'t receive the badge.');
      console.log('');
      console.log('🔧 SOLUTIONS:');
      console.log('1. Run badge checking manually:');
      console.log('   - Complete another activity to trigger badge checking');
      console.log('   - Or run: npm run check-badges (if available)');
      console.log('');
      console.log('2. Award the badge manually (in database):');
      console.log(`   INSERT INTO student_badges (student_id, badge_id, date_earned)`);
      console.log(`   VALUES ('${userId}', '${badge.id}', NOW());`);
    } else if (!intermediateIdentification || intermediateIdentification.length === 0) {
      console.log('💡 You haven\'t completed an Intermediate Identification activity yet.');
      console.log('   Make sure to:');
      console.log('   1. Select "Identification" activity');
      console.log('   2. Choose "Intermediate" difficulty');
      console.log('   3. Complete the activity');
    } else {
      console.log('✅ Everything looks correct. You should have the badge.');
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];
debugRecognitionRookie(userId);

