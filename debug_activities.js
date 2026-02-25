// Debug activities and categories
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugActivities() {
  console.log('🔍 Checking activities in the database...\n');
  
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        Categories(*),
        Difficulties(*)
      `)
      .limit(15);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`✅ Found ${data.length} activities\n`);
    
    if (data.length === 0) {
      console.log('⚠️  No activities in database!');
      return;
    }
    
    console.log('📋 Activities:');
    data.forEach((act, index) => {
      console.log(`\n${index + 1}. ${act.title}`);
      console.log(`   ID: ${act.id}`);
      console.log(`   Category (direct): "${act.category || 'N/A'}"`);
      console.log(`   Category Name (join): "${act.Categories?.category_name || 'N/A'}"`);
      console.log(`   Category ID: ${act.category_id}`);
      console.log(`   Activity Type: ${act.activity_type}`);
      console.log(`   Difficulty: ${act.Difficulties?.difficulty || act.difficulty || 'N/A'}`);
    });
    
    // Get unique category names
    const categoryNames = [...new Set(data.map(a => a.Categories?.category_name).filter(Boolean))];
    console.log('\n📊 Unique categories found:');
    categoryNames.forEach(cat => {
      console.log(`   - "${cat}"`);
    });
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

debugActivities();
