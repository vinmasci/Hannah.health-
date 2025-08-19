# Hannah.health User Lifecycle Document
## From First Visit to Daily Use

---

## 🎯 Core Philosophy
- **Not a silver bullet** - A supportive tool alongside professional care
- **No drama** - Honest, authentic stories without overselling
- **Progressive disclosure** - Only ask what we need, when we need it
- **Safety first** - Especially for ED recovery users

---

## 🚪 Entry Point: Landing Page

### Visual Design
- **Style:** Warm & welcoming with soft colors and rounded edges (Headspace-inspired)
- **Interaction:** Card selection interface for choices
- **Feel:** Safe, approachable, non-clinical

### Hero Section
```
Hannah.health
Meal planning that supports your health journey, not a quick fix

"What brought you here today?"

[Three beautiful cards to select from:]

Card 1: "I'm managing a medical condition"
🏥 Soft blue gradient, medical icon

Card 2: "I want to improve my relationship with food"  
🌱 Soft green gradient, growth icon

Card 3: "I want to eat healthier"
🌟 Soft yellow gradient, star icon
```

### Our Story Section (Below the Fold)

#### Two-Column Layout: "Him" | "Her"

**[HIS STORY]**
> "I was the fitness guy - endurance cycling, always active. Then Hannah became pregnant, life got beautifully busy, and I stopped paying attention. In just 9 months, my liver inflammation markers tripled. Only 8kg heavier, but suddenly diagnosed with NAFLD.
>
> The shock was my wake-up call. I didn't want a fad diet - I wanted to change how I approached food for life. I built this app to be the companion I needed."

**[HER STORY]**
> "My relationship with food has been complicated. It's still a daily choice, and it's never perfect, but with the right support it gets a little easier every day.
>
> This isn't a magic solution - I have a team: doctors, nutritionist, therapist. But having a meal planning tool that doesn't trigger me, that focuses on nourishment over numbers? That's one less battle to fight."

### Trust Statement
> "Hannah isn't a replacement for medical care. It's a tool designed to support the guidance from your healthcare team."

---

## 🛤️ User Journey Scenarios

### Scenario 1: NAFLD Patient (Like "Him")

#### Entry Flow
1. **Lands on homepage** → Reads "His Story" → Relates to the sudden diagnosis
2. **Clicks:** "Start with a simple question: What brought you here today?"
3. **Selects:** "I was recently diagnosed with a medical condition"
4. **Asked:** "Which condition?" → Selects NAFLD
5. **Shown:** "We understand. Let's focus on what matters for liver health."

#### Onboarding Questions (Medical Path)
```javascript
questions: [
  {
    q: "What brought you here today?",
    a: "I'm managing a medical condition"
  },
  {
    q: "Could you tell us a bit more? (in your own words)",
    type: "text_input",
    placeholder: "e.g., 'My doctor said I have fatty liver' or 'High cholesterol and pre-diabetic'",
    ai_analysis: true,
    // AI detects: NAFLD, diabetes, cholesterol, etc. from natural language
  },
  {
    q: "Have you received dietary guidance from your doctor?",
    options: ["Yes, I have a plan to follow", "Some general advice", "Not yet"]
  },
  {
    q: "What's your biggest challenge right now?",
    options: [
      "Understanding what I can eat",
      "Planning meals that fit my restrictions",
      "Staying motivated with the changes",
      "Tracking the right nutrients"
    ]
  },
  {
    q: "How do you prefer to approach changes?",
    options: [
      "Gradual adjustments over time",
      "Complete fresh start",
      "Following my doctor's plan exactly"
    ]
  }
]
```

#### First Experience
- **Dashboard:** Clean, medical-focused view
- **Highlighted:** Liver-friendly meals, Mediterranean options
- **Tracking:** Shows relevant markers (fiber, saturated fat limits)
- **Hidden:** Weight loss language, before/after imagery
- **First task:** "Let's plan your first liver-friendly day"

#### Daily Use Pattern
- Morning: Check daily meal plan
- Meals: Quick-add or swap meals
- Evening: Optional symptom/energy logging
- Weekly: Review progress (non-weight victories)

---

### Scenario 2: ED Recovery (Like "Her")

#### Entry Flow
1. **Lands on homepage** → Reads "Her Story" → Feels understood
2. **Clicks:** "Start with a simple question: What brought you here today?"
3. **Selects:** "I want to improve my relationship with food"
4. **Asked:** "Would you like to see nutrition numbers?"
5. **Selects:** "No, I prefer to focus on balance without numbers"
6. **Shown:** "Perfect. Let's focus on nourishment and variety."

