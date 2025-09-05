// Use native fetch (available in Node 18+)
const fs = require('fs').promises;

// Test scenarios for conversations
const testScenarios = [
  {
    name: "NAFLD with details",
    responses: {
      healthConditions: "NAFLD",
      healthDetails: "mild, recently diagnosed",
      age: "42",
      gender: "male",
      height: "5'10",
      weight: "190",
      dailySteps: "8000",
      stepsDetails: "mostly from work, I'm a teacher, moderate intensity",
      exercise: "3x gym, 2x runs",
      exerciseDetails: "gym sessions 45 mins moderate, runs 30 mins light",
      goal: "lose weight and manage NAFLD",
      dietaryPreferences: "no seafood"
    }
  },
  {
    name: "Diabetes patient",
    responses: {
      healthConditions: "Type 2 diabetes",
      healthDetails: "managed with medication, 3 years",
      age: "55",
      gender: "female",
      height: "165cm",
      weight: "rather not say",
      dailySteps: "5000",
      stepsDetails: "casual walking, low intensity",
      exercise: "yoga twice a week",
      exerciseDetails: "1 hour sessions, light intensity",
      goal: "maintain weight and control blood sugar",
      dietaryPreferences: "vegetarian"
    }
  },
  {
    name: "No health conditions",
    responses: {
      healthConditions: "none",
      age: "28",
      gender: "female",
      height: "5'6",
      weight: "140",
      dailySteps: "12000",
      stepsDetails: "work as a nurse, high intensity on my feet all day",
      exercise: "crossfit 4x week",
      exerciseDetails: "1 hour intense workouts",
      goal: "gain muscle",
      dietaryPreferences: "none"
    }
  },
  {
    name: "Multiple conditions",
    responses: {
      healthConditions: "high cholesterol and hypertension",
      healthDetails: "both under control with diet",
      age: "48",
      gender: "male",
      height: "6 feet",
      weight: "210",
      dailySteps: "6500",
      stepsDetails: "office job but take walking breaks, low to moderate",
      exercise: "swimming 3 times",
      exerciseDetails: "45 minutes moderate intensity",
      goal: "lose weight",
      dietaryPreferences: "low sodium"
    }
  },
  {
    name: "User declines details",
    responses: {
      healthConditions: "heart disease",
      healthDetails: "move on",
      age: "60",
      gender: "male",
      height: "175cm",
      weight: "185",
      dailySteps: "4000",
      stepsDetails: "just daily activities, low intensity",
      exercise: "none",
      goal: "improve heart health",
      dietaryPreferences: "low fat"
    }
  }
];

// Questions flow
const questionFlow = [
  { id: 'healthConditions', question: "Do you have any health conditions?" },
  { id: 'age', question: "What's your age?" },
  { id: 'gender', question: "What's your biological gender?" },
  { id: 'height', question: "What's your height?" },
  { id: 'weight', question: "What's your weight?" },
  { id: 'dailySteps', question: "How many steps do you take daily?" },
  { id: 'exercise', question: "Do you exercise?" },
  { id: 'goal', question: "What's your main health goal?" },
  { id: 'dietaryPreferences', question: "Any dietary preferences?" }
];

