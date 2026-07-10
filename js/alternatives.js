/**
 * NutriAI - Healthy Alternatives Page
 * Loads nutritional data from data/alternatives.json
 * and renders comparison cards with real verified nutrition info.
 */

let alternatives = [];

// Load data from JSON
async function loadAlternatives() {
    try {
        const response = await fetch('data/alternatives.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        alternatives = await response.json();
        renderCards('all');
    } catch (error) {
        // Fallback: try loading inline if fetch fails (e.g. file:// protocol)
        console.warn('Fetch failed, loading inline data fallback:', error.message);
        if (typeof alternativesData !== 'undefined') {
            alternatives = alternativesData;
            renderCards('all');
        } else {
            document.getElementById('alternatives-list').innerHTML =
                '<p style="text-align:center;color:#888;">Unable to load meal data. Please use a local server.</p>';
        }
    }
}

// Generate comparison badges from nutritional differences
function generateBadges(original, alternative) {
    const badges = [];
    const calDiff = original.calories - alternative.calories;
    const proteinDiff = alternative.protein - original.protein;
    const fatDiff = original.fat - alternative.fat;
    const satFatDiff = original.saturatedFat - alternative.saturatedFat;
    const sugarDiff = original.sugar - alternative.sugar;
    const sodiumDiff = original.sodium - alternative.sodium;
    const fibreDiff = alternative.fibre - original.fibre;

    if (calDiff > 0) badges.push({ text: `↓ ${calDiff} kcal`, type: 'good' });
    if (proteinDiff > 0) badges.push({ text: `↑ +${proteinDiff}g protein`, type: 'good' });
    if (fatDiff > 0) badges.push({ text: `↓ ${fatDiff}g fat`, type: 'good' });
    if (satFatDiff > 0) badges.push({ text: `↓ ${satFatDiff}g sat. fat`, type: 'good' });
    if (sugarDiff > 0) badges.push({ text: `↓ ${sugarDiff}g sugar`, type: 'good' });
    if (sodiumDiff > 0) badges.push({ text: `↓ ${sodiumDiff}mg sodium`, type: 'good' });
    if (fibreDiff > 0) badges.push({ text: `↑ +${fibreDiff}g fibre`, type: 'good' });

    return badges;
}

// Render a nutrition comparison table
function renderNutritionTable(original, alternative) {
    const rows = [
        { label: 'Calories', unit: 'kcal', orig: original.calories, alt: alternative.calories, lower: true },
        { label: 'Protein', unit: 'g', orig: original.protein, alt: alternative.protein, lower: false },
        { label: 'Carbohydrates', unit: 'g', orig: original.carbs, alt: alternative.carbs, lower: true },
        { label: 'Fat', unit: 'g', orig: original.fat, alt: alternative.fat, lower: true },
        { label: 'Saturated Fat', unit: 'g', orig: original.saturatedFat, alt: alternative.saturatedFat, lower: true },
        { label: 'Sugar', unit: 'g', orig: original.sugar, alt: alternative.sugar, lower: true },
        { label: 'Sodium', unit: 'mg', orig: original.sodium, alt: alternative.sodium, lower: true },
        { label: 'Fibre', unit: 'g', orig: original.fibre, alt: alternative.fibre, lower: false }
    ];

    return `
        <div class="nutrition-comparison">
            <table>
                <thead>
                    <tr>
                        <th>Nutrient</th>
                        <th>Original</th>
                        <th>Alternative</th>
                        <th>Difference</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => {
                        const diff = row.alt - row.orig;
                        const isBetter = row.lower ? diff < 0 : diff > 0;
                        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                        return `
                            <tr>
                                <td>${row.label}</td>
                                <td>${row.orig} ${row.unit}</td>
                                <td class="${isBetter ? 'better' : ''}">${row.alt} ${row.unit}</td>
                                <td class="${isBetter ? 'better' : ''}">${diffStr} ${row.unit}</td>
                            </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
}

// Render a single swap card
function renderSwapCard(item, isSearchResult) {
    const badges = generateBadges(item.original, item.alternative);
    const cardClass = isSearchResult ? 'swap-card result-card' : 'swap-card';

    return `
        <div class="${cardClass}">
            <div class="swap-top">
                <div class="swap-meal original-meal">
                    <span class="meal-emoji">${item.original.emoji}</span>
                    <div class="meal-info">
                        <span class="swap-label">Instead of</span>
                        <h3>${item.original.name}</h3>
                        <span class="calorie-tag">${item.original.calories} kcal</span>
                    </div>
                </div>
                <div class="swap-arrow">→</div>
                <div class="swap-meal recommended-meal">
                    <span class="meal-emoji">${item.alternative.emoji}</span>
                    <div class="meal-info">
                        <span class="swap-label">Try this</span>
                        <h3>${item.alternative.name}</h3>
                        <span class="calorie-tag green">${item.alternative.calories} kcal</span>
                    </div>
                </div>
            </div>
            <div class="swap-highlights">
                ${badges.map(b => `<span class="highlight-pill ${b.type}">${b.text}</span>`).join('')}
            </div>
            <details class="swap-details">
                <summary>View Nutrition Comparison & Explanation</summary>
                ${renderNutritionTable(item.original, item.alternative)}
                <div class="result-benefits">
                    <h4>Why this is better:</h4>
                    <p class="explanation-text">${item.explanation}</p>
                </div>
                <div class="data-sources">
                    <p class="source-label">📊 Data Sources:</p>
                    <p class="source-text">Original: ${item.original.source}</p>
                    <p class="source-text">Alternative: ${item.alternative.source}</p>
                </div>
            </details>
        </div>`;
}

// Search functionality
function findAlternative(query) {
    query = query.toLowerCase().trim();
    if (!query) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const item of alternatives) {
        for (const keyword of item.keywords) {
            if (query.includes(keyword) || keyword.includes(query)) {
                const score = keyword === query ? 10 : keyword.includes(query) ? 5 : 3;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = item;
                }
            }
        }
    }
    return bestMatch;
}

function renderSearchResult(match) {
    const searchResult = document.getElementById('search-result');

    if (!match) {
        searchResult.style.display = 'block';
        searchResult.innerHTML = `
            <div class="no-result">
                <span class="no-result-emoji">🤔</span>
                <h3>No match found</h3>
                <p>Try a different food, or browse the categories below!</p>
            </div>`;
        return;
    }

    searchResult.style.display = 'block';
    searchResult.innerHTML = renderSwapCard(match, true);
    searchResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Render category cards
function renderCards(category) {
    const filtered = category === 'all'
        ? alternatives
        : alternatives.filter(item => item.category === category);

    const list = document.getElementById('alternatives-list');
    list.innerHTML = filtered.map(item => renderSwapCard(item, false)).join('');
}

// Event listeners
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const query = document.getElementById('food-input').value;
    const match = findAlternative(query);
    renderSearchResult(match);
});

document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderCards(this.getAttribute('data-category'));
    });
});

// Initialize
loadAlternatives();