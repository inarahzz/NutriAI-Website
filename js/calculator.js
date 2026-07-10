/* ============================
   NutriAI - BMI & Calorie Calculator
   
   FORMULAS & SOURCES:
   -------------------
   BMI: weight(kg) / height(m)² — WHO standard
   BMI Categories (Asian): WHO Expert Consultation for Asian populations
     - Underweight: < 18.5
     - Normal: 18.5 – 22.9
     - Overweight (At Risk): 23 – 27.4
     - Obese: ≥ 27.5
     Source: WHO Expert Consultation, 2004 (Lancet) & HPB Singapore
   
   BMR: Mifflin-St Jeor Equation (1990)
     Male:   BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5
     Female: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
     Source: Mifflin MD et al. Am J Clin Nutr. 1990;51(2):241-247
     Note: Recommended by Academy of Nutrition and Dietetics as most accurate
   
   TDEE: BMR × Activity Factor (Harris-Benedict activity multipliers)
     Sedentary: 1.2 | Light: 1.375 | Moderate: 1.55 | Very Active: 1.725 | Extra: 1.9
     Source: Roza AM, Shizgal HM. Am J Clin Nutr. 1984;40(1):168-182
   
   Weight Loss/Gain:
     - 1 kg body fat ≈ 7,700 kcal (Wishnofsky M. Am J Clin Nutr. 1958)
     - 500 kcal/day deficit → ~0.45 kg/week loss (safe rate per NHS/HPB guidelines)
     - 300 kcal/day surplus → ~0.25–0.3 kg/week lean gain
   
   Macronutrient Ranges (AMDR - Acceptable Macronutrient Distribution Ranges):
     - Protein: 10–35% of calories (4 kcal/g)
     - Carbohydrates: 45–65% of calories (4 kcal/g)
     - Fat: 20–35% of calories (9 kcal/g)
     Source: Institute of Medicine (IOM) Dietary Reference Intakes, 2005
     
   Applied split (balanced for active students):
     - Protein: 25% (supports muscle recovery)
     - Carbohydrates: 50% (primary energy source)
     - Fat: 25% (essential functions, hormone production)
     Source: HPB Singapore "My Healthy Plate" guidelines
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculate-btn');
    if (!calculateBtn) return;

    // Gender toggle
    const genderBtns = document.querySelectorAll('.gender-btn');
    let selectedGender = 'male';

    genderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
        });
    });

    // Calculate button
    calculateBtn.addEventListener('click', () => {
        const age = parseInt(document.getElementById('calc-age').value);
        const height = parseFloat(document.getElementById('calc-height').value);
        const weight = parseFloat(document.getElementById('calc-weight').value);
        const activity = parseFloat(document.getElementById('calc-activity').value);
        const goal = document.getElementById('calc-goal').value;

        // Validation
        if (!age || !height || !weight || !activity) {
            showToast('Please fill in all fields to calculate.');
            return;
        }

        if (age < 13 || age > 80) {
            showToast('Please enter an age between 13 and 80.');
            return;
        }

        if (height < 100 || height > 250) {
            showToast('Please enter a height between 100 and 250 cm.');
            return;
        }

        if (weight < 30 || weight > 250) {
            showToast('Please enter a weight between 30 and 250 kg.');
            return;
        }

        // =============================
        // BMI Calculation (WHO formula)
        // BMI = weight(kg) / height(m)²
        // =============================
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        // =============================
        // BMR using Mifflin-St Jeor (1990)
        // Most accurate for general population
        // Male:   (10 × kg) + (6.25 × cm) − (5 × age) + 5
        // Female: (10 × kg) + (6.25 × cm) − (5 × age) − 161
        // =============================
        let bmr;
        if (selectedGender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        // =============================
        // TDEE = BMR × Activity Factor
        // Activity multipliers from Harris-Benedict research
        // =============================
        let tdee = bmr * activity;

        // =============================
        // Goal adjustment
        // Based on: 1 kg fat ≈ 7,700 kcal (Wishnofsky, 1958)
        // - Lose: 500 kcal deficit → ~0.45 kg/week (recommended safe rate)
        // - Gain: 300 kcal surplus → ~0.25–0.3 kg/week lean mass
        // =============================
        let targetCalories = tdee;
        if (goal === 'lose') {
            targetCalories = tdee - 500;
        } else if (goal === 'gain') {
            targetCalories = tdee + 300;
        }

        // Ensure minimum safe calorie intake
        // (NHS & HPB recommend minimum 1,200 for women, 1,500 for men)
        const minCalories = selectedGender === 'male' ? 1500 : 1200;
        if (targetCalories < minCalories) {
            targetCalories = minCalories;
        }

        targetCalories = Math.round(targetCalories);

        // =============================
        // Macronutrient calculation
        // Based on IOM AMDR & HPB "My Healthy Plate"
        // Protein: 25% (4 kcal/g) — supports muscle, satiety
        // Carbs:   50% (4 kcal/g) — primary energy
        // Fat:     25% (9 kcal/g) — hormones, cell function
        // =============================
        const proteinGrams = Math.round((targetCalories * 0.25) / 4);
        const carbsGrams = Math.round((targetCalories * 0.50) / 4);
        const fatGrams = Math.round((targetCalories * 0.25) / 9);

        // Display results
        displayResults(bmi, targetCalories, proteinGrams, carbsGrams, fatGrams, goal, selectedGender, age, bmr, tdee);
    });
});

function displayResults(bmi, calories, protein, carbs, fat, goal, gender, age, bmr, tdee) {
    // Show results, hide placeholder
    document.getElementById('results-placeholder').style.display = 'none';
    const resultsContent = document.getElementById('results-content');
    resultsContent.classList.add('visible');

    // BMI Value
    const bmiValue = document.getElementById('bmi-value');
    bmiValue.textContent = bmi.toFixed(1);

    // =============================
    // BMI Categories — Asian cutoffs
    // WHO Expert Consultation (2004) + HPB Singapore
    // Asian populations have higher health risks at lower BMI
    // Underweight: < 18.5
    // Normal: 18.5 – 22.9
    // Overweight (At Risk): 23.0 – 27.4
    // Obese: ≥ 27.5
    // =============================
    const bmiCategory = document.getElementById('bmi-category');
    let category, color;

    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#2196F3';
    } else if (bmi < 23) {
        category = 'Normal Weight';
        color = '#4caf50';
    } else if (bmi < 27.5) {
        category = 'Overweight (At Risk)';
        color = '#ff9800';
    } else {
        category = 'Obese';
        color = '#f44336';
    }

    bmiCategory.textContent = category;
    bmiCategory.style.color = color;
    bmiValue.style.color = color;

    // BMI Indicator position (scale: 15–40 mapped to 0–100%)
    const indicatorPos = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
    document.getElementById('bmi-indicator').style.left = indicatorPos + '%';

    // Calories
    document.getElementById('calorie-value').textContent = calories.toLocaleString();

    // Macros
    document.getElementById('macro-protein').textContent = protein + 'g';
    document.getElementById('macro-carbs').textContent = carbs + 'g';
    document.getElementById('macro-fat').textContent = fat + 'g';

    // Generate insight
    const insight = generateInsight(bmi, calories, goal, gender, age, bmr, tdee);
    document.getElementById('insight-text').textContent = insight;

    // Scroll to results on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('results-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function generateInsight(bmi, calories, goal, gender, age, bmr, tdee) {
    const insights = [];

    // BMI-based insight (using Asian cutoffs)
    if (bmi < 18.5) {
        insights.push('Your BMI suggests you\'re underweight. Focus on calorie-dense, nutrient-rich foods like nuts, avocados, whole grains, and lean protein to gain weight safely.');
    } else if (bmi >= 18.5 && bmi < 23) {
        insights.push('Your BMI is in the healthy range for Asian populations — well done! Maintain this with balanced meals and regular physical activity.');
    } else if (bmi >= 23 && bmi < 27.5) {
        insights.push('Your BMI puts you in the "at risk" category for Asian populations (HPB Singapore guideline: 23+). Reducing refined carbs and increasing vegetables can help.');
    } else {
        insights.push('Your BMI is in the obese range. Please consider consulting a healthcare professional for personalised dietary and exercise guidance.');
    }

    // Goal-based insight with scientific context
    if (goal === 'lose') {
        const weeklyLoss = (500 * 7 / 7700).toFixed(2);
        insights.push(`Your target of ${calories} kcal/day creates a 500 kcal deficit, resulting in approximately ${weeklyLoss} kg loss per week — a safe rate recommended by health authorities.`);
    } else if (goal === 'gain') {
        insights.push(`Your target of ${calories} kcal/day provides a 300 kcal surplus for gradual lean mass gain. Pair this with resistance training for best results.`);
    } else {
        insights.push(`Your maintenance level is ${Math.round(tdee)} kcal/day (BMR: ${Math.round(bmr)} kcal). Eating around this amount will keep your weight stable.`);
    }

    // Age-based tip
    if (age >= 13 && age <= 18) {
        insights.push('As a growing teen, don\'t restrict calories too aggressively — you need nutrients for development.');
    } else if (age >= 19 && age <= 25) {
        insights.push('As a young adult, prioritise protein (at least 0.8g per kg body weight) and calcium for bone health.');
    }

    return insights[0] + ' ' + (insights[1] || '');
}
