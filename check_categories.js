// Check what categories exist in the database
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCategories() {
  console.log('🔍 Checking categories in the database...\n');
  
  try {
    // Get all unique categories
    const { data: categories, error } = await supabase
      .from('Categories')
      .select('*');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📋 Categories found:');
    categories.forEach(cat => {
      console.log(`  - ID: ${cat.id}`);
      console.log(`    Name: "${cat.category_name}"`);
      console.log('');
    });
    
    // Also check what categories are actually used in activities
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        category_id,
        Categories (
          category_name
        )
      `)
      .limit(10);
    
    if (actError) {
      console.error('❌ Error fetching activities:', actError);
    } else {
      console.log('📚 Sample activities with their categories:');
      activities.forEach(act => {
        console.log(`  - ${act.title}: "${act.Categories?.category_name || 'N/A'}"`);
      });
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

checkCategories();
