// Temporary fix to include all male students
// Add this to the fetchStudents function if some students are missing

// After getting studentsData and profilesData, also get all male profiles
const { data: allMaleProfiles, error: maleError } = await supabase
  .from('user_profiles')
  .select('*')
  .ilike('gender', 'male');

if (!maleError && allMaleProfiles) {
  console.log('All male profiles found:', allMaleProfiles.length);
  
  // Find profiles without student entries
  const maleWithoutStudents = allMaleProfiles.filter(profile => 
    !studentsData.some(student => student.profile_id === profile.id)
  );
  
  if (maleWithoutStudents.length > 0) {
    console.log('Male profiles without student entries:', 
      maleWithoutStudents.map(p => p.full_name));
    
    // Add them as temporary students
    const tempStudents = maleWithoutStudents.map(profile => ({
      id: `temp-${profile.id}`,
      profile_id: profile.id,
      created_at: profile.created_at
    }));
    
    studentsData.push(...tempStudents);
  }
}