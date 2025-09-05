#!/bin/bash

# SMS Gateway Test Cases - 20 diverse food logging scenarios
# Run against local SMS gateway to avoid Twilio costs

BASE_URL="http://localhost:3000/sms-webhook"
TEST_PHONE="+61423691622"  # Test phone number

echo "🧪 SMS Gateway Test Suite"
echo "========================="
echo ""

# Function to send SMS and display result
send_sms() {
    local test_num=$1
    local message=$2
    local description=$3
    
    echo "Test $test_num: $description"
    echo "Message: \"$message\""
    
    response=$(curl -s -X POST $BASE_URL \
        -d "From=$TEST_PHONE&Body=$message" \
        -H "Content-Type: application/x-www-form-urlencoded")
    
    echo "Response: $response"
    echo "---"
    echo ""
    sleep 1  # Prevent rate limiting
}

# CATEGORY 1: Simple Single Items
send_sms 1 "ate an apple" "Simple fruit"
send_sms 2 "had a banana" "Common snack"

# CATEGORY 2: Restaurant/Brand Items  
send_sms 3 "big mac" "Brand name item"
send_sms 4 "chipotle bowl with chicken" "Restaurant with details"

# CATEGORY 3: Ambiguous Sizes
send_sms 5 "had pizza" "No size specified"
send_sms 6 "ate a salad" "Vague description"

# CATEGORY 4: Multiple Items
send_sms 7 "burger and fries" "Two items together"
send_sms 8 "chicken salad and a coke" "Food and drink combo"

# CATEGORY 5: Drinks
send_sms 9 "coffee with oat milk" "Drink with modification"
send_sms 10 "large iced latte with 2 sugars" "Detailed drink order"

# CATEGORY 6: Quantities
send_sms 11 "3 tacos" "Multiple of same item"
send_sms 12 "half a sandwich" "Fractional portion"

# CATEGORY 7: Homemade/Generic
send_sms 13 "spaghetti bolognese" "Home cooked meal"
send_sms 14 "pb&j sandwich" "Common homemade item"

# CATEGORY 8: Typos and Misspellings
send_sms 15 "ate a borgur" "Typo in food name"
send_sms 16 "chickn cesar salad" "Multiple typos"

# CATEGORY 9: Time-based Context
send_sms 17 "breakfast was eggs and toast" "Past meal reference"
send_sms 18 "having dinner now, steak and veggies" "Current meal context"

# CATEGORY 10: Edge Cases
send_sms 19 "i ate some food" "Extremely vague"
send_sms 20 "2 slices of large pepperoni from dominos" "Very specific"

echo "✅ Test suite complete!"
echo ""
echo "Review the responses above for:"
echo "1. Confidence scoring accuracy"
echo "2. Follow-up question quality"
echo "3. Calorie estimation accuracy"
echo "4. Response formatting issues"
echo "5. Edge cases that break the flow"