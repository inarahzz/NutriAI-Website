/* ============================
   NutriAI - Chat Engine
   Intent-aware food AI chatbot
   ============================ */

(function () {
    'use strict';

    let conversations = loadConversations();
    let activeConversationId = null;

    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const historyList = document.getElementById('history-list');
    const chatTitle = document.getElementById('chat-title');
    const welcomeState = document.getElementById('welcome-state');
    const suggestedPrompts = document.getElementById('suggested-prompts');
    const exportChatBtn = document.getElementById('export-chat-btn');
    const deleteChatBtn = document.getElementById('delete-chat-btn');
    const exportAllBtn = document.getElementById('export-all-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('chat-sidebar');

    if (!chatMessages || !chatInput) return;

    renderSidebar();
    showWelcome();

    sendBtn.addEventListener('click', () => handleSend());
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } });
    newChatBtn.addEventListener('click', () => startNewChat());
    document.querySelectorAll('.prompt-chip').forEach(chip => { chip.addEventListener('click', () => { chatInput.value = chip.textContent; handleSend(); }); });
    exportChatBtn.addEventListener('click', () => exportToPDF());
    deleteChatBtn.addEventListener('click', () => deleteActiveChat());
    exportAllBtn.addEventListener('click', () => exportAllToPDF());
    deleteAllBtn.addEventListener('click', () => deleteAllChats());
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;
        if (!activeConversationId) {
            const convo = { id: 'chat_' + Date.now(), title: text.substring(0, 35) + (text.length > 35 ? '...' : ''), messages: [], createdAt: Date.now(), updatedAt: Date.now() };
            conversations.unshift(convo);
            activeConversationId = convo.id;
            chatTitle.textContent = convo.title;
        }
        hideWelcome();
        appendMsg('user', text);
        saveMsg('user', text);
        chatInput.value = '';
        renderSidebar();
        const typingEl = createTyping();
        chatMessages.appendChild(typingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => { typingEl.remove(); const r = generateResponse(text); appendMsg('ai', r); saveMsg('ai', r); renderSidebar(); }, 700 + Math.random() * 400);
    }

    function saveMsg(role, content) {
        const c = conversations.find(x => x.id === activeConversationId);
        if (!c) return;
        c.messages.push({ role, content, time: Date.now() });
        c.updatedAt = Date.now();
        if (role === 'user' && c.messages.filter(m => m.role === 'user').length === 1) { c.title = content.substring(0, 35) + (content.length > 35 ? '...' : ''); chatTitle.textContent = c.title; }
        saveConversations();
    }

    function appendMsg(role, content) {
        const div = document.createElement('div');
        div.className = `message message-${role}`;
        const exportBtn = role === 'ai' ? `<button class="msg-export-btn" title="Export to PDF">📄</button>` : '';
        div.innerHTML = `<div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div><div class="message-content"><div class="message-bubble">${content}</div>${role === 'ai' ? `<div class="message-actions">${exportBtn}</div>` : ''}</div>`;
        if (role === 'ai') { const btn = div.querySelector('.msg-export-btn'); if (btn) btn.addEventListener('click', () => exportSingleAnswer(content)); }
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createTyping() { const d = document.createElement('div'); d.className = 'message message-ai typing-indicator'; d.innerHTML = `<div class="message-avatar">🤖</div><div class="message-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`; return d; }
    function showWelcome() { chatMessages.innerHTML = ''; if (welcomeState) { chatMessages.appendChild(welcomeState); welcomeState.style.display = ''; } if (suggestedPrompts) suggestedPrompts.style.display = ''; chatTitle.textContent = 'New Chat'; activeConversationId = null; }
    function hideWelcome() { if (welcomeState) welcomeState.style.display = 'none'; if (suggestedPrompts) suggestedPrompts.style.display = 'none'; }
    function startNewChat() { showWelcome(); renderSidebar(); chatInput.value = ''; chatInput.focus(); sidebar.classList.remove('open'); }

    function loadConversation(id) { const c = conversations.find(x => x.id === id); if (!c) return; activeConversationId = id; chatTitle.textContent = c.title; chatMessages.innerHTML = ''; hideWelcome(); if (c.messages.length === 0) { showWelcome(); } else { c.messages.forEach(m => appendMsg(m.role, m.content)); } renderSidebar(); sidebar.classList.remove('open'); }
    function deleteActiveChat() { if (!activeConversationId) return; if (!confirm('Delete this conversation?')) return; conversations = conversations.filter(c => c.id !== activeConversationId); saveConversations(); startNewChat(); showToast('Chat deleted.'); }
    function deleteAllChats() { if (!conversations.length) return; if (!confirm('Delete all conversations?')) return; conversations = []; saveConversations(); startNewChat(); showToast('All chats deleted.'); }

    function exportSingleAnswer(content) {
        const w = window.open('', '_blank');
        if (!w) { showToast('Allow popups to export.'); return; }
        const clean = content.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
        w.document.write(`<!DOCTYPE html><html><head><title>NutriAI</title><style>body{font-family:-apple-system,sans-serif;max-width:650px;margin:0 auto;padding:40px 28px;color:#2d3436;line-height:1.7}.h{display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #2d8a4e}.h h1{font-size:16px;color:#2d8a4e;margin:0}.c{font-size:14px;line-height:1.8}.c strong{color:#1a1a2e}.f{margin-top:32px;padding-top:14px;border-top:1px solid #e0e0e0;font-size:10px;color:#999;text-align:center}@media print{body{padding:20px}}</style></head><body><div class="h"><span style="font-size:24px">🥗</span><h1>NutriAI</h1></div><div class="c">${clean}</div><div class="f">Generated by NutriAI • ${new Date().toLocaleDateString()} • Republic Polytechnic</div><script>window.onload=function(){window.print()}<\/script></body></html>`);
        w.document.close();
    }

    function exportToPDF() { const c = conversations.find(x => x.id === activeConversationId); if (!c || !c.messages.length) { showToast('No messages to export.'); return; } exportSingleAnswer(c.messages.filter(m => m.role === 'ai').map(m => m.content).join('<br><br><hr style="border:none;border-top:1px solid #eee;margin:16px 0"><br>')); }
    function exportAllToPDF() { if (!conversations.length) { showToast('No chats.'); return; } const all = conversations.map(c => `<strong>${c.title}</strong><br>` + c.messages.filter(m => m.role === 'ai').map(m => m.content).join('<br><br>')).join('<br><br><hr style="border:none;border-top:2px solid #2d8a4e;margin:24px 0"><br>'); exportSingleAnswer(all); }

    function renderSidebar() {
        historyList.innerHTML = '';
        if (!conversations.length) { historyList.innerHTML = '<p class="no-chats">No conversations yet</p>'; return; }
        conversations.forEach(convo => {
            const item = document.createElement('div');
            item.className = `history-item${convo.id === activeConversationId ? ' active' : ''}`;
            item.innerHTML = `<span class="history-item-text" title="${convo.title}">${convo.title}</span><button class="history-item-delete" title="Delete">×</button>`;
            item.addEventListener('click', (e) => { if (e.target.classList.contains('history-item-delete')) return; loadConversation(convo.id); });
            item.querySelector('.history-item-delete').addEventListener('click', (e) => { e.stopPropagation(); conversations = conversations.filter(c => c.id !== convo.id); saveConversations(); if (convo.id === activeConversationId) startNewChat(); else renderSidebar(); showToast('Chat deleted.'); });
            historyList.appendChild(item);
        });
    }

    function loadConversations() { try { const d = localStorage.getItem('nutriai_chats'); return d ? JSON.parse(d) : []; } catch(e) { return []; } }
    function saveConversations() { localStorage.setItem('nutriai_chats', JSON.stringify(conversations)); }

    // =============================
    // INTENT-AWARE AI RESPONSE ENGINE
    // =============================
    function generateResponse(input) {
        const lower = input.toLowerCase();

        // Detect user intent
        const wantsRecipe = /recipe|how to make|how to cook|how do i make|cook|prepare|make a|make me/.test(lower);
        const wantsCalories = /calorie|kcal|how many cal|nutrition|macro/.test(lower);
        const wantsAlternative = /alternative|healthier|swap|replace|instead of|better option|substitute/.test(lower);
        const wantsIngredients = /ingredient|what.?s in|made of|contain|what goes in/.test(lower);
        const asksHealthy = /is .+ healthy|is .+ good|is .+ bad|healthy\?/.test(lower);

        // Greetings
        if (/^(hi|hey|hello|yo|sup)\b/.test(lower)) {
            return "Hey! 👋 I'm NutriAI. Ask me anything food-related:<br><br>• 🍳 <strong>Recipes</strong> — \"give me a healthy pasta recipe\"<br>• 📊 <strong>Calories</strong> — \"how many calories in nasi lemak?\"<br>• 🥦 <strong>Ingredients</strong> — \"what's in a caesar salad?\"<br>• 🔄 <strong>Alternatives</strong> — \"healthier alternative to bubble tea\"<br><br>What can I help you with?";
        }
        if (lower.includes('thank') || lower.includes('thanks')) {
            return "You're welcome! 😊 Eat well and come back anytime you need nutrition help. 🥗";
        }

        // Extract food from input
        const food = extractFood(input);

        // RECIPE INTENT
        if (wantsRecipe) {
            return getRecipe(food, lower);
        }

        // CALORIES / NUTRITION INTENT
        if (wantsCalories) {
            return getCalories(food, lower);
        }

        // ALTERNATIVE INTENT
        if (wantsAlternative) {
            return getAlternative(food, lower);
        }

        // INGREDIENTS INTENT
        if (wantsIngredients) {
            return getIngredients(food, lower);
        }

        // IS IT HEALTHY?
        if (asksHealthy) {
            return getHealthCheck(food, lower);
        }

        // FOOD-SPECIFIC (no clear intent — give overview)
        if (food && foodDB[food]) {
            return getFoodOverview(food);
        }

        // Meal time suggestions
        if (lower.includes('breakfast') || lower.includes('morning')) return getMealSuggestions('breakfast');
        if (lower.includes('lunch') || lower.includes('suggest') || lower.includes('recommend') || lower.includes('what should')) return getMealSuggestions('lunch');
        if (lower.includes('dinner') || lower.includes('evening')) return getMealSuggestions('dinner');
        if (lower.includes('snack') || lower.includes('hungry') || lower.includes('craving')) return getMealSuggestions('snack');

        // Topics
        if (lower.includes('protein')) return getTopic('protein');
        if (lower.includes('weight') || lower.includes('lose') || lower.includes('diet')) return getTopic('weight');
        if (lower.includes('water') || lower.includes('hydrat')) return getTopic('water');
        if (lower.includes('sugar') || lower.includes('sweet')) return getTopic('sugar');
        if (lower.includes('exercise') || lower.includes('gym') || lower.includes('workout')) return getTopic('exercise');
        if (lower.includes('vitamin') || lower.includes('nutrient')) return getTopic('vitamins');

        // If food detected but not in DB
        if (food) return getFoodOverview(food);

        // Default
        return `I can help with that! Try asking:<br><br>• "Give me a healthy <strong>[food]</strong> recipe"<br>• "How many calories in <strong>[food]</strong>?"<br>• "What's a healthier alternative to <strong>[food]</strong>?"<br>• "What ingredients are in <strong>[food]</strong>?"<br><br>I know about pasta, rice, noodles, chicken, pizza, burgers, bubble tea, local hawker food, and much more!`;
    }

    // =============================
    // FOOD DATABASE
    // =============================
    const foodDB = {
        pasta: { cal: '400-800', protein: '12-20g', fat: '10-35g', carbs: '50-80g' },
        'chicken rice': { cal: '607', protein: '27g', fat: '23g', carbs: '68g' },
        'nasi lemak': { cal: '640-795', protein: '18-38g', fat: '32-43g', carbs: '62-72g' },
        'mee goreng': { cal: '550', protein: '16g', fat: '24g', carbs: '68g' },
        pizza: { cal: '568 (2 slices)', protein: '22g', fat: '28g', carbs: '56g' },
        burger: { cal: '900 (with fries)', protein: '29g', fat: '48g', carbs: '87g' },
        'bubble tea': { cal: '440', protein: '2g', fat: '8g', carbs: '88g (55g sugar)' },
        'roti prata': { cal: '520 (2pcs)', protein: '12g', fat: '26g', carbs: '60g' },
        rice: { cal: '240 (1 cup)', protein: '5g', fat: '0.5g', carbs: '53g' },
        oatmeal: { cal: '320', protein: '12g', fat: '6g', carbs: '55g' },
        salad: { cal: '200-400', protein: '10-25g', fat: '8-20g', carbs: '15-30g' },
        sandwich: { cal: '350-500', protein: '15-28g', fat: '10-20g', carbs: '35-50g' },
        sushi: { cal: '300-500', protein: '15-25g', fat: '5-15g', carbs: '40-65g' },
        steak: { cal: '500-700', protein: '40-55g', fat: '25-45g', carbs: '0g' },
        soup: { cal: '150-400', protein: '10-28g', fat: '3-12g', carbs: '15-40g' },
        eggs: { cal: '155 (2 eggs)', protein: '13g', fat: '11g', carbs: '1g' },
        fish: { cal: '200-350', protein: '25-35g', fat: '5-15g', carbs: '0-10g' },
        tofu: { cal: '180-250', protein: '15-20g', fat: '8-12g', carbs: '5-15g' },
        bread: { cal: '140 (2 slices)', protein: '5g', fat: '2g', carbs: '26g' },
        noodles: { cal: '350-550', protein: '10-25g', fat: '5-25g', carbs: '45-70g' }
    };

    function extractFood(input) {
        const lower = input.toLowerCase();
        const foods = Object.keys(foodDB);
        for (const f of foods) { if (lower.includes(f)) return f; }
        // Try to extract food noun
        const match = lower.match(/(?:of|in|for|about|make|cook|recipe for)\s+(?:a\s+|an\s+)?(?:healthy\s+)?(.+?)(?:\?|$|\.)/);
        if (match) return match[1].trim();
        const match2 = lower.match(/(?:i ate|i had|i eat)\s+(?:a\s+|an\s+|some\s+)?(.+?)(?:\?|$|\.)/);
        if (match2) return match2[1].trim();
        return null;
    }

    // =============================
    // INTENT HANDLERS
    // =============================
    function getRecipe(food, lower) {
        const f = food || 'a healthy meal';
        const recipes = {
            pasta: `<strong>Healthy Pasta Recipe (420 kcal)</strong><br><br><strong>Ingredients:</strong><br>• 80g whole wheat pasta<br>• 100g cherry tomatoes, halved<br>• 2 cups spinach<br>• 100g grilled chicken breast, sliced<br>• 1 tbsp olive oil<br>• 2 cloves garlic, minced<br>• Salt, pepper, chili flakes<br>• Fresh basil<br><br><strong>Instructions:</strong><br>1. Cook pasta al dente, drain (save ¼ cup pasta water)<br>2. Heat olive oil, sauté garlic 30 seconds<br>3. Add tomatoes, cook 3 mins until soft<br>4. Add spinach, wilt 1 min<br>5. Toss in pasta + splash of pasta water<br>6. Top with chicken, basil, pepper<br><br>📊 <strong>Per serving:</strong> 420 kcal | 35g protein | 45g carbs | 12g fat | 6g fibre`,
            rice: `<strong>Healthy Fried Rice (380 kcal)</strong><br><br><strong>Ingredients:</strong><br>• 1 cup cooked brown rice (cold, day-old is best)<br>• 2 eggs, scrambled<br>• 100g chicken breast, diced<br>• ½ cup mixed vegetables (peas, corn, carrots)<br>• 1 tsp sesame oil<br>• 1 tbsp low-sodium soy sauce<br>• Spring onions<br><br><strong>Instructions:</strong><br>1. Heat sesame oil in wok on high heat<br>2. Cook chicken until golden, set aside<br>3. Scramble eggs, break into pieces<br>4. Add rice, stir-fry 3 mins<br>5. Add vegetables, chicken, soy sauce<br>6. Toss 2 mins, garnish with spring onions<br><br>📊 380 kcal | 28g protein | 42g carbs | 10g fat`,
            salad: `<strong>High-Protein Salad Bowl (400 kcal)</strong><br><br><strong>Ingredients:</strong><br>• 2 cups mixed greens<br>• 120g grilled chicken breast<br>• ½ avocado, sliced<br>• ¼ cup chickpeas<br>• Cherry tomatoes, cucumber<br>• 1 tbsp olive oil + lemon juice dressing<br>• Seeds (pumpkin or sunflower)<br><br><strong>Instructions:</strong><br>1. Arrange greens in bowl<br>2. Top with chicken, avocado, chickpeas, veggies<br>3. Drizzle olive oil + lemon<br>4. Sprinkle seeds<br><br>📊 400 kcal | 35g protein | 22g carbs | 20g fat (healthy fats)`,
            oatmeal: `<strong>Overnight Oats (350 kcal)</strong><br><br><strong>Ingredients:</strong><br>• ½ cup rolled oats<br>• ½ cup milk (or almond milk)<br>• ¼ cup Greek yogurt<br>• 1 tbsp chia seeds<br>• 1 banana, sliced<br>• 1 tbsp peanut butter<br>• Honey (optional)<br><br><strong>Instructions:</strong><br>1. Mix oats + milk + yogurt + chia seeds<br>2. Refrigerate overnight (or 4+ hours)<br>3. Top with banana + peanut butter in the morning<br><br>📊 350 kcal | 15g protein | 48g carbs | 12g fat | 8g fibre`,
            sandwich: `<strong>Healthy Chicken Wrap (420 kcal)</strong><br><br><strong>Ingredients:</strong><br>• 1 whole wheat tortilla<br>• 100g grilled chicken, sliced<br>• Mixed lettuce, tomato, cucumber<br>• 2 tbsp hummus<br>• ¼ avocado<br><br><strong>Instructions:</strong><br>1. Spread hummus on tortilla<br>2. Layer chicken, avocado, veggies<br>3. Roll tightly, cut in half<br><br>📊 420 kcal | 32g protein | 38g carbs | 16g fat`
        };
        const key = Object.keys(recipes).find(k => (food || '').includes(k));
        if (key) return recipes[key];
        return `<strong>Healthy ${f.charAt(0).toUpperCase() + f.slice(1)} — General Tips</strong><br><br>I don't have a specific recipe for "${f}" yet, but here's how to make any dish healthier:<br><br><strong>Cooking methods (best → worst):</strong><br>1. ✅ Steamed / boiled<br>2. ✅ Grilled / baked<br>3. ⚠️ Stir-fried (minimal oil)<br>4. ❌ Deep-fried<br><br><strong>General principles:</strong><br>• Use lean protein (chicken breast, fish, tofu)<br>• Add vegetables for fibre & volume<br>• Use whole grains instead of refined<br>• Season with herbs/spices instead of heavy sauces<br>• Control oil — 1 tbsp max per serving<br><br>Want me to suggest a recipe for a specific dish?`;
    }

    function getCalories(food, lower) {
        const f = food || 'that food';
        const data = foodDB[food];
        if (data) {
            return `<strong>Nutrition: ${f.charAt(0).toUpperCase() + f.slice(1)}</strong><br><br>📊 <strong>Calories:</strong> ${data.cal} kcal<br>🥩 <strong>Protein:</strong> ${data.protein}<br>🍚 <strong>Carbs:</strong> ${data.carbs}<br>🥑 <strong>Fat:</strong> ${data.fat}<br><br>💡 These values are per standard serving. Actual calories depend on portion size, preparation method, and added sauces/toppings.<br><br>Want a healthier alternative or recipe?`;
        }
        return `I don't have exact data for "${f}" in my database, but here's how to estimate:<br><br>• Steamed/boiled dishes: typically 300-450 kcal<br>• Stir-fried dishes: typically 450-600 kcal<br>• Deep-fried dishes: typically 600-900 kcal<br><br>For an accurate breakdown, try our <a href="meal-analysis.html" style="color:#2d8a4e;font-weight:500;">Meal Analysis</a> tool!`;
    }

    function getAlternative(food, lower) {
        const f = food || 'that food';
        const alts = {
            pasta: "Instead of cream-based pasta (650 kcal), try:<br>✅ <strong>Zucchini noodles + tomato sauce</strong> — 180 kcal<br>✅ <strong>Whole wheat pasta + grilled veggies</strong> — 420 kcal<br>✅ <strong>Konjac/shirataki noodles</strong> — 20 kcal (almost zero!)",
            'bubble tea': "Instead of full-sugar bubble tea (440 kcal), try:<br>✅ <strong>Iced green tea, 0% sugar</strong> — 5 kcal<br>✅ <strong>Fresh fruit tea, 25% sugar</strong> — 80 kcal<br>✅ <strong>Sparkling water + lemon</strong> — 5 kcal",
            burger: "Instead of burger + fries (900 kcal), try:<br>✅ <strong>Grilled chicken wrap + salad</strong> — 460 kcal<br>✅ <strong>Lettuce-wrapped burger (no bun)</strong> — 400 kcal<br>✅ <strong>Turkey burger + sweet potato</strong> — 520 kcal",
            pizza: "Instead of 2 slices pepperoni pizza (568 kcal), try:<br>✅ <strong>Whole wheat pita + veggies + hummus</strong> — 320 kcal<br>✅ <strong>Cauliflower crust pizza</strong> — 380 kcal<br>✅ <strong>Portobello mushroom pizza</strong> — 250 kcal",
            'nasi lemak': "Instead of nasi lemak (640 kcal), try:<br>✅ <strong>Grilled chicken + brown rice + veggies</strong> — 420 kcal<br>✅ <strong>Nasi lemak with steamed chicken, no fried items</strong> — 450 kcal<br>✅ <strong>Overnight oats + banana</strong> (for breakfast) — 380 kcal",
            'chicken rice': "Instead of roasted chicken rice (607 kcal), try:<br>✅ <strong>Steamed chicken + plain rice + cucumber</strong> — 440 kcal<br>✅ <strong>Sliced fish soup with rice</strong> — 400 kcal<br>✅ <strong>Chicken soup with brown rice</strong> — 380 kcal",
            'roti prata': "Instead of roti prata (520 kcal), try:<br>✅ <strong>Thosai with sambar</strong> — 250 kcal<br>✅ <strong>Whole wheat chapati</strong> — 200 kcal<br>✅ <strong>Idli with chutney</strong> — 180 kcal",
            rice: "Instead of white rice, try:<br>✅ <strong>Brown rice</strong> — same calories, 3× more fibre<br>✅ <strong>Cauliflower rice</strong> — 25 kcal vs 240 kcal<br>✅ <strong>Quinoa</strong> — more protein, complete amino acids"
        };
        const key = Object.keys(alts).find(k => (food || '').includes(k));
        if (key) return `<strong>Healthier alternatives to ${key}:</strong><br><br>${alts[key]}<br><br>Check our <a href="alternatives.html" style="color:#2d8a4e;font-weight:500;">Healthy Alternatives</a> page for 20+ swap guides!`;
        return `Healthier alternatives for <strong>${f}</strong>:<br><br>General swaps that always work:<br>✅ Grilled/steamed instead of fried<br>✅ Brown rice/whole wheat instead of white<br>✅ Water/green tea instead of sugary drinks<br>✅ More vegetables, less sauce<br>✅ Smaller portion + side salad<br><br>Tell me the specific food and I'll give you targeted alternatives!`;
    }

    function getIngredients(food, lower) {
        const f = food || 'that food';
        const ingredients = {
            'nasi lemak': "🍛 <strong>Nasi Lemak ingredients:</strong><br><br>• Coconut milk rice (rice cooked in santan + pandan leaf)<br>• Sambal (chili paste with anchovies & onion)<br>• Fried chicken wing or drumstick<br>• Hard-boiled or fried egg<br>• Ikan bilis (fried anchovies)<br>• Roasted peanuts<br>• Cucumber slices<br>• Sometimes: otah, fish cake, luncheon meat<br><br>⚠️ The coconut milk and fried items are what make it calorie-dense.",
            'chicken rice': "🍚 <strong>Chicken Rice ingredients:</strong><br><br>• Poached/roasted whole chicken<br>• Rice cooked in chicken fat + garlic + pandan<br>• Chicken broth<br>• Ginger-scallion sauce<br>• Sweet dark soy sauce<br>• Chili sauce (garlic + chili + lime)<br>• Cucumber slices<br>• Sesame oil<br><br>⚠️ The rice is oily because it's cooked in rendered chicken fat.",
            pasta: "🍝 <strong>Pasta ingredients (varies by type):</strong><br><br><strong>Basic pasta:</strong> durum wheat semolina + water (sometimes eggs)<br><br><strong>Carbonara:</strong> pasta + eggs + pancetta/bacon + parmesan + black pepper<br><strong>Aglio olio:</strong> pasta + olive oil + garlic + chili flakes + parsley<br><strong>Marinara:</strong> pasta + tomatoes + garlic + basil + olive oil<br><strong>Pesto:</strong> pasta + basil + pine nuts + parmesan + olive oil",
            pizza: "🍕 <strong>Pizza ingredients:</strong><br><br><strong>Dough:</strong> flour, yeast, water, olive oil, salt, sugar<br><strong>Sauce:</strong> crushed tomatoes, garlic, oregano, basil<br><strong>Cheese:</strong> mozzarella (high fat — 280 kcal per 100g)<br><strong>Toppings:</strong> varies (pepperoni, mushrooms, peppers, etc.)<br><br>⚠️ Most calories come from the cheese and processed meat toppings.",
            burger: "🍔 <strong>Burger ingredients:</strong><br><br>• Beef patty (or chicken/fish fillet)<br>• Burger bun (white flour, sesame seeds)<br>• Lettuce, tomato, onion, pickles<br>• Cheese slice (American/cheddar)<br>• Sauces: mayo, ketchup, special sauce<br>• Fries: potato, vegetable oil, salt<br><br>⚠️ The bun + cheese + sauces add 300+ kcal on top of the patty."
        };
        const key = Object.keys(ingredients).find(k => (food || '').includes(k));
        if (key) return ingredients[key];
        return `I don't have a full ingredient list for "${f}" yet.<br><br>But here's what typically makes food unhealthy:<br>• 🛢️ Added oils/fats (frying, butter, cream)<br>• 🧂 Excess sodium (soy sauce, MSG, salt)<br>• 🍬 Added sugars (sauces, marinades)<br>• 🧀 Processed ingredients (cheese, processed meat)<br><br>Ask me about a specific dish and I'll tell you exactly what's in it!`;
    }

    function getHealthCheck(food, lower) {
        const f = food || 'that food';
        if (foodDB[food]) {
            const data = foodDB[food];
            const cal = parseInt(data.cal) || 500;
            const verdict = cal <= 400 ? "relatively healthy" : cal <= 600 ? "moderate — watch portion sizes" : "high-calorie — best as an occasional treat";
            return `<strong>Is ${f} healthy?</strong><br><br>📊 At <strong>${data.cal} kcal</strong>, it's <strong>${verdict}</strong>.<br><br>Nutrition: ${data.protein} protein | ${data.carbs} carbs | ${data.fat} fat<br><br>It depends on how it's prepared:<br>✅ Steamed/grilled version = healthier<br>❌ Fried/cream-based version = less healthy<br><br>Want me to suggest a healthier version or recipe?`;
        }
        return `<strong>Is ${f} healthy?</strong><br><br>It depends on:<br>• <strong>Preparation:</strong> steamed vs fried makes a 200-300 kcal difference<br>• <strong>Portion size:</strong> even healthy food can be too much<br>• <strong>Frequency:</strong> occasional treats are fine<br>• <strong>What's added:</strong> sauces, oils, and cheese add hidden calories<br><br>Tell me the specific dish and how it's prepared — I'll give you a clearer answer!`;
    }

    function getFoodOverview(food) {
        const f = food || 'that food';
        const data = foodDB[food];
        if (data) {
            return `<strong>${f.charAt(0).toUpperCase() + f.slice(1)} — Overview</strong><br><br>📊 <strong>Calories:</strong> ${data.cal} kcal<br>🥩 <strong>Protein:</strong> ${data.protein}<br>🍚 <strong>Carbs:</strong> ${data.carbs}<br>🥑 <strong>Fat:</strong> ${data.fat}<br><br>I can also help you with:<br>• 🍳 "Give me a healthy ${food} recipe"<br>• 🔄 "What's a healthier alternative to ${food}?"<br>• 🥦 "What ingredients are in ${food}?"<br><br>Just ask!`;
        }
        return `I can help with <strong>${f}</strong>! What would you like to know?<br><br>• 📊 "How many calories in ${f}?"<br>• 🍳 "Give me a healthy ${f} recipe"<br>• 🔄 "Healthier alternative to ${f}?"<br>• 🥦 "What ingredients are in ${f}?"<br><br>Or check our <a href="meal-analysis.html" style="color:#2d8a4e;font-weight:500;">Meal Analysis</a> tool for a full breakdown.`;
    }

    function getMealSuggestions(meal) {
        const meals = {
            breakfast: "🌅 <strong>Healthy breakfast ideas:</strong><br><br>🥣 <strong>Oatmeal + banana + peanut butter</strong> — 380 kcal, 7g fibre<br>🍳 <strong>2 eggs on wholemeal toast</strong> — 350 kcal, 18g protein<br>🥤 <strong>Greek yogurt + granola + berries</strong> — 300 kcal<br>🥑 <strong>Avocado toast with egg</strong> — 380 kcal<br>🥞 <strong>Thosai + sambar</strong> — 250 kcal (vs prata 520!)<br><br>Key: protein + fibre = sustained energy.",
            lunch: "☀️ <strong>Healthy lunch options (under $6):</strong><br><br>🥗 <strong>Grilled chicken + brown rice + veggies</strong> — 420 kcal, 35g protein<br>🍲 <strong>Soup noodles + lean meat</strong> — 380 kcal, 28g protein<br>🐟 <strong>Sliced fish soup + rice</strong> — 400 kcal, 32g protein<br>🥪 <strong>Whole wheat chicken wrap</strong> — 450 kcal<br>🥗 <strong>Yong tau foo (soup)</strong> — 350 kcal<br><br>Rule: ¼ protein, ¼ carbs, ½ vegetables.",
            dinner: "🌙 <strong>Healthy dinner ideas:</strong><br><br>🐟 <strong>Steamed fish + rice + vegetables</strong> — 450 kcal<br>🍲 <strong>Clear soup + tofu + vegetables</strong> — 250 kcal<br>🥗 <strong>Grilled salmon salad</strong> — 400 kcal<br>🍛 <strong>Dhal + brown rice</strong> — 420 kcal<br><br>Tips: eat lighter than lunch, finish 2-3 hrs before bed.",
            snack: "🍿 <strong>Healthy snacks under 200 kcal:</strong><br><br>🍿 Air-popped popcorn — 120 kcal<br>🥜 Mixed nuts (20g) — 130 kcal<br>🍌 Banana + peanut butter — 190 kcal<br>🥒 Cucumber + hummus — 100 kcal<br>🫐 Greek yogurt + berries — 150 kcal<br><br>Avoid: curry puffs (440 kcal), chips (320 kcal)."
        };
        return meals[meal] || meals.lunch;
    }

    function getTopic(topic) {
        const topics = {
            protein: "💪 <strong>High-protein meals:</strong><br><br>• Grilled chicken + rice — 35g<br>• 2 eggs + toast — 18g<br>• Sliced fish soup — 32g<br>• Tofu stir-fry — 20g<br>• Greek yogurt + nuts — 22g<br><br>Target: 0.8–1.2g per kg body weight daily.",
            weight: "⚖️ <strong>Weight management tips:</strong><br><br>1. 500 kcal/day deficit = ~0.45 kg/week loss<br>2. Never below 1,200 (women) / 1,500 (men) kcal<br>3. Prioritise protein<br>4. Drink water before meals<br>5. Eat slowly<br><br>Try our <a href='calculator.html' style='color:#2d8a4e;font-weight:500;'>Calorie Calculator</a>!",
            water: "💧 <strong>Hydration guide:</strong><br><br>Aim for 8 glasses (2L) daily. Signs of dehydration: headaches, fatigue, dark urine. Tips: carry a bottle, drink before meals, infuse with lemon.",
            sugar: "🍬 <strong>Sugar facts:</strong><br><br>WHO max: 25g/day. Bubble tea has 55g. Coke has 36g. Tips: order 0% sugar drinks, choose whole fruits over juice, check labels.",
            exercise: "🏋️ <strong>Exercise nutrition:</strong><br><br>Before: light carbs (banana). After: protein + carbs within 60 mins. Target: 1.2-1.6g protein per kg for muscle building.",
            vitamins: "🌈 <strong>Key nutrients:</strong><br><br>Iron (spinach, meat), Vitamin D (sunlight, eggs), Calcium (milk, tofu), Omega-3 (salmon, walnuts), B vitamins (whole grains, eggs)."
        };
        return topics[topic] || topics.protein;
    }

})();
