// Check actual Supabase schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the connection details from SUPABASE-SETUP.md
const supabaseUrl = 'https://phnvrqzqhuigmvuxfktf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking Supabase Schema...\n');
  console.log('Project URL:', supabaseUrl);
  console.log('---\n');

  // Test connection
  const { data: test, error: testError } = await supabase
    .from('user_profiles')
    .select('count')
    .limit(1);

  if (testError) {
    console.log('❌ Error connecting to Supabase:');
    console.log(testError.message);
    console.log('\nPossible reasons:');
    console.log('1. Table might not exist yet');
    console.log('2. RLS policies might be blocking access');
    console.log('3. Schema might be different than documented');
    return;
  }

  console.log('✅ Connection successful!\n');

  // Try to check what tables we can access
  console.log('Attempting to query documented tables:\n');

  const tables = [
    'user_profiles',
    'food_entries', 
    'chat_messages',
    'nutritionist_clients',
    'weekly_summaries',
    'meal_plans',
    'phone_verifications' // This one probably doesn't exist yet
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: Exists (${count || 0} rows)`);
    }
  }

  console.log('\n---');
  console.log('Note: Some tables might exist but have RLS policies preventing access.');
  console.log('To see all tables, you need to check in the Supabase dashboard.');
}

checkSchema().catch(console.error);