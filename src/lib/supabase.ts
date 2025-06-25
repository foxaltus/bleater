import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwpazbmcghdjsygjluqs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cGF6Ym1jZ2hkanN5Z2psdXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Mzg1OTcsImV4cCI6MjA2NjQxNDU5N30.5BYCp5TB4haOzin3bwJXS6xzx3WzqR-t1qrqtvWrRM8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
