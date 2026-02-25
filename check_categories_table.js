// Check Categories table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zppltopvyzuyhxgwrfwm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCategoriesTable() {
  console.log('🔍 Checking Categories table...\n');
  
  try {
    const { data, error } = await supabase
      .from('Categories')
      .select('*');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (data.length === 0) {
      console.log('⚠️  Categories table is empty!');
      console.log('\nThe activities have category_id values but the Categories table has no data.');
      console.log('This is why all activities show "N/A" for category.');
    } else {
      console.log(`✅ Found ${data.length} categories:\n`);
      data.forEach(cat => {
        console.log('Category:');
        Object.keys(cat).forEach(key => {
          console.log(`  ${key}: ${cat[key]}`);
        });
        console.log('');
      });
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

checkCategoriesTable();
