/* ============================
   Meal Comparison Tool Logic
   ============================ */

const mealData = {
    'nasi-lemak': {
        name: 'Nasi Lemak with Fried Chicken',
        emoji: '🍛',
        calories: 640,
        protein: 18,
        carbs: 72,
        fat: 32,
        sugar: 8,
        sodium: 1200,
        fibre: 3,
        score: 6.0
    },
    'chicken-rice': {
        name: 'Chicken Rice',
        emoji: '🍚',
        calories: 520,
        protein: 22,
        carbs: 65,
        fat: 18,
        sugar: 4,
        sodium: 900,
        fibre: 2,
        score: 6.5
    },
    'mee-goreng': {
        name: 'Mee Goreng',
        emoji: '🍜',
        calories: 550,
        protein: 14,
        carbs: 68,
        fat: 24,
        sugar: 12,
        sodium: 1400,
        fibre: 3,
        score: 5.5
    },
    'burger-fries': {
        name: 'Burger & Fries',
        emoji: '🍔',
        calories: 890,
        protein: 22,
        carbs: 85,
        fat: 48,
        sugar: 18,
        sodium: 1600,
        fibre: 3,
        score: 4.0
    },
    'char-kway-teow': {
        name: 'Char Kway Teow',
        emoji: '🍝',
        calories: 750,
        protein: 20,
        carbs: 78,
        fat: 40,
        sugar: 6,
        sodium: 1500,
        fibre: 2,
        score: 4.5
    },
    'roti-prata': {
        name: 'Roti Prata (2 pcs)',
        emoji: '🫓',
        calories: 480,
        protein: 10,
        carbs: 55,
        fat: 24,
        sugar: 3,
        sodium: 800,
        fibre: 2,
        score: 5.0
    },
    'bubble-tea': {
        name: 'Bubble Tea (Regular)',
        emoji: '🧋',
        calories: 500,
        protein: 2,
        carbs: 85,
        fat: 12,
        sugar: 50,
        sodium: 100,
        fibre: 0,
        score: 3.0
    },
    'nasi-padang': {
        name: 'Nasi Padang',
        emoji: '🍛',
        calories: 720,
        protein: 25,
        carbs: 70,
        fat: 38,
        sugar: 6,
        sodium: 1300,
        fibre: 4,
        score: 5.5
    },
    'grilled-chicken-rice': {
        name: 'Grilled Chicken with Brown Rice',
        emoji: '🥙',
        calories: 420,
        protein: 35,
        carbs: 45,
        fat: 12,
        sugar: 4,
        sodium: 600,
        fibre: 5,
        score: 8.5
    },
    'soup-noodles': {
        name: 'Soup Noodles with Vegetables',
        emoji: '🍲',
        calories: 380,
        protein: 28,
        carbs: 42,
        fat: 8,
        sugar: 3,
        sodium: 700,
        fibre: 5,
        score: 8.0
    },
    'salad-bowl': {
        name: 'Salad Bowl with Protein',
        emoji: '🥗',
        calories: 350,
        protein: 30,
        carbs: 25,
        fat: 14,
        sugar: 6,
        sodium: 400,
        fibre: 8,
        score: 9.0
    },
    'oatmeal': {
        name: 'Oatmeal with Banana',
        emoji: '🥣',
        calories: 320,
        protein: 12,
        carbs: 55,
        fat: 6,
        sugar: 14,
        sodium: 150,
        fibre: 7,
        score: 8.5
    },
    'sandwich': {
        name: 'Whole Wheat Chicken Sandwich',
        emoji: '🥪',
        calories: 400,
        protein: 28,
        carbs: 38,
        fat: 14,
        sugar: 5,
        sodium: 650,
        fibre: 5,
        score: 7.5
    },
    'green-tea': {
        name: 'Green Tea (No Sugar)',
        emoji: '🍵',
        calories: 5,
        protein: 0,
        carbs: 1,
        fat: 0,
        sugar: 0,
        sodium: 5,
        fibre: 0,
        score: 9.5
    },
    'fish-soup': {
        name: 'Sliced Fish Soup with Rice',
        emoji: '🐟',
        calories: 400,
        protein: 32,
        carbs: 48,
        fat: 8,
        sugar: 2,
        sodium: 750,
        fibre: 3,
        score: 8.0
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const compareBtn = document.getElementById('compareBtn');
    if (!compareBtn) return;

    compareBtn.addEventListener('click', compareMeals);
});