async function simulateConversation(scenario, scenarioIndex) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Scenario ${scenarioIndex + 1}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const conversation = [];
  const conversationHistory = [];
  let userData = {};
  let currentQuestionIndex = 0;
  
  try {
    while (currentQuestionIndex < questionFlow.length) {
      const currentQuestion = questionFlow[currentQuestionIndex];
      
      // Get the appropriate response
      let userResponse = scenario.responses[currentQuestion.id];
      
      // Special handling for follow-up questions
      if (currentQuestion.id === 'healthConditions' && 
          scenario.responses.healthDetails && 
          userResponse !== 'none') {
        // First response about condition
        console.log(`Q${currentQuestionIndex + 1}: ${currentQuestion.question}`);
        console.log(`User: ${userResponse}`);
        
        // Send to AI
        const response = await fetch('http://localhost:3001/api/ai/assessment-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `test-${scenarioIndex}`,
            currentQuestion: currentQuestion,
            userResponse: userResponse,
            userData: userData,
            conversationHistory: conversationHistory
          })
        });
        
        const aiData = await response.json();
        console.log(`AI: ${aiData.aiResponse}`);
        
        conversation.push({
          question: currentQuestion.question,
          userResponse: userResponse,
          aiResponse: aiData.aiResponse,
          needsFollowUp: aiData.needsFollowUp
        });
        
        conversationHistory.push(
          { role: 'user', content: userResponse },
          { role: 'assistant', content: aiData.aiResponse }
        );
        
        // If AI asks for follow-up about health condition
        if (aiData.needsFollowUp) {
          userResponse = scenario.responses.healthDetails;
          console.log(`User (follow-up): ${userResponse}`);
          
          // Send follow-up response
          const followUpResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: `test-${scenarioIndex}`,
              currentQuestion: currentQuestion,
              userResponse: userResponse,
              userData: userData,
              conversationHistory: conversationHistory
            })
          });
          
          const followUpData = await followUpResponse.json();
          console.log(`AI: ${followUpData.aiResponse}`);
          
          conversation.push({
            question: "Follow-up",
            userResponse: userResponse,
            aiResponse: followUpData.aiResponse,
            needsFollowUp: followUpData.needsFollowUp
          });
          
          conversationHistory.push(
            { role: 'user', content: userResponse },
            { role: 'assistant', content: followUpData.aiResponse }
          );
        }
      } 
      // Similar handling for steps follow-up
      else if (currentQuestion.id === 'dailySteps' && scenario.responses.stepsDetails) {
        console.log(`Q${currentQuestionIndex + 1}: ${currentQuestion.question}`);
        console.log(`User: ${userResponse}`);
        
        // First response about steps
        const response = await fetch('http://localhost:3001/api/ai/assessment-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `test-${scenarioIndex}`,
            currentQuestion: currentQuestion,
            userResponse: userResponse,
            userData: userData,
            conversationHistory: conversationHistory
          })
        });
        
        const aiData = await response.json();
        console.log(`AI: ${aiData.aiResponse}`);
        
        conversation.push({
          question: currentQuestion.question,
          userResponse: userResponse,
          aiResponse: aiData.aiResponse,
          needsFollowUp: aiData.needsFollowUp
        });
        
        conversationHistory.push(
          { role: 'user', content: userResponse },
          { role: 'assistant', content: aiData.aiResponse }
        );
        
        // Follow-up about step details
        if (aiData.needsFollowUp) {
          userResponse = scenario.responses.stepsDetails;
          console.log(`User (follow-up): ${userResponse}`);
          
          const followUpResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: `test-${scenarioIndex}`,
              currentQuestion: currentQuestion,
              userResponse: userResponse,
              userData: userData,
              conversationHistory: conversationHistory
            })
          });
          
          const followUpData = await followUpResponse.json();
          console.log(`AI: ${followUpData.aiResponse}`);
          
          conversation.push({
            question: "Steps follow-up",
            userResponse: userResponse,
            aiResponse: followUpData.aiResponse,
            needsFollowUp: followUpData.needsFollowUp
          });
        }
      }
      // Similar for exercise follow-up
      else if (currentQuestion.id === 'exercise' && 
               scenario.responses.exerciseDetails && 
               userResponse !== 'none') {
        console.log(`Q${currentQuestionIndex + 1}: ${currentQuestion.question}`);
        console.log(`User: ${userResponse}`);
        
        const response = await fetch('http://localhost:3001/api/ai/assessment-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `test-${scenarioIndex}`,
            currentQuestion: currentQuestion,
            userResponse: userResponse,
            userData: userData,
            conversationHistory: conversationHistory
          })
        });
        
        const aiData = await response.json();
        console.log(`AI: ${aiData.aiResponse}`);
        
        conversation.push({
          question: currentQuestion.question,
          userResponse: userResponse,
          aiResponse: aiData.aiResponse,
          needsFollowUp: aiData.needsFollowUp
        });
        
        conversationHistory.push(
          { role: 'user', content: userResponse },
          { role: 'assistant', content: aiData.aiResponse }
        );
        
        // Exercise details follow-up
        if (aiData.needsFollowUp) {
          userResponse = scenario.responses.exerciseDetails;
          console.log(`User (follow-up): ${userResponse}`);
          
          const followUpResponse = await fetch('http://localhost:3001/api/ai/assessment-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: `test-${scenarioIndex}`,
              currentQuestion: currentQuestion,
              userResponse: userResponse,
              userData: userData,
              conversationHistory: conversationHistory
            })
          });
          
          const followUpData = await followUpResponse.json();
          console.log(`AI: ${followUpData.aiResponse}`);
          
          conversation.push({
            question: "Exercise follow-up",
            userResponse: userResponse,
            aiResponse: followUpData.aiResponse,
            needsFollowUp: followUpData.needsFollowUp
          });
        }
      }
      // Regular questions without follow-ups
      else {
        console.log(`Q${currentQuestionIndex + 1}: ${currentQuestion.question}`);
        console.log(`User: ${userResponse}`);
        
        const response = await fetch('http://localhost:3001/api/ai/assessment-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: `test-${scenarioIndex}`,
            currentQuestion: currentQuestion,
            userResponse: userResponse,
            userData: userData,
            conversationHistory: conversationHistory
          })
        });
        
        const aiData = await response.json();
        console.log(`AI: ${aiData.aiResponse}`);
        
        conversation.push({
          question: currentQuestion.question,
          userResponse: userResponse,
          aiResponse: aiData.aiResponse,
          needsFollowUp: aiData.needsFollowUp
        });
        
        conversationHistory.push(
          { role: 'user', content: userResponse },
          { role: 'assistant', content: aiData.aiResponse }
        );
      }
      
      currentQuestionIndex++;
    }
    
    return {
      scenario: scenario.name,
      success: true,
      conversation: conversation,
      totalExchanges: conversation.length
    };
    
  } catch (error) {
    return {
      scenario: scenario.name,
      success: false,
      error: error.message
    };
  }
}

async function runAllSimulations() {
  console.log('Starting conversation simulations...\n');
  const results = [];
  
  // Run only 5 scenarios for testing (you can increase to 20)
  for (let i = 0; i < Math.min(5, testScenarios.length); i++) {
    const result = await simulateConversation(testScenarios[i], i);
    results.push(result);
    
    // Small delay between conversations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results to file
  await fs.writeFile(
    'simulation-results.json', 
    JSON.stringify(results, null, 2)
  );
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SIMULATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total scenarios run: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  results.forEach(r => {
    console.log(`\n${r.scenario}: ${r.success ? '✅' : '❌'}`);
    if (r.success) {
      console.log(`  Total exchanges: ${r.totalExchanges}`);
      const followUps = r.conversation.filter(c => c.needsFollowUp).length;
      console.log(`  Follow-up questions: ${followUps}`);
    } else {
      console.log(`  Error: ${r.error}`);
    }
  });
  
  console.log('\nDetailed results saved to simulation-results.json');
}

// Run the simulations
runAllSimulations().catch(console.error);