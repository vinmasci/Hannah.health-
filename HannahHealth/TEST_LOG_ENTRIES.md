# Test Log Entries - Edge Cases and Error Detection

## Test Categories

### 1. Decimal Calorie Values
- ✅ "1 grape = 0.67 calories" - Should round to 1
- ✅ "Half a banana = 52.5 calories" - Should round to 53
- ✅ "1/4 cup almonds = 132.25 calories" - Should round to 132

### 2. Meal + Snack Combinations
- ✅ Breakfast + Snack → Should create "breakfast" and "morning snack" entries
- ✅ Lunch + Snack → Should create "lunch" and "afternoon snack" entries  
- ✅ Dinner + Snack → Should create "dinner" and "evening snack" entries

### 3. Range Values
- ✅ "2 eggs = 140-160 calories" - Should average to 150
- ✅ "Salad = 200-300 calories" - Should average to 250

### 4. Approximate Values
- ✅ "Apple = approximately 95 calories" - Should extract 95

### 5. Exercise Entries
- ✅ "30 min walk = 120 calories burned" - Should save as -120 calories
- ✅ "45 minute run = 450 calories burned" - Should save as -450
- ✅ "Gym workout = 300 calories burned" - Should save as -300

### 6. Edge Cases to Test

#### Numeric Edge Cases
1. "0.1 calorie mint" - Very small decimal
2. "10000 calorie challenge meal" - Very large number
3. "Negative calories celery" - Confusing phrasing
4. "Zero calorie soda" - Zero value
5. "1/3 cup rice = 68.33333 calories" - Repeating decimal

#### Text Parsing Edge Cases
6. "2 eggs (140 cal), toast (80 cal)" - Multiple items in one message
7. "Breakfast: eggs = 140, bacon = 120, toast = 80" - Multiple with commas
8. "For lunch I had: soup = 200 cal and salad = 150 cal" - Natural language
9. "eggs 140 calories" - Missing equals sign
10. "2 eggs - 140 calories" - Dash instead of equals

#### Special Characters
11. "Café latte = 190 calories" - Accented characters
12. "Ben & Jerry's = 270 calories" - Ampersand
13. "M&M's = 240 calories" - Apostrophe and ampersand
14. "Häagen-Dazs = 290 calories" - Umlaut and hyphen
15. "1/2 & 1/2 creamer = 40 calories" - Fractions and ampersand

#### Time-Based Edge Cases
16. "Yesterday's dinner = 600 calories" - Past reference
17. "Tomorrow's breakfast = 400 calories" - Future reference
18. "Late night snack = 200 calories" - Time descriptor
19. "Early morning coffee = 50 calories" - Time descriptor
20. "Midnight snack = 150 calories" - Specific time

#### Weight Entry Edge Cases
21. "For weight: 78.5kg" - Decimal weight
22. "Weight update: 172.3 lbs" - Pounds (should convert?)
23. "Current weight 78 kilograms" - Full word
24. "I weigh 78.2" - No unit specified
25. "Weight: 78kg, body fat: 15%" - Multiple metrics

#### Meal Type Confusion
26. "Brunch = 450 calories" - Not a standard meal type
27. "Tea time snack = 100 calories" - British meal time
28. "Appetizer = 200 calories" - Course type
29. "Dessert = 300 calories" - Course type
30. "Pre-workout = 150 calories" - Fitness timing

#### Mixed Content
31. "30 min walk and 2 eggs = 140 calories" - Exercise + food
32. "Burned 200 calories, ate 300 calories" - Both in one message
33. "Net calories: ate 500, burned 200" - Net calculation
34. "Total intake minus exercise = 300" - Math expression
35. "Calorie balance: +200" - Balance notation

#### Error-Prone Inputs
36. "Two and a half eggs = 175 calories" - Word numbers
37. "Eggs = one hundred forty calories" - Word calories
38. "🥚🥚 = 140 calories" - Emoji input
39. "Eggs = 140 cal (approx)" - Parenthetical note
40. "Eggs = 140 calories*" - Asterisk notation

## Expected Errors/Issues

### Likely to Fail:
1. **Word numbers** (#36, #37) - Regex won't match spelled-out numbers
2. **Multiple items** (#6, #7, #8) - Only extracts first item
3. **Missing equals** (#9, #10) - Pattern mismatch
4. **Non-standard meal types** (#26-30) - Will default to time-based or "snack"
5. **Mixed exercise/food** (#31-35) - Confusion in categorization
6. **Emoji input** (#38) - Won't extract food name properly
7. **Unit conversion** (#22) - No pounds to kg conversion
8. **Net calculations** (#33-35) - Won't understand complex math

### Potential Database Issues:
1. **Very long food names** - Might exceed column length
2. **Special characters** - Could cause encoding issues
3. **NULL meal types** - Exercise entries might fail if not handled

### UI Display Issues:
1. **Very small calories** (0.1) - Might round to 0 and not display
2. **Very large calories** (10000) - Might overflow display
3. **Long food names** - Could break layout
4. **Special characters** - Might not render correctly

### Logic Issues:
1. **Time references** (#16-20) - Won't adjust date, will log as "today"
2. **Course types** (#28-29) - No proper categorization
3. **Fitness timing** (#30) - Won't map to standard meal types
4. **Balance notations** (#35) - Won't understand net concepts