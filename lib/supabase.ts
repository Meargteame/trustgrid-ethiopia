import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* 
  NOTE: This is a robust check to prevent app crashes during setup.
  In production, you would want strict errors if config is missing.
*/
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl !== 'YOUR_SUPABASE_URL' && 
                     supabaseUrl.startsWith('http');

if (!isConfigured) {
  console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
} else {
  console.log('Supabase initialized with URL:', supabaseUrl);
  // Do not log the full key in production
  console.log('Supabase Anon Key detected:', supabaseAnonKey ? 'Yes (length: ' + supabaseAnonKey.length + ')' : 'No');
}

// Export a robust client that warns if used before config
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: () => {
         console.warn('Supabase call ignored: missing valid credentials.');
         return () => ({ data: null, error: new Error('Supabase not configured') });
      }
    });