#### Onboarding Questions (ED Recovery Path)
```javascript
questions: [
  {
    q: "What brought you here today?",
    a: "I want to improve my relationship with food"
  },
  {
    q: "Would you like to see nutrition numbers?",
    a: "No, I prefer to focus on balance without numbers",
    note: "This immediately sets ED-safe mode"
  },
  {
    q: "What would help you most?",
    options: [
      "Regular meal reminders",
      "Meal ideas without pressure",
      "Celebrating food variety",
      "Gentle structure"
    ]
  },
  {
    q: "Do you have support from:",
    options: [
      "Treatment team",
      "Nutritionist/Dietitian", 
      "Therapist",
      "I'm building my support system"
    ],
    note: "Reinforces that we're part of support, not replacement"
  }
]
```

#### First Experience
- **Dashboard:** Colorful, peaceful, no numbers
- **Focus:** Meal variety, colors, food groups
- **Language:** "Nourishment," "satisfaction," "energy"
- **Hidden:** ALL numbers, weights, calories, macros
- **First task:** "Let's explore some nourishing meal ideas"

#### Daily Use Pattern
- Morning: Gentle meal suggestions
- Meals: Focus on variety and satisfaction
- Evening: Mood/energy check-in (no food guilt)
- Weekly: Celebrate variety achievements

---

### Scenario 3: General Wellness User

#### Entry Flow
1. **Clicks:** "Start with a simple question: What brought you here today?"
2. **Selects:** "I want to eat healthier"
3. **Asked:** "What's your main goal?"
4. **Options:** Balanced nutrition / More energy / Athletic performance / Just curious

#### Onboarding Questions (Wellness Path)
```javascript
questions: [
  {
    q: "What brought you here today?",
    a: "I want to eat healthier"
  },
  {
    q: "What's your main focus?",
    options: [
      "Balanced nutrition",
      "More energy",
      "Athletic performance",
      "Preventive health"
    ]
  },
  {
    q: "How do you like to track progress?",
    options: [
      "Detailed metrics",
      "Simple trends",
      "Just meal planning",
      "Energy and mood"
    ]
  },
  {
    q: "Any dietary preferences?",
    options: [
      "No restrictions",
      "Vegetarian/Vegan",
      "Gluten-free",
      "Other"
    ]
  }
]
```

#### First Experience
- **Dashboard:** Balanced view with optional metrics
- **Choice:** Can toggle numbers on/off anytime
- **Focus:** Sustainable habits, variety
- **First task:** "Let's create your first balanced meal plan"

---

## 🔄 Lifecycle Stages

### 1. Discovery (Day 0)
- Find Hannah through: Google search, doctor recommendation, social media
- Read stories → Feel understood → Start with simple question

### 2. Onboarding (Day 1)
- Answer 4-5 questions max
- Get personalized setup
- Plan first meal/day
- Success: User completes first meal plan

### 3. Activation (Days 2-7)
- Daily login to check meals
- Make first meal swap
- Try shopping list feature
- Success: User uses app 3+ days in first week

### 4. Habit Formation (Weeks 2-4)
- Regular meal planning routine
- Customize preferences
- Build favorite meals library
- Success: Weekly planning becomes routine

### 5. Retention (Month 2+)
- Track progress (condition-appropriate)
- Adjust goals with healthcare team
- Share wins (non-weight victories)
- Success: Continued engagement

### 6. Advocacy (Month 3+)
- Share with doctor
- Recommend to support groups
- Provide testimonial
- Success: Organic referrals

---

## 🚫 What We DON'T Do

### Never on Landing Page:
- Weight loss promises
- Before/after photos
- Calorie counting emphasis
- "Quick fix" language
- Diet culture messaging

### Never in Onboarding:
- Ask for weight (unless medical user requests)
- Show ideal body images
- Create food fear
- Promise specific results
- Rush through safety settings

### Never in Daily Use:
- Shame for missed days
- Comparative metrics
- Restrictive language
- Unsolicited weight tracking
- Break trust with ED users

---

## 🩸 Blood Test Integration (Medical Path Only)

### When Introduced
After initial onboarding, once trust is established:
- **Day 3-7:** "Would you like to track your health markers?"
- **Optional:** Never forced, always skippable

### Supported Markers

#### NAFLD Primary Markers
```
Liver Function:
- ALT (Alanine Aminotransferase)
- AST (Aspartate Aminotransferase)  
- GGT (Gamma-Glutamyl Transferase)
- Alkaline Phosphatase

Metabolic:
- Fasting Glucose
- HbA1c
- Insulin
- HOMA-IR (calculated)

Lipids:
- Triglycerides
- HDL Cholesterol
- LDL Cholesterol
- Total Cholesterol

Inflammation:
- CRP (C-Reactive Protein)
- Ferritin
```

### Input Methods

#### Phase 1: Manual Entry (Launch)
```
Simple, clean form:
Test Date: [Date picker]

Liver Function:
ALT: [___] U/L  (Normal: 7-56)
AST: [___] U/L  (Normal: 10-40)

Metabolic:
Glucose: [___] mg/dL  (Normal: 70-100)
HbA1c: [___] %  (Normal: <5.7)

[Save Results] [Skip for Now]
```

