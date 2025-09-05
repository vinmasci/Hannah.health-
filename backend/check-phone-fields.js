// Check if phone fields exist in user_profiles
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://phnvrqzqhuigmvuxfktf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPhoneSupport() {
  console.log('📱 Checking Phone Number Support...\n');

  // Try to select phone-related columns
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, phone_number, phone_verified, sms_enabled')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ Phone fields NOT found in user_profiles table');
      console.log('Error:', error.message);
      console.log('\n📝 You need to run the phone migration SQL to add:');
      console.log('- phone_number');
      console.log('- phone_verified');
      console.log('- sms_enabled');
      console.log('- sms_message_count');
      console.log('\nRun: supabase-phone-migration.sql');
    } else {
      console.log('✅ Phone fields might exist but no data yet');
      console.log('Response:', error.message);
    }
  } else {
    console.log('✅ Phone fields EXIST in user_profiles!');
    console.log('Columns found:');
    console.log('- phone_number');
    console.log('- phone_verified'); 
    console.log('- sms_enabled');
    
    // Check phone_verifications table structure
    const { data: verif, error: verifError } = await supabase
      .from('phone_verifications')
      .select('*')
      .limit(1);
    
    if (!verifError) {
      console.log('\n✅ phone_verifications table is ready!');
    }
  }

  // Try to check if functions exist
  console.log('\n📊 Checking for SMS functions...');
  
  // This is tricky - Supabase doesn't expose function metadata easily via client
  // We'd need to actually try calling them or check via SQL in the dashboard
  console.log('Note: Check Supabase dashboard SQL Editor for functions:');
  console.log('- get_user_by_phone()');
  console.log('- log_food_via_sms()');
  console.log('- verify_phone_number()');
}

checkPhoneSupport().catch(console.error);