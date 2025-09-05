#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://phnvrqzqhuigmvuxfktf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixVincentProfile() {
  console.log('🔧 Fixing Vincent\'s profile...\n');

  // 1. First sign up/sign in to get a real user ID
  console.log('1. Creating/signing in user...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'vincentmasci@icloud.com',
    password: 'Test123!' // You'll need to set this
  });

  if (authError) {
    console.log('   Sign in failed, trying to sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'vincentmasci@icloud.com',
      password: 'Test123!' // You'll need to remember this
    });

    if (signUpError) {
      console.log('   ❌ Error:', signUpError.message);
      return;
    } else {
      console.log('   ✅ User created:', signUpData.user.id);
      
      // 2. Create profile for the new user
      console.log('\n2. Creating user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: signUpData.user.id,
          email: 'vincentmasci@icloud.com',
          full_name: 'Vincent',
          basal_metabolic_rate: 2200,
          daily_deficit_target: 500,
          tracking_mode: 'full',
          subscription_tier: 'free',
          activity_level: 'moderately_active',
          phone_verified: false,
          sms_enabled: true,
          sms_message_count: 0,
          subscription_status: 'active', // Skip trial for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (profileError) {
        console.log('   ❌ Error creating profile:', profileError.message);
      } else {
        console.log('   ✅ Profile created successfully!');
        console.log('   Profile ID:', profile[0].id);
      }
    }
  } else {
    console.log('   ✅ Signed in as:', authData.user.id);
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (checkError || !existingProfile) {
      console.log('   No profile found, creating one...');
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: 'vincentmasci@icloud.com',
          full_name: 'Vincent',
          basal_metabolic_rate: 2200,
          daily_deficit_target: 500,
          tracking_mode: 'full',
          subscription_tier: 'free',
          activity_level: 'moderately_active',
          phone_verified: false,
          sms_enabled: true,
          sms_message_count: 0,
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (profileError) {
        console.log('   ❌ Error creating profile:', profileError.message);
      } else {
        console.log('   ✅ Profile created successfully!');
      }
    } else {
      console.log('   ✅ Profile already exists');
      console.log('   Subscription status:', existingProfile.subscription_status);
    }
  }

  console.log('\n✅ Done! You can now sign in with:');
  console.log('   Email: vincentmasci@icloud.com');
  console.log('   Password: Test123!');
}

fixVincentProfile().catch(console.error);