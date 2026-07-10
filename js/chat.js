/* ============================
   NutriAI - Chat Engine
   Features:
   - New Chat button works
   - Recent chats update live as you type
   - Delete chats from sidebar
   - Export chat to PDF
   - All conversations saved in localStorage
   ============================ */

(function () {
    'use strict';

    // =============================
    // State
    // =============================
    let conversations = loadConversations();
    let activeConversationId = null;

    // =============================
    // DOM
    // =============================
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

    // =============================
    // Init
    // =============================
    renderSidebar();
    // Start with a fresh chat (don't auto-load old ones)
    showWelcome();

    // =============================
    // Events
    // =============================
    sendBtn.addEventListener('click', () => handleSend());
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    newChatBtn.addEventListener('click', () => startNewChat());

    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.textContent;
            handleSend();
        });
    });

    exportChatBtn.addEventListener('click', () => exportToPDF());
    deleteChatBtn.addEventListener('click', () => deleteActiveChat());
    exportAllBtn.addEventListener('click', () => exportAllToPDF());
    deleteAllBtn.addEventListener('click', () => deleteAllChats());

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // =============================
    // Send Message
    // =============================
    function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Create conversation if needed
        if (!activeConversationId) {
            const convo = {
                id: 'chat_' + Date.now(),
                title: text.substring(0, 35) + (text.length > 35 ? '...' : ''),
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            conversations.unshift(convo);
            activeConversationId = convo.id;
            chatTitle.textContent = convo.title;
        }

        // Hide welcome & prompts
        hideWelcome();

        // Render user message
        appendMessageToDOM('user', text);
        saveMessage('user', text);
        chatInput.value = '';
        chatInput.focus();

        // Update sidebar immediately
        renderSidebar();

        // Typing indicator
        const typingEl = createTypingIndicator();
        chatMessages.appendChild(typingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // AI response
        setTimeout(() => {
            typingEl.remove();
            const response = generateResponse(text);
            appendMessageToDOM('ai', response);
            saveMessage('ai', response);
            renderSidebar();
        }, 700 + Math.random() * 500);
    }

    function saveMessage(role, content) {
        const convo = conversations.find(c => c.id === activeConversationId);
        if (!convo) return;
        convo.messages.push({ role, content, time: Date.now() });
        convo.updatedAt = Date.now();

        // Update title from first user message
        if (role === 'user' && convo.messages.filter(m => m.role === 'user').length === 1) {
            convo.title = content.substring(0, 35) + (content.length > 35 ? '...' : '');
            chatTitle.textContent = convo.title;
        }
        saveConversations();
    }

    // =============================
    // DOM Helpers
    // =============================
    function appendMessageToDOM(role, content) {
        const div = document.createElement('div');
        div.className = `message message-${role}`;
        div.innerHTML = `
            <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="message-bubble">${content}</div>
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message message-ai typing-indicator';
        div.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        `;
        return div;
    }

    function showWelcome() {
        chatMessages.innerHTML = '';
        if (welcomeState) {
            chatMessages.appendChild(welcomeState);
            welcomeState.style.display = '';
        }
        if (suggestedPrompts) suggestedPrompts.style.display = '';
        chatTitle.textContent = 'New Chat';
        activeConversationId = null;
    }

    function hideWelcome() {
        if (welcomeState) welcomeState.style.display = 'none';
        if (suggestedPrompts) suggestedPrompts.style.display = 'none';
    }

    // =============================
    // New Chat
    // =============================
    function startNewChat() {
        activeConversationId = null;
        showWelcome();
        renderSidebar();
        chatInput.value = '';
        chatInput.focus();
        sidebar.classList.remove('open');
    }

    // =============================
    // Load Conversation
    // =============================
    function loadConversation(id) {
        const convo = conversations.find(c => c.id === id);
        if (!convo) return;

        activeConversationId = id;
        chatTitle.textContent = convo.title;
        chatMessages.innerHTML = '';
        hideWelcome();

        if (convo.messages.length === 0) {
            showWelcome();
        } else {
            convo.messages.forEach(msg => {
                appendMessageToDOM(msg.role, msg.content);
            });
        }

        renderSidebar();
        sidebar.classList.remove('open');
    }

    // =============================
    // Delete
    // =============================
    function deleteActiveChat() {
        if (!activeConversationId) {
            showToast('No active chat to delete.');
            return;
        }
        if (!confirm('Delete this conversation?')) return;
        conversations = conversations.filter(c => c.id !== activeConversationId);
        saveConversations();
        startNewChat();
        showToast('Chat deleted.');
    }

    function deleteAllChats() {
        if (conversations.length === 0) {
            showToast('No chats to delete.');
            return;
        }
        if (!confirm('Delete all conversations? This cannot be undone.')) return;
        conversations = [];
        saveConversations();
        startNewChat();
        showToast('All chats deleted.');
    }

    // =============================
    // Export to PDF
    // =============================
    function exportToPDF() {
        const convo = conversations.find(c => c.id === activeConversationId);
        if (!convo || convo.messages.length === 0) {
            showToast('No messages to export.');
            return;
        }
        generatePDF(convo);
    }

    function exportAllToPDF() {
        if (conversations.length === 0) {
            showToast('No chats to export.');
            return;
        }
        // Export each as a combined PDF
        const combined = {
            title: 'All NutriAI Conversations',
            messages: [],
            createdAt: Date.now()
        };
        conversations.forEach(convo => {
            combined.messages.push({ role: 'system', content: `--- ${convo.title} (${new Date(convo.createdAt).toLocaleDateString()}) ---`, time: convo.createdAt });
            combined.messages.push(...convo.messages);
            combined.messages.push({ role: 'system', content: '', time: convo.createdAt });
        });
        generatePDF(combined);
    }

    function generatePDF(convo) {
        // Create a printable HTML document and use window.print()
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Please allow popups to export PDF.');
            return;
        }

        let messagesHTML = '';
        convo.messages.forEach(msg => {
            if (msg.role === 'system') {
                messagesHTML += `<div style="text-align:center;color:#888;font-size:12px;margin:20px 0 8px;font-weight:600;">${msg.content}</div>`;
                return;
            }
            const isUser = msg.role === 'user';
            const align = isUser ? 'flex-end' : 'flex-start';
            const bg = isUser ? '#2d8a4e' : '#f4f4f2';
            const color = isUser ? '#fff' : '#333';
            const label = isUser ? 'You' : 'NutriAI';
            const cleanContent = msg.content.replace(/<a[^>]*>/g, '').replace(/<\/a>/g, '');

            messagesHTML += `
                <div style="display:flex;flex-direction:column;align-items:${align};margin-bottom:14px;">
                    <div style="font-size:10px;color:#888;margin-bottom:3px;font-weight:600;">${label}</div>
                    <div style="background:${bg};color:${color};padding:10px 14px;border-radius:10px;max-width:75%;font-size:13px;line-height:1.6;">
                        ${cleanContent}
                    </div>
                </div>
            `;
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>NutriAI Chat Export - ${convo.title}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #333; }
                    h1 { font-size: 18px; color: #2d8a4e; margin-bottom: 4px; }
                    .meta { font-size: 11px; color: #888; margin-bottom: 24px; }
                    .footer { margin-top: 30px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; text-align: center; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>🥗 NutriAI Chat Export</h1>
                <div class="meta">${convo.title} • Exported ${new Date().toLocaleString()}</div>
                ${messagesHTML}
                <div class="footer">Generated by NutriAI – Republic Polytechnic, Singapore</div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        showToast('PDF export opened — use "Save as PDF" in the print dialog.');
    }

    // =============================
    // Sidebar Rendering
    // =============================
    function renderSidebar() {
        historyList.innerHTML = '';

        if (conversations.length === 0) {
            historyList.innerHTML = '<p class="no-chats">No conversations yet</p>';
            return;
        }

        conversations.forEach(convo => {
            const item = document.createElement('div');
            item.className = `history-item${convo.id === activeConversationId ? ' active' : ''}`;

            item.innerHTML = `
                <span class="history-item-text" title="${convo.title}">${convo.title}</span>
                <button class="history-item-delete" title="Delete this chat">×</button>
            `;

            // Click to load
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-item-delete')) return;
                loadConversation(convo.id);
            });

            // Delete button
            item.querySelector('.history-item-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                conversations = conversations.filter(c => c.id !== convo.id);
                saveConversations();
                if (convo.id === activeConversationId) {
                    startNewChat();
                } else {
                    renderSidebar();
                }
                showToast('Chat deleted.');
            });

            historyList.appendChild(item);
        });
    }

    // =============================
    // Storage
    // =============================
    function loadConversations() {
        try {
            const data = localStorage.getItem('nutriai_chats');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveConversations() {
        localStorage.setItem('nutriai_chats', JSON.stringify(conversations));
    }

    // =============================
    // AI Responses
    // =============================
    function generateResponse(input) {
        const lower = input.toLowerCase();

        if (lower.includes('nasi lemak')) {
            return "Nasi lemak is a popular local dish, but it's typically high in calories (~640 kcal) and saturated fat due to the coconut rice and fried items.<br><br><strong>Tips to make it healthier:</strong><br>✅ Choose grilled chicken instead of fried<br>✅ Ask for extra cucumber and vegetables<br>✅ Request less sambal to reduce sodium<br>✅ Swap to brown rice if available<br><br>A healthier swap: <strong>Grilled chicken with brown rice & vegetables</strong> (420 kcal, 38g protein).";
        } else if (lower.includes('mee goreng') || lower.includes('fried noodle')) {
            return "Mee goreng packs around 550 kcal with high sodium (1,400mg) from the sauces.<br><br><strong>Healthier approach:</strong><br>✅ Opt for soup-based noodles instead (saves ~200 kcal)<br>✅ Add extra vegetables and lean protein<br>✅ Choose egg noodles over instant noodles<br>✅ Ask for less oil when ordering<br><br>Try: <strong>Soup noodles with lean chicken & vegetables</strong> — 350 kcal, 28g protein.";
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return "Hey! 👋 I'm NutriAI, your nutrition assistant. I can help you:<br><br>• Analyse any meal's nutrition<br>• Find healthier alternatives<br>• Suggest budget-friendly healthy options<br><br>What did you have for your last meal?";
        } else if (lower.includes('healthy lunch') || lower.includes('suggest') || lower.includes('recommend')) {
            return "Healthy lunch options under $6:<br><br>🥗 <strong>Grilled chicken with brown rice & veggies</strong> — 420 kcal, 35g protein<br>🍲 <strong>Soup noodles with lean meat</strong> — 380 kcal, 28g protein<br>🥪 <strong>Whole wheat wrap with grilled chicken</strong> — 450 kcal, 32g protein<br>🐟 <strong>Sliced fish soup with rice</strong> — 400 kcal, 32g protein<br><br>Available at most hawker centres!";
        } else if (lower.includes('breakfast') || lower.includes('morning')) {
            return "Quick breakfast ideas:<br><br>🥣 <strong>Oatmeal with banana & peanut butter</strong> — 380 kcal, high fibre<br>🍳 <strong>2 eggs on wholemeal toast</strong> — 350 kcal, 18g protein<br>🥤 <strong>Greek yogurt with granola & berries</strong> — 300 kcal<br>🥑 <strong>Avocado toast with egg</strong> — 380 kcal, healthy fats<br>🥞 <strong>Thosai with sambar</strong> — 250 kcal (vs roti prata at 520 kcal)";
        } else if (lower.includes('protein')) {
            return "High-protein meals (budget-friendly):<br><br>💪 <strong>Grilled chicken breast with rice</strong> — 35g protein<br>💪 <strong>2 Eggs with wholemeal bread</strong> — 18g protein<br>💪 <strong>Tofu stir-fry with vegetables</strong> — 20g protein<br>💪 <strong>Tuna sandwich</strong> — 28g protein<br>💪 <strong>Sliced fish soup</strong> — 32g protein<br><br>Aim for 0.8–1.2g per kg body weight daily.";
        } else if (lower.includes('bubble tea') || lower.includes('boba')) {
            return "A large bubble tea with full sugar + pearls = <strong>440 kcal</strong> — almost a full meal!<br><br>📊 55g sugar (2× WHO daily limit), 8g fat from creamer.<br><br><strong>Better options:</strong><br>✅ 0% sugar, less ice — saves ~200 kcal<br>✅ Swap pearls for aloe vera — saves ~100 kcal<br>✅ Best: <strong>Iced green tea (0% sugar) with aloe</strong> — just 60 kcal<br><br>That's 380 kcal saved per drink!";
        } else if (lower.includes('chicken rice')) {
            return "Chicken rice (roasted) = <strong>607 kcal</strong>, 23g fat (mostly from oily rice + skin).<br><br><strong>Smarter ordering:</strong><br>✅ Steamed over roasted<br>✅ Less rice or swap to brown rice<br>✅ Remove skin (saves 6.5g saturated fat)<br>✅ Add vegetable side<br><br>Steamed chicken + plain rice + cucumber = 440 kcal, 35g protein, half the fat.";
        } else if (lower.includes('weight') || lower.includes('lose') || lower.includes('diet')) {
            return "For healthy weight management:<br><br>📐 Know your numbers — try our <a href='calculator.html' style='color:#2d8a4e;font-weight:500;'>BMI & Calorie Calculator</a><br><br><strong>Key principles:</strong><br>1. 500 kcal/day deficit = ~0.45 kg/week loss<br>2. Never below 1,200 kcal (women) or 1,500 kcal (men)<br>3. Prioritise protein (25% of calories)<br>4. Drink water before meals<br>5. Eat slowly — fullness signals take 20 mins";
        } else if (lower.includes('snack') || lower.includes('hungry')) {
            return "Healthy snacks under 200 kcal:<br><br>🍿 <strong>Air-popped popcorn (30g)</strong> — 120 kcal, 4g fibre<br>🥜 <strong>Mixed nuts (20g)</strong> — 130 kcal, healthy fats<br>🍌 <strong>Banana + peanut butter</strong> — 190 kcal<br>🥒 <strong>Cucumber & hummus</strong> — 100 kcal<br>🫐 <strong>Greek yogurt + berries</strong> — 150 kcal, 12g protein<br><br>Avoid: curry puffs (440 kcal/2pcs), chips (320 kcal/bag).";
        } else {
            return `Thanks for asking about "${input}"!<br><br>For a detailed breakdown, try our <a href="meal-analysis.html" style="color:#2d8a4e;font-weight:500;">Meal Analysis</a> page.<br><br>Or tell me more:<br>• What specific meal did you eat?<br>• Looking for healthier alternatives?<br>• Need suggestions for a meal time?`;
        }
    }

})();
