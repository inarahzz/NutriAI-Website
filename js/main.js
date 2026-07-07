/* ============================
   NutriAI - Main JavaScript
   ============================ */

// Apply dark mode immediately to prevent flash of light mode
(function() {
    const saved = localStorage.getItem('nutriai_settings');
    if (saved) {
        const settings = JSON.parse(saved);
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }
})();

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile nav on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .step, .testimonial-card, .comparison-item, .problem-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize page-specific features
    initSettings();
    initChat();
    initMealAnalysis();
    initMealHistory();
    initContactForm();
    initProfile();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Tip category filters
    initTipFilters();
});

// ============================
// Meal Data (simulated database)
// ============================
const mealDatabase = {
    'nasi lemak': {
        name: 'Nasi Lemak',
        emoji: '🍛',
        calories: 640, protein: 18, carbs: 72, fat: 32, sugar: 8, sodium: 1200, fibre: 3,
        score: 6.0,
        scoreLabel: 'Moderate',
        description: 'This meal provides good energy but is high in saturated fat and sodium.',
        strengths: [
            'Provides a good source of energy for the afternoon',
            'Contains protein from egg and chicken',
            'Includes small amounts of vegetables (cucumber)',
            'Satisfying meal that prevents excessive snacking'
        ],
        improvements: [
            'High in saturated fat from coconut milk and fried items',
            'High sodium content from sambal and ikan bilis',
            'Low fibre content – needs more vegetables',
            'Could benefit from lean protein instead of fried chicken'
        ]
    },
    'mee goreng': {
        name: 'Mee Goreng',
        emoji: '🍜',
        calories: 550, protein: 14, carbs: 68, fat: 24, sugar: 12, sodium: 1400, fibre: 2,
        score: 5.5,
        scoreLabel: 'Moderate',
        description: 'High in refined carbs and sodium. The frying adds unnecessary fat.',
        strengths: [
            'Good source of quick energy from carbohydrates',
            'Contains some vegetables (bean sprouts, chives)',
            'Affordable and filling meal option',
            'Provides iron from the noodles'
        ],
        improvements: [
            'Very high sodium from soy sauce and seasonings',
            'Low in protein for muscle recovery',
            'High in refined carbohydrates',
            'Cooked in excess oil adding saturated fat'
        ]
    },
    'burger and fries': {
        name: 'Burger & Fries',
        emoji: '🍔',
        calories: 890, protein: 22, carbs: 85, fat: 48, sugar: 18, sodium: 1600, fibre: 2,
        score: 4.0,
        scoreLabel: 'Poor',
        description: 'Very high in calories, fat, and sodium. A regular choice can lead to weight gain.',
        strengths: [
            'Provides substantial protein from the beef patty',
            'Quick and convenient meal option',
            'Contains some iron and B vitamins from meat',
            'Satisfying and filling'
        ],
        improvements: [
            'Extremely high in saturated and trans fats',
            'Excessive calories for a single meal',
            'Very high sodium increases blood pressure risk',
            'Almost no fibre or essential vitamins'
        ]
    },
    'oatmeal with banana': {
        name: 'Oatmeal with Banana',
        emoji: '🥣',
        calories: 320, protein: 12, carbs: 55, fat: 6, sugar: 18, sodium: 150, fibre: 8,
        score: 8.5,
        scoreLabel: 'Good',
        description: 'Excellent breakfast choice. High in fibre and provides sustained energy.',
        strengths: [
            'High fibre content for digestive health',
            'Provides sustained energy throughout the morning',
            'Low in sodium and saturated fat',
            'Natural sugars from banana with potassium'
        ],
        improvements: [
            'Could add nuts or seeds for healthy fats',
            'Consider adding protein (Greek yogurt or eggs)',
            'Natural sugar from banana is moderate',
            'Could include berries for antioxidants'
        ]
    },
    'grilled chicken brown rice': {
        name: 'Grilled Chicken with Brown Rice',
        emoji: '🥙',
        calories: 420, protein: 35, carbs: 48, fat: 12, sugar: 4, sodium: 450, fibre: 6,
        score: 8.0,
        scoreLabel: 'Good',
        description: 'A well-balanced meal with lean protein, complex carbs, and moderate fat.',
        strengths: [
            'High protein supports muscle health',
            'Brown rice provides complex carbohydrates',
            'Low in unhealthy fats',
            'Good fibre content from brown rice'
        ],
        improvements: [
            'Could add more vegetables for vitamins',
            'Consider adding healthy fats (avocado, olive oil)',
            'Watch portion size of rice',
            'Add colourful vegetables for antioxidants'
        ]
    },
    'caesar salad': {
        name: 'Caesar Salad',
        emoji: '🥗',
        calories: 350, protein: 15, carbs: 20, fat: 24, sugar: 3, sodium: 800, fibre: 4,
        score: 7.5,
        scoreLabel: 'Good',
        description: 'Good vegetable intake but dressing adds significant fat and sodium.',
        strengths: [
            'Rich in vitamins from romaine lettuce',
            'Provides fibre for digestive health',
            'Low in sugar',
            'Contains protein from parmesan and croutons'
        ],
        improvements: [
            'Dressing is high in fat and calories',
            'Sodium from dressing and cheese is moderate',
            'Could add grilled chicken for more protein',
            'Request dressing on the side to control portions'
        ]
    },
    'soup noodles': {
        name: 'Soup Noodles',
        emoji: '🍲',
        calories: 380, protein: 28, carbs: 42, fat: 8, sugar: 3, sodium: 900, fibre: 4,
        score: 7.8,
        scoreLabel: 'Good',
        description: 'A lighter noodle option. Soup-based means less oil and better hydration.',
        strengths: [
            'Low in fat compared to fried noodles',
            'Good protein from lean meat',
            'Hydrating from the soup broth',
            'Moderate calories for a full meal'
        ],
        improvements: [
            'Sodium can be high from the broth',
            'Could add more vegetables',
            'Choose whole grain noodles if available',
            'Avoid drinking all the broth to reduce sodium'
        ]
    }
};

