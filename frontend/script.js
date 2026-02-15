const API_BASE_URL = 'http://localhost:8000/api';

// Get form and result elements
const form = document.getElementById('predictionForm');
const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const resultValue = document.getElementById('resultValue');
const resultBar = document.getElementById('resultBar');
const errorMessage = document.getElementById('errorMessage');

// Validation and warning elements
const validationMessage = document.getElementById('validationMessage');
const warningsContainer = document.getElementById('warningsContainer');

// Get input elements for validation
const hoursStudiedInput = document.getElementById('hours_studied');
const sleepHoursInput = document.getElementById('sleep_hours');
const previousScoresInput = document.getElementById('previous_scores');
const samplePapersInput = document.getElementById('sample_papers');

// Realistic range warnings
const WARNINGS = {
    hours_studied: {
        min: 1, max: 12,
        lowMsg: (v) => `Warning: Studying only ${v} hour(s) per day is very low. Most students study at least 2-4 hours.`,
        highMsg: (v) => `Warning: Studying ${v} hours per day is extreme and unsustainable. Even dedicated students rarely exceed 10-12 hours.`
    },
    sleep_hours: {
        min: 5, max: 10,
        lowMsg: (v) => `Warning: Sleeping only ${v} hour(s) is unhealthy. Adults need 7-9 hours; chronic sleep deprivation harms cognitive function.`,
        highMsg: (v) => `Warning: Sleeping ${v} hours is excessive. Oversleeping may indicate health issues or reduced productive time.`
    },
    previous_scores: {
        min: 20, max: 100,
        lowMsg: (v) => `Note: A previous score of ${v} is very low. Consider if this is accurate.`,
        highMsg: null // 100 is fine
    },
    sample_papers: {
        min: 0, max: 15,
        lowMsg: null, // 0 is fine
        highMsg: (v) => `Note: Practicing ${v} sample papers is unusually high. Typical students practice 3-10 papers.`
    }
};

// Combined hours validation (study + sleep must be <= 24)
function validateTotalHours() {
    const hoursStudied = parseFloat(hoursStudiedInput.value) || 0;
    const sleepHours = parseFloat(sleepHoursInput.value) || 0;
    const total = hoursStudied + sleepHours;
    
    if (total > 24) {
        validationMessage.textContent = `Invalid: Study (${hoursStudied}h) + Sleep (${sleepHours}h) = ${total}h exceeds 24 hours in a day. This is physically impossible.`;
        validationMessage.className = 'validation-message validation-error';
        validationMessage.style.display = 'block';
        submitBtn.disabled = true;
        return false;
    } else if (total > 20) {
        // Warning: leaves very little time for eating, commuting, etc.
        validationMessage.textContent = `Caution: Study (${hoursStudied}h) + Sleep (${sleepHours}h) = ${total}h leaves only ${24 - total} hour(s) for meals, commute, and other activities.`;
        validationMessage.className = 'validation-message validation-warning';
        validationMessage.style.display = 'block';
        submitBtn.disabled = false;
        return true;
    } else {
        validationMessage.style.display = 'none';
        submitBtn.disabled = false;
        return true;
    }
}

// Check individual field warnings
function checkFieldWarnings() {
    const warnings = [];
    
    // Hours studied
    const hoursStudied = parseFloat(hoursStudiedInput.value);
    if (!isNaN(hoursStudied)) {
        if (hoursStudied < WARNINGS.hours_studied.min && WARNINGS.hours_studied.lowMsg) {
            warnings.push(WARNINGS.hours_studied.lowMsg(hoursStudied));
        } else if (hoursStudied > WARNINGS.hours_studied.max && WARNINGS.hours_studied.highMsg) {
            warnings.push(WARNINGS.hours_studied.highMsg(hoursStudied));
        }
    }
    
    // Sleep hours
    const sleepHours = parseFloat(sleepHoursInput.value);
    if (!isNaN(sleepHours)) {
        if (sleepHours < WARNINGS.sleep_hours.min && WARNINGS.sleep_hours.lowMsg) {
            warnings.push(WARNINGS.sleep_hours.lowMsg(sleepHours));
        } else if (sleepHours > WARNINGS.sleep_hours.max && WARNINGS.sleep_hours.highMsg) {
            warnings.push(WARNINGS.sleep_hours.highMsg(sleepHours));
        }
    }
    
    // Previous scores
    const prevScores = parseFloat(previousScoresInput.value);
    if (!isNaN(prevScores)) {
        if (prevScores < WARNINGS.previous_scores.min && WARNINGS.previous_scores.lowMsg) {
            warnings.push(WARNINGS.previous_scores.lowMsg(prevScores));
        }
    }
    
    // Sample papers
    const samplePapers = parseFloat(samplePapersInput.value);
    if (!isNaN(samplePapers)) {
        if (samplePapers > WARNINGS.sample_papers.max && WARNINGS.sample_papers.highMsg) {
            warnings.push(WARNINGS.sample_papers.highMsg(samplePapers));
        }
    }
    
    // Display warnings
    if (warnings.length > 0 && warningsContainer) {
        warningsContainer.innerHTML = warnings.map(w => `<div class="warning-item">${w}</div>`).join('');
        warningsContainer.style.display = 'block';
    } else if (warningsContainer) {
        warningsContainer.style.display = 'none';
    }
}

// Combined validation function
function validateAll() {
    validateTotalHours();
    checkFieldWarnings();
}

// Add event listeners for real-time validation
if (hoursStudiedInput) hoursStudiedInput.addEventListener('input', validateAll);
if (sleepHoursInput) sleepHoursInput.addEventListener('input', validateAll);
if (previousScoresInput) previousScoresInput.addEventListener('input', validateAll);
if (samplePapersInput) samplePapersInput.addEventListener('input', validateAll);

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate before submission
    if (!validateTotalHours()) {
        return;
    }
    
    // Hide previous results/errors
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    
    // Show loading state
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';
    submitBtn.querySelector('.btn-text').textContent = 'Predicting...';
    
    // Get form data
    const formData = {
        hours_studied: parseInt(document.getElementById('hours_studied').value),
        previous_scores: parseInt(document.getElementById('previous_scores').value),
        extracurricular: document.querySelector('input[name="extracurricular"]:checked').value === 'true',
        sleep_hours: parseInt(document.getElementById('sleep_hours').value),
        sample_papers: parseInt(document.getElementById('sample_papers').value)
    };
    
    try {
        // Make API request
        const response = await fetch(`${API_BASE_URL}/predict/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get prediction');
        }
        
        // Display result
        displayResult(data.predicted_performance_index);
        
    } catch (error) {
        console.error('Error:', error);
        displayError(error.message || 'An error occurred while making the prediction. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        loader.style.display = 'none';
        submitBtn.querySelector('.btn-text').textContent = 'Predict Performance';
    }
});

// Display prediction result
function displayResult(performanceIndex) {
    resultValue.textContent = performanceIndex.toFixed(2);
    
    // Calculate percentage for progress bar (assuming max is 100)
    const percentage = Math.min(performanceIndex, 100);
    resultBar.style.width = `${percentage}%`;
    resultBar.textContent = `${percentage.toFixed(0)}%`;
    
    // Show result container
    resultContainer.style.display = 'block';
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error message
function displayError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    
    // Scroll to error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset form function
function resetForm() {
    form.reset();
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    if (validationMessage) validationMessage.style.display = 'none';
    if (warningsContainer) warningsContainer.style.display = 'none';
    submitBtn.disabled = false;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add input validation for min/max
const numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        
        if (value < min) {
            e.target.value = min;
        } else if (value > max) {
            e.target.value = max;
        }
    });
});
