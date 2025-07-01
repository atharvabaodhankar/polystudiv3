import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgzwodftkglvngkmkwnv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnendvZGZ0a2dsdm5na21rd252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNzM4OTAsImV4cCI6MjA2Njk0OTg5MH0.9eEt44ULmRjgyUL3_SaL6yi0Rhsab2qWEpIxJU1GNmw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 