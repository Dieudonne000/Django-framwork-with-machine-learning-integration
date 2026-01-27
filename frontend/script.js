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

// Validation message element
const validationMessage = document.getElementById('validationMessage');

// Get input elements for validation
const hoursStudiedInput = document.getElementById('hours_studied');
const sleepHoursInput = document.getElementById('sleep_hours');

// Validation function: check that hours_studied + sleep_hours <= 24
function validateHours() {
    const hoursStudied = parseFloat(hoursStudiedInput.value) || 0;
    const sleepHours = parseFloat(sleepHoursInput.value) || 0;
    const total = hoursStudied + sleepHours;
    
    if (total > 24) {
        validationMessage.textContent = `Invalid: Study (${hoursStudied}h) + Sleep (${sleepHours}h) = ${total}h exceeds 24 hours in a day.`;
        validationMessage.style.display = 'block';
        submitBtn.disabled = true;
        return false;
    } else {
        validationMessage.style.display = 'none';
        submitBtn.disabled = false;
        return true;
    }
}

// Add event listeners for real-time validation
if (hoursStudiedInput && sleepHoursInput) {
    hoursStudiedInput.addEventListener('input', validateHours);
    sleepHoursInput.addEventListener('input', validateHours);
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate before submission
    if (!validateHours()) {
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
