const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvkspdqpzltolxgkyjrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2a3NwZHFwemx0b2x4Z2t5anJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDMzNjUsImV4cCI6MjA0MDE3OTM2NX0.zcJzF2_jQD3VQDf2DGS6PQOV9BtUr99g4tJevG59UqU'
);

async function testDbConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check alert table
    console.log('\n1. Testing alert table:');
    const { data: alerts, error: alertError } = await supabase
      .from('alert')
      .select('*')
      .limit(5);
    
    if (alertError) {
      console.error('Alert table error:', alertError);
    } else {
      console.log('Alert table data:', alerts);
    }

    // Test 2: Check user_profiles table (students are now just user_profiles)
    console.log('\n2. Testing user_profiles table:');
    const { data: students, error: studentError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (studentError) {
      console.error('User profiles table error:', studentError);
    } else {
      console.log('User profiles table data:', students);
    }

    // Test 3: Check user_profiles table
    console.log('\n3. Testing user_profiles table:');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    if (profileError) {
      console.error('User profiles table error:', profileError);
    } else {
      console.log('User profiles table data:', profiles);
    }

    // Test 4: Check Expressions table
    console.log('\n4. Testing Expressions table:');
    const { data: expressions, error: expressionError } = await supabase
      .from('Expressions')
      .select('*')
      .limit(5);
    
    if (expressionError) {
      console.error('Expressions table error:', expressionError);
    } else {
      console.log('Expressions table data:', expressions);
    }

    // Test 5: Try the join query from the component
    console.log('\n5. Testing join query:');
    const { data: joinData, error: joinError } = await supabase
      .from('alert')
      .select(`
        *,
        students!alert_student_id_fkey (
          id,
          profile_id,
          user_profiles!students_profile_id_fkey (
            full_name,
            username
          )
        )
      `)
      .limit(5);
    
    if (joinError) {
      console.error('Join query error:', joinError);
    } else {
      console.log('Join query data:', joinData);
    }

  } catch (error) {
    console.error('General error:', error);
  }
}

testDbConnection();