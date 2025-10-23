import { supabase } from './src/lib/supabase.js';

async function checkTables() {
  try {
    console.log('Checking activities table...');
    // Check activities table structure
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .limit(3);
    
    if (activitiesError) {
      console.error('Activities error:', activitiesError);
    } else {
      console.log('Sample activities:', JSON.stringify(activities, null, 2));
    }
    
    console.log('\nChecking Difficulties table...');
    // Check if Difficulties table exists
    const { data: difficulties, error: diffError } = await supabase
      .from('Difficulties')
      .select('*');
    
    if (diffError) {
      console.error('Difficulties error:', diffError);
    } else {
      console.log('Difficulties table:', JSON.stringify(difficulties, null, 2));
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
  
  process.exit(0);
}

checkTables();