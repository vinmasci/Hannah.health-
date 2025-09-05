#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://phnvrqzqhuigmvuxfktf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('🔍 Debugging Supabase Database...\n');

  // 1. Check if user exists
  console.log('1. Checking auth.users for vincentmasci@icloud.com:');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.log('   Error accessing auth.users:', authError.message);
  } else {
    const vincent = authUsers?.users?.find(u => u.email === 'vincentmasci@icloud.com');
    if (vincent) {
      console.log('   ✅ User found:', vincent.id);
      console.log('   Created:', vincent.created_at);
    } else {
      console.log('   ❌ User not found');
    }
  }

  // 2. Check user_profiles table structure
  console.log('\n2. Checking user_profiles table structure:');
  const { data: columns, error: colError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(0);
  
  if (colError) {
    console.log('   Error:', colError.message);
  } else {
    console.log('   ✅ Table exists and is accessible');
  }

  // 3. Count profiles
  console.log('\n3. Counting profiles:');
  const { count, error: countError } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('   Error:', countError.message);
  } else {
    console.log('   Total profiles:', count);
  }

  // 4. Check for Vincent's profile
  console.log('\n4. Checking for Vincent\'s profile:');
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'vincentmasci@icloud.com');
  
  if (profileError) {
    console.log('   Error:', profileError.message);
  } else if (profiles && profiles.length > 0) {
    console.log('   Found', profiles.length, 'profile(s):');
    profiles.forEach(p => {
      console.log('   - ID:', p.id);
      console.log('     Created:', p.created_at);
      console.log('     Trial Status:', p.subscription_status);
      console.log('     Trial Ends:', p.trial_ends_at);
    });
  } else {
    console.log('   ❌ No profile found');
  }

  // 5. Test creating a profile manually
  console.log('\n5. Attempting to create profile manually...');
  const testUserId = 'test-' + Date.now();
  const { data: newProfile, error: createError } = await supabase
    .from('user_profiles')
    .insert({
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User',
      basal_metabolic_rate: 2200,
      daily_deficit_target: 500,
      tracking_mode: 'full',
      subscription_tier: 'free',
      activity_level: 'moderately_active',
      phone_verified: false,
      sms_enabled: true,
      sms_message_count: 0
    })
    .select();

  if (createError) {
    console.log('   ❌ Error creating profile:', createError.message);
    console.log('   Details:', createError.details);
    console.log('   Hint:', createError.hint);
  } else {
    console.log('   ✅ Successfully created test profile');
    // Clean up
    await supabase.from('user_profiles').delete().eq('id', testUserId);
    console.log('   🧹 Cleaned up test profile');
  }

  console.log('\n✅ Debug complete!');
}

debugDatabase().catch(console.error);