// Test script for exercise question (Question 7) with 10 different scenarios

const fs = require('fs').promises;

// 10 different exercise scenarios
const exerciseScenarios = [
  {
    name: "Gym and running routine",
    initial: "3x gym, 2x runs",
    followUp: "gym sessions 45 mins moderate intensity, runs 30 mins light intensity"
  },
  {
    name: "No exercise",
    initial: "none",
    followUp: null // No follow-up expected
  },
  {
    name: "Yoga practice",
    initial: "yoga 4 times a week",
    followUp: "1 hour sessions, light to moderate intensity"
  },
  {
    name: "Mixed activities",
    initial: "swimming twice, cycling once, and weekend hikes",
    followUp: "swimming 45 mins moderate, cycling 1 hour moderate, hikes 2-3 hours light"
  },
  {
    name: "CrossFit enthusiast",
    initial: "crossfit 5x week",
    followUp: "1 hour sessions, very intense"
  },
  {
    name: "Simple walking",
    initial: "just daily walks",
    followUp: "30-45 minutes, light intensity"
  },
  {
    name: "Sports player",
    initial: "basketball 3x week, tennis on weekends",
    followUp: "basketball 90 mins high intensity, tennis 2 hours moderate"
  },
  {
    name: "Home workouts",
    initial: "home workouts every morning",
    followUp: "20-30 minutes, moderate intensity bodyweight exercises"
  },
  {
    name: "Martial arts",
    initial: "BJJ 3x week and boxing 2x",
    followUp: "BJJ 90 mins intense, boxing 1 hour very intense"
  },
  {
    name: "Casual exercise",
    initial: "pilates twice a week",
    followUp: "45 minute classes, moderate intensity"
  }
];

async function testExerciseQuestion(scenario, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const conversationHistory = [];
  const currentQuestion = {
    id: 'exercise',
    question: "Do you exercise regularly? If so, what type and how often?"
  };
  
  // Simulate previous conversation context (user has already answered other questions)
  const previousContext = [
    { role: 'user', content: 'NAFLD' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: 'mild, recently diagnosed' },
    { role: 'assistant', content: 'Thanks for sharing.' },
    { role: 'user', content: '42' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: 'male' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: '5\'10' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: '190' },
    { role: 'assistant', content: 'Got it.' },
    { role: 'user', content: '8000' },
    { role: 'assistant', content: 'How do you accumulate those steps?' },
    { role: 'user', content: 'mostly from work, moderate intensity' },
    { role: 'assistant', content: 'Got it.' }
  ];
  
  try {
    // Initial response about exercise
    console.log(`\n📝 Question 7: ${currentQuestion.question}`);
    console.log(`👤 User: "${scenario.initial}"`);
    
    const initialResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `exercise-test-${index}`,
        currentQuestion: currentQuestion,
        userResponse: scenario.initial,
        userData: {
          healthConditions: 'NAFLD',
          age: 42,
          gender: 'male',
          height: 178,
          weight: 190,
          dailySteps: 8000
        },
        conversationHistory: previousContext
      })
    });
    
    const initialData = await initialResponse.json();
    console.log(`🤖 AI: "${initialData.aiResponse}"`);
    console.log(`   [Needs follow-up: ${initialData.needsFollowUp}]`);
    
    conversationHistory.push(
      { role: 'user', content: scenario.initial },
      { role: 'assistant', content: initialData.aiResponse }
    );
    
    let result = {
      scenario: scenario.name,
      initial: scenario.initial,
      aiResponse: initialData.aiResponse,
      needsFollowUp: initialData.needsFollowUp
    };
    
    // If AI asks for follow-up and we have a follow-up response
    if (initialData.needsFollowUp && scenario.followUp) {
      console.log(`\n👤 User (follow-up): "${scenario.followUp}"`);
      
      const followUpResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `exercise-test-${index}`,
          currentQuestion: currentQuestion,
          userResponse: scenario.followUp,
          userData: {
            healthConditions: 'NAFLD',
            age: 42,
            gender: 'male',
            height: 178,
            weight: 190,
            dailySteps: 8000
          },
          conversationHistory: [...previousContext, ...conversationHistory]
        })
      });
      
      const followUpData = await followUpResponse.json();
      console.log(`🤖 AI: "${followUpData.aiResponse}"`);
      console.log(`   [Needs another follow-up: ${followUpData.needsFollowUp}]`);
      
      result.followUp = scenario.followUp;
      result.followUpAIResponse = followUpData.aiResponse;
      result.stillNeedsFollowUp = followUpData.needsFollowUp;
      
      if (!followUpData.needsFollowUp) {
        console.log(`\n✅ AI correctly moved to next question after getting exercise details`);
        result.status = 'success';
      } else {
        console.log(`\n⚠️  WARNING: AI is still asking for more details!`);
        result.status = 'excessive_follow_up';
      }
    } else if (initialData.needsFollowUp && !scenario.followUp) {
      console.log(`\n⚠️  Expected no follow-up for "${scenario.initial}"`);
      result.status = 'unexpected_follow_up';
    } else if (!initialData.needsFollowUp && scenario.initial !== 'none') {
      console.log(`\n⚠️  AI didn't ask for exercise details!`);
      result.status = 'missing_follow_up';
    } else {
      console.log(`\n✅ Handled correctly (no follow-up needed for "none")`);
      result.status = 'success';
    }
    
    return result;
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    return {
      scenario: scenario.name,
      status: 'error',
      error: error.message
    };
  }
}

async function runExerciseTests() {
  console.log('🏃 Testing Exercise Question Follow-up Logic\n');
  console.log('Expected behavior:');
  console.log('1. Ask for duration and intensity for each exercise mentioned');
  console.log('2. Move on after receiving details');
  console.log('3. No follow-up for "none"');
  console.log('4. Should ask separately for each activity type\n');
  
  const results = [];
  
  for (let i = 0; i < exerciseScenarios.length; i++) {
    const result = await testExerciseQuestion(exerciseScenarios[i], i);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save results
  await fs.writeFile(
    'exercise-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;
  const excessive = results.filter(r => r.status === 'excessive_follow_up').length;
  const unexpected = results.filter(r => r.status === 'unexpected_follow_up').length;
  const missing = results.filter(r => r.status === 'missing_follow_up').length;
  
  console.log(`\n✅ Successful: ${successful}/${results.length}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);
  if (excessive > 0) console.log(`⚠️  Excessive follow-ups: ${excessive}`);
  if (unexpected > 0) console.log(`⚠️  Unexpected follow-ups: ${unexpected}`);
  if (missing > 0) console.log(`⚠️  Missing follow-ups: ${missing}`);
  
  console.log('\n📊 Results by scenario:');
  results.forEach((r, i) => {
    const icon = r.status === 'success' ? '✅' : r.status === 'error' ? '❌' : '⚠️';
    console.log(`${icon} Test ${i+1}: ${r.scenario}`);
    if (r.status !== 'success') {
      console.log(`   Issue: ${r.status.replace(/_/g, ' ')}`);
    }
  });
  
  console.log('\nDetailed results saved to exercise-test-results.json');
}

// Run the tests
runExerciseTests().catch(console.error);