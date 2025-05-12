import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://asfagvrbatxwogufesvj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZmFndnJiYXR4d29ndWZlc3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDcxMTYsImV4cCI6MjA2MjMyMzExNn0.Stdq6dNRP5rT4KhX5oIXKoSCm5QkzfqF77wd9smPihA'
export const supabase = createClient(supabaseUrl, supabaseKey)
