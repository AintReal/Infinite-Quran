import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zrcrwjraseuazkljcrlk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyY3J3anJhc2V1YXprbGpjcmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MjczMTcsImV4cCI6MjA4NjIwMzMxN30.qX1_g04yQWundxplu-IT1yBYzSHtZPa0qHL1UKjudpc'
)

async function verify() {
  // Check deceased by slug ID
  const { data: person } = await supabase.from('deceased').select('*').eq('id', 1).single()
  console.log('Slug /1:', person?.name, '-', person?.companion_text)

  // Check random audio
  const { data: audio } = await supabase.from('audio_files').select('*').limit(3)
  console.log('Audio files:', audio?.map(a => a.file_name))

  // Check stats view
  const { data: stats } = await supabase.from('stats_overview').select('*').single()
  console.log('Stats:', stats)

  // Check highest ID (next slug should be this + 1)
  const { data: last } = await supabase.from('deceased').select('id').order('id', { ascending: false }).limit(1).single()
  console.log('Last ID (next slug will be):', last?.id, '→', (last?.id || 0) + 1)
}

verify()
