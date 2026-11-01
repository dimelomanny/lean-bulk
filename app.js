/* Lean Bulk PWA — vanilla JS, data in data.js, everything saved in localStorage on this device. */
(function () {
  'use strict';
  const PREP = {
    A: [
      ['0:00', 10, 'Oven on, season chicken', 'Oven 425°F, line half sheet pan. Pat dry and season 460 g chicken breast for the teriyaki bowls.'],
      ['0:10', 5, 'Chicken in, rice on', 'Chicken into oven, timer 20 min. Rinse 500 g rice and start it in the 4-qt pot (boil, then LOW 18 min, rest 5).'],
      ['0:15', 15, 'Taco turkey + boiled eggs', "Brown 330 g turkey with taco seasoning, beans and corn in the 12-inch skillet. At the same time: 2 eggs in the 2-qt pan for Wednesday's hummus box (boil, off, 11 min, ice bath)."],
      ['0:30', 5, 'Pull chicken', 'Check 165°F in the thickest piece, rest on a board. Fluff rice.'],
      ['0:35', 20, 'Breakfast burritos', 'Scramble 8 eggs + 1 cup whites, warm beans, roll and foil-wrap 4 burritos.'],
      ['0:55', 20, 'Muffin sandwiches', 'Toast 6 English muffins, cook 6 eggs in rings, stack and wrap 3 servings.'],
      ['1:15', 10, 'Broccoli + slice chicken', 'Steam 400 g broccoli in 2 microwave batches. Slice chicken across the grain.'],
      ['1:25', 15, 'Portion lunches', '4 teriyaki bowls (240 g cooked rice each) and 3 taco bowls (180 g cooked rice each). Cool 20 min with lids off.'],
      ['1:40', 15, 'Snack kits', '2 turkey roll-up boxes, 1 hummus box, 1 jerky grab bag, whey bags (2 half-scoop, 2 two-thirds-scoop), slice strawberries, 2 yogurt jars.'],
      ['1:55', 15, 'Label, store, clean', "Masking-tape label with day on each lid. Mon-Wed in fridge, Thu-Sun in freezer. Move next day's frozen meals to the fridge each night. Wash up."]
    ],
    B: [
      ['0:00', 10, 'Egg bites into the tin', 'Oven 350°F. Chop pepper and spinach, whisk 6 eggs + 3/4 cup whites + cheddar, fill 9 sprayed muffin cups.'],
      ['0:10', 5, 'Bake, rice on, pasta water', "Egg bites in, timer 20 min. Rinse 370 g rice (300 g for lunches + 70 g for Tuesday's fried rice) and start it. 4 qt salted water on HIGH for pasta."],
      ['0:15', 15, 'Chicken + pasta', 'Cube and sear 315 g chicken in the 12-inch skillet (165°F). Penne into boiling water, 1 min under box time.'],
      ['0:30', 10, 'Finish pasta lunches', 'Pull egg bites (160°F center). Drain pasta, add marinara + spinach to the chicken, toss, portion 3 containers with parmesan.'],
      ['0:40', 10, 'Sauce + broccoli', 'Whisk the beef-and-broccoli sauce. Steam 480 g broccoli in 2 microwave batches.'],
      ['0:50', 10, 'Beef & broccoli', 'Brown 440 g beef (160°F), drain fat, glaze with sauce, fold in broccoli.'],
      ['1:00', 10, 'Portion lunches', '4 bowls with 225 g cooked rice each. Spread the extra rice flat in a container for Tuesday. Cool lids-off 20 min.'],
      ['1:10', 30, 'Pancakes', 'Mix batter, cook 16 pancakes on MEDIUM, cool on a rack, stack with parchment. Pack PB and maple cups.'],
      ['1:40', 15, 'Snack kits + chili veg', "Hard-boil 4 eggs (2 hummus boxes), 1 turkey roll-up box, 1 jerky grab bag, whey bags, slice strawberries, 2 yogurt jars. Dice 1/3 cup onion + 1/3 cup bell pepper for Sunday's chili and freeze it."],
      ['1:55', 15, 'Label, store, clean', 'Mon-Wed in fridge, rest in freezer (pancakes and egg bites freeze well). Wash up.']
    ]
  };
  const UNITS = { egg: [50, 'eggs'], banana: [118, 'bananas'], apple: [182, 'apples'], tortilla10: [72, 'tortillas'], tortilla8: [49, 'tortillas'], tortilla6: [32, 'tortillas'], engmuffin: [57, 'muffins'], bagel: [105, 'bagels'], bread: [32, 'slices'], bun: [52, 'buns'], pita: [60, 'pitas'], ricecake: [9, 'cakes'], stringcheese: [28, 'sticks'], tuna: [113, 'cans (5 oz)'] };
  const FRACS = [[0, '0'], [0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'], [1, '1'], [1.5, '1 1/2'], [2, '2']];
  const POS_TIME = { B: 'breakfast', S: 'snack', L: 'lunch', P: 'pre', X: 'wEnd', D: 'dinner', E: 'evening' };
  const DEF_TARGETS = { kcal: 2900, p: 160, c: 350, f: 85, bump: 40, cut: 50 };
  const DEF_TIMES = { wake: '06:00', breakfast: '06:30', snack: '09:30', lunch: '12:30', pre: '16:30', wStart: '18:00', wEnd: '19:30', dinner: '20:15', evening: '22:00' };
  const TIME_LABELS = { wake: 'Wake', breakfast: 'Breakfast', snack: 'AM snack', lunch: 'Lunch', pre: 'Pre-workout', wStart: 'Workout start', wEnd: 'Workout end', dinner: 'Dinner', evening: 'Evening snack' };
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DEF_ANCHOR = '2026-11-02';

  const load = (k, d) => { try { const v = localStorage.getItem('lb.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('lb.' + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const S = {
    targets: Object.assign({}, DEF_TARGETS, load('targets', {})),
    times: Object.assign({}, DEF_TIMES, load('times', {})),
    anchor: load('anchor', DEF_ANCHOR),
    logs: load('logs', {}),
    weights: load('weights', [{ date: '2026-10-24', lb: 140 }]),
    swaps: load('swaps', {}),
    checkins: load('checkins', []),
    tab: 'today', open: '', portion: {}, custom: {}, im: {}, glance: null, shopWeek: 'A', week: null, day: null, logDate: null
  };
  // One-time migration (plan reset Nov 1 2026): move the old default anchor to the new Week A start.
  if (!load('mig_anchor_1102', false)) {
    if (S.anchor === '2026-10-26') { S.anchor = DEF_ANCHOR; save('anchor', S.anchor); }
    save('mig_anchor_1102', true);
  }
  const persist = () => { ['targets', 'times', 'anchor', 'logs', 'weights', 'swaps', 'checkins'].forEach((k) => save(k, S[k])); };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const isoOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim()); if (!m) return null; const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d) ? null : d; };
  const shiftIso = (s, n) => { const d = parseIso(s) || new Date(); d.setDate(d.getDate() + n); return isoOf(d); };
  const toMin = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim()); if (!m) return null; const h = +m[1], mm = +m[2]; return h > 23 || mm > 59 ? null : h * 60 + mm; };
  const fmt12 = (min) => { const m = ((min % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return (h % 12 === 0 ? 12 : h % 12) + ':' + pad(mm) + (h < 12 ? ' AM' : ' PM'); };
  const tLabel = (s) => { const m = toMin(s); return m === null ? s : fmt12(m); };
  const r0 = Math.round;
  const fracLabel = (v) => { const f = FRACS.find((x) => x[0] === v); return f ? f[1] : String(v); };
  const today = () => isoOf(new Date());

  const ingMac = (k, g) => { const v = ING[k]; return { kcal: v[1] * g / 100, p: v[2] * g / 100, c: v[3] * g / 100, f: v[4] * g / 100 }; };
  const addM = (a, b, s) => { s = s === undefined ? 1 : s; return { kcal: a.kcal + b.kcal * s, p: a.p + b.p * s, c: a.c + b.c * s, f: a.f + b.f * s }; };
  const ZERO = { kcal: 0, p: 0, c: 0, f: 0 };
  const recipeMac = (r, mult, im) => r.items.reduce((a, it, i) => addM(a, ingMac(it[0], it[1]), (mult === undefined ? 1 : mult) * (im && im[i] !== undefined ? im[i] : 1)), ZERO);
  const dayMac = (d) => d.meals.reduce((a, id) => addM(a, recipeMac(RECIPES[id])), ZERO);
  const macLine = (m) => r0(m.kcal) + ' kcal · ' + r0(m.p) + ' g P · ' + r0(m.c) + ' g C · ' + r0(m.f) + ' g F';
  const rotation = (iso) => {
    const d = parseIso(iso), a = parseIso(S.anchor) || parseIso(DEF_ANCHOR);
    if (!d) return { week: 'A', idx: 0 };
    const n = (((Math.round((d - a) / 86400000)) % 14) + 14) % 14;
    return { week: n < 7 ? 'A' : 'B', idx: n % 7 };
  };
  const dayType = (f) => (f === 'Rest' ? 'rest' : (f === 'Legs' || f === 'Lower') ? 'leg' : 'train');
  const targetFor = (focus) => {
    const t = S.targets, ty = dayType(focus);
    const adj = ty === 'leg' ? +t.bump : ty === 'rest' ? -t.cut : 0;
    return { kcal: +t.kcal + adj * 4, p: +t.p, c: +t.c + adj, f: +t.f };
  };
  const dinnerOf = (d) => d.meals.find((x) => x[0] === 'D');
  const startCook = (rid) => { const m = toMin(S.times.dinner), r = RECIPES[rid]; return m === null ? '-' : fmt12(m - r.prep - r.cook); };

  // ---------- state init ----------
  const r = rotation(today());
  S.week = r.week; S.day = r.idx; S.glance = r.week; S.logDate = today();

  const bar = (label, val, target, unit) => {
    const pct = target > 0 ? val / target : 0;
    return '<div class="barrow"><div class="lab"><span>' + esc(label) + '</span><span class="muted">' + r0(val) + ' / ' + r0(target) + ' ' + unit + ' (' + r0(pct * 100) + '%)</span></div><div class="bar"><div class="' + (pct > 1.1 ? 'over' : '') + '" style="width:' + Math.min(pct, 1) * 100 + '%"></div></div></div>';
  };
  const fracOptions = (sel) => FRACS.map((f) => '<option value="' + f[0] + '"' + (f[0] === sel ? ' selected' : '') + '>' + f[1] + '</option>').join('');
  const mealMult = (key) => { const c = S.custom[key]; if (c !== undefined && c !== '' && isFinite(+c) && +c >= 0) return +c; return S.portion[key] !== undefined ? S.portion[key] : 1; };

  // ---------- views ----------
  function scheduleHtml(plan) {
    const T = S.times, rest = plan.focus === 'Rest', dn = RECIPES[dinnerOf(plan)];
    const rows = [
      [T.breakfast, 'Breakfast (prepped) + Animal Pak' + (rest ? ' + creatine 5 g' : '')],
      [T.snack, 'AM snack'], [T.lunch, 'Lunch (prepped)'],
      [T.pre, rest ? 'Afternoon snack' : 'Pre-workout snack (60-90 min before)']
    ];
    if (!rest) {
      rows.push([T.wStart, plan.focus + ' workout until ' + tLabel(T.wEnd) + ', BCAAs sipped during']);
      rows.push([T.wEnd, 'Creatine 5 g right after' + (dayType(plan.focus) === 'leg' ? ', in 1 cup chocolate milk' : ', in water')]);
    }
    const sc = toMin(T.dinner);
    if (sc !== null) rows.push([fmt12(sc - dn.prep - dn.cook).replace(/ (AM|PM)/, '$&'), 'Start cooking: ' + dn.name + ' (' + (dn.prep + dn.cook) + ' min)']);
    rows.push([T.dinner, 'Dinner']); rows.push([T.evening, 'Evening snack (slow protein)']);
    return '<div class="sched">' + rows.map((x) => '<div class="t">' + esc(toMin(x[0]) !== null ? tLabel(x[0]) : x[0]) + '</div><div>' + esc(x[1]) + '</div>').join('') + '</div>';
  }

  function mealCard(rid, pos) {
    const r = RECIPES[rid], key = S.week + S.day + '-' + pos, open = S.open === key;
    const m = mealMult(key), ims = S.im[key] || r.items.map(() => 1), mac = recipeMac(r, m, ims), isD = r.kind === 'dinner';
    let h = '<div class="card"><div class="meal-head" data-act="toggle" data-key="' + key + '"><div><div class="muted">' + esc(tLabel(S.times[POS_TIME[rid[0]]])) + ' · ' + esc(r.slot) + (r.kind === 'prep' ? ' · meal-prepped' : isD ? ' · start ' + startCook(rid) : '') + '</div><div class="meal-name">' + esc(r.name) + '</div><div class="muted">' + macLine(recipeMac(r)) + (isD ? ' · ' + r.prep + ' + ' + r.cook + ' = ' + (r.prep + r.cook) + ' min' : '') + '</div></div><div class="open-hint">' + (open ? 'Hide' : 'Open') + '</div></div>';
    if (open) {
      h += '<h3>How much did you eat?</h3><div class="chips">' + FRACS.map((f) => '<button class="chip' + ((S.custom[key] === undefined || S.custom[key] === '') && m === f[0] ? ' on' : '') + '" data-act="portion" data-key="' + key + '" data-v="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>';
      h += '<div class="row" style="margin-top:8px"><label>Custom multiplier<input type="number" step="0.05" min="0" inputmode="decimal" data-inp="custom" data-key="' + key + '" value="' + esc(S.custom[key] || '') + '" placeholder="e.g. 0.6"></label><button class="primary" data-act="log" data-key="' + key + '" data-rid="' + rid + '">Log it (' + esc(S.logDate) + ')</button></div>';
      h += '<div class="muted" style="margin-top:6px">Logs: ' + macLine(mac) + '</div>';
      h += '<h3>Ingredients (per serving)</h3><div class="scroll"><table class="tbl"><tr><th>Ingredient</th><th class="l">Measure</th><th>g</th><th>kcal</th><th>P</th><th>Ate</th></tr>' + r.items.map((it, i) => { const x = ingMac(it[0], it[1]); return '<tr><td>' + esc(ING[it[0]][0]) + '</td><td class="l">' + esc(it[2]) + '</td><td>' + it[1] + '</td><td>' + r0(x.kcal) + '</td><td>' + x.p.toFixed(1) + '</td><td><select data-inp="im" data-key="' + key + '" data-i="' + i + '" data-n="' + r.items.length + '">' + fracOptions(ims[i]) + '</select></td></tr>'; }).join('') + '</table></div>';
      if (r.serv > 1) h += '<div class="muted">Batch on prep Sunday: ' + r.serv + ' servings (steps use batch amounts).</div>';
      h += '<h3>Tools</h3><ul>' + r.tools.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>';
      h += '<h3>Procedure' + (r.prep + r.cook ? ' — prep ' + r.prep + ' min, cook ' + r.cook + ' min' : '') + '</h3><ol>' + r.steps.map((s) => '<li><b>' + esc(s[0]) + '.</b> ' + esc(s[1]) + '</li>').join('') + '</ol>';
      h += '<h3>Storage & reheating</h3><div class="small">' + esc(r.store) + '</div><div class="small">' + esc(r.reheat) + '</div>';
      h += '<h3>Swap request</h3><textarea data-inp="swap" data-rid="' + rid + '" placeholder="Not a fan? Note what you\'d change and ask for a swap.">' + esc(S.swaps[rid] || '') + '</textarea>';
    }
    return h + '</div>';
  }

  function viewToday() {
    const plan = WEEKS[S.week][S.day], lr = rotation(S.logDate), lp = WEEKS[lr.week][lr.idx], lt = targetFor(lp.focus);
    const entries = S.logs[S.logDate] || [], logged = entries.reduce((a, e) => addM(a, e), ZERO), tg = targetFor(plan.focus);
    let h = '<div class="card"><div class="chips">' + ['A', 'B'].map((w) => '<button class="chip' + (S.week === w ? ' on' : '') + '" data-act="week" data-v="' + w + '">Week ' + w + '</button>').join('') + '<button class="chip" data-act="jump">Today</button></div><div class="chips" style="margin-top:6px">' + WEEKS[S.week].map((d, i) => '<button class="chip' + (S.day === i ? ' on' : '') + '" data-act="day" data-v="' + i + '">' + d.day + ' · ' + d.focus + '</button>').join('') + '</div>';
    h += '<div class="muted" style="margin-top:8px">Planned ' + macLine(dayMac(plan)) + ' · target ' + r0(tg.kcal) + ' kcal / ' + r0(tg.p) + ' g protein</div></div>';
    h += '<h2>Schedule — ' + S.week + ' ' + plan.day + ' (' + plan.focus + ')</h2><div class="card">' + scheduleHtml(plan) + '</div>';
    h += '<h2>Meals</h2>' + plan.meals.map(mealCard).join('');
    h += '<h2>Log</h2><div class="card"><div class="row"><button data-act="ld" data-v="-1">‹</button><label>Log date<input data-inp="logdate" value="' + esc(S.logDate) + '" style="width:130px"></label><button data-act="ld" data-v="1">›</button><button data-act="ldt">Today</button></div><div class="muted" style="margin:6px 0">' + esc(S.logDate) + ' = ' + lr.week + ' ' + lp.day + ' (' + lp.focus + ')</div>';
    h += bar('Calories', logged.kcal, lt.kcal, 'kcal') + bar('Protein', logged.p, lt.p, 'g') + bar('Carbs', logged.c, lt.c, 'g') + bar('Fat', logged.f, lt.f, 'g');
    h += '<div class="chips"><button class="primary" data-act="logall">Log full day as planned</button><button data-act="supp" data-v="Animal Pak">Animal Pak</button><button data-act="supp" data-v="Creatine 5 g">Creatine</button><button data-act="supp" data-v="BCAAs">BCAAs</button></div>';
    h += '<h3>Off-plan food</h3><div class="row"><label>Food<input id="cf-name" placeholder="e.g. Protein bar" style="width:150px"></label><label>kcal<input id="cf-kcal" type="number" inputmode="decimal" style="width:70px"></label><label>P<input id="cf-p" type="number" inputmode="decimal" style="width:60px"></label><label>C<input id="cf-c" type="number" inputmode="decimal" style="width:60px"></label><label>F<input id="cf-f" type="number" inputmode="decimal" style="width:60px"></label><button data-act="cf">Add</button></div>';
    if (entries.length) h += '<div class="scroll" style="margin-top:10px"><table class="tbl"><tr><th>Logged</th><th>kcal</th><th>P</th><th>C</th><th>F</th><th></th></tr>' + entries.map((e) => '<tr><td>' + esc(e.slot + ': ' + e.label) + '<div class="muted">' + esc(e.note) + '</div></td><td>' + e.kcal + '</td><td>' + e.p + '</td><td>' + e.c + '</td><td>' + e.f + '</td><td><button data-act="rm" data-id="' + esc(e.id) + '">✕</button></td></tr>').join('') + '</table></div>';
    return h + '</div>';
  }

  function viewWeek() {
    let h = '<div class="card"><div class="chips">' + ['A', 'B'].map((w) => '<button class="chip' + (S.glance === w ? ' on' : '') + '" data-act="glance" data-v="' + w + '">Week ' + w + '</button>').join('') + '</div></div>';
    h += WEEKS[S.glance].map((d, i) => { const m = dayMac(d), t = targetFor(d.focus), dn = RECIPES[dinnerOf(d)]; return '<div class="card" data-act="goday" data-w="' + S.glance + '" data-v="' + i + '" style="cursor:pointer"><b>' + d.day + ' · ' + d.focus + '</b><div class="muted">' + macLine(m) + ' (target ' + r0(t.kcal) + ')</div><div class="small" style="margin-top:4px">Dinner: ' + esc(dn.name) + '</div><div class="muted">' + dn.prep + ' + ' + dn.cook + ' = ' + (dn.prep + dn.cook) + ' min · start cooking ' + startCook(dinnerOf(d)) + '</div></div>'; }).join('');
    h += '<div class="muted" style="padding:0 4px">Every dinner is 35 min or less, cooked after the workout. "Morning step" and "Sunday step" items are done ahead and not counted in the evening time. Tap a day to open its meals.</div>';
    return h;
  }

  function viewPrep() {
    const w = S.shopWeek, total = PREP[w].reduce((a, s) => a + s[1], 0);
    const prep = {}, din = {};
    WEEKS[w].forEach((d) => d.meals.forEach((rid) => { const r = RECIPES[rid], t = r.kind === 'dinner' ? din : prep; r.items.forEach((it) => { if (it[0] !== 'spice') t[it[0]] = (t[it[0]] || 0) + it[1]; }); }));
    const amt = (k, g) => { const u = UNITS[k]; if (u) return Math.ceil(g / u[0] - 0.05) + ' ' + u[1]; return g >= 450 ? (g / 453.6).toFixed(1) + ' lb' : (Math.round(g / 28.35 * 10) / 10) + ' oz'; };
    const list = (o) => '<table class="tbl"><tr><th>Item</th><th>Grams</th><th>Buy about</th></tr>' + Object.keys(o).sort((a, b) => ING[a][0].localeCompare(ING[b][0])).map((k) => '<tr><td>' + esc(ING[k][0]) + '</td><td>' + r0(o[k]) + '</td><td>' + amt(k, o[k]) + '</td></tr>').join('') + '</table>';
    let h = '<div class="card"><div class="chips">' + ['A', 'B'].map((x) => '<button class="chip' + (w === x ? ' on' : '') + '" data-act="shop" data-v="' + x + '">Batch for Week ' + x + '</button>').join('') + '</div><div class="small" style="margin-top:8px">Session: <b>' + Math.floor(total / 60) + ' h ' + (total % 60) + ' min</b> hands-on, cleanup included. Do it the Sunday before the week starts; it covers breakfasts, lunches and snack kits Mon-Sun.</div></div>';
    h += '<h2>Prep order</h2><div class="card"><ol>' + PREP[w].map((s) => '<li><b>' + s[0] + ' · ' + esc(s[2]) + '</b> (' + s[1] + ' min)<div class="small">' + esc(s[3]) + '</div></li>').join('') + '</ol></div>';
    h += '<h2>Shopping: prepped meals & snacks</h2><div class="card scroll">' + list(prep) + '</div>';
    h += '<h2>Shopping: dinners</h2><div class="card scroll">' + list(din) + '</div>';
    h += '<h2>Containers & food safety</h2><div class="card small stack"><div><b>Containers:</b> 7 glass meal-prep containers (~3-cup, microwave safe), 8 small 2-oz lidded cups, 6 bento boxes, gallon freezer bags, foil, masking tape + marker.</div><div><b>Fridge (35-38°F):</b> cooked meat, rice, pasta 3-4 days; peeled hard-boiled eggs 5 days. Max 2 hours on the counter before it goes in.</div><div><b>Freezer (0°F):</b> lunch bowls 2-3 months, burritos/sandwiches 1-2 months, pancakes and egg bites 2 months. Thu-Sun portions go straight to the freezer.</div><div><b>Thaw:</b> each night move the next day\'s frozen breakfast and lunch to the fridge. Never thaw on the counter.</div><div><b>Reheat:</b> until steaming in the center, 165°F. Stir halfway; 1 tbsp water on rice.</div></div>';
    return h;
  }

  function weightChart(ws) {
    if (ws.length < 2) return '';
    const W = 340, H = 160, P = 30, lo = Math.min(138, ...ws.map((w) => w.lb)) - 1, hi = Math.max(161, ...ws.map((w) => w.lb)) + 1;
    const x = (i) => P + i * (W - P - 10) / (ws.length - 1), y = (v) => H - 20 - (v - lo) * (H - 30) / (hi - lo);
    const pts = ws.map((w, i) => x(i).toFixed(1) + ',' + y(w.lb).toFixed(1)).join(' ');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%"><line x1="' + P + '" x2="' + (W - 10) + '" y1="' + y(160) + '" y2="' + y(160) + '" stroke="currentColor" stroke-dasharray="4 4" opacity=".4"/><text x="' + (W - 60) + '" y="' + (y(160) - 4) + '">Goal 160</text><polyline points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2.5"/>' + ws.map((w, i) => '<circle cx="' + x(i) + '" cy="' + y(w.lb) + '" r="3" fill="var(--accent)"/>').join('') + '<text x="2" y="' + (y(hi - 1) + 4) + '">' + (hi - 1) + '</text><text x="2" y="' + (y(lo + 1) + 4) + '">' + (lo + 1) + '</text><text x="' + P + '" y="' + (H - 4) + '">' + ws[0].date.slice(5) + '</text><text x="' + (W - 50) + '" y="' + (H - 4) + '">' + ws[ws.length - 1].date.slice(5) + '</text></svg>';
  }

  function viewProgress() {
    const ws = S.weights.slice().sort((a, b) => a.date.localeCompare(b.date)), start = ws.length ? ws[0].lb : 140, latest = ws.length ? ws[ws.length - 1].lb : 140;
    let h = '<h2>Body weight</h2><div class="card"><div class="row"><label>Date<input id="w-date" value="' + today() + '" style="width:130px"></label><label>Weight (lb)<input id="w-lb" type="number" inputmode="decimal" step="0.1"></label><button class="primary" data-act="wlog">Log weight</button></div><div style="margin-top:10px">' + bar('Toward 160 lb', Math.max(latest - start, 0), Math.max(160 - start, 1), 'lb gained') + '</div><div class="small">Start ' + start + ' lb · latest ' + latest + ' lb · goal 160 lb. Aim for 0.25-0.5 lb/week. Weigh mornings 3-4×/week and compare weekly averages.</div>' + weightChart(ws);
    if (ws.length) h += '<div class="scroll"><table class="tbl"><tr><th>Date</th><th>lb</th><th></th></tr>' + ws.slice().reverse().map((w) => '<tr><td>' + w.date + '</td><td>' + w.lb + '</td><td><button data-act="wrm" data-v="' + w.date + '">✕</button></td></tr>').join('') + '</table></div>';
    h += '</div>';
    const days = Object.keys(S.logs).filter((d) => (S.logs[d] || []).length).sort().reverse().slice(0, 30);
    if (days.length) {
      h += '<h2>History</h2><div class="card scroll"><table class="tbl"><tr><th>Date</th><th>kcal</th><th>%</th><th>P</th><th>C</th><th>F</th></tr>' + days.map((d) => { const m = S.logs[d].reduce((a, e) => addM(a, e), ZERO), rr = rotation(d), t = targetFor(WEEKS[rr.week][rr.idx].focus), pct = r0(m.kcal / t.kcal * 100); return '<tr><td>' + d + '<div class="muted">' + rr.week + ' ' + WEEKS[rr.week][rr.idx].day + ' · ' + WEEKS[rr.week][rr.idx].focus + '</div></td><td>' + r0(m.kcal) + '</td><td class="' + (pct >= 90 && pct <= 110 ? 'good' : 'warn') + '">' + pct + '%</td><td>' + r0(m.p) + '</td><td>' + r0(m.c) + '</td><td>' + r0(m.f) + '</td></tr>'; }).join('') + '</table></div>';
    }
    const sw = Object.keys(S.swaps).filter((k) => (S.swaps[k] || '').trim());
    if (sw.length) h += '<h2>Swap requests</h2><div class="card small stack">' + sw.map((k) => '<div><b>' + esc(RECIPES[k].name) + ':</b> ' + esc(S.swaps[k]) + '</div>').join('') + '</div>';
    return h;
  }

  function viewCheckin() {
    const d = new Date(), dow = (d.getDay() + 6) % 7, nextMon = shiftIso(today(), 7 - dow);
    let h = '<div class="card"><b>Sunday weekly check-in</b><div class="muted">Every Sunday, before meal prep: note next week\'s schedule changes, weigh in, and flag foods to swap. Then send the summary to your assistant so the plan can be adjusted.</div></div>';
    h += '<div class="card stack"><label>Week starting (Monday)<input id="ci-week" value="' + nextMon + '" style="width:140px"></label>';
    h += '<div><div class="muted">Training days next week</div><div class="chips" id="ci-days">' + DAYS.map((x, i) => '<button class="chip' + (i < 5 ? ' on' : '') + '" data-act="cidays" data-v="' + i + '">' + x + '</button>').join('') + '</div></div>';
    h += '<div class="row"><label>Wake<input id="ci-wake" class="time" value="' + esc(S.times.wake) + '" placeholder="HH:MM"></label><label>Workout start<input id="ci-ws" class="time" value="' + esc(S.times.wStart) + '"></label><label>Workout end<input id="ci-we" class="time" value="' + esc(S.times.wEnd) + '"></label><label>Dinner<input id="ci-din" class="time" value="' + esc(S.times.dinner) + '"></label></div>';
    h += '<div class="row"><label>Weight today (lb)<input id="ci-lb" type="number" inputmode="decimal" step="0.1"></label><label>Energy / hunger (1-5)<input id="ci-energy" type="number" min="1" max="5" style="width:70px"></label></div>';
    h += '<label>Schedule changes (late shifts, travel, missed sessions)<textarea id="ci-notes"></textarea></label><label>Foods to swap / what worked<textarea id="ci-food"></textarea></label>';
    h += '<div class="chips"><button class="primary" data-act="cisave">Save check-in & apply times</button></div></div>';
    if (S.checkins.length) h += '<h2>Past check-ins</h2>' + S.checkins.slice().reverse().map((c, i) => '<div class="card small"><b>Week of ' + esc(c.week) + '</b> · saved ' + esc(c.saved) + '<div>Training: ' + esc(c.days.map((x) => DAYS[x]).join(', ') || 'none') + ' · workout ' + esc(tLabel(c.ws)) + '-' + esc(tLabel(c.we)) + ' · dinner ' + esc(tLabel(c.din)) + ' · wake ' + esc(tLabel(c.wake)) + '</div>' + (c.lb ? '<div>Weight ' + esc(c.lb) + ' lb</div>' : '') + (c.energy ? '<div>Energy/hunger ' + esc(c.energy) + '/5</div>' : '') + (c.notes ? '<div>Changes: ' + esc(c.notes) + '</div>' : '') + (c.food ? '<div>Food: ' + esc(c.food) + '</div>' : '') + '<div class="chips" style="margin-top:6px"><button data-act="cicopy" data-v="' + (S.checkins.length - 1 - i) + '">Copy summary</button><button data-act="cirm" data-v="' + (S.checkins.length - 1 - i) + '">Delete</button></div></div>').join('');
    return h;
  }

  function viewSettings() {
    const tt = targetFor('Push'), tl = targetFor('Legs'), tr = targetFor('Rest');
    let h = '<h2>Daily targets</h2><div class="card"><table class="tbl"><tr><th>Day type</th><th>kcal</th><th>P</th><th>C</th><th>F</th></tr><tr><td>Push / Pull / Upper</td><td>' + tt.kcal + '</td><td>' + tt.p + '</td><td>' + tt.c + '</td><td>' + tt.f + '</td></tr><tr><td>Legs / Lower</td><td>' + tl.kcal + '</td><td>' + tl.p + '</td><td>' + tl.c + '</td><td>' + tl.f + '</td></tr><tr><td>Rest</td><td>' + tr.kcal + '</td><td>' + tr.p + '</td><td>' + tr.c + '</td><td>' + tr.f + '</td></tr></table>';
    h += '<div class="row" style="margin-top:10px">' + [['kcal', 'Base kcal'], ['p', 'Protein g'], ['c', 'Carbs g'], ['f', 'Fat g'], ['bump', 'Leg-day carbs +g'], ['cut', 'Rest-day carbs −g']].map((x) => '<label>' + x[1] + '<input type="number" inputmode="numeric" data-inp="target" data-k="' + x[0] + '" value="' + esc(S.targets[x[0]]) + '"></label>').join('') + '</div><div class="chips" style="margin-top:8px"><button data-act="rtargets">Reset targets</button></div>';
    h += '<div class="small" style="margin-top:10px">How the target was set: Mifflin-St Jeor BMR for 35 y, 175 cm, 63.5 kg = 1,559 kcal (male) or 1,393 (female). × 1.65 activity ≈ 2,400-2,450 maintenance. + 400-450 lean-bulk surplus = 2,850-2,900 kcal. Protein 1 g per lb of goal weight = 160 g (the menu lands 170-195 g). Adjust after 2-3 weeks: gaining under 0.25 lb/week → add 200 kcal; over 1 lb/week → remove 200.</div></div>';
    h += '<h2>Schedule times</h2><div class="card"><div class="row">' + Object.keys(TIME_LABELS).map((k) => '<label>' + TIME_LABELS[k] + '<input class="time" data-inp="time" data-k="' + k + '" value="' + esc(S.times[k]) + '" placeholder="HH:MM"></label>').join('') + '</div><div class="muted" style="margin-top:6px">24-hour HH:MM. Dinner start-cooking times update automatically.</div><div class="chips" style="margin-top:8px"><button data-act="rtimes">Reset times</button></div></div>';
    h += '<h2>Supplements</h2><div class="card small stack"><div><b>Animal Pak:</b> 1 pack with breakfast (with food for absorption).</div><div><b>Creatine 5 g:</b> right after the workout (in chocolate milk on Legs/Lower days, water otherwise); rest days with breakfast. Daily consistency matters most.</div><div><b>BCAAs:</b> 1 serving in 20-24 oz water, sipped during the 90-min session.</div><div><b>Water:</b> 3-4 L a day.</div></div>';
    h += '<h2>Rotation</h2><div class="card"><label>Week A starts on (a Monday)<input data-inp="anchor" value="' + esc(S.anchor) + '" style="width:140px"></label></div>';
    h += '<h2>Your data</h2><div class="card"><div class="muted">Logs live only on this phone. Export a backup now and then.</div><div class="chips" style="margin-top:8px"><button data-act="export">Export backup</button><button data-act="import">Import backup</button></div><textarea id="io" placeholder="Backup text appears here / paste a backup to import"></textarea></div>';
    h += '<div class="muted" style="padding:0 4px 10px">Nutrition values are USDA-style per-100 g figures; brands vary ~10%. No oatmeal or sweet potatoes anywhere.</div>';
    return h;
  }

  const VIEWS = { today: viewToday, week: viewWeek, prep: viewPrep, progress: viewProgress, checkin: viewCheckin, settings: viewSettings };
  function render() {
    document.getElementById('app').innerHTML = VIEWS[S.tab]();
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
    const rr = rotation(today()), p = WEEKS[rr.week][rr.idx];
    document.getElementById('sub').textContent = 'Today: Week ' + rr.week + ' · ' + p.day + ' · ' + p.focus;
  }
  const toast = (msg) => { const t = document.createElement('div'); t.textContent = msg; t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#0f766e;color:#fff;padding:8px 14px;border-radius:10px;z-index:9;font-size:14px'; document.body.appendChild(t); setTimeout(() => t.remove(), 1600); };
  const addEntry = (e) => { (S.logs[S.logDate] = S.logs[S.logDate] || []).push(e); persist(); };
  const val = (id) => (document.getElementById(id) || {}).value || '';

  document.getElementById('tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; S.tab = b.dataset.tab; render(); window.scrollTo(0, 0); });
  document.getElementById('app').addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, v = el.dataset.v, key = el.dataset.key;
    if (a === 'toggle') S.open = S.open === key ? '' : key;
    else if (a === 'week') { S.week = v; S.open = ''; }
    else if (a === 'day') { S.day = +v; S.open = ''; }
    else if (a === 'jump') { const r = rotation(today()); S.week = r.week; S.day = r.idx; S.logDate = today(); S.open = ''; }
    else if (a === 'goday') { S.week = el.dataset.w; S.day = +v; S.tab = 'today'; S.open = ''; window.scrollTo(0, 0); }
    else if (a === 'portion') { S.portion[key] = +v; S.custom[key] = ''; }
    else if (a === 'log') {
      const rid = el.dataset.rid, r = RECIPES[rid], m = mealMult(key), ims = S.im[key] || r.items.map(() => 1), mac = recipeMac(r, m, ims);
      const adj = r.items.map((it, i) => (ims[i] !== 1 ? ING[it[0]][0] + ' ×' + fracLabel(ims[i]) : '')).filter(Boolean);
      addEntry({ id: Date.now() + rid, label: r.name, slot: r.slot, note: [fracLabel(m) + ' portion'].concat(adj).join('; '), kcal: r0(mac.kcal), p: r0(mac.p), c: r0(mac.c), f: r0(mac.f) });
      toast('Logged ' + r0(mac.kcal) + ' kcal');
    }
    else if (a === 'logall') { const lr = rotation(S.logDate); WEEKS[lr.week][lr.idx].meals.forEach((rid, i) => { const r = RECIPES[rid], m = recipeMac(r); addEntry({ id: Date.now() + '' + i + rid, label: r.name, slot: r.slot, note: '1 portion (as planned)', kcal: r0(m.kcal), p: r0(m.p), c: r0(m.c), f: r0(m.f) }); }); toast('Day logged'); }
    else if (a === 'supp') { addEntry({ id: Date.now() + v, label: v, slot: 'Supplement', note: 'taken', kcal: 0, p: 0, c: 0, f: 0 }); toast(v + ' logged'); }
    else if (a === 'cf') { const n = val('cf-name').trim(); if (!n) return; addEntry({ id: Date.now() + 'c', label: n, slot: 'Off-plan', note: 'custom', kcal: +val('cf-kcal') || 0, p: +val('cf-p') || 0, c: +val('cf-c') || 0, f: +val('cf-f') || 0 }); }
    else if (a === 'rm') { S.logs[S.logDate] = (S.logs[S.logDate] || []).filter((x) => String(x.id) !== el.dataset.id); persist(); }
    else if (a === 'ld') S.logDate = shiftIso(S.logDate, +v);
    else if (a === 'ldt') S.logDate = today();
    else if (a === 'glance') S.glance = v;
    else if (a === 'shop') S.shopWeek = v;
    else if (a === 'wlog') { const lb = +val('w-lb'), d = val('w-date').trim(); if (!(lb > 50) || !parseIso(d)) { toast('Enter a date and weight'); return; } S.weights = S.weights.filter((w) => w.date !== d).concat([{ date: d, lb }]); persist(); toast('Weight saved'); }
    else if (a === 'wrm') { S.weights = S.weights.filter((w) => w.date !== v); persist(); }
    else if (a === 'cidays') { el.classList.toggle('on'); return; }
    else if (a === 'cisave') {
      const days = [...document.querySelectorAll('#ci-days .chip.on')].map((b) => +b.dataset.v);
      const c = { week: val('ci-week'), saved: today(), days, wake: val('ci-wake'), ws: val('ci-ws'), we: val('ci-we'), din: val('ci-din'), lb: val('ci-lb'), energy: val('ci-energy'), notes: val('ci-notes'), food: val('ci-food') };
      S.checkins.push(c);
      [['wake', c.wake], ['wStart', c.ws], ['wEnd', c.we], ['dinner', c.din]].forEach((x) => { if (toMin(x[1]) !== null) S.times[x[0]] = x[1]; });
      if (+c.lb > 50) S.weights = S.weights.filter((w) => w.date !== today()).concat([{ date: today(), lb: +c.lb }]);
      persist(); toast('Check-in saved, times applied');
    }
    else if (a === 'cicopy') {
      const c = S.checkins[+v];
      const txt = 'Lean Bulk check-in, week of ' + c.week + ': training ' + (c.days.map((x) => DAYS[x]).join(', ') || 'none') + '; wake ' + tLabel(c.wake) + '; workout ' + tLabel(c.ws) + '-' + tLabel(c.we) + '; dinner ' + tLabel(c.din) + (c.lb ? '; weight ' + c.lb + ' lb' : '') + (c.energy ? '; energy/hunger ' + c.energy + '/5' : '') + (c.notes ? '; changes: ' + c.notes : '') + (c.food ? '; food: ' + c.food : '') + '.';
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Summary copied'), () => { prompt('Copy this summary:', txt); });
      return;
    }
    else if (a === 'cirm') { if (confirm('Delete this check-in?')) { S.checkins.splice(+v, 1); persist(); } }
    else if (a === 'rtargets') { S.targets = Object.assign({}, DEF_TARGETS); persist(); }
    else if (a === 'rtimes') { S.times = Object.assign({}, DEF_TIMES); persist(); }
    else if (a === 'export') { document.getElementById('io').value = JSON.stringify({ targets: S.targets, times: S.times, anchor: S.anchor, logs: S.logs, weights: S.weights, swaps: S.swaps, checkins: S.checkins }); return; }
    else if (a === 'import') { try { const o = JSON.parse(document.getElementById('io').value); ['targets', 'times', 'anchor', 'logs', 'weights', 'swaps', 'checkins'].forEach((k) => { if (o[k] !== undefined) S[k] = o[k]; }); persist(); toast('Backup imported'); } catch (err) { toast('That backup text is not valid'); return; } }
    else return;
    render();
  });
  document.getElementById('app').addEventListener('change', (e) => {
    const el = e.target, k = el.dataset.inp; if (!k) return;
    if (k === 'im') { const key = el.dataset.key, n = +el.dataset.n; const arr = (S.im[key] || Array(n).fill(1)).slice(); arr[+el.dataset.i] = +el.value; S.im[key] = arr; render(); }
    else if (k === 'custom') { S.custom[el.dataset.key] = el.value; render(); }
    else if (k === 'swap') { S.swaps[el.dataset.rid] = el.value; persist(); }
    else if (k === 'logdate') { if (parseIso(el.value)) { S.logDate = el.value.trim(); render(); } }
    else if (k === 'target') { if (el.value !== '' && isFinite(+el.value)) { S.targets[el.dataset.k] = +el.value; persist(); render(); } }
    else if (k === 'time') { if (toMin(el.value) !== null) { S.times[el.dataset.k] = el.value.trim(); persist(); } else toast('Use HH:MM, e.g. 18:00'); }
    else if (k === 'anchor') { if (parseIso(el.value)) { S.anchor = el.value.trim(); persist(); render(); } }
  });
  render();
})();
