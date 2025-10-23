// Debug helper for checking male students issue
// Open browser console and paste this code to run diagnostics

async function debugMaleStudents() {
    // Import supabase (adjust path if needed)
    const { supabase } = await import('./src/lib/supabase.js');
    
    console.log('🔍 Starting male students debug...');
    
    try {
        // 1. Check all user profiles
        const { data: allProfiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('full_name, gender, user_id, id')
            .order('full_name');
            
        if (profileError) {
            console.error('❌ Profile error:', profileError);
            return;
        }
        
        console.log('📊 All profiles:', allProfiles);
        
        // 2. Check specifically for male students
        const maleProfiles = allProfiles.filter(p => {
            if (!p.gender) return false;
            return p.gender.toLowerCase().trim() === 'male';
        });
        
        console.log(`👥 Male profiles found: ${maleProfiles.length}`, maleProfiles);
        
        // 3. Check for the specific students mentioned
        const targetNames = ['isaiah', 'kobe', 'xaian', 'gi'];
        const foundStudents = {};
        
        targetNames.forEach(name => {
            const found = allProfiles.find(p => 
                p.full_name && p.full_name.toLowerCase().includes(name.toLowerCase())
            );
            foundStudents[name] = found;
            console.log(`🔍 ${name}:`, found || 'NOT FOUND');
        });
        
        // 4. Check students table connections
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*');
            
        if (studentsError) {
            console.error('❌ Students table error:', studentsError);
        } else {
            console.log('📈 Students table:', studentsData);
            
            // Check which profiles have students table entries
            const connectedProfiles = allProfiles.filter(profile => 
                studentsData.some(student => student.profile_id === profile.id)
            );
            
            console.log(`🔗 Profiles connected to students table: ${connectedProfiles.length}`, 
                connectedProfiles.map(p => ({ name: p.full_name, gender: p.gender })));
        }
        
        // 5. Check for gender formatting issues
        const genderIssues = allProfiles.filter(p => p.gender && p.gender !== p.gender.trim());
        if (genderIssues.length > 0) {
            console.warn('⚠️ Profiles with gender whitespace issues:', genderIssues);
        }
        
        // 6. Summary
        console.log('📋 SUMMARY:');
        console.log(`- Total profiles: ${allProfiles.length}`);
        console.log(`- Male profiles: ${maleProfiles.length}`);
        console.log(`- Students table entries: ${studentsData?.length || 0}`);
        console.log('- Target students found:', Object.entries(foundStudents).filter(([name, data]) => data).length);
        
        return {
            allProfiles,
            maleProfiles,
            studentsData,
            foundStudents
        };
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Run the debug function
debugMaleStudents().then(result => {
    console.log('✅ Debug complete. Results available in console.');
    window.debugResult = result; // Store for further inspection
});