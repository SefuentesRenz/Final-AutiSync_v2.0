 import { createClient } from '@supabase/supabase-js'

 const supabaseUrl = 'https://zppltopvyzuyhxgwrfwm.supabase.co'
 const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcGx0b3B2eXp1eWh4Z3dyZndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzNDIsImV4cCI6MjA3MDkzODM0Mn0.IAQjz7i33F_uy8NPgb2bGntzFjeadHMs19y-DOqhpQI'


// Use sessionStorage instead of localStorage to prevent session sharing across tabs
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage, // Each tab/window has its own session
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

