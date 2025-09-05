# Hannah Health Goals & Calorie System

**Created**: January 30, 2025  
**Status**: Fully Implemented  
**Location**: `/Features/Dashboard/Modules/DailyGoalSelector.swift`

## Overview
Dynamic goal-based calorie system that adjusts daily targets based on user's objectives, medical conditions, and activity level.

## Goal Types

### 1. Lose Weight
Users select from three sustainable weight loss rates:
- **Gentle**: 0.25 kg/week (-275 cal/day deficit)
- **Moderate**: 0.5 kg/week (-550 cal/day deficit) 
- **Aggressive**: 0.75 kg/week (-825 cal/day deficit)

*Note: Maximum safe rate limited to 0.75 kg/week*

### 2. Maintain Weight
- No deficit or surplus
- Eat at TDEE (Total Daily Energy Expenditure)
- Focus on consistent intake

### 3. Build Muscle
- +300 calorie daily surplus
- High protein focus
- Supports strength training goals

### 4. Medical Recovery
- +200 calorie daily surplus
- High protein + high calorie
- For post-surgery or illness recovery

### 5. Manage Condition
Condition-specific calorie adjustments:
- **Diabetes**: Maintenance (blood sugar stability)
- **NAFLD**: -275 cal deficit (gentle weight loss)
- **PCOS**: -275 cal deficit (low carb focus)
- **Kidney Disease**: Maintenance (limited protein)
- **Heart Disease**: Maintenance (low sodium)
- **IBS/IBD**: Maintenance (trigger tracking)

### 6. Intuitive Eating
- No calorie targets shown
- Focus on hunger cues
- For ED recovery or mindful eating

## TDEE Calculation *(Updated Session 18)*

### BMR (Basal Metabolic Rate)
Using Mifflin-St Jeor Equation:
```
Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
```

### Activity-Based TDEE Formula (NEW)
**No longer using generic multipliers!** Instead, we calculate from actual activity:

```
TDEE = BMR + Steps + Exercise + TEF + NEAT
```

Where:
- **BMR**: Basal Metabolic Rate (calculated above)
- **Steps**: Actual step count × 0.04 calories per step
- **Exercise**: Active energy from HealthKit (with deduplication)
- **TEF**: Thermic Effect of Food = 10% of consumed calories
- **NEAT**: Non-Exercise Activity Thermogenesis = 20% of BMR

### Smart Exercise Deduplication
Prevents double-counting when running with phone + fitness tracker:

```swift
if exerciseCalories > 0 {
    // Estimate steps that came from exercise
    let minutesOfExercise = exerciseCalories / 10.0
    let stepsFromExercise = minutesOfExercise * 120
    
    // Only count non-exercise steps
    let nonExerciseSteps = max(0, totalSteps - stepsFromExercise)
    stepCalories = nonExerciseSteps * 0.04
}
```

### Daily Target Calculation
```
Daily Target = TDEE + Goal Adjustment

Where Goal Adjustment:
- Lose Weight: -275 to -825 calories
- Maintain: 0 calories
- Build Muscle: +300 calories
- Medical Recovery: +200 calories
```

### Activity Level Reference (Legacy)
*Note: We still show activity levels for user understanding, but don't use multipliers*

| Level | Steps/Day | Description |
|-------|-----------|-------------|
| Sedentary | < 5,000 | Office work, minimal movement |
| Lightly Active | 5,000-7,500 | Some walking, light activity |
| Moderately Active | 7,500-10,000 | Regular walking, active lifestyle |
| Very Active | 10,000-12,500 | Very active job or regular exercise |
| Extremely Active | > 12,500 | Athlete or physical labor |

## User Interface

### Dashboard Integration
- Goal selector appears below calorie panel
- One-tap access to change goals
- Immediate visual feedback
- Shows current goal and calorie target

### Visual Design
```
┌─────────────────────────────┐
│ 🎯 Daily Goal    [▼]        │
│                              │
│ [Lose Weight ▼]              │
│                              │
│ Weight Loss Rate:            │
│ ○ 0.25 kg/week (-275)        │
│ ● 0.5 kg/week (-550)         │
│ ○ 0.75 kg/week (-825)        │
└─────────────────────────────┘
```

### Calorie Panel Updates
```
Your TDEE: 2,145 [ℹ]
0.5 kg/week: -550
──────────────────
Daily Target: 1,595
Food: -1,200
Exercise: +250
──────────────────
Remaining: 645
```

### TDEE Info Expansion
When [ℹ] is tapped:
```
What is TDEE?
Total Daily Energy Expenditure
The total calories you burn per day

BMR (Basal Metabolic Rate)
Calories burned at complete rest
Your BMR: 1,384 cal/day

Your Activity Level
Moderately Active (7.5-10k steps)
Based on: 8,500 steps, 30 min exercise

TDEE = BMR × Activity
2,145 cal/day
```

## Implementation Details

### DashboardViewModel
```swift
@Published var selectedGoal: DailyGoalType = .loseWeight
@Published var weightLossRate: WeightLossRate = .moderate
@Published var selectedCondition: MedicalCondition = .diabetes

func calculateBMR() {
    // Uses actual user profile data
    // Weight, height, age, gender
}

func updateCalorieTarget() {
    // Adjusts based on selected goal
    // Updates daily deficit/surplus
}
```

### Data Flow
1. User selects goal → `selectedGoal` updates
2. `updateCalorieTarget()` recalculates deficit
3. `dailyCalorieTarget` computed property updates
4. UI reflects new target immediately
5. All dependent calculations update

## Medical Considerations

### Safe Weight Loss
- Maximum 0.75 kg/week (1.65 lbs)
- Prevents muscle loss
- Sustainable long-term

### Recovery Modes
- Medical Recovery: High calorie + protein
- ED Safe Mode: Hides all numbers
- Intuitive Eating: No targets

### Condition-Specific
Each medical condition has tailored:
- Calorie targets
- Macro focus
- Tracking priorities

## Future Enhancements

### Phase 1 (Next Sprint)
- Weekly activity averaging
- Exercise type logging
- Custom activity level override

### Phase 2
- AI meal suggestions based on target
- Automatic goal adjustment based on progress
- Macro targets by goal type

### Phase 3
- Integration with meal planning
- Shopping list adjustments
- Recipe recommendations

## Testing Checklist

- [x] Goal selector appears on dashboard
- [x] Calorie target updates on goal change
- [x] Weight loss rates calculate correctly
- [x] Medical conditions apply proper adjustments
- [x] TDEE explanation shows accurate data
- [x] Activity level reflects user data
- [x] BMR calculation matches formula
- [x] All goal types function properly

## Known Issues

None currently - system fully functional

---

*Last Updated: January 30, 2025 - Session 16*
*Next Priority: Weekly activity averaging*