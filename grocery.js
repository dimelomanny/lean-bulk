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
  const G = { trip: 'all', checks: loadChecks() };
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

  function html() {
    const t = totals(G.trip), all = totals('all'), t1 = totals('t1'), t2 = totals('t2');
    const label = G.trip === 't1' ? 'Trip 1' : G.trip === 't2' ? 'Trip 2' : 'Both trips';
    let h = '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><button data-gl="back">‹ Back to meal plan</button><button data-gl="reset">Reset checkboxes</button></div>';
    h += '<h2 style="margin-top:12px">Two-week grocery list</h2><div class="small">Week A (Mon Oct 26) + Week B (Mon Nov 2), 1 person. Totals come from every meal, snack, Sunday prep and dinner in the plan. Supplements aren’t included.</div>';
    h += '<div class="small" style="margin-top:6px"><b>Trip 1</b> (Sat Oct 24 / Sun Oct 25, before Week A prep) · <b>Trip 2</b> (Sat Oct 31 / Sun Nov 1, before Week B prep). Shopping once? Buy it all on Trip 1, freeze the ❄️ meat and fish in single-meal portions, and buy Trip 2 produce and dairy fresh in week 2.</div>';
    h += '<div class="muted" style="margin-top:6px">❄️ = freeze if you buy early · 🧂 = pantry staple that lasts past two weeks (one-time buy)</div>';
    h += '<div class="chips" style="margin-top:10px">' + [['all', 'Both trips'], ['t1', 'Trip 1'], ['t2', 'Trip 2']].map((x) => '<button class="chip' + (G.trip === x[0] ? ' on' : '') + '" data-gl="trip" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div>';

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
    else if (a === 'reset') { if (window.confirm('Uncheck every item on the grocery list?')) { G.checks = {}; saveChecks(); render(); } }
  });
  sec.addEventListener('change', (e) => {
    const el = e.target; if (el.dataset.gl !== 'chk') return;
    if (el.checked) G.checks[el.dataset.id] = 1; else delete G.checks[el.dataset.id];
    saveChecks(); el.closest('.gl-item').classList.toggle('done', el.checked);
  });
  if (location.hash === '#grocery') show(true, true);
  window.LB_GROCERY = { totals: totals, SECTIONS: SECTIONS };
})();
