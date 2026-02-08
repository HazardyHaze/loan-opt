import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wlwsjwdmbcxrryqlpjxo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'

export const supabase = createClient(supabaseUrl, supabaseKey)