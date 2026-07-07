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
            navToggle.classList.remove('active');
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all
                faqItems.forEach(i => i.classList.remove('active'));
                // Open clicked if it wasn't active
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

    document.querySelectorAll('.feature-card, .step, .testimonial-card, .comparison-item').forEach(el => {
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

    // Toggle switches with functionality
    initSettings();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});

// ============================
// Settings & Dark Mode
// ============================

function initSettings() {
    // Load saved settings from localStorage
    const settings = loadSettings();

    // Apply dark mode on page load (works on all pages)
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Set up toggle switches on profile page
    const toggleRows = document.querySelectorAll('.toggle-row');
    toggleRows.forEach(row => {
        const label = row.querySelector('.toggle-label');
        const toggle = row.querySelector('.toggle-switch');
        if (!label || !toggle) return;

        const settingKey = getSettingKey(label.textContent);

        // Apply saved state
        if (settings[settingKey]) {
            toggle.classList.add('active');
        } else {
            toggle.classList.remove('active');
        }

        // Handle click
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const isActive = toggle.classList.contains('active');
            settings[settingKey] = isActive;
            saveSettings(settings);

            // Apply dark mode immediately
            if (settingKey === 'darkMode') {
                if (isActive) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }

            // Show feedback for other toggles
            if (settingKey === 'mealReminders') {
                showToast(isActive ? 'Meal reminders enabled' : 'Meal reminders disabled');
            } else if (settingKey === 'weeklyReport') {
                showToast(isActive ? 'Weekly reports enabled' : 'Weekly reports disabled');
            } else if (settingKey === 'emailNotifications') {
                showToast(isActive ? 'Email notifications enabled' : 'Email notifications disabled');
            } else if (settingKey === 'darkMode') {
                showToast(isActive ? 'Dark mode enabled' : 'Dark mode disabled');
            }
        });
    });

    // Save button functionality
    const saveBtn = document.querySelector('.save-btn-wrapper .btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Save form data
            const nameInput = document.querySelector('.form-group input[type="text"]');
            const emailInput = document.querySelector('.form-group input[type="email"]');
            const calorieInput = document.querySelector('.form-group input[type="number"]');
            const goalSelect = document.querySelectorAll('.form-input')[2]; // Health Goal select
            const dietSelect = document.querySelectorAll('select.form-input')[1]; // Diet Type select

            const profileData = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                calories: calorieInput ? calorieInput.value : '',
                goal: goalSelect ? goalSelect.value : '',
                diet: dietSelect ? dietSelect.value : ''
            };

            localStorage.setItem('nutriai_profile', JSON.stringify(profileData));
            showToast('Settings saved successfully!');
        });
    }

    // Load saved profile data
    const savedProfile = localStorage.getItem('nutriai_profile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        const nameInput = document.querySelector('.form-group input[type="text"]');
        const emailInput = document.querySelector('.form-group input[type="email"]');
        const calorieInput = document.querySelector('.form-group input[type="number"]');

        if (nameInput && profileData.name) nameInput.value = profileData.name;
        if (emailInput && profileData.email) emailInput.value = profileData.email;
        if (calorieInput && profileData.calories) calorieInput.value = profileData.calories;
    }
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
    if (saved) {
        return JSON.parse(saved);
    }
    // Defaults
    return {
        mealReminders: true,
        weeklyReport: true,
        darkMode: false,
        emailNotifications: false
    };
}

function saveSettings(settings) {
    localStorage.setItem('nutriai_settings', JSON.stringify(settings));
}

function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Chat functionality
function initChat() {
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    const promptChips = document.querySelectorAll('.prompt-chip');
    const clearBtn = document.querySelector('.clear-chat-btn');

    if (!chatInput || !sendBtn || !chatMessages) return;

    function sendMessage(text) {
        if (!text.trim()) return;

        // Add user message
        const userMsg = createMessage(text, 'user');
        chatMessages.appendChild(userMsg);

        // Clear input
        chatInput.value = '';

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = getAIResponse(text);
            const aiMsg = createMessage(aiResponse, 'ai');
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
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

    function getAIResponse(input) {
        const lower = input.toLowerCase();
        if (lower.includes('nasi lemak')) {
            return "Nasi lemak is a popular local dish, but it's typically high in calories (~640 kcal) and saturated fat due to the coconut rice and fried items. Here are some suggestions:<br><br>✅ Choose grilled chicken instead of fried chicken<br>✅ Add extra vegetables or cucumber<br>✅ Ask for less sambal to reduce sodium<br>✅ Consider brown rice as a base<br><br>Would you like me to suggest a healthier alternative meal?";
        } else if (lower.includes('mee goreng') || lower.includes('fried noodle')) {
            return "Mee goreng is a tasty choice but tends to be high in sodium and refined carbs (~550 kcal). Tips to make it healthier:<br><br>✅ Opt for less oil when ordering<br>✅ Add extra vegetables<br>✅ Choose egg noodles over instant noodles<br>✅ Try soup-based noodles instead for fewer calories<br><br>Want me to show you a healthier noodle alternative?";
        } else if (lower.includes('hello') || lower.includes('hi')) {
            return "Hello! 👋 I'm NutriAI, your smart meal assistant. Tell me what you ate today, and I'll help you understand its nutritional value and suggest healthier alternatives. What did you have for your last meal?";
        } else {
            return `Thanks for sharing! Let me analyse "${input}" for you.<br><br>Based on general nutritional data, here's what I can tell you:<br><br>📊 I'd recommend tracking this meal in your history and looking at the detailed breakdown in the Meal Analysis section.<br><br>Would you like me to suggest healthier alternatives, or would you like to log another meal?`;
        }
    }

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    // Prompt chips
    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.textContent;
            sendMessage(chip.textContent);
        });
    });

    // Clear chat
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const messages = chatMessages.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
            // Add welcome message back
            const welcome = createMessage("Hello! 👋 I'm NutriAI, your smart meal assistant. Tell me what you ate today, and I'll help analyse the nutrition and suggest healthier alternatives!", 'ai');
            chatMessages.appendChild(welcome);
        });
    }
}

// Initialize chat when on chat page
document.addEventListener('DOMContentLoaded', initChat);

// Animate nutrition bars on scroll
function animateNutrientBars() {
    const bars = document.querySelectorAll('.nutrient-fill');
    bars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 300);
    });
}

// Call on page load if on analysis page
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.nutrient-bars')) {
        setTimeout(animateNutrientBars, 500);
    }
});

// Add CSS for scroll animations and toast
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
`;
document.head.appendChild(style);