#### Phase 2: Photo Upload (3-6 months)
```
"Take a photo of your lab report"
[Camera icon]
    ↓
AI extracts values
    ↓
"Please confirm these values:"
ALT: [45] ← extracted, editable
AST: [38] ← extracted, editable
    ↓
[Confirm & Save]
```

**Implementation:**
- Use Google Vision API or AWS Textract
- Train on common lab report formats
- Always allow manual correction
- Store photo for reference

### Smart Features

#### Trend Analysis
```
"Your ALT has decreased 35% over the last 3 months"
"This coincides with your increased fiber intake"
```

#### Meal Recommendations
```
High Triglycerides (>150):
→ Suggest: Omega-3 rich meals (salmon, walnuts)
→ Reduce: Simple carbohydrate options
→ Highlight: Mediterranean choices

Elevated ALT (>40):
→ Increase: Antioxidant-rich foods
→ Feature: Liver-supporting meals
→ Limit: Processed food options
```

#### Progress Correlation
- Show blood work trends alongside dietary adherence
- Highlight potential connections (not causation)
- Export reports for doctors

### Safety & Privacy

#### Medical Disclaimers
```
"This feature tracks your lab values for personal reference only.
Hannah does not provide medical interpretation or diagnosis.
Always consult your healthcare provider about your results."
```

#### Data Security
- Encrypted storage
- HIPAA-compliant infrastructure
- Never shared without explicit consent
- Easy data deletion

### UI/UX for Blood Tests

#### Dashboard Widget (Medical Users)
```
[Your Health Markers]
Last Updated: Jan 15, 2025

ALT: 32 ↓ (down from 45)
Triglycerides: 140 ↓ (down from 180)
HbA1c: 5.4 → (stable)

[Update Values] [View Trends]
```

#### Trends View
- Beautiful charts showing progress
- Overlay with dietary changes
- Highlight improvements in green
- Show target ranges

---

## 📱 Key Screens Flow

```
Landing Page
    ↓
"What brought you here today?"
    ↓
[Medical] → [ED Recovery] → [Wellness]
    ↓           ↓              ↓
Condition    Safe Mode     Goal Select
    ↓           ↓              ↓
Onboard      Onboard       Onboard
    ↓           ↓              ↓
Dashboard    Dashboard     Dashboard
(medical)    (no numbers)  (balanced)
```

---

## 🎯 Success Metrics by User Type

### NAFLD Users
- Consistent meal planning (3+ days/week)
- Improved nutrition markers understanding
- Confidence in food choices
- Positive healthcare provider feedback

### ED Recovery Users
- Regular nourishment without numbers
- Increased food variety
- Reduced meal anxiety
- No triggering experiences reported

### Wellness Users
- Sustainable habit formation
- Energy improvement tracking
- Balanced nutrition achievement
- Long-term retention

---

## 💬 Key Messaging by Stage

### Landing Page
> "Start with a simple question: What brought you here today?"

### After Selection
- Medical: "Let's focus on what matters for your health"
- ED Recovery: "Let's focus on nourishment, not numbers"
- Wellness: "Let's build sustainable healthy habits"

### Daily Use
- Medical: "Your liver-friendly meals for today"
- ED Recovery: "Today's nourishing options"
- Wellness: "Your balanced day ahead"

### Progress
- Medical: "Your health markers are improving"
- ED Recovery: "Celebrating your food variety"
- Wellness: "Your energy levels this week"

---

## 🔐 Safety Gates

### ED Recovery Protection
1. Question 2 immediately sets safe mode
2. Numbers hidden permanently unless user changes
3. No weight-related features ever shown
4. Special language filters applied
5. Can't accidentally see triggering content

### Medical Accuracy
1. Disclaimers about medical advice
2. Encourage healthcare team consultation
3. Evidence-based recommendations only
4. No extreme restrictions suggested
5. Regular prompts to check with doctor

---

## 📊 Personas Quick Reference

### "Like Him" - NAFLD Patient
- **Age:** 30-50
- **Trigger:** Recent diagnosis
- **Need:** Practical meal planning
- **Fear:** Disease progression
- **Win:** Improved liver markers

### "Like Her" - ED Recovery
- **Age:** 20-40
- **Trigger:** Want peace with food
- **Need:** Safe meal planning
- **Fear:** Being triggered
- **Win:** Consistent nourishment

### "General Wellness" - Preventive Health
- **Age:** 25-45
- **Trigger:** Want better energy
- **Need:** Simple healthy habits
- **Fear:** Complicated diets
- **Win:** Sustainable changes

---

## 🚀 Implementation Priority

### Phase 1: Core Landing & Onboarding
1. Landing page with stories
2. "What brought you here" flow
3. Three path onboarding
4. Basic dashboards

### Phase 2: Personalization
1. Condition-specific features
2. ED-safe mode complete
3. Progress tracking
4. Meal customization

### Phase 3: Retention Features
1. Shopping lists
2. Healthcare provider reports
3. Community features
4. Mobile app

---

*Last Updated: January 2025*
*Version: 1.0*