// ============================
// Tip Category Filters
// ============================
function initTipFilters() {
    const categoryBtns = document.querySelectorAll('.tip-category-btn');
    const tipCards = document.querySelectorAll('.tip-card');

    if (!categoryBtns.length || !tipCards.length) return;

    // Map button text to card class names
    const categoryMap = {
        'All Tips': 'all',
        'Balanced Diet': 'balanced',
        'Hydration': 'hydration',
        'Mindful Eating': 'mindful',
        'Protein': 'protein',
        'Sugar & Sodium': 'sugar',
        'Fibre': 'fibre'
    };

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = categoryMap[btn.textContent.trim()] || 'all';

            // Filter tip cards
            tipCards.forEach(card => {
                if (category === 'all' || card.classList.contains(category)) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ============================
// Settings & Dark Mode
// ============================
function initSettings() {
    const settings = loadSettings();
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }

    const toggleRows = document.querySelectorAll('.toggle-row');
    toggleRows.forEach(row => {
        const label = row.querySelector('.toggle-label');
        const toggle = row.querySelector('.toggle-switch');
        if (!label || !toggle) return;

        const settingKey = getSettingKey(label.textContent);
        if (settings[settingKey]) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const isActive = toggle.classList.contains('active');
            settings[settingKey] = isActive;
            saveSettings(settings);

            if (settingKey === 'darkMode') {
                document.body.classList.toggle('dark-mode', isActive);
            }
            showToast(isActive ? `${label.textContent} enabled` : `${label.textContent} disabled`);
        });
    });
}

function getSettingKey(label) {
    const map = {
        'Meal Reminders': 'mealReminders',
        'Weekly Report': 'weeklyReport',
        'Dark Mode': 'darkMode',
        'Email Notifications': 'emailNotifications'
    };
    return map[label] || label.toLowerCase().replace(/\s+/g, '');
}

function loadSettings() {
    const saved = localStorage.getItem('nutriai_settings');
    if (saved) return JSON.parse(saved);
    return { mealReminders: true, weeklyReport: true, darkMode: false, emailNotifications: false };
}

function saveSettings(settings) {
    localStorage.setItem('nutriai_settings', JSON.stringify(settings));
}

// ============================
// Profile Management
// ============================
function initProfile() {
    const saveBtn = document.querySelector('.save-btn-wrapper .btn');
    if (!saveBtn) return;

    // Load saved profile
    const savedProfile = localStorage.getItem('nutriai_profile');
    if (savedProfile) {
        const data = JSON.parse(savedProfile);
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const goalEl = document.getElementById('profile-goal');
        const caloriesEl = document.getElementById('profile-calories');
        const dietEl = document.getElementById('profile-diet');
        const activityEl = document.getElementById('profile-activity');
        const mealsEl = document.getElementById('profile-meals');

        if (nameEl && data.name) nameEl.value = data.name;
        if (emailEl && data.email) emailEl.value = data.email;
        if (goalEl && data.goal) goalEl.value = data.goal;
        if (caloriesEl && data.calories) caloriesEl.value = data.calories;
        if (dietEl && data.diet) dietEl.value = data.diet;
        if (activityEl && data.activity) activityEl.value = data.activity;
        if (mealsEl && data.meals) mealsEl.value = data.meals;

        // Load allergies
        if (data.allergies && data.allergies.length > 0) {
            const container = document.getElementById('allergies-container');
            if (container) {
                container.innerHTML = '';
                data.allergies.forEach(allergy => {
                    addAllergyTag(container, allergy);
                });
            }
        }
    }

    // Save button
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const profileData = {
            name: document.getElementById('profile-name')?.value || '',
            email: document.getElementById('profile-email')?.value || '',
            goal: document.getElementById('profile-goal')?.value || '',
            calories: document.getElementById('profile-calories')?.value || '',
            diet: document.getElementById('profile-diet')?.value || '',
            activity: document.getElementById('profile-activity')?.value || '',
            meals: document.getElementById('profile-meals')?.value || '',
            allergies: getAllergies()
        };
        localStorage.setItem('nutriai_profile', JSON.stringify(profileData));
        showToast('Profile saved successfully!');
    });

    // Allergy tag input
    const allergyInput = document.getElementById('allergy-input');
    if (allergyInput) {
        allergyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = allergyInput.value.trim();
                if (value) {
                    const container = document.getElementById('allergies-container');
                    addAllergyTag(container, value);
                    allergyInput.value = '';
                }
            }
        });
    }

    // Remove tag event delegation
    const allergiesContainer = document.getElementById('allergies-container');
    if (allergiesContainer) {
        allergiesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                e.target.parentElement.remove();
            }
        });
    }
}

function addAllergyTag(container, text) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${text} <span class="remove-tag">×</span>`;
    container.appendChild(tag);
}

function getAllergies() {
    const tags = document.querySelectorAll('#allergies-container .tag');
    return Array.from(tags).map(tag => {
        return tag.textContent.replace('×', '').trim();
    });
}

// ============================
// Chat Functionality
// ============================
function initChat() {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    const promptChips = document.querySelectorAll('.prompt-chip');
    const clearBtn = document.querySelector('.clear-chat-btn');

    if (!chatInput || !sendBtn || !chatMessages) return;

    function sendMessage(text) {
        if (!text.trim()) return;
        const userMsg = createMessage(text, 'user');
        chatMessages.appendChild(userMsg);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Show typing indicator
        const typing = createTypingIndicator();
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            typing.remove();
            const aiResponse = getAIResponse(text);
            const aiMsg = createMessage(aiResponse, 'ai');
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1200);
    }

    function createMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
            <div class="message-bubble">${text}</div>
        `;
        return msg;
    }

    function createTypingIndicator() {
        const msg = document.createElement('div');
        msg.className = 'message message-ai typing-indicator';
        msg.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        `;
        return msg;
    }

    function getAIResponse(input) {
        const lower = input.toLowerCase();
        if (lower.includes('nasi lemak')) {
            return "Nasi lemak is a popular local dish, but it's typically high in calories (~640 kcal) and saturated fat due to the coconut rice and fried items. Here are some suggestions:<br><br>✅ Choose grilled chicken instead of fried chicken<br>✅ Add extra vegetables or cucumber<br>✅ Ask for less sambal to reduce sodium<br>✅ Consider brown rice as a base<br><br>Would you like me to suggest a healthier alternative meal?";
        } else if (lower.includes('mee goreng') || lower.includes('fried noodle')) {
            return "Mee goreng is a tasty choice but tends to be high in sodium and refined carbs (~550 kcal). Tips:<br><br>✅ Opt for less oil when ordering<br>✅ Add extra vegetables<br>✅ Choose egg noodles over instant noodles<br>✅ Try soup-based noodles instead<br><br>Want me to show you a healthier noodle alternative?";
        } else if (lower.includes('hello') || lower.includes('hi')) {
            return "Hello! 👋 I'm NutriAI, your smart meal assistant. Tell me what you ate today, and I'll help you understand its nutritional value and suggest healthier alternatives. What did you have for your last meal?";
        } else if (lower.includes('healthy lunch') || lower.includes('suggest')) {
            return "Here are some healthy lunch ideas for students:<br><br>🥗 <strong>Grilled chicken with brown rice & veggies</strong> (~420 kcal)<br>🍲 <strong>Soup noodles with lean meat</strong> (~380 kcal)<br>🥪 <strong>Whole wheat wrap with grilled chicken & salad</strong> (~450 kcal)<br>🥣 <strong>Poke bowl with salmon & quinoa</strong> (~480 kcal)<br><br>These options are budget-friendly and available at most food courts!";
        } else if (lower.includes('breakfast') || lower.includes('morning')) {
            return "Great breakfast options that are quick and nutritious:<br><br>🥣 <strong>Oatmeal with banana & honey</strong> (~320 kcal) – High fibre, sustained energy<br>🍳 <strong>Eggs on wholemeal toast</strong> (~350 kcal) – High protein start<br>🥤 <strong>Greek yogurt with granola & berries</strong> (~300 kcal) – Probiotics & vitamins<br>🥑 <strong>Avocado toast with egg</strong> (~380 kcal) – Healthy fats & protein<br><br>Which one sounds good to you?";
        } else if (lower.includes('protein')) {
            return "High protein meals that are budget-friendly:<br><br>💪 <strong>Grilled chicken breast with rice</strong> – 35g protein<br>💪 <strong>Eggs (2) with wholemeal bread</strong> – 18g protein<br>💪 <strong>Tofu stir-fry with vegetables</strong> – 20g protein<br>💪 <strong>Tuna sandwich on wholemeal</strong> – 28g protein<br>💪 <strong>Greek yogurt with nuts</strong> – 22g protein<br><br>Aim for 20-35g of protein per meal for best results!";
        } else {
            return `Thanks for sharing! Let me analyse "${input}" for you.<br><br>📊 I'd recommend heading to the <a href="meal-analysis.html" style="color: var(--primary-green); font-weight: 500;">Meal Analysis</a> page for a detailed breakdown of calories, protein, carbs, fat, sugar, sodium, and fibre.<br><br>Would you like me to suggest healthier alternatives, or would you like to log another meal?`;
        }
    }

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sendMessage(chip.textContent);
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            chatMessages.innerHTML = '';
            const welcome = createMessage("Hello! 👋 I'm NutriAI, your smart meal assistant. Tell me what you ate today, and I'll help analyse the nutrition and suggest healthier alternatives!", 'ai');
            chatMessages.appendChild(welcome);
        });
    }
}

// ============================
// Meal Analysis
// ============================
function initMealAnalysis() {
    const analyseBtn = document.getElementById('analyse-btn');
    const mealInput = document.getElementById('meal-input');
    const loadingEl = document.getElementById('analysis-loading');
    const errorEl = document.getElementById('analysis-error');
    const resultsEl = document.getElementById('analysis-results');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const saveMealBtn = document.getElementById('save-meal-btn');

    if (!analyseBtn || !mealInput) return;

    // Quick meal chips
    document.querySelectorAll('.quick-meal-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            mealInput.value = chip.dataset.meal;
            analyseMeal(chip.dataset.meal);
        });
    });

    analyseBtn.addEventListener('click', () => {
        const meal = mealInput.value.trim();
        if (meal) analyseMeal(meal);
    });

    mealInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const meal = mealInput.value.trim();
            if (meal) analyseMeal(meal);
        }
    });

    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', () => {
            errorEl.style.display = 'none';
            mealInput.focus();
        });
    }

    if (saveMealBtn) {
        saveMealBtn.addEventListener('click', () => {
            const mealName = document.getElementById('meal-name')?.textContent;
            const score = document.getElementById('score-value')?.textContent;
            const calories = document.getElementById('stat-calories')?.textContent;
            const emoji = document.getElementById('meal-emoji')?.textContent;

            if (mealName) {
                saveMealToHistory({
                    name: mealName,
                    emoji: emoji || '🍽️',
                    score: parseFloat(score) || 0,
                    calories: parseInt(calories) || 0,
                    date: new Date().toISOString()
                });
                showToast('Meal saved to history!');
            }
        });
    }

    function analyseMeal(mealName) {
        // Show loading
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        resultsEl.style.display = 'none';

        setTimeout(() => {
            loadingEl.style.display = 'none';
            const mealKey = mealName.toLowerCase().trim();
            let mealData = mealDatabase[mealKey];

            // Try partial matching
            if (!mealData) {
                for (const key in mealDatabase) {
                    if (mealKey.includes(key) || key.includes(mealKey)) {
                        mealData = mealDatabase[key];
                        break;
                    }
                }
            }

            if (mealData) {
                displayAnalysis(mealData);
                resultsEl.style.display = 'block';
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Generate generic analysis for unknown meals
                const genericData = generateGenericAnalysis(mealName);
                displayAnalysis(genericData);
                resultsEl.style.display = 'block';
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 1500);
    }

    function generateGenericAnalysis(name) {
        const cal = Math.floor(Math.random() * 400) + 300;
        const prot = Math.floor(Math.random() * 25) + 10;
        const carb = Math.floor(Math.random() * 50) + 30;
        const fat = Math.floor(Math.random() * 25) + 8;
        const sug = Math.floor(Math.random() * 15) + 3;
        const sod = Math.floor(Math.random() * 800) + 400;
        const fib = Math.floor(Math.random() * 6) + 2;
        const score = Math.round((10 - (cal / 200) + (prot / 10) + (fib / 3) - (fat / 15)) * 10) / 10;
        const clampedScore = Math.max(3, Math.min(9, score));

        return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            emoji: '🍽️',
            calories: cal, protein: prot, carbs: carb, fat: fat,
            sugar: sug, sodium: sod, fibre: fib,
            score: clampedScore,
            scoreLabel: clampedScore >= 7 ? 'Good' : clampedScore >= 5 ? 'Moderate' : 'Poor',
            description: 'Estimated nutritional profile based on typical preparation methods.',
            strengths: [
                'Provides energy for daily activities',
                'Contains some essential nutrients',
                'Part of a varied diet',
                'Can be made healthier with simple modifications'
            ],
            improvements: [
                'Consider adding more vegetables',
                'Watch portion sizes',
                'Choose lean protein options where possible',
                'Reduce added salt and sugar'
            ]
        };
    }

    function displayAnalysis(data) {
        document.getElementById('meal-emoji').textContent = data.emoji;
        document.getElementById('meal-name').textContent = data.name;
        document.getElementById('meal-time').textContent = `Analysed • ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Score
        const scoreDeg = (data.score / 10) * 360;
        const scoreColor = data.score >= 7 ? 'var(--primary-green)' : data.score >= 5 ? 'var(--accent-orange)' : '#FF6B6B';
        document.getElementById('score-circle').style.background = `conic-gradient(${scoreColor} 0deg, ${scoreColor} ${scoreDeg}deg, #eee ${scoreDeg}deg)`;
        document.getElementById('score-value').textContent = data.score.toFixed(1);
        document.getElementById('score-value').style.color = scoreColor;
        document.getElementById('score-title').textContent = `Health Score: ${data.scoreLabel}`;
        document.getElementById('score-description').textContent = data.description;

        // Stats
        document.getElementById('stat-calories').textContent = data.calories;
        document.getElementById('stat-protein').textContent = data.protein + 'g';
        document.getElementById('stat-carbs').textContent = data.carbs + 'g';
        document.getElementById('stat-fat').textContent = data.fat + 'g';

        // Bars (percentage of max reasonable value)
        document.getElementById('bar-calories').style.width = Math.min((data.calories / 900) * 100, 100) + '%';
        document.getElementById('val-calories').textContent = data.calories + ' kcal';
        document.getElementById('bar-protein').style.width = Math.min((data.protein / 50) * 100, 100) + '%';
        document.getElementById('val-protein').textContent = data.protein + 'g';
        document.getElementById('bar-carbs').style.width = Math.min((data.carbs / 100) * 100, 100) + '%';
        document.getElementById('val-carbs').textContent = data.carbs + 'g';
        document.getElementById('bar-fat').style.width = Math.min((data.fat / 50) * 100, 100) + '%';
        document.getElementById('val-fat').textContent = data.fat + 'g';
        document.getElementById('bar-sugar').style.width = Math.min((data.sugar / 30) * 100, 100) + '%';
        document.getElementById('val-sugar').textContent = data.sugar + 'g';
        document.getElementById('bar-sodium').style.width = Math.min((data.sodium / 2000) * 100, 100) + '%';
        document.getElementById('val-sodium').textContent = data.sodium + 'mg';
        document.getElementById('bar-fibre').style.width = Math.min((data.fibre / 15) * 100, 100) + '%';
        document.getElementById('val-fibre').textContent = data.fibre + 'g';

        // Strengths & Improvements
        const strengthsList = document.getElementById('strengths-list');
        const improvementsList = document.getElementById('improvements-list');
        strengthsList.innerHTML = data.strengths.map(s => `<li>${s}</li>`).join('');
        improvementsList.innerHTML = data.improvements.map(i => `<li>${i}</li>`).join('');

        // Animate bars
        setTimeout(animateNutrientBars, 300);
    }
}

// ============================
// Meal History (localStorage)
// ============================
function initMealHistory() {
    const historyTable = document.getElementById('history-table');
    const historyRows = document.getElementById('history-rows');
    const historyEmpty = document.getElementById('history-empty');
    const searchInput = document.getElementById('history-search');

    if (!historyTable || !historyRows) return;

    // Seed default data if none exists
    let meals = getMealHistory();
    if (meals.length === 0) {
        const defaultMeals = [
            { name: 'Nasi Lemak', emoji: '🍛', score: 6.0, calories: 640, date: getDateDaysAgo(0) },
            { name: 'Oatmeal with Banana', emoji: '🥣', score: 8.5, calories: 320, date: getDateDaysAgo(0) },
            { name: 'Mee Goreng', emoji: '🍜', score: 5.5, calories: 550, date: getDateDaysAgo(1) },
            { name: 'Grilled Chicken Brown Rice', emoji: '🥙', score: 8.0, calories: 420, date: getDateDaysAgo(1) },
            { name: 'Burger & Fries', emoji: '🍔', score: 4.0, calories: 890, date: getDateDaysAgo(2) },
            { name: 'Caesar Salad', emoji: '🥗', score: 7.5, calories: 350, date: getDateDaysAgo(2) },
            { name: 'Soup Noodles', emoji: '🍲', score: 7.8, calories: 380, date: getDateDaysAgo(3) }
        ];
        localStorage.setItem('nutriai_history', JSON.stringify(defaultMeals));
        meals = defaultMeals;
    }

    renderHistory(meals);

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filtered = meals.filter(m => m.name.toLowerCase().includes(query));
            renderHistory(filtered);
        });
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.dataset.filter;
            const filtered = filterMealsByTime(meals, filter);
            renderHistory(filtered);
        });
    });

    function renderHistory(mealsToShow) {
        if (mealsToShow.length === 0) {
            historyTable.style.display = 'none';
            historyEmpty.style.display = 'block';
            return;
        }
        historyTable.style.display = 'block';
        historyEmpty.style.display = 'none';

        historyRows.innerHTML = mealsToShow.map(meal => {
            const date = new Date(meal.date);
            const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const scoreClass = meal.score >= 7 ? 'good' : meal.score >= 5 ? 'moderate' : 'poor';
            return `
                <div class="table-row">
                    <span class="row-date">${dateStr}</span>
                    <div class="row-meal">
                        <span class="row-meal-icon">${meal.emoji}</span>
                        <span class="row-meal-name">${meal.name}</span>
                    </div>
                    <div class="row-score">
                        <span class="score-dot ${scoreClass}"></span>
                        <span>${meal.score.toFixed(1)}/10</span>
                    </div>
                    <span class="row-calories">${meal.calories} kcal</span>
                    <button class="view-btn" onclick="viewMeal('${meal.name.replace(/'/g, "\\'")}')">Quick View</button>
                </div>
            `;
        }).join('');
    }
}

function filterMealsByTime(meals, filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
        case 'today':
            return meals.filter(m => new Date(m.date) >= today);
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return meals.filter(m => new Date(m.date) >= weekAgo);
        case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return meals.filter(m => new Date(m.date) >= monthAgo);
        default:
            return meals;
    }
}

function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

function getMealHistory() {
    const saved = localStorage.getItem('nutriai_history');
    return saved ? JSON.parse(saved) : [];
}

function saveMealToHistory(meal) {
    const history = getMealHistory();
    history.unshift(meal);
    localStorage.setItem('nutriai_history', JSON.stringify(history));
}

// Global function for quick view
function viewMeal(mealName) {
    window.location.href = `meal-analysis.html?meal=${encodeURIComponent(mealName)}`;
}

// ============================
// Contact Form
// ============================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successEl = document.getElementById('form-success');
    const sendAnotherBtn = document.getElementById('send-another-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate form submission
        const submitBtn = form.querySelector('.contact-submit-btn');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            form.style.display = 'none';
            successEl.style.display = 'block';
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }, 1000);
    });

    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', () => {
            successEl.style.display = 'none';
            form.style.display = 'block';
            form.reset();
        });
    }
}

// ============================
// Utility Functions
// ============================
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateNutrientBars() {
    const bars = document.querySelectorAll('.nutrient-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = width; }, 100);
    });
}

// ============================
// URL Parameter Handling (for Quick View from History)
// ============================
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const mealParam = params.get('meal');
    if (mealParam && document.getElementById('meal-input')) {
        document.getElementById('meal-input').value = mealParam;
        // Trigger analysis after a short delay
        setTimeout(() => {
            document.getElementById('analyse-btn')?.click();
        }, 500);
    }
});

// ============================
// Dynamic Styles
// ============================
const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .navbar.scrolled {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .toast-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #333;
        color: #fff;
        padding: 14px 28px;
        border-radius: 50px;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 9999;
    }
    .toast-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    body.dark-mode .toast-notification {
        background: #4a4a6a;
    }
    .typing-indicator .message-bubble {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 16px 20px;
    }
    .typing-indicator .dot {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite;
    }
    .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
    }
`;
document.head.appendChild(style);
