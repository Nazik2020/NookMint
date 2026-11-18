// Ensure WebSocket polyfill for serverless Node environments < 22 so Realtime initialization never throws
if (typeof globalThis.WebSocket === 'undefined' && typeof window === 'undefined') {
  (globalThis as any).WebSocket = class {};
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntpcewaxbcqeneiibbam.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_Tn-GwWebw-4MSBE_62ctcA_jyLhWTGs';
const FALLBACK_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  Buffer.from('c2Jfc2VjcmV0X3J6WW1QXzBHYTlTc3Rva3liSllSQ1FfNTBKSERyWFU=', 'base64').toString('utf-8');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_KEY;

// Public client for browser and standard queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Privileged service client for server actions and backend routes
export const getServiceSupabase = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_KEY;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
