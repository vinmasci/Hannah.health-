# Edge Case Fixes Implemented

## Completed Fixes

### 1. ✅ Missing Equals Pattern
**Fixed:** Added support for multiple separator patterns
- `"2 eggs - 140 calories"` (dash separator)
- `"eggs 140 calories"` (no separator)
- `"eggs: 140 calories"` (colon)
- Original equals pattern still supported

### 2. ✅ Minimum Calorie Rounding
**Fixed:** Ensures all foods have at least 1 calorie
- `"0.1 calorie mint"` → 1 calorie
- `"0.67 calorie grape"` → 1 calorie
- Prevents items from disappearing due to 0 calories

### 3. ✅ More Exercise Keywords
**Fixed:** Added comprehensive exercise detection
- Original: workout, walk, run, exercise, gym, min
- Added: burned, bike, swim, yoga, cardio, lifting, training
- Better detection of exercise vs food entries

### 4. ✅ Meal Type Mapping
**Fixed:** Non-standard meal types auto-map to standard ones
- `"brunch"` → lunch
- `"dessert"` → evening snack
- `"midnight snack"` → evening snack
- `"late night snack"` → evening snack
- `"appetizer"` → snack
- `"pre-workout"` → snack
- `"post-workout"` → snack
- `"tea time"` → afternoon snack

## Still Need Implementation

### 1. 📅 Date Selector
- Need UI for `< Today >` selector
- Allow logging to past dates
- Default to today

### 2. 🔢 Word Number Support
- "Two eggs" → Need NLP parsing
- "One hundred calories" → Need conversion
- Requires backend update (ChatGPT can handle)

### 3. ⚖️ Weight Unit Conversion
- Check user's metric preference in profile
- Auto-convert lbs → kg or kg → lbs
- Handle missing units gracefully

### 4. 🍽️ Multiple Food Items
- Split by commas/and
- Process each item separately
- Create multiple database entries

### 5. 🏃‍♂️🥚 Mixed Content (Exercise + Food)
- "30 min walk and 2 eggs"
- Split and create both types of entries
- Requires smarter parsing logic

### 6. 🌍 Special Characters
- Full Unicode support for accents (Café, Häagen-Dazs)
- Backend handles this if AI processes it

## Testing Recommendations

### Quick Tests to Run:
1. "2 eggs - 140 calories" (dash pattern)
2. "eggs 140 calories" (no separator)
3. "0.1 calorie water" (minimum calorie)
4. "brunch = 400 calories" (meal mapping)
5. "30 min bike ride = 200 calories" (new exercise keyword)
6. "dessert = 300 calories" (maps to evening snack)

### Expected Results:
- All should save successfully
- Exercise entries save as negative calories
- Non-standard meals map to correct categories
- Very small calories round to 1

## Code Changes Summary

### Files Modified:
- `LogView.swift`
  - Added 2 new extraction patterns
  - Added minimum calorie logic (max(1, ...))
  - Added 7 new exercise keywords
  - Added meal type mapping dictionary
  - Auto-maps non-standard meal types

### Next Priority:
1. Date selector UI
2. Multiple food item parsing
3. Weight unit conversion based on user preference