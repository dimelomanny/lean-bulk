/* Lean Bulk: two-week grocery list view (add-on). Self-contained: it does not touch the meal plan data or app.js state. */
(function () {
  'use strict';
  // Item: [name, plan uses (A+B), buy, when, trip1 qty, trip2 qty, unit price $, unit, source, flags]
  // source: 'W' = Walmart.com listed price looked up Oct 2026 (Lake Nona Walmart #4365 is 2.4 mi from Concorde); 'E' = estimate
  // flags: s = one-time pantry staple 🧂, f = freeze if bought early ❄️, o = optional (not in totals)
  const SECTIONS = [
    ['Produce', [
      ['Bananas', '2,360 g ≈ 20 medium (A 9, B 11)', '~10 bananas each trip', 'T1 + T2', 10, 10, 0.25, 'each', 'W', ''],
      ['Apples', '3 medium (A 2, B 1)', '3 apples', 'T1 (2) + T2 (1)', 2, 1, 0.80, 'each', 'E', ''],
      ['Blueberries', '450 g ≈ 3 cups (225 g/week)', '1 pint (~11–12 oz) each week', 'T1 + T2', 1, 1, 2.97, 'pint', 'W', ''],
      ['Strawberries', '400 g (200 g/week)', '1 lb clamshell each week (about half used)', 'T1 + T2', 1, 1, 2.67, '1-lb box', 'W', ''],
      ['Grapes', '300 g ≈ 2 cups (1 cup/week)', '~1 lb bunch, or 1/2 lb each trip', 'Either', 0.5, 0.5, 2.48, 'lb', 'E', ''],
      ['Pineapple chunks', '660 g ≈ 4 cups (2 cups/week)', '1 × 16-oz cut-pineapple tub each week (or 2 × 20-oz cans in juice, drained)', 'T1 + T2', 1, 1, 4.48, '16-oz tub', 'E', ''],
      ['Broccoli florets', '1,040 g ≈ 2.3 lb (A 560 g, B 480 g)', '~1.25 lb each week (e.g., 2 × 12-oz bags of florets)', 'T1 + T2', 2, 2, 2.47, '12-oz bag', 'W', ''],
      ['Asparagus', '220 g ≈ 15 spears (A 6–7, B 8)', '1 small bunch each week', 'T1 + T2', 1, 1, 2.98, 'bunch', 'E', ''],
      ['Green beans', '200 g ≈ 2 cups (Sun Nov 1 + Sat Nov 7)', '1 × 12-oz bag of trimmed beans', 'T2 (if Trip 2 is the morning of Sun Nov 1) or T1', 0, 1, 2.48, '12-oz bag', 'E', ''],
      ['Bell peppers', '360 g ≈ 2.5 peppers (A 160 g, B 200 g)', '3 peppers', 'T1 (1) + T2 (2)', 1, 2, 0.98, 'each', 'E', ''],
      ['Yellow onion', '170 g ≈ 1.5 medium', '2 medium (or a 2–3 lb bag 🧂)', 'Either', 2, 0, 0.75, 'each', 'E', ''],
      ['Garlic', '27 g ≈ 9 cloves', '1 head', 'T1', 1, 0, 0.58, 'head', 'E', ''],
      ['Lemons', '45 g juice = 3 tbsp + optional squeeze for tuna', '2 lemons (or a bottle of lemon juice 🧂)', 'T1 + T2', 1, 1, 0.68, 'each', 'E', ''],
      ['Romaine', '50 g (1 leaf + 1/2 cup shredded)', '1 romaine heart each trip', 'T1 + T2', 1, 1, 1.25, 'heart', 'E', ''],
      ['Tomato', '50 g (1 slice + 1/4 cup diced)', '2 Roma tomatoes, 1 each trip', 'T1 + T2', 1, 1, 0.30, 'each', 'E', ''],
      ['Cucumber', '240 g (A 80 g, B 160 g)', '2 cucumbers, 1 each trip', 'T1 + T2', 1, 1, 0.78, 'each', 'E', ''],
      ['Baby carrots', '280 g (A 80 g, B 200 g)', '1 × 1-lb bag', 'T1', 1, 0, 1.28, '1-lb bag', 'E', ''],
      ['Baby spinach', '150 g (Week B only)', '1 × 6–10 oz bag (a 5-oz box is 8 g short)', 'T2', 0, 1, 2.98, 'bag', 'E', ''],
      ['Russet potato', '150 g (1 small, Sat Oct 31)', '1 small russet', 'T1', 1, 0, 0.50, 'each', 'E', ''],
      ['Red potatoes', '450 g ≈ 1 lb (Sun Nov 1, Sat Nov 7)', '1 × 1.5-lb bag', 'T1', 1, 0, 2.97, '1.5-lb bag', 'E', '']
    ]],
    ['Meat & Seafood', [
      ['Chicken breast, boneless skinless', '1,135 g ≈ 2.5 lb (A 695 g, B 440 g)', '~1.6 lb on Trip 1 + ~1 lb on Trip 2 (or one 2.5–3 lb family pack ❄️)', 'T1 + T2. Freeze the Fri Oct 30 piece if it won’t be used within 2 days', 1.6, 1, 2.57, 'lb', 'W', 'f'],
      ['Chicken thighs, boneless skinless', '150 g (Sun Nov 1)', '1 small pack (freeze the extra) or 2 thighs from the butcher', 'T1', 1.75, 0, 3.92, 'lb', 'W', 'f'],
      ['Ground beef 93/7', '760 g ≈ 1.7 lb', '2 × 1-lb packs', '1 lb T1, split into 100 g + 120 g portions; 1 lb T2 for prep + Wed', 1, 1, 7.87, '1-lb pack', 'W', 'f'],
      ['Ground turkey 93/7', '460 g ≈ 1 lb (330 g Week A prep + 130 g chili Sun Nov 8)', '1 × 1.25-lb pack (a 1-lb pack is 6 g short; fine)', 'T1, freeze the 130 g for the chili', 1.25, 0, 4.93, 'lb', 'W', 'f'],
      ['Shrimp, raw, peeled & deveined', '255 g ≈ 9 oz (Mon Oct 26 + Tue Nov 3)', '1 × 1-lb bag frozen raw shrimp', 'T1, stays frozen', 1, 0, 10.97, '1-lb bag', 'W', 'f'],
      ['Salmon fillet', '125 g ≈ 4.4 oz (Thu Oct 29)', '1 fillet (4–6 oz), or a bag of individually frozen fillets', 'T1 (fresh only lasts 1–2 days)', 0.33, 0, 10.64, 'lb', 'W', 'f'],
      ['Cod fillet', '170 g = 6 oz (Thu Nov 5)', '1 fillet, or individually frozen cod fillets (Walmart 2-lb frozen bag ≈ $14.46)', 'T2', 0, 0.375, 11.99, 'lb', 'E', 'f'],
      ['Top sirloin steak', '125 g ≈ 4.4 oz (Mon Nov 2)', '1 small steak (~8 oz–12 oz: cut and freeze the rest)', 'T2 (it’s eaten the next day)', 0, 0.75, 12.94, 'lb', 'W', ''],
      ['Pork tenderloin', '145 g ≈ 5 oz (Sat Nov 7)', '1 plain, unseasoned tenderloin (~1–1.25 lb). Cut a 145 g piece and freeze the rest', 'T2', 0, 1.1, 4.46, 'lb', 'W', 'f'],
      ['Sliced deli turkey breast', '336 g ≈ 12 oz (A 252 g, B 84 g)', '~9 oz on Trip 1 + ~3 oz on Trip 2 (deli counter or prepacked)', 'T1 + T2', 9, 3, 0.397, 'oz', 'W', '']
    ]],
    ['Dairy & Eggs', [
      ['Large eggs', '31 eggs (A 16, B 15)', '1 × 18-ct carton each trip (36 total)', 'T1 + T2', 1, 1, 2.47, '18-ct', 'W', ''],
      ['Liquid egg whites', '420 g ≈ 1 3/4 cups', '1 × 16-oz carton each trip (use within ~7 days of opening)', 'T1 + T2', 1, 1, 2.20, '16 oz', 'W', ''],
      ['Cheddar, shredded', '203 g ≈ 7 oz', '1 × 8-oz bag', 'T1', 1, 0, 1.97, '8-oz bag', 'W', ''],
      ['Cheddar, sliced', '77 g ≈ 4 slices', '1 small pack of slices (or slice from a block)', 'T1', 1, 0, 2.27, 'pack', 'E', ''],
      ['String cheese', '5 sticks', '1 pack (often 12 ct; it keeps for weeks)', 'T1', 1, 0, 3.28, '12-ct', 'W', ''],
      ['Plain nonfat Greek yogurt', '1,330 g ≈ 2.9 lb (A 730 g, B 600 g)', '1 × 32-oz tub each trip', 'T1 + T2', 1, 1, 3.28, '32 oz', 'W', ''],
      ['Plain 2% Greek yogurt', '1,500 g (750 g/week)', '1 × 32-oz tub each trip (e.g., Fage 2%)', 'T1 + T2', 1, 1, 6.96, '32 oz', 'W', ''],
      ['2% cottage cheese', '1,700 g (850 g/week)', '2 × 16-oz tubs each trip (4 total; a 24-oz tub is ~$2.87 at Walmart)', 'T1 + T2', 2, 2, 2.17, '16 oz', 'E', ''],
      ['2% milk (Trip 1)', '1,680 g ≈ 7 cups total (A 2 1/2 cups)', '1 quart', 'T1', 1, 0, 1.48, 'quart', 'E', ''],
      ['2% milk (Trip 2)', '(B 4 1/2 cups)', '1/2 gallon', 'T2', 0, 1, 2.04, '1/2 gal', 'W', ''],
      ['Low-fat chocolate milk', '4 cups (2/week, Wed + Fri)', '1 quart each trip, or 4 × 8-oz single bottles (a 1/2 gallon is ~$2.14 at Walmart)', 'T1 + T2', 1, 1, 1.68, 'quart', 'E', ''],
      ['Butter', '27 g ≈ 2 tbsp', '1 lb (4 sticks)', 'T1', 1, 0, 3.97, '1 lb', 'E', 's'],
      ['Grated parmesan', '35 g ≈ 7 tbsp', '1 × 8-oz shaker', 'T1', 1, 0, 2.98, '8 oz', 'E', 's'],
      ['Hummus (plain)', '180 g = 3/4 cup (A 1/4 cup, B 1/2 cup)', '1 × 8–10 oz tub each trip', 'T1 + T2', 1, 1, 3.97, '10-oz tub', 'W', '']
    ]],
    ['Bakery / Bread', [
      ['Flour tortillas, 10-inch burrito size', '4 (Week A burritos)', '1 pack (usually 8; freeze the rest)', 'T1', 1, 0, 3.48, '8-ct', 'W', ''],
      ['Flour tortillas, 8-inch', '2 (Tue Oct 27 fajitas)', '1 pack (usually 8–10; freeze the rest)', 'T1', 1, 0, 2.98, 'pack', 'E', ''],
      ['Flour tortillas, 6-inch', '3 (Wed Nov 4 tacos)', '1 pack (street-taco/fajita size)', 'T2', 0, 1, 2.48, 'pack', 'E', ''],
      ['English muffins', '6 (Week A prep)', '1 × 6-pack', 'T1', 1, 0, 1.48, '6-pack', 'E', ''],
      ['Plain bagels', '3 (Week B)', '1 × 6-pack, or 3 from the bakery (freeze extras)', 'T2', 0, 1, 2.48, '6-pack', 'E', ''],
      ['Whole-wheat bread', '14 slices (A 8, B 6)', '1 × 20-oz loaf (freeze half for Week B)', 'T1', 1, 0, 1.98, 'loaf', 'E', ''],
      ['Hamburger bun', '1 (Sat Oct 31)', '1 pack (freeze the rest) or 1 bakery bun', 'T1', 1, 0, 1.48, '8-pack', 'E', ''],
      ['Pita, 6.5-inch', '3 (A 1, B 2)', '1 pack (5–6; freeze the rest)', 'T1', 1, 0, 2.98, 'pack', 'E', '']
    ]],
    ['Pantry / Dry goods', [
      ['Long-grain white rice', '1,270 g ≈ 2.8 lb (dry)', '1 × 5-lb bag (or 2 × 2-lb bags for exactly two weeks)', 'T1', 1, 0, 3.52, '5-lb bag', 'W', 's'],
      ['Spaghetti', '90 g (Wed Oct 28)', '1 × 1-lb box', 'T1', 1, 0, 1.18, '1 lb', 'E', 's'],
      ['Penne', '240 g (Week B prep)', '1 × 1-lb box', 'T1', 1, 0, 1.18, '1 lb', 'E', 's'],
      ['Couscous, plain', '75 g (Thu Nov 5)', '1 × ~10-oz box (plain, not flavored)', 'T1', 1, 0, 2.98, 'box', 'E', 's'],
      ['All-purpose flour', '200 g (pancakes)', '1 × 2-lb bag', 'T1', 1, 0, 1.98, '2-lb bag', 'E', 's'],
      ['Baking powder', '1 tbsp', '1 can', 'T1', 1, 0, 1.48, 'can', 'E', 's'],
      ['Cornstarch', '15 g ≈ 5 tsp', '1 box', 'T1', 1, 0, 1.68, 'box', 'E', 's'],
      ['Whey protein powder', '220 g ≈ 7–8 scoops', 'Skip if you have some; otherwise 1 × 2-lb tub', 'T1', 1, 0, 24.98, '2-lb tub', 'E', 'so'],
      ['Peanut butter', '400 g ≈ 25 tbsp (A 176 g, B 224 g)', '1 × 16-oz jar (just enough; a 28-oz jar gives some margin)', 'T1 (nearly used up in 2 weeks)', 1, 0, 1.98, '16 oz', 'W', ''],
      ['Plain rice cakes', '28 cakes (A 12, B 16)', '2 packs (~14 cakes each)', 'T1', 2, 0, 3.64, 'pack', 'W', ''],
      ['Pretzels', '196 g ≈ 7 oz', '1 × 16-oz bag', 'T1', 1, 0, 2.48, '16-oz bag', 'E', ''],
      ['Almonds', '84 g ≈ 3 oz', '1 small bag (6–8 oz)', 'T1', 1, 0, 3.98, 'bag', 'E', 's'],
      ['Cashews', '56 g = 2 oz', '1 small bag/can', 'T1', 1, 0, 4.48, 'bag', 'E', 's'],
      ['Beef jerky', '56 g = 2 oz', '1 bag (~2.5–3 oz)', 'T1', 1, 0, 5.98, 'bag', 'E', ''],
      ['Honey', '266 g ≈ 12–13 tbsp', '1 × 12-oz bottle', 'T1 (nearly used up in 2 weeks)', 1, 0, 3.74, '12 oz', 'W', ''],
      ['Pure maple syrup', '80 g = 4 tbsp (Week B)', '1 × 8-oz bottle', 'T1', 1, 0, 5.48, '8 oz', 'E', 's'],
      ['Strawberry jam', '100 g = 5 tbsp', '1 jar (12–18 oz)', 'T1', 1, 0, 2.48, 'jar', 'E', 's']
    ]],
    ['Canned & Jarred', [
      ['Black beans', '490 g drained ≈ 2 3/4 cups', '3 × 15-oz cans', 'Shelf-stable, can all go on T1', 3, 0, 0.92, '15-oz can', 'W', ''],
      ['Crushed tomatoes', '150 g = 2/3 cup (Sun Nov 8 chili)', '1 × 14.5–15-oz can', 'T1', 1, 0, 1.18, 'can', 'E', ''],
      ['Marinara sauce', '525 g ≈ 2 1/4 cups', '1 × 24-oz jar (refrigerate once open, use within ~5–7 days)', 'T1', 1, 0, 1.68, '24-oz jar', 'W', ''],
      ['Salsa', '270 g ≈ 1 cup (A 240 g, B 30 g)', '1 × 16-oz jar', 'T1', 1, 0, 2.48, '16-oz jar', 'E', ''],
      ['Light tuna in water', '2 × 5-oz cans', '2 cans', 'T1', 2, 0, 1.08, '5-oz can', 'E', ''],
      ['Light mayonnaise', '2 tbsp', '1 small jar', 'T1', 1, 0, 3.48, 'jar', 'E', 's']
    ]],
    ['Spices, Condiments & Sauces', [
      ['Olive oil', '109 g ≈ 8 tbsp', '1 × 16.9-oz bottle', 'T1', 1, 0, 6.12, '17 oz', 'W', 's'],
      ['Cooking spray', 'used throughout the steps', '1 can', 'T1', 1, 0, 2.48, 'can', 'E', 's'],
      ['Soy sauce, low sodium', '104 g ≈ 6.5 tbsp', '1 × 10-oz bottle', 'T1', 1, 0, 2.48, '10 oz', 'E', 's'],
      ['Teriyaki sauce', '162 g ≈ 9 tbsp (Week A)', '1 × 10-oz bottle', 'T1', 1, 0, 2.98, '10 oz', 'E', 's'],
      ['BBQ sauce', '35 g = 2 tbsp (Fri Nov 6)', '1 bottle', 'T1', 1, 0, 1.98, 'bottle', 'E', 's'],
      ['Dijon mustard', '1 tsp (Sat Nov 7)', '1 small jar', 'T1', 1, 0, 1.98, 'jar', 'E', 's'],
      ['Taco seasoning', '22 g ≈ 7 1/2 tsp', '1 jar, or 2 × 1-oz packets', 'T1', 2, 0, 0.78, 'packet', 'E', ''],
      ['Chili powder', '2 tsp', '1 jar', 'T1', 1, 0, 1.28, 'jar', 'E', 's'],
      ['Ground cumin', '1/2 tsp', '1 jar', 'T1', 1, 0, 1.78, 'jar', 'E', 's'],
      ['Garlic powder', 'for the lunch chicken and oven fries', '1 jar', 'T1', 1, 0, 1.28, 'jar', 'E', 's'],
      ['Smoked paprika', 'for the BBQ chicken', '1 jar', 'T1', 1, 0, 2.48, 'jar', 'E', 's'],
      ['Dried oregano', '1/2 tsp (thighs)', '1 jar', 'T1', 1, 0, 1.28, 'jar', 'E', 's'],
      ['Dried rosemary', '1/2 tsp (potatoes)', '1 jar', 'T1', 1, 0, 1.48, 'jar', 'E', 's'],
      ['Salt + black pepper', 'throughout', '1 salt + 1 pepper', 'T1', 1, 0, 3.00, 'pair', 'E', 's'],
      ['Optional: yellow mustard, ketchup (burger), ice (shakes)', '', 'only if you want them', 'Either', 0, 0, 0, '', 'E', 'o']
    ]],
    ['Frozen', [
      ['Frozen sweet corn', '180 g ≈ 1 cup (A 120 g, B 60 g)', '1 × 12–16 oz bag', 'T1', 1, 0, 1.28, 'bag', 'E', 's'],
      ['Frozen peas', '40 g = 1/4 cup (Tue Nov 3)', '1 × 12–16 oz bag', 'T1', 1, 0, 1.28, 'bag', 'E', 's']
    ]],
    ['Other (prep supplies)', [
      ['Parchment paper', 'sheet-pan prep', '1 roll', 'T1', 1, 0, 3.48, 'roll', 'E', 's'],
      ['Aluminum foil', 'sheet-pan prep', '1 roll', 'T1', 1, 0, 3.98, 'roll', 'E', 's'],
      ['Gallon freezer bags', 'freezing portions', '1 box', 'T1', 1, 0, 3.48, 'box', 'E', 's'],
      ['Plastic wrap', 'wrapping portions', '1 roll', 'T1', 1, 0, 2.48, 'roll', 'E', 's'],
      ['Paper towels, masking tape + marker for labels', '', 'only if you’re out (not priced)', 'Either', 0, 0, 0, '', 'E', 'o'],
      ['Meal-prep containers (7 glass, 8 small 2-oz cups, 6 bento boxes)', 'see the Prep tab', 'one-time, only if you don’t own them (not priced)', 'Either', 0, 0, 0, '', 'E', 'o']
    ]]
  ];

  const STORES = [
    ['Publix – Lake Nona Plaza (#1430)', 'https://www.publix.com/locations/1430-lake-nona-plaza', '13900 Narcoossee Rd, Orlando, FL 32832', '0.3 mi · ~2 min (next door)', 'Default one-stop. Full grocery: seafood counter (salmon, cod, shrimp), meat counter that will cut one sirloin or a small piece of pork tenderloin, Boar’s Head deli turkey sliced to any weight, bakery, Fage 2%. BOGO deals. 7 AM–10 PM'],
    ['Sprouts Farmers Market – Eagle Creek', 'https://www.sprouts.com/store/fl/eagle-creek/eagle-creek-sanctuary-blvd/', '10013 Eagle Creek Sanctuary Blvd, Orlando, FL 32832', '0.4 mi · ~2 min', 'Produce, bulk bins (almonds, cashews, couscous, rice) so you can buy exact small amounts, meat and seafood counter. Opened Jun 2026. 7 AM–10 PM'],
    ['ALDI – Narcoossee Rd', 'https://www.aldi.us/stores/l/fl/orlando/12817-narcoossee-road/l667', '12817 Narcoossee Rd, Orlando, FL 32832', '1.5 mi · ~4 min', 'Cheapest eggs, dairy, Greek yogurt, cottage cheese, produce, rice cakes, PB and frozen shrimp. Smaller selection, no meat or seafood counter. 9 AM–8 PM'],
    ['Bravo Supermarkets – Lake Nona', 'https://locations.bravosupermarkets.com/bravo-supermarkets-1e16f98f9d35', '13024 Narcoossee Rd, Orlando, FL 32832', '1.5 mi · ~4 min', 'Latin/Caribbean market: every tortilla size, beans, salsa, cheap produce, butcher counter. 7:30 AM–9:30 PM (8 PM Sun)'],
    ['Walmart Supercenter #4365', 'https://www.walmart.com/store/4365-orlando-fl', '11930 Narcoossee Rd, Orlando, FL 32832', '2.4 mi · ~6 min', 'Lowest staple and pantry prices (the prices on this page), Great Value frozen shrimp, cod and salmon bags, chicken family packs, pickup and delivery. 6 AM–11 PM'],
    ['Sam’s Club – Lake Nona (#4828)', 'https://www.samsclub.com/club/4828-orlando-fl', '11920 Narcoossee Rd, Orlando, FL 32832', '2.7 mi · ~7 min', 'Membership needed. Bulk chicken, eggs, Greek yogurt, rice, nuts, whey. Only worth it if you freeze a lot (this is the closest warehouse club; there’s no Costco in Lake Nona)'],
    ['Publix – Cornerstone at Lake Hart (#886)', 'https://www.publix.com/locations/886-cornerstone-at-lake-hart', '10615 Narcoossee Rd, Orlando, FL 32832', '3.9 mi · ~8 min', 'Same as Lake Nona Plaza; backup if something is out. 7 AM–10 PM'],
    ['Target – Lake Nona', 'https://www.target.com/sl/lake-nona/2947', '6065 Lake Nona Blvd, Orlando, FL 32827 (Lake Nona Town Center)', '4.2 mi · ~13 min', 'Opened Jul 2026 with fresh produce, meat and dairy; Good & Gather dairy and pantry, frozen fish, Drive Up pickup. 8 AM–11 PM'],
    ['Publix – Lake Nona Creekside (#1625)', 'https://www.publix.com/locations/1625-lake-nona-creekside', '14185 Lake Nona Blvd, Orlando, FL 32824 (at Boggy Creek Rd)', '4.6 mi · ~12 min', 'Full Publix, handy if you’re on the Boggy Creek side. 7 AM–10 PM'],
    ['Trader Joe’s – Dr. Phillips (#768)', 'https://locations.traderjoes.com/fl/orlando/768/', '8323 Sand Lake Rd, Orlando, FL 32819', '16 mi · ~27 min', 'Cheap nuts, hummus, frozen fish. Far; announced UCF, Kissimmee and Maitland stores aren’t open yet'],
    ['Costco – S Orlando', 'https://www.costco.com/w/-/fl/orlando/1235', '4696 Gardens Park Blvd, Orlando, FL 32839', '23.5 mi · ~34 min', 'Membership needed; Sam’s Club next to Walmart is much closer for bulk'],
    ['Whole Foods – Bayhill', 'https://www.wholefoodsmarket.com/stores/orlando', '8003 Turkey Lake Rd, Orlando, FL 32819', '23.5 mi · ~36 min', 'Premium meat and seafood. Not needed; no Lake Nona Whole Foods'],
    ['Eastside Asian Market', 'https://www.eastsideasianmarket.com/', '12950 E Colonial Dr, Orlando, FL 32826', '21 mi · ~30 min', 'Not needed: every sauce in this plan is mainstream']
  ];

  const SNAGS = [
    ['Plain 2% Greek yogurt, 32 oz', 'Many stores carry only nonfat or whole in the big tub', 'Publix Lake Nona Plaza (next door) usually has Fage 2%; Walmart and Target too. Or use nonfat/whole (numbers shift slightly)'],
    ['93/7 ground beef and turkey', 'ALDI sometimes carries only 90/10, 85/15 or 99%', 'Publix meat case (next door), Walmart (usually), Sprouts'],
    ['Cod fillet', 'Fresh cod isn’t always in the case', 'Publix Lake Nona Plaza or Sprouts seafood counter (both ~2 min away), or a frozen cod bag at Walmart, ALDI or Target'],
    ['One small top sirloin / small piece of pork tenderloin', 'Packs are usually 1–2 lb (tenderloin often comes as a 2-pack, sometimes pre-marinated)', 'Ask the Publix Lake Nona Plaza or Sprouts meat counter to cut one steak. Buy unseasoned tenderloin and freeze the rest'],
    ['Boneless skinless thighs, small amount', 'ALDI sometimes has only bone-in or big packs', 'Publix or Sprouts counter (buy 2 thighs), or Walmart and freeze the extras'],
    ['6-inch and 8-inch flour tortillas', 'Sizes and labels vary (“street taco”, “fajita”, “soft taco”)', 'Bravo (1.5 mi) has the widest range; Publix and Walmart too'],
    ['Liquid egg whites', 'Usually stocked; ALDI selection can vary', 'Publix, Walmart, Target'],
    ['Plain couscous, small amounts of nuts', 'ALDI may only have couscous seasonally', 'Sprouts bulk bins (0.4 mi) let you buy exactly 75 g couscous / 3 oz almonds / 2 oz cashews; or Publix, Walmart'],
    ['Plain rice cakes', 'Common; ALDI may only carry flavored', 'Publix or Walmart (Quaker)'],
    ['Whey protein', 'Grocery selection is limited', 'Walmart, Sam’s Club, Target, or online']
  ];

  const KEY = 'lb.grocery';
  const loadChecks = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
  const G = { trip: 'wb', checks: loadChecks() };
  const saveChecks = () => { try { localStorage.setItem(KEY, JSON.stringify(G.checks)); } catch (e) { /* storage blocked */ } };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + n.toFixed(2);
  const qtyTxt = (n) => (Math.round(n * 100) / 100).toString();
  const r2 = (n) => Math.round(n * 100) / 100;
  const qtyFor = (it, trip) => (trip === 't1' ? it[4] : trip === 't2' ? it[5] : it[4] + it[5]);
  const lineFor = (it, trip) => r2(qtyFor(it, trip) * it[6]);
  const idOf = (si, ii) => si + '.' + ii;

  function totals(trip) {
    const t = { trip: 0, staple: 0, opt: 0, look: 0, est: 0 };
    SECTIONS.forEach((s) => s[1].forEach((it) => {
      const q = qtyFor(it, trip); if (!(q > 0) || !(it[6] > 0)) return;
      const v = lineFor(it, trip);
      if (it[9].indexOf('o') >= 0) { t.opt += v; return; }
      if (it[9].indexOf('s') >= 0) t.staple += v; else t.trip += v;
      if (it[8] === 'W') t.look++; else t.est++;
    }));
    t.trip = r2(t.trip); t.staple = r2(t.staple); t.grand = r2(t.trip + t.staple);
    return t;
  }

  function itemRow(it, si, ii) {
    const trip = G.trip, q = qtyFor(it, trip), id = trip + '|' + idOf(si, ii), on = !!G.checks[id];
    const fl = it[9], opt = fl.indexOf('o') >= 0;
    const marks = (fl.indexOf('f') >= 0 ? ' ❄️' : '') + (fl.indexOf('s') >= 0 ? ' 🧂' : '');
    const trips = [];
    if (it[4] > 0) trips.push('Trip 1 ×' + qtyTxt(it[4]));
    if (it[5] > 0) trips.push('Trip 2 ×' + qtyTxt(it[5]));
    let price = '';
    if (it[6] > 0) {
      price = '<div class="gl-p">' + money(it[6]) + '<span class="muted"> /' + esc(it[7]) + '</span></div>' +
        '<div class="muted">×' + qtyTxt(q) + ' = <b class="gl-line">' + money(lineFor(it, trip)) + '</b></div>' +
        '<div class="gl-src ' + (it[8] === 'W' ? 'good' : 'warn') + '">' + (it[8] === 'W' ? 'Walmart.com' : 'est.') + '</div>';
    } else price = '<div class="muted">not priced</div>';
    return '<div class="gl-item' + (on ? ' done' : '') + (opt ? ' opt' : '') + '">' +
      '<label class="gl-chk"><input type="checkbox" data-gl="chk" data-id="' + esc(id) + '"' + (on ? ' checked' : '') + '></label>' +
      '<div class="gl-main"><div class="gl-name">' + esc(it[0]) + marks + '</div>' +
      '<div class="small">Buy: ' + esc(it[2]) + '</div>' +
      '<div class="muted">' + esc(it[3]) + (trips.length ? ' · ' + trips.join(' · ') : '') + '</div>' +
      (it[1] ? '<div class="muted">Plan uses: ' + esc(it[1]) + '</div>' : '') + '</div>' +
      '<div class="gl-price">' + price + '</div></div>';
  }

  function chipRow() {
    return '<div class="chips" style="margin-top:10px">' + [['wb', '🛒 Week B shop (for Sun Nov 1 prep)'], ['all', 'Both trips'], ['t1', 'Trip 1'], ['t2', 'Trip 2']].map((x) => '<button class="chip' + (G.trip === x[0] ? ' on' : '') + '" data-gl="trip" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
  }
  // ---------- Week B shop (for Sun Nov 1 prep) ----------
  // Computed from data.js WEEKS.B (Mon Nov 2 – Sun Nov 8): every breakfast, snack, lunch, pre-workout, post-workout, dinner and evening snack.
  // Item: [name, Week B uses, buy, qty, unit price $, unit, source W/E, flags, note]
  // flags: s = pantry staple 🧂 (separate subtotal), f = freeze ❄️, r = check pantry/freezer first (may be left from Trip 1), o = optional (not in totals)
  const WB = [
    ['Produce', [
      ['Bananas', '1,298 g ≈ 11 (pancakes, shakes, pre-workout, snacks, yogurt bowls)', '11 bananas (buy some green; they’re eaten through Sun Nov 8)', 11, 0.25, 'each', 'W', '', ''],
      ['Apple', '1 medium (Wed snack box)', '1 apple', 1, 0.80, 'each', 'E', '', ''],
      ['Blueberries', '225 g ≈ 1 1/2 cups (Mon, Thu, Sun yogurt)', '1 pint', 1, 2.97, 'pint', 'W', '', 'Sun Nov 8 is 9 days out: frozen blueberries work for the last one'],
      ['Strawberries', '200 g (Tue + Fri cottage cheese)', '1 lb clamshell', 1, 2.67, '1-lb box', 'W', '', ''],
      ['Grapes', '150 g ≈ 1 cup (Sat tuna snack)', '~1/2 lb', 0.5, 2.48, 'lb', 'E', '', ''],
      ['Pineapple chunks', '330 g ≈ 2 cups (Sat + Sun)', '1 × 16-oz cut-pineapple tub (or 1 × 20-oz can in juice, keeps better)', 1, 4.48, '16-oz tub', 'E', '', ''],
      ['Broccoli florets', '480 g (4 beef & broccoli lunches)', '2 × 12-oz bags', 2, 2.47, '12-oz bag', 'W', '', ''],
      ['Asparagus', '120 g ≈ 8 spears (Thu cod)', '1 small bunch', 1, 2.98, 'bunch', 'E', '', ''],
      ['Green beans', '100 g (Sat pork) + 100 g for the Sun Nov 1 add-on', '1 × 12-oz bag (covers both)', 1, 2.48, '12-oz bag', 'E', '', ''],
      ['Bell peppers', '200 g (Mon steak bowl, egg bites, Sun chili)', '2 peppers', 2, 0.98, 'each', 'E', '', ''],
      ['Yellow onion', '90 g (Mon steak bowl, Sun chili)', '1 medium', 1, 0.75, 'each', 'E', 'r', ''],
      ['Garlic', '12 g = 4 cloves (lunch prep) + 1 clove Sun add-on', '1 head', 1, 0.58, 'head', 'E', 'r', ''],
      ['Lemon', '15 g juice = 1 tbsp (Thu cod) + squeeze for Sat tuna', '1 lemon', 1, 0.68, 'each', 'E', '', ''],
      ['Romaine', '30 g (Wed tacos)', '1 romaine heart', 1, 1.25, 'heart', 'E', '', ''],
      ['Tomato', '30 g (Wed tacos)', '1 Roma tomato', 1, 0.30, 'each', 'E', '', ''],
      ['Cucumber', '160 g (Mon + Sun snack boxes)', '1 cucumber', 1, 0.78, 'each', 'E', '', ''],
      ['Baby carrots', '200 g (snack boxes + Tue fried rice)', '1 × 1-lb bag', 1, 1.28, '1-lb bag', 'E', 'r', ''],
      ['Baby spinach', '150 g (egg bites + penne lunches)', '1 × 6–10 oz bag', 1, 2.98, 'bag', 'E', '', ''],
      ['Red potatoes', '230 g (Sat pork) + 220 g for the Sun Nov 1 add-on', '1 × 1.5-lb bag (covers both)', 1, 2.97, '1.5-lb bag', 'E', '', '']
    ]],
    ['Meat & Seafood', [
      ['Chicken breast, boneless skinless', '440 g ≈ 1 lb (3 penne lunches + Fri BBQ chicken)', '~1 lb', 1, 2.57, 'lb', 'W', 'f', 'Freeze the Fri Nov 6 piece'],
      ['Ground beef 93/7', '540 g ≈ 1.2 lb (4 lunches 110 g each + Wed tacos 100 g)', '2 × 1-lb packs (freeze the extra)', 2, 7.87, '1-lb pack', 'W', 'fr', 'If ~250 g of Trip 1 beef is in the freezer, 1 pack is enough'],
      ['Ground turkey 93/7', '130 g (Sun Nov 8 chili)', '1 × 1-lb pack (freeze the rest)', 1, 4.93, 'lb', 'W', 'fr', 'Trip 1 plan reserved 130 g in the freezer for this chili'],
      ['Shrimp, raw, peeled & deveined (frozen)', '115 g ≈ 4 oz (Tue fried rice)', '1 × 12-oz frozen bag', 1, 7.42, '12-oz bag', 'W', 'fr', 'The Trip 1 1-lb bag would still have ~11 oz'],
      ['Top sirloin steak', '125 g ≈ 4.4 oz (Mon Nov 2)', '1 small steak (~8–12 oz; cut and freeze the rest)', 0.75, 12.94, 'lb', 'W', '', ''],
      ['Cod fillet', '170 g = 6 oz (Thu Nov 5)', '1 fillet, or individually frozen fillets (Walmart 2-lb bag ≈ $14.46)', 0.375, 11.99, 'lb', 'E', 'f', 'Bought Fri/Sat, it’s 5–6 days out: freeze it'],
      ['Pork tenderloin', '145 g ≈ 5 oz (Sat Nov 7)', '1 plain, unseasoned tenderloin; cut 145 g, freeze the rest', 1.1, 4.46, 'lb', 'W', 'f', ''],
      ['Sliced deli turkey breast', '84 g ≈ 3 oz (Wed roll-ups)', '~3 oz from the deli counter', 3, 0.397, 'oz', 'W', '', '']
    ]],
    ['Dairy & Eggs', [
      ['Large eggs', '15 eggs (pancakes, egg bites, 4 hard-boiled, fried rice)', '1 × 18-ct carton', 1, 2.47, '18-ct', 'W', '', ''],
      ['Liquid egg whites', '180 g ≈ 3/4 cup (egg bites)', '1 × 16-oz carton', 1, 2.20, '16 oz', 'W', '', ''],
      ['Cheddar, shredded', '77 g ≈ 2.7 oz (egg bites + chili)', '1 × 8-oz bag', 1, 1.97, '8-oz bag', 'W', 'r', 'About 3.5 oz should be left from the Trip 1 bag'],
      ['String cheese', '2 sticks (Wed + Thu snacks)', '1 pack', 1, 3.28, '12-ct', 'W', 'r', 'A Trip 1 12-ct pack would still have 9 sticks'],
      ['Plain 2% Greek yogurt', '750 g (Mon, Thu, Sun yogurt bowls)', '1 × 32-oz tub', 1, 6.96, '32 oz', 'W', '', ''],
      ['Plain nonfat Greek yogurt', '600 g (PB&J snack + PB-banana bowls)', '1 × 32-oz tub', 1, 3.28, '32 oz', 'W', '', ''],
      ['2% cottage cheese', '850 g (Tue/Fri evening + Sat/Sun afternoon)', '2 × 16-oz tubs', 2, 2.17, '16 oz', 'E', '', ''],
      ['2% milk', '1,080 g ≈ 4 1/2 cups (pancakes + PB-banana shakes)', '1/2 gallon', 1, 2.04, '1/2 gal', 'W', '', ''],
      ['Low-fat chocolate milk', '2 cups (Wed + Fri post-workout)', '1 quart', 1, 1.68, 'quart', 'E', '', ''],
      ['Hummus (plain)', '120 g = 1/2 cup (Mon + Sun snack boxes)', '1 × 8–10 oz tub', 1, 3.97, '10-oz tub', 'W', '', ''],
      ['Butter', '17 g (Thu cod, Sat pork)', '1 lb', 1, 3.97, '1 lb', 'E', 'sr', ''],
      ['Grated parmesan', '30 g = 6 tbsp (penne lunches)', '1 × 8-oz shaker', 1, 2.98, '8 oz', 'E', 'sr', '']
    ]],
    ['Bakery / Bread', [
      ['Plain bagels', '3 (Tue, Thu, Sat breakfasts)', '1 × 6-pack (freeze extras)', 1, 2.48, '6-pack', 'E', '', ''],
      ['Flour tortillas, 6-inch', '3 (Wed Nov 4 tacos)', '1 pack (street-taco size)', 1, 2.48, 'pack', 'E', '', ''],
      ['Whole-wheat bread', '6 slices (PB&J + PB toast)', '1 × 20-oz loaf', 1, 1.98, 'loaf', 'E', 'r', 'The plan froze half the Trip 1 loaf for Week B'],
      ['Pita, 6.5-inch', '2 (Mon + Sun snack boxes)', '1 pack', 1, 2.98, 'pack', 'E', 'r', 'Trip 1 pack extras may be in the freezer']
    ]],
    ['Pantry / Dry goods', [
      ['Peanut butter', '224 g ≈ 14 tbsp', '1 × 16-oz jar', 1, 1.98, '16 oz', 'W', 'r', 'A Trip 1 jar would have ~10 oz left (enough)'],
      ['Plain rice cakes', '16 cakes (pre-workout + Sat tuna)', '2 packs (~14 each)', 2, 3.64, 'pack', 'W', 'r', 'Trip 1’s 2 packs would have ~16 left'],
      ['Pretzels', '84 g ≈ 3 oz', '1 × 16-oz bag', 1, 2.48, '16-oz bag', 'E', 'r', ''],
      ['Beef jerky', '28 g = 1 oz (Thu snack)', '1 small bag', 1, 5.98, 'bag', 'E', 'r', ''],
      ['Honey', '154 g ≈ 7 tbsp', '1 × 12-oz bottle', 1, 3.74, '12 oz', 'W', 'r', 'A Trip 1 bottle would have ~8 oz left (enough)'],
      ['Long-grain white rice', '535 g ≈ 1.2 lb dry (lunches, steak bowl, fried rice, BBQ chicken)', '1 × 5-lb bag', 1, 3.52, '5-lb bag', 'W', 'sr', ''],
      ['Penne', '240 g (3 penne lunches)', '1 × 1-lb box', 1, 1.18, '1 lb', 'E', 'sr', ''],
      ['Couscous, plain', '75 g (Thu cod)', '1 × ~10-oz box', 1, 2.98, 'box', 'E', 'sr', ''],
      ['All-purpose flour', '200 g (4 pancake breakfasts)', '1 × 2-lb bag', 1, 1.98, '2-lb bag', 'E', 'sr', ''],
      ['Baking powder', '12 g = 3 tsp', '1 can', 1, 1.48, 'can', 'E', 'sr', ''],
      ['Cornstarch', '12 g = 4 tsp', '1 box', 1, 1.68, 'box', 'E', 'sr', ''],
      ['Almonds', '42 g ≈ 36 almonds', '1 small bag', 1, 3.98, 'bag', 'E', 'sr', ''],
      ['Cashews', '28 g = 1/4 cup', '1 small bag', 1, 4.48, 'bag', 'E', 'sr', ''],
      ['Pure maple syrup', '80 g = 4 tbsp (pancakes)', '1 × 8-oz bottle', 1, 5.48, '8 oz', 'E', 'sr', ''],
      ['Strawberry jam', '40 g = 2 tbsp', '1 jar', 1, 2.48, 'jar', 'E', 'sr', ''],
      ['Whey protein powder', '150 g ≈ 5 scoops', '1 × 2-lb tub (skip if you have some)', 1, 24.98, '2-lb tub', 'E', 'sor', '']
    ]],
    ['Canned & Jarred', [
      ['Black beans', '150 g (Wed tacos + Sun chili)', '1 × 15-oz can', 1, 0.92, '15-oz can', 'W', 'r', 'Trip 1 bought 3 cans; 1 may be left'],
      ['Crushed tomatoes', '150 g (Sun chili)', '1 × 14.5–15-oz can', 1, 1.18, 'can', 'E', 'r', 'Trip 1 list included this can'],
      ['Marinara sauce', '375 g ≈ 1 1/2 cups (penne lunches)', '1 × 24-oz jar (don’t reuse a jar opened last week)', 1, 1.68, '24-oz jar', 'W', '', ''],
      ['Salsa', '30 g = 2 tbsp (Wed tacos)', '1 × 16-oz jar', 1, 2.48, '16-oz jar', 'E', 'r', ''],
      ['Light tuna in water', '1 × 5-oz can (Sat snack)', '1 can', 1, 1.08, '5-oz can', 'E', 'r', ''],
      ['Light mayonnaise', '1 tbsp', '1 small jar', 1, 3.48, 'jar', 'E', 'sr', '']
    ]],
    ['Spices, Condiments & Sauces', [
      ['Taco seasoning', '6 g = 2 tsp (Wed tacos)', '1 packet', 1, 0.78, 'packet', 'E', 'r', ''],
      ['Olive oil', '57 g ≈ 4 tbsp', '1 × 16.9-oz bottle', 1, 6.12, '17 oz', 'W', 'sr', ''],
      ['Cooking spray', 'pancakes, egg bites, penne prep, BBQ chicken', '1 can', 1, 2.48, 'can', 'E', 'sr', ''],
      ['Soy sauce, low sodium', '88 g ≈ 5.5 tbsp', '1 × 10-oz bottle', 1, 2.48, '10 oz', 'E', 'sr', ''],
      ['BBQ sauce', '35 g = 2 tbsp (Fri)', '1 bottle', 1, 1.98, 'bottle', 'E', 'sr', ''],
      ['Dijon mustard', '1 tsp (Sat pork)', '1 small jar', 1, 1.98, 'jar', 'E', 'sr', ''],
      ['Chili powder + ground cumin', '2 tsp + 1/2 tsp (Sun chili)', '1 jar each', 1, 3.06, 'pair', 'E', 'sr', ''],
      ['Smoked paprika', 'Fri BBQ chicken', '1 jar', 1, 2.48, 'jar', 'E', 'sr', ''],
      ['Salt + black pepper', 'throughout', '1 salt + 1 pepper', 1, 3.00, 'pair', 'E', 'sr', '']
    ]],
    ['Frozen', [
      ['Frozen sweet corn', '60 g = 1/3 cup (Fri)', '1 × 12–16 oz bag', 1, 1.28, 'bag', 'E', 'sr', ''],
      ['Frozen peas', '40 g = 1/4 cup (Tue fried rice)', '1 × 12–16 oz bag', 1, 1.28, 'bag', 'E', 'sr', '']
    ]],
    ['Prep supplies', [
      ['Parchment paper', 'pancakes / sheet pans', '1 roll', 1, 3.48, 'roll', 'E', 'sr', ''],
      ['Aluminum foil', 'Thu cod, Fri BBQ chicken', '1 roll', 1, 3.98, 'roll', 'E', 'sr', ''],
      ['Gallon freezer bags', 'Thu–Sun portions go to the freezer', '1 box', 1, 3.48, 'box', 'E', 'sr', '']
    ]]
  ];
  // Sun Nov 1 dinner is still Week A: D7 Sheet-Pan Lemon Herb Chicken Thighs & Potatoes (150 g thighs, 220 g red potatoes, 100 g green beans, 1 tbsp oil, 1 tbsp lemon, 1 garlic clove, oregano, rosemary)
  const ADDON = [
    ['Chicken thighs, boneless skinless', '150 g ≈ 5.3 oz', '1 small pack (freeze the extra) or 2 thighs from the Publix counter', 1.75, 3.92, 'lb', 'W', 'f', ''],
    ['Lemon (extra)', '1 tbsp juice', '1 lemon', 1, 0.68, 'each', 'E', '', ''],
    ['Dried oregano', '1/2 tsp', '1 jar (skip if you have it)', 1, 1.28, 'jar', 'E', 's', ''],
    ['Dried rosemary', '1/2 tsp', '1 jar (skip if you have it)', 1, 1.48, 'jar', 'E', 's', '']
  ];
  const WKEY = 'lb.groceryWeekB';
  const loadW = () => { try { const v = JSON.parse(localStorage.getItem(WKEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
  G.wb = loadW();
  const saveW = () => { try { localStorage.setItem(WKEY, JSON.stringify(G.wb)); } catch (e) { /* storage blocked */ } };
  const wLine = (it) => r2(it[3] * it[4]);
  function wbTotals() {
    const t = { trip: 0, staple: 0, opt: 0, addon: 0, look: 0, est: 0 };
    WB.forEach((s) => s[1].forEach((it) => {
      const v = wLine(it);
      if (it[7].indexOf('o') >= 0) { t.opt += v; return; }
      if (it[7].indexOf('s') >= 0) t.staple += v; else t.trip += v;
      if (it[6] === 'W') t.look++; else t.est++;
    }));
    ADDON.forEach((it) => { t.addon += wLine(it); });
    t.trip = r2(t.trip); t.staple = r2(t.staple); t.addon = r2(t.addon); t.grand = r2(t.trip + t.staple); t.withAddon = r2(t.grand + t.addon);
    return t;
  }
  function wbRow(it, id) {
    const on = !!G.wb[id], fl = it[7];
    const marks = (fl.indexOf('f') >= 0 ? ' ❄️' : '') + (fl.indexOf('s') >= 0 ? ' 🧂' : '');
    const price = '<div class="gl-p">' + money(it[4]) + '<span class="muted"> /' + esc(it[5]) + '</span></div><div class="muted">×' + qtyTxt(it[3]) + ' = <b class="gl-line">' + money(wLine(it)) + '</b></div><div class="gl-src ' + (it[6] === 'W' ? 'good' : 'warn') + '">' + (it[6] === 'W' ? 'Walmart.com' : 'est.') + '</div>';
    return '<div class="gl-item' + (on ? ' done' : '') + '"><label class="gl-chk"><input type="checkbox" data-gl="wbchk" data-id="' + esc(id) + '"' + (on ? ' checked' : '') + '></label>' +
      '<div class="gl-main"><div class="gl-name">' + esc(it[0]) + marks + (fl.indexOf('o') >= 0 ? ' <span class="muted">(optional, not in totals)</span>' : '') + '</div>' +
      '<div class="small">Buy: ' + esc(it[2]) + '</div><div class="muted">Week B uses: ' + esc(it[1]) + '</div>' +
      (fl.indexOf('r') >= 0 ? '<div class="small warn">Check your pantry/freezer first' + (it[8] ? ': ' + esc(it[8]) : '') + '</div>' : (it[8] ? '<div class="muted">' + esc(it[8]) + '</div>' : '')) +
      '</div><div class="gl-price">' + price + '</div></div>';
  }
  function htmlWB() {
    const t = wbTotals();
    let h = '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><button data-gl="back">‹ Back to meal plan</button><button data-gl="reset">Reset checkboxes</button></div>';
    h += '<h2 style="margin-top:12px">Week B shop (for Sun Nov 1 prep)</h2><div class="small">Everything for Week B, Mon Nov 2 – Sun Nov 8: all breakfasts, snacks, lunches, pre/post-workout and dinners, through the Sun Nov 8 turkey chili. Quantities come from the Week B recipes in the plan. Shop Fri Oct 30 or Sat Oct 31, prep Sunday Nov 1. Supplements aren’t included.</div>';
    h += '<div class="muted" style="margin-top:6px">❄️ = freeze when you get home (eaten late in the week) · 🧂 = pantry staple · <span class="warn">Check your pantry/freezer first</span> = may be left over from Trip 1, if you did it</div>';
    h += chipRow() + '</div>';
    h += '<div class="card small"><b>Fri/Sat shopping tip:</b> Publix Lake Nona Plaza (0.3 mi from Concorde, 7 AM–10 PM) covers all of Week B in one stop, including counter cuts of one sirloin, 6 oz cod and a small pork tenderloin, and 3 oz of deli turkey. Walmart Supercenter on Narcoossee (2.4 mi, 6 AM–11 PM) is the cheapest one-stop. ALDI closes at 8 PM. Hours are the stores’ regular hours; check the store page before a late run.</div>';
    WB.forEach((s, si) => {
      const sub = r2(s[1].reduce((a, it) => a + (it[7].indexOf('o') >= 0 ? 0 : wLine(it)), 0));
      h += '<h2>' + esc(s[0]) + ' <span class="muted">' + money(sub) + '</span></h2><div class="card gl-list">' + s[1].map((it, ii) => wbRow(it, 'wb.' + si + '.' + ii)).join('') + '</div>';
    });
    h += '<h2>Sun Nov 1 dinner add-on <span class="muted">' + money(t.addon) + '</span></h2><div class="card"><div class="small">Sunday’s dinner is still Week A: Sheet-Pan Lemon Herb Chicken Thighs & Potatoes. If you didn’t do Trip 1 as planned, make sure you have these too. The 220 g red potatoes, 100 g green beans, garlic clove and 1 tbsp olive oil are covered by the Week B bags above.</div><div class="gl-list" style="padding:0">' + ADDON.map((it, ii) => wbRow(it, 'add.' + ii)).join('') + '</div></div>';
    h += '<div class="card gl-tot"><h3 style="margin-top:0">Estimated cost · Week B shop</h3><table class="tbl">' +
      '<tr><td>Week B groceries</td><td><b>' + money(t.trip) + '</b></td></tr>' +
      '<tr><td>Pantry staples 🧂 <div class="muted">skip if you still have them from Trip 1</div></td><td><b>' + money(t.staple) + '</b></td></tr>' +
      '<tr><td><b>Week B total</b></td><td><b>' + money(t.grand) + '</b></td></tr>' +
      '<tr><td>+ Sun Nov 1 add-on</td><td>' + money(t.addon) + '</td></tr>' +
      '<tr><td>Week B total with add-on</td><td>' + money(t.withAddon) + '</td></tr></table>' +
      '<div class="muted" style="margin-top:6px">Items marked “check your pantry/freezer first” are still counted, since you may not have them. Whey (~$24.98, optional) isn’t included.</div>' +
      '<div class="small warn" style="margin-top:8px">Prices are estimates. They vary by store and week, and items sold by weight (meat, fish, deli, bananas, grapes) settle at the register. Prices checked Oct 2026.</div>' +
      '<div class="muted" style="margin-top:4px">“Walmart.com” = listed price looked up Oct 2026 (Walmart #4365 on Narcoossee, 2.4 mi from Concorde; in-store can differ). “est.” = typical Lake Nona price where no lookup was possible. Publix and Sprouts usually run 10–25% higher, ALDI a bit lower. ' + t.look + ' prices looked up, ' + t.est + ' estimated.</div></div>';
    return h + storesHtml();
  }

  function html() { return G.trip === 'wb' ? htmlWB() : htmlBi(); }

  function htmlBi() {
    const t = totals(G.trip), all = totals('all'), t1 = totals('t1'), t2 = totals('t2');
    const label = G.trip === 't1' ? 'Trip 1' : G.trip === 't2' ? 'Trip 2' : 'Both trips';
    let h = '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><button data-gl="back">‹ Back to meal plan</button><button data-gl="reset">Reset checkboxes</button></div>';
    h += '<h2 style="margin-top:12px">Two-week grocery list</h2><div class="small">Week A (Mon Oct 26) + Week B (Mon Nov 2), 1 person. Totals come from every meal, snack, Sunday prep and dinner in the plan. Supplements aren’t included.</div>';
    h += '<div class="small" style="margin-top:6px"><b>Trip 1</b> (Sat Oct 24 / Sun Oct 25, before Week A prep) · <b>Trip 2</b> (Sat Oct 31 / Sun Nov 1, before Week B prep). Shopping once? Buy it all on Trip 1, freeze the ❄️ meat and fish in single-meal portions, and buy Trip 2 produce and dairy fresh in week 2.</div>';
    h += '<div class="muted" style="margin-top:6px">❄️ = freeze if you buy early · 🧂 = pantry staple that lasts past two weeks (one-time buy)</div>';
    h += chipRow() + '</div>';

    h += '<div class="card gl-tot"><h3 style="margin-top:0">Estimated cost · ' + label + '</h3><table class="tbl">' +
      '<tr><td>Groceries (every trip)</td><td><b>' + money(t.trip) + '</b></td></tr>' +
      '<tr><td>Pantry staples 🧂 (one-time)</td><td><b>' + money(t.staple) + '</b></td></tr>' +
      '<tr><td><b>Grand total</b></td><td><b>' + money(t.grand) + '</b></td></tr></table>' +
      (G.trip === 'all' ? '<div class="muted" style="margin-top:6px">Trip 1 ' + money(t1.grand) + ' (groceries ' + money(t1.trip) + ' + staples ' + money(t1.staple) + ') · Trip 2 ' + money(t2.grand) + '. Whey (~$24.98, optional) isn’t included.</div>' : '') +
      '<div class="small warn" style="margin-top:8px">Prices are estimates. They vary by store and week, and items sold by weight (meat, fish, deli, bananas, grapes) settle at the register. Prices checked Oct 2026.</div>' +
      '<div class="muted" style="margin-top:4px">“Walmart.com” = listed price for that item looked up Oct 2026 (Walmart #4365 on Narcoossee is 2.4 mi from Concorde; in-store can differ). “est.” = typical Lake Nona price (Walmart/ALDI/Publix level) where no lookup was possible. Publix and Sprouts usually run 10–25% higher, ALDI a bit lower. ' + all.look + ' prices looked up, ' + all.est + ' estimated.</div></div>';

    SECTIONS.forEach((s, si) => {
      const rows = s[1].map((it, ii) => [it, ii]).filter((x) => G.trip === 'all' || qtyFor(x[0], G.trip) > 0 || (x[0][9].indexOf('o') >= 0 && G.trip === 't1'));
      if (!rows.length) return;
      const sub = r2(rows.reduce((a, x) => a + (x[0][9].indexOf('o') >= 0 ? 0 : lineFor(x[0], G.trip)), 0));
      h += '<h2>' + esc(s[0]) + ' <span class="muted">' + money(sub) + '</span></h2><div class="card gl-list">' + rows.map((x) => itemRow(x[0], si, x[1])).join('') + '</div>';
    });

    return h + storesHtml();
  }

  function storesHtml() {
    let h = '';
    h += '<h2>Stores near Lake Nona Concorde</h2><div class="card"><div class="small">Measured from Lake Nona Concorde Apartments, 10105 Selten Way, Orlando, FL 32827 (Greenwood district, next to Lake Nona Plaza). Driving distance and time via OpenStreetMap routing, no traffic.</div><div class="gl-list" style="padding:0">' +
      STORES.map((x) => '<div class="gl-item"><div class="gl-main"><div class="gl-name"><a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a></div><div class="muted">' + esc(x[2]) + '</div><div class="small" style="margin-top:2px">' + esc(x[4]) + '</div></div><div class="gl-price"><b>' + esc(x[3].split(' · ')[0]) + '</b><div class="muted">' + esc(x[3].split(' · ')[1] || '') + '</div></div></div>').join('') +
      '</div><div class="muted" style="margin-top:6px">“Good for” is what each chain typically carries, not a live inventory check.</div></div>';

    h += '<h2>Hard-to-find items</h2><div class="card"><div class="small"><b>Everything here is mainstream.</b> Publix Lake Nona Plaza, next door to Concorde, can do the whole list in one stop. Walmart (2.4 mi) is the cheapest one-stop, and ALDI (1.5 mi) is cheaper for dairy, eggs and produce if you don’t mind two stops. Typical availability, not live inventory:</div><div class="gl-list" style="padding:0">' +
      SNAGS.map((x) => '<div class="gl-item"><div class="gl-main"><div class="gl-name">' + esc(x[0]) + '</div><div class="muted">Snag: ' + esc(x[1]) + '</div><div class="small">Get it: ' + esc(x[2]) + '</div></div></div>').join('') + '</div></div>';
    h += '<div class="card"><button data-gl="back">‹ Back to meal plan</button></div>';
    return h;
  }

  const sec = document.getElementById('grocery'), app = document.getElementById('app'), btn = document.getElementById('grocery-btn');
  if (!sec || !app || !btn) return;
  let open = false;
  function render() { sec.innerHTML = html(); }
  function show(on, fromHash) {
    open = on; sec.hidden = !on; app.hidden = on;
    btn.textContent = on ? '‹ Meal plan' : '🛒 Grocery List';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) { render(); window.scrollTo(0, 0); }
    if (!fromHash) {
      if (on && location.hash !== '#grocery') history.pushState(null, '', '#grocery');
      else if (!on && location.hash === '#grocery') history.pushState(null, '', location.pathname + location.search);
    }
  }
  btn.addEventListener('click', () => show(!open));
  document.getElementById('tabs').addEventListener('click', (e) => { if (open && e.target.closest('button')) show(false); });
  window.addEventListener('popstate', () => show(location.hash === '#grocery', true));
  sec.addEventListener('click', (e) => {
    const el = e.target.closest('[data-gl]'); if (!el) return;
    const a = el.dataset.gl;
    if (a === 'back') { show(false); window.scrollTo(0, 0); }
    else if (a === 'trip') { G.trip = el.dataset.v; render(); }
    else if (a === 'reset') { if (window.confirm(G.trip === 'wb' ? 'Uncheck every item on the Week B list?' : 'Uncheck every item on the two-week list?')) { if (G.trip === 'wb') { G.wb = {}; saveW(); } else { G.checks = {}; saveChecks(); } render(); } }
  });
  sec.addEventListener('change', (e) => {
    const el = e.target, k = el.dataset.gl; if (k !== 'chk' && k !== 'wbchk') return;
    const store = k === 'wbchk' ? G.wb : G.checks;
    if (el.checked) store[el.dataset.id] = 1; else delete store[el.dataset.id];
    if (k === 'wbchk') saveW(); else saveChecks();
    el.closest('.gl-item').classList.toggle('done', el.checked);
  });
  if (location.hash === '#grocery') show(true, true);
  window.LB_GROCERY = { totals: totals, SECTIONS: SECTIONS, wbTotals: wbTotals, WB: WB, ADDON: ADDON };
})();