function compareMeals() {
    const mealAKey = document.getElementById('mealA').value;
    const mealBKey = document.getElementById('mealB').value;

    if (!mealAKey || !mealBKey) {
        alert('Please select both meals to compare!');
        return;
    }

    if (mealAKey === mealBKey) {
        alert('Please select two different meals to compare!');
        return;
    }

    const mealA = mealData[mealAKey];
    const mealB = mealData[mealBKey];

    if (!mealA || !mealB) {
        alert('Meal data not found. Please try different meals.');
        return;
    }

    // Show results
    const results = document.getElementById('comparisonResults');
    results.classList.add('visible');

    // Update legend
    document.getElementById('legendA').textContent = mealA.name;
    document.getElementById('legendB').textContent = mealB.name;

    // Build bar comparison
    buildBarComparison(mealA, mealB);

    // Build result cards
    buildResultCard('resultCardA', mealA, mealB);
    buildResultCard('resultCardB', mealB, mealA);

    // Build verdict
    buildVerdict(mealA, mealB);

    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildBarComparison(mealA, mealB) {
    const container = document.getElementById('barRows');
    const nutrients = [
        { label: 'Calories', key: 'calories', unit: 'kcal', lowerBetter: true },
        { label: 'Protein', key: 'protein', unit: 'g', lowerBetter: false },
        { label: 'Carbs', key: 'carbs', unit: 'g', lowerBetter: true },
        { label: 'Fat', key: 'fat', unit: 'g', lowerBetter: true },
        { label: 'Sugar', key: 'sugar', unit: 'g', lowerBetter: true },
        { label: 'Sodium', key: 'sodium', unit: 'mg', lowerBetter: true },
        { label: 'Fibre', key: 'fibre', unit: 'g', lowerBetter: false }
    ];

    let html = '';
    nutrients.forEach(n => {
        const total = mealA[n.key] + mealB[n.key];
        const pctA = total > 0 ? (mealA[n.key] / total * 100).toFixed(0) : 50;
        const pctB = total > 0 ? (mealB[n.key] / total * 100).toFixed(0) : 50;

        html += `
            <div class="bar-row">
                <span class="bar-label">${n.label}</span>
                <div class="bar-track">
                    <div class="bar-fill-a" style="width: ${pctA}%">${mealA[n.key]}${n.unit}</div>
                    <div class="bar-fill-b" style="width: ${pctB}%">${mealB[n.key]}${n.unit}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function buildResultCard(cardId, meal, otherMeal) {
    const card = document.getElementById(cardId);
    const nutrients = ['calories', 'protein', 'carbs', 'fat', 'sugar', 'sodium', 'fibre'];
    const labels = { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat', sugar: 'Sugar', sodium: 'Sodium', fibre: 'Fibre' };
    const units = { calories: ' kcal', protein: 'g', carbs: 'g', fat: 'g', sugar: 'g', sodium: 'mg', fibre: 'g' };
    const lowerBetter = { calories: true, protein: false, carbs: true, fat: true, sugar: true, sodium: true, fibre: false };

    let statsHtml = '';
    nutrients.forEach(key => {
        let className = '';
        if (lowerBetter[key]) {
            className = meal[key] < otherMeal[key] ? 'better' : (meal[key] > otherMeal[key] ? 'worse' : '');
        } else {
            className = meal[key] > otherMeal[key] ? 'better' : (meal[key] < otherMeal[key] ? 'worse' : '');
        }

        statsHtml += `
            <div class="result-stat-row">
                <span class="result-stat-label">${labels[key]}</span>
                <span class="result-stat-value ${className}">${meal[key]}${units[key]}</span>
            </div>
        `;
    });

    card.innerHTML = `
        <div class="result-meal-emoji">${meal.emoji}</div>
        <h3>${meal.name}</h3>
        <div class="result-stats">
            <div class="result-stat-row">
                <span class="result-stat-label">Health Score</span>
                <span class="result-stat-value" style="color: ${meal.score >= 7 ? 'var(--primary-green)' : meal.score >= 5 ? 'var(--accent-orange)' : '#FF6B6B'}">${meal.score}/10</span>
            </div>
            ${statsHtml}
        </div>
    `;
}

function buildVerdict(mealA, mealB) {
    const section = document.getElementById('verdictSection');
    let winner, loser, reason;

    if (mealA.score > mealB.score) {
        winner = mealB;
        loser = mealA;
    } else {
        winner = mealB;
        loser = mealA;
    }

    // Always pick the one with higher score
    if (mealA.score > mealB.score) {
        winner = mealA;
        loser = mealB;
    }

    const calDiff = Math.abs(mealA.calories - mealB.calories);
    const proteinDiff = Math.abs(mealA.protein - mealB.protein);

    if (winner.calories < loser.calories && winner.protein > loser.protein) {
        reason = `${winner.name} has ${calDiff} fewer calories and ${proteinDiff}g more protein — a much better nutritional balance for your body.`;
    } else if (winner.calories < loser.calories) {
        reason = `${winner.name} saves you ${calDiff} calories while still being a satisfying meal. Small swaps like this add up over the week!`;
    } else {
        reason = `${winner.name} has a better overall nutritional profile with more balanced macronutrients and less unhealthy components.`;
    }

    section.innerHTML = `
        <h3>🏆 AI Verdict</h3>
        <div class="verdict-winner">${winner.emoji} ${winner.name} wins!</div>
        <p class="verdict-text">${reason}</p>
        <p class="verdict-text" style="margin-top: 12px; font-size: 0.85rem; color: #888;">
            💡 Tip: Try choosing ${winner.name} next time for a healthier option!
        </p>
    `;
}
