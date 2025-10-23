import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugPage = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDebugInfo();
    }
  }, [user]);

  const loadDebugInfo = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../lib/supabase');
      
      console.log('Debug: Loading info for user:', user);
      
      // Get user profile info
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Get parent-child relations
      const { data: relations, error: relationsError } = await supabase
        .from('parent_child_relations')
        .select(`
          *,
          user_profiles!parent_child_relations_child_user_id_fkey (
            id,
            user_id,
            username,
            first_name,
            last_name,
            email,
            age
          )
        `)
        .eq('parent_user_id', user.id);
      
      // Get all parent-child relations (for debugging)
      const { data: allRelations, error: allRelationsError } = await supabase
        .from('parent_child_relations')
        .select('*');
      
      // Get all user profiles (for debugging)
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('user_profiles')
        .select('*');
      
      setDebugInfo({
        user: user,
        userProfile: { data: userProfile, error: profileError },
        relations: { data: relations, error: relationsError },
        allRelations: { data: allRelations, error: allRelationsError },
        allProfiles: { data: allProfiles, error: allProfilesError }
      });
      
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8">Please log in to view debug info</div>;
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User Profile</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo.userProfile, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Parent-Child Relations (Your Children)</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo.relations, null, 2)}
          </pre>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">All Parent-Child Relations (Database)</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo.allRelations, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">All User Profiles (Database)</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(debugInfo.allProfiles, null, 2)}
          </pre>
        </div>
        
        <button 
          onClick={loadDebugInfo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Debug Info
        </button>
      </div>
    </div>
  );
};

export default DebugPage;