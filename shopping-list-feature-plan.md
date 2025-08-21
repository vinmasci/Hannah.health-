# Shopping List Feature Plan

## Overview
The shopping list is the **conversion moment** - where users realize they need Hannah.health. It appears as a live column that updates in real-time as users build their meal plan, creating an immediate "I need this" moment.

## Core Concept
- **Live Updates**: Shopping list builds automatically as meals are added
- **Visual Magic**: Users see ingredients aggregating in real-time
- **Conversion Hook**: The value is so obvious they want to save it
- **Supermarket Integration**: Match items to Coles/Woolies with real prices

## Phase 1: MVP (Week 1)
**Goal**: Basic working shopping list that creates the "aha" moment

### Visual Design
```
┌─────────────────────┐
│ 🛒 Shopping List    │
│─────────────────────│
│ Building your list..│
│                     │
│ ✓ Chicken 500g     │
│ ✓ Brown rice 1kg   │
│ ✓ Eggs x12         │
│ ✓ Spinach 200g     │
│ ✓ Greek yogurt 500g│
│                     │
│ 15 items total     │
│                     │
│ [Copy List] 📋      │
└─────────────────────┘
```

### Features
- Auto-aggregates ingredients from all meals
- Combines duplicates (2x chicken = 1kg chicken)
- Groups by category (Proteins, Produce, Dairy, Pantry)
- Basic quantity intelligence

### Technical Implementation
```javascript
// Real-time aggregation
function updateShoppingList() {
  const allMeals = getMealPlanItems();
  const ingredients = {};
  
  allMeals.forEach(meal => {
    meal.ingredients.forEach(item => {
      if (ingredients[item.name]) {
        ingredients[item.name].quantity += item.quantity;
      } else {
        ingredients[item.name] = {...item};
      }
    });
  });
  
  renderShoppingList(ingredients);
}

// Smart grouping
const categories = {
  proteins: ['chicken', 'beef', 'fish', 'eggs'],
  produce: ['lettuce', 'tomato', 'onion'],
  dairy: ['milk', 'yogurt', 'cheese'],
  pantry: ['rice', 'pasta', 'oil']
};
```

### CTA Strategy
**Free (No Signup):**
- View the list
- Manually copy items

**Soft CTA (Bottom of List):**
```
"Save this list?"
[Copy to Clipboard]
[Email to Me] ← Captures email
```

## Phase 2: Supermarket Integration (Week 2)
**Goal**: Add Coles/Woolies pricing and direct cart export

### Coles/Woolies API Integration
```javascript
// Using RapidAPI or web scraping
async function getColesPrices(items) {
  const priceData = await fetch('rapidapi.com/coles-prices', {
    headers: {'X-RapidAPI-Key': RAPID_API_KEY},
    body: JSON.stringify({items})
  });
  
  return priceData.map(item => ({
    name: item.name,
    colesMatch: item.matched_product,
    price: item.price,
    special: item.on_special,
    availability: item.in_stock
  }));
}
```

### Enhanced List Display
```
┌─────────────────────────┐
│ 🛒 Shopping List        │
│ Coles Prices (Est.)     │
│─────────────────────────│
│ Meat & Seafood          │
│ ✓ Chicken Breast 500g   │
│   RSPCA Approved - $7.50│
│ ✓ Salmon 400g          │
│   Tas Atlantic - $16.00 │
│                         │
│ Fruit & Veg            │
│ ✓ Broccoli 1 head      │
│   Fresh - $2.90        │
│                         │
│ Estimated Total: $67.40 │
│                         │
│ [Export to Coles] 🔴    │
│ [Export to Woolies] 🟢  │
└─────────────────────────┘
```

### Export Functionality
```javascript
// Generate Coles/Woolies compatible list
function exportToColes(shoppingList) {
  // Option 1: Deep link to Coles app
  const colesDeepLink = `colesapp://list/add?items=${encodedItems}`;
  
  // Option 2: Email format Coles understands
  const colesFormat = items.map(item => 
    `${item.quantity} x ${item.colesProductName}`
  ).join('\n');
  
  // Option 3: Copy in Coles search-friendly format
  return colesFormat;
}
```

### Pricing Accuracy Strategy
- Cache common items locally
- Update prices weekly via API
- Show "~" for estimates
- Include disclaimer "Prices approximate"

## Phase 3: Smart Features (Week 3)
**Goal**: Premium features that drive conversion

### Premium Features (Require Account)
```
FREE:
✓ See shopping list
✓ View estimated total
✓ Copy list manually

ACCOUNT FEATURES:
✓ Export to Coles/Woolies app
✓ Share list with partner
✓ Save lists for reuse
✓ Track price history
✓ Budget alerts
✓ Auto-order via partnership
```

### Smart Aggregation
```javascript
// Intelligent quantity combination
"500g chicken" + "300g chicken" = "800g chicken (2 packs)"
"2 onions" + "1 onion" = "3 onions"
"Greek yogurt" + "Greek yogurt" = "Greek yogurt x2 (500g tubs)"

// Brand preferences
if (user.prefersOrganic) {
  match to "Macro Organic Chicken"
} else {
  match to "Coles RSPCA Chicken"
}
```

### Partner Sharing
```
"Share with household?"
- Send to partner's WhatsApp
- Sync between accounts
- Split shopping (you get dairy, they get produce)
```

## Phase 4: Advanced Integration (Month 2)
**Goal**: Become indispensable shopping tool

### Direct Supermarket Partnership
- Official Coles/Woolies API access
- Real-time stock levels
- Actual pricing (not estimates)
- Direct "Add to Cart" functionality
- Delivery slot booking

### Budget Management
```
Budget: $100/week
Current list: $67
Remaining: $33

Suggestions:
- Swap salmon for chicken: Save $8
- Buy homebrand rice: Save $3
```

### Meal Prep Integration
```
Sunday Prep List:
□ Cook rice (3 cups)
□ Grill chicken (1kg)
□ Chop vegetables
□ Make overnight oats x5
```

## Conversion Metrics

### Success Indicators
- **Engagement**: 80% of users who create meal plan view shopping list
- **Soft Conversion**: 40% copy or interact with list
- **Email Capture**: 25% email list to themselves
- **Account Creation**: 15% create account to save
- **Premium**: 5% upgrade for Coles/Woolies export

### A/B Testing
**Test 1: CTA Placement**
- A: CTA at bottom of list
- B: CTA appears after 10+ items
- C: Floating CTA always visible

**Test 2: Value Prop**
- A: "Save your list"
- B: "Get prices from Coles"
- C: "Share with partner"

**Test 3: Friction**
- A: Email only
- B: WhatsApp number only
- C: Choice of email/WhatsApp/Google

## Technical Requirements

### APIs Needed
1. **RapidAPI** - Coles/Woolies prices
2. **OpenAI** - Ingredient parsing
3. **Twilio** - WhatsApp/SMS sending

### Database Schema
```sql
shopping_lists:
- id
- user_id
- meal_plan_id
- items (JSONB)
- total_estimated
- created_at
- shared_with[]

shopping_list_items:
- id
- list_id
- item_name
- quantity
- unit
- category
- coles_product_id
- woolies_product_id
- estimated_price
```

## Implementation Priority

### Week 1 Sprint
1. ✅ Basic list aggregation
2. ✅ Real-time updates
3. ✅ Copy to clipboard
4. ✅ Email capture CTA

### Week 2 Sprint
1. ⏳ Coles API integration
2. ⏳ Price estimates
3. ⏳ Category grouping
4. ⏳ Export formatting

### Week 3 Sprint
1. ⏳ Account creation flow
2. ⏳ List saving
3. ⏳ Partner sharing
4. ⏳ WhatsApp integration

## The Magic Moment

**User Flow:**
1. Drags "Chicken Stir Fry" to Tuesday
2. Sees "Chicken 300g" appear in shopping list
3. Adds "Beef Tacos" to Wednesday  
4. Sees list update with "Beef mince 500g"
5. Realizes: "This is building my exact shopping list!"
6. Sees total: "$67 at Coles"
7. Thinks: "I need this every week"
8. Clicks: "Save list for Coles"
9. Converted to user

## ROI Calculation

**Development Cost**: ~40 hours ($4,000)

**Value Created:**
- 15% conversion improvement = 150 extra users/month
- At $4.99/month = $750/month revenue
- Payback period: 5.3 months
- Year 1 ROI: $5,000 profit

**This feature literally pays for itself.**

## Related Documents
- `user-experience-unified.md` - Overall UX flow
- `whatsapp-integration.md` - WhatsApp list sending
- `database_documentation.md` - Shopping list storage