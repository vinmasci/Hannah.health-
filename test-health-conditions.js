// Test script focused on health condition question only
const fs = require('fs').promises;

// 10 different health condition scenarios
const healthScenarios = [
  {
    name: "NAFLD with severity details",
    initial: "NAFLD",
    followUp: "mild, recently diagnosed"
  },
  {
    name: "Diabetes with management info",
    initial: "Type 2 diabetes",
    followUp: "managed with medication for 5 years"
  },
  {
    name: "Heart disease - user declines details",
    initial: "heart disease",
    followUp: "move on"
  },
  {
    name: "No conditions",
    initial: "none",
    followUp: null // No follow-up expected
  },
  {
    name: "High cholesterol with control status",
    initial: "high cholesterol",
    followUp: "under control with statins"
  },
  {
    name: "Multiple conditions with details",
    initial: "NAFLD and high blood pressure",
    followUp: "both mild, diagnosed last year"
  },
  {
    name: "Celiac disease with timeline",
    initial: "celiac disease",
    followUp: "diagnosed 3 months ago"
  },
  {
    name: "IBS with severity",
    initial: "IBS",
    followUp: "moderate, managing with diet"
  },
  {
    name: "Hypertension - user says no to details",
    initial: "hypertension",
    followUp: "no"
  },
  {
    name: "Allergies with specifics",
    initial: "food allergies",
    followUp: "severe peanut allergy, carry epipen"
  }
];

async function testHealthCondition(scenario, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const conversationHistory = [];
  const currentQuestion = {
    id: 'healthConditions',
    question: "Do you have any health conditions that significantly influence your meal planning?"
  };
  
  try {
    // Initial response about health condition
    console.log(`\n📝 Question: ${currentQuestion.question}`);
    console.log(`👤 User: "${scenario.initial}"`);
    
    const initialResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `health-test-${index}`,
        currentQuestion: currentQuestion,
        userResponse: scenario.initial,
        userData: {},
        conversationHistory: []
      })
    });
    
    const initialData = await initialResponse.json();
    console.log(`🤖 AI: "${initialData.aiResponse}"`);
    console.log(`   [Needs follow-up: ${initialData.needsFollowUp}]`);
    
    conversationHistory.push(
      { role: 'user', content: scenario.initial },
      { role: 'assistant', content: initialData.aiResponse }
    );
    
    let finalStatus = 'completed';
    let followUpCount = 0;
    
    // If AI asks for follow-up and we have a follow-up response
    if (initialData.needsFollowUp && scenario.followUp) {
      console.log(`\n👤 User (follow-up): "${scenario.followUp}"`);
      
      const followUpResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: `health-test-${index}`,
          currentQuestion: currentQuestion,
          userResponse: scenario.followUp,
          userData: {},
          conversationHistory: conversationHistory
        })
      });
      
      const followUpData = await followUpResponse.json();
      console.log(`🤖 AI: "${followUpData.aiResponse}"`);
      console.log(`   [Needs follow-up: ${followUpData.needsFollowUp}]`);
      
      followUpCount++;
      
      // Check if AI is still asking for more info (it shouldn't after getting details)
      if (followUpData.needsFollowUp && 
          (scenario.followUp.includes('mild') || 
           scenario.followUp.includes('moderate') || 
           scenario.followUp.includes('severe') ||
           scenario.followUp.includes('diagnosed') ||
           scenario.followUp.includes('managed') ||
           scenario.followUp.includes('control'))) {
        console.log(`\n⚠️  WARNING: AI is still asking for follow-up after receiving sufficient details!`);
        finalStatus = 'incorrect_follow_up';
      } else if (followUpData.needsFollowUp && scenario.followUp === 'move on') {
        console.log(`\n⚠️  WARNING: AI is still asking for follow-up after user said "move on"!`);
        finalStatus = 'incorrect_follow_up';
      } else {
        console.log(`\n✅ AI correctly moved to next question`);
      }
    } else if (initialData.needsFollowUp && !scenario.followUp) {
      console.log(`\n⚠️  WARNING: AI asked for follow-up but scenario has none (expected for "none")!`);
      finalStatus = 'unexpected_follow_up';
    } else if (!initialData.needsFollowUp && scenario.initial !== 'none') {
      console.log(`\n⚠️  WARNING: AI didn't ask for follow-up about health condition!`);
      finalStatus = 'missing_follow_up';
    } else {
      console.log(`\n✅ Handled correctly (no follow-up needed)`);
    }
    
    return {
      scenario: scenario.name,
      status: finalStatus,
      followUpCount: followUpCount,
      initialResponse: scenario.initial,
      followUpResponse: scenario.followUp
    };
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    return {
      scenario: scenario.name,
      status: 'error',
      error: error.message
    };
  }
}

async function runHealthTests() {
  console.log('🧪 Testing Health Condition Follow-up Logic\n');
  console.log('Expected behavior:');
  console.log('1. Ask for details when health condition is mentioned');
  console.log('2. Move on after receiving details (mild, severe, managed, etc.)');
  console.log('3. Move on if user says "move on" or "no"');
  console.log('4. No follow-up for "none"\n');
  
  const results = [];
  
  for (let i = 0; i < healthScenarios.length; i++) {
    const result = await testHealthCondition(healthScenarios[i], i);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save results
  await fs.writeFile(
    'health-test-results.json',
    JSON.stringify(results, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const correct = results.filter(r => r.status === 'completed').length;
  const errors = results.filter(r => r.status === 'error').length;
  const incorrectFollowUp = results.filter(r => r.status === 'incorrect_follow_up').length;
  const unexpectedFollowUp = results.filter(r => r.status === 'unexpected_follow_up').length;
  const missingFollowUp = results.filter(r => r.status === 'missing_follow_up').length;
  
  console.log(`✅ Correct: ${correct}/${results.length}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`⚠️  Incorrect follow-ups: ${incorrectFollowUp}`);
  console.log(`⚠️  Unexpected follow-ups: ${unexpectedFollowUp}`);
  console.log(`⚠️  Missing follow-ups: ${missingFollowUp}`);
  
  console.log('\nDetailed results by scenario:');
  results.forEach((r, i) => {
    const icon = r.status === 'completed' ? '✅' : r.status === 'error' ? '❌' : '⚠️';
    console.log(`${icon} Test ${i+1}: ${r.scenario}`);
    if (r.status !== 'completed' && r.status !== 'error') {
      console.log(`   Issue: ${r.status.replace('_', ' ')}`);
    }
  });
  
  console.log('\nFull results saved to health-test-results.json');
}

// Run the tests
runHealthTests().catch(console.error);