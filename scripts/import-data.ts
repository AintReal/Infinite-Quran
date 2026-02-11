import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = 'https://zrcrwjraseuazkljcrlk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyY3J3anJhc2V1YXprbGpjcmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyNzMxNywiZXhwIjoyMDg2MjAzMzE3fQ.9QZMQmJcMVlny-No6wRJtNkOqazH1h9kv6k71wEUsoQ'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Parse deceased INSERT statements from the SQL dump
function parseDeceasedFromSQL(sqlContent: string) {
  const rows: any[] = []
  // Match all lines starting with ( that are part of deceased INSERT blocks
  const insertBlockRegex = /INSERT INTO `deceased`[\s\S]*?VALUES\s*\n([\s\S]*?)(?=;\s*$|;\s*\n\s*(?:INSERT|--|CREATE|ALTER))/gm
  let match: RegExpExecArray | null

  while ((match = insertBlockRegex.exec(sqlContent)) !== null) {
    const block = match[1]
    // Match individual row tuples
    const rowRegex = /\((\d+),\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*(NULL|'[^']*'),\s*'([^']*)',\s*'((?:[^'\\]|\\.|'')*)',\s*(NULL|'(?:[^'\\]|\\.|'')*'),\s*(NULL|'(?:[^'\\]|\\.|'')*'),\s*'([^']*)',\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']*)',\s*'([^']*)'\)/g
    let rowMatch: RegExpExecArray | null

    while ((rowMatch = rowRegex.exec(block)) !== null) {
      rows.push({
        id: parseInt(rowMatch[1]),
        name: rowMatch[2].replace(/''/g, "'"),
        companion_text: rowMatch[3].replace(/''/g, "'"),
        country: rowMatch[4].replace(/''/g, "'"),
        country_code: rowMatch[5] === 'NULL' ? null : rowMatch[5].replace(/'/g, ''),
        language: rowMatch[6],
        created_by_name: rowMatch[7].replace(/''/g, "'"),
        created_by_email: rowMatch[8] === 'NULL' ? null : rowMatch[8].replace(/'/g, ''),
        created_by_phone: rowMatch[9] === 'NULL' ? null : rowMatch[9].replace(/'/g, ''),
        status: rowMatch[10],
        visits: parseInt(rowMatch[11]),
        last_visit: rowMatch[12] === 'NULL' ? null : rowMatch[12].replace(/'/g, ''),
        created_at: rowMatch[13],
        updated_at: rowMatch[14],
      })
    }
  }
  return rows
}

// Parse audio_files INSERT statements
function parseAudioFromSQL(sqlContent: string) {
  const rows: any[] = []
  const regex = /\((\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*(NULL|\d+),\s*(\d+),\s*'([^']*)'\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(sqlContent)) !== null) {
    rows.push({
      id: parseInt(match[1]),
      file_name: match[2],
      reciter_ar: match[3],
      reciter_en: match[4],
      surah_name_ar: match[5],
      surah_name_en: match[6],
      surah_number: parseInt(match[7]),
      duration_seconds: match[8] === 'NULL' ? null : parseInt(match[8]),
      is_active: match[9] === '1',
      created_at: match[10],
    })
  }
  return rows
}

async function importData() {
  const sqlPath = path.join(__dirname, '..', 'quranather_quran_2026.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

  // 1. Import audio files from SQL
  console.log('📻 Parsing audio files from SQL...')
  const audioRows = parseAudioFromSQL(sqlContent)
  console.log(`   Found ${audioRows.length} audio files in SQL`)

  // Also generate entries for all files in the bucket
  const audioDir = path.join(__dirname, '..', '001.mp3')
  const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3')).sort()
  console.log(`   Found ${audioFiles.length} audio files on disk`)

  // Build complete audio list — use SQL data where available, generate for the rest
  const audioInserts = audioFiles.map((fileName, idx) => {
    const existing = audioRows.find(a => a.file_name === fileName)
    if (existing) return existing
    return {
      file_name: fileName,
      reciter_ar: fileName.startsWith('mish') ? 'مشاري العفاسي' : 'قارئ',
      reciter_en: fileName.startsWith('mish') ? 'Mishary Alafasy' : 'Reciter',
      surah_name_ar: null,
      surah_name_en: null,
      surah_number: null,
      duration_seconds: null,
      is_active: true,
    }
  })

  if (audioInserts.length > 0) {
    console.log(`   Inserting ${audioInserts.length} audio records...`)
    const { error } = await supabase.from('audio_files').upsert(
      audioInserts.map((a, i) => ({ ...a, id: i + 1 })),
      { onConflict: 'id' }
    )
    if (error) {
      console.error('   ❌ Audio insert error:', error.message)
    } else {
      console.log('   ✅ Audio files imported!')
    }
  }

  // 2. Import deceased records
  console.log('\n👥 Parsing deceased records from SQL...')
  const deceasedRows = parseDeceasedFromSQL(sqlContent)
  console.log(`   Found ${deceasedRows.length} deceased records`)

  // Insert in batches of 200
  const BATCH_SIZE = 200
  let imported = 0
  let errors = 0

  for (let i = 0; i < deceasedRows.length; i += BATCH_SIZE) {
    const batch = deceasedRows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('deceased').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message)
      errors++
    } else {
      imported += batch.length
      process.stdout.write(`\r   Imported ${imported}/${deceasedRows.length}...`)
    }
  }

  console.log(`\n   ✅ Deceased import complete: ${imported} records (${errors} batch errors)`)

  // 3. Import visit logs
  console.log('\n📊 Importing visit logs...')
  const visitRegex = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*(NULL|'[^']*'),\s*'([^']*)'\)/g
  const visitRows: any[] = []
  let visitMatch: RegExpExecArray | null
  const visitSection = sqlContent.substring(sqlContent.indexOf("INSERT INTO `visit_logs`"))
  while ((visitMatch = visitRegex.exec(visitSection)) !== null) {
    visitRows.push({
      id: parseInt(visitMatch[1]),
      deceased_id: parseInt(visitMatch[2]),
      visitor_ip: visitMatch[3],
      visit_date: visitMatch[4],
      user_agent: visitMatch[5] === 'NULL' ? null : visitMatch[5].replace(/'/g, ''),
      created_at: visitMatch[6],
    })
  }

  if (visitRows.length > 0) {
    const { error } = await supabase.from('visit_logs').upsert(visitRows, { onConflict: 'id' })
    if (error) {
      console.error('   ❌ Visit logs error:', error.message)
    } else {
      console.log(`   ✅ ${visitRows.length} visit logs imported!`)
    }
  }

  // 4. Summary
  console.log('\n========================================')
  console.log('📋 IMPORT SUMMARY')
  console.log('========================================')
  const { count: deceasedCount } = await supabase.from('deceased').select('*', { count: 'exact', head: true })
  const { count: audioCount } = await supabase.from('audio_files').select('*', { count: 'exact', head: true })
  const { count: visitCount } = await supabase.from('visit_logs').select('*', { count: 'exact', head: true })
  console.log(`   Deceased records:  ${deceasedCount}`)
  console.log(`   Audio files:       ${audioCount}`)
  console.log(`   Visit logs:        ${visitCount}`)
  console.log('========================================')
}

importData().catch(console.error)
