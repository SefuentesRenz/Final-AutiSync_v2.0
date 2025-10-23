import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DatabaseDebugger = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const diagnostics = {};

    try {
      // 1. Check if parent_child_relations table exists and has data
      console.log('Checking parent_child_relations table...');
      const { data: relations, error: relationsError } = await supabase
        .from('parent_child_relations')
        .select('*')
        .eq('parent_user_id', user.id);
      
      diagnostics.relations = { data: relations, error: relationsError };

      // 2. Check user_profiles table
      console.log('Checking user_profiles table...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      diagnostics.userProfiles = { data: profiles, error: profilesError };

      // 3. Check User_emotion table
      console.log('Checking User_emotion table...');
      const { data: emotions, error: emotionsError } = await supabase
        .from('User_emotion')
        .select('*')
        .limit(5);
      
      diagnostics.emotions = { data: emotions, error: emotionsError };

      // 4. Check current user info
      diagnostics.currentUser = {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      };

      console.log('Diagnostics complete:', diagnostics);
      setResults(diagnostics);
    } catch (error) {
      console.error('Diagnostics error:', error);
      diagnostics.error = error.message;
      setResults(diagnostics);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Database Diagnostics</h2>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Current User:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.currentUser, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Parent-Child Relations:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.relations, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">User Profiles:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.userProfiles, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Emotions (sample):</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results.emotions, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDebugger;