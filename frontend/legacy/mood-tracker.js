// mood-tracker.js - Mood tracker page functionality (Updated for Firestore)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mood tracker page loaded successfully');
    
    let selectedMood = null;
    let selectedIntensity = 5;
    let currentStep = 1;
    
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
    };
    
    // Elements
    const moodOptions = document.querySelectorAll('.mood-option');
    const intensityRange = document.getElementById('intensityRange');
    const intensityValue = document.getElementById('intensityValue');
    const nextStep1Btn = document.getElementById('nextStep1Btn');
    const intensityPrompt = document.getElementById('intensityPrompt');

    
    // Initialize
    initializeMoodOptions();
    initializeIntensitySlider();
    
    // Check Auth State on load
    auth.onAuthStateChanged(user => {
        if (!user) {
            showAlert('Please log in to track your mood.', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            console.log('User logged in, ready to track mood.');
        }
    });


    // --- STEP FLOW LOGIC (Unchanged) ---

    window.nextStep = function(step) {
        if (!steps[step] || (step > 1 && !selectedMood)) return;

        // Hide current step
        if (steps[currentStep]) {
            steps[currentStep].style.display = 'none';
        }
        
        // Update current step
        currentStep = step;

        // Show next step
        if (steps[currentStep]) {
            steps[currentStep].style.display = 'block';
            steps[currentStep].scrollIntoView({ behavior: 'smooth' });
        }
        
        // Special logic for Step 2
        if (currentStep === 2) {
            intensityPrompt.textContent = `How intense is your feeling of ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}?`;
        }
    }

    window.prevStep = function() {
        if (currentStep > 1) {
            nextStep(currentStep - 1);
        }
    }
    
    // --- INITIALIZATION FUNCTIONS (Unchanged) ---

    function initializeMoodOptions() {
        moodOptions.forEach(option => {
            option.addEventListener('click', function() {
                moodOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                selectedMood = this.dataset.mood;
                nextStep1Btn.disabled = false;
                nextStep1Btn.textContent = `Next: Rate ${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}`;
            });
        });

        nextStep1Btn.addEventListener('click', () => nextStep(2));
    }
    
    function initializeIntensitySlider() {
        if (intensityRange && intensityValue) {
            intensityRange.addEventListener('input', function() {
                selectedIntensity = this.value;
                intensityValue.textContent = this.value;
            });
        }
    }
    
    // --- MOOD ENTRY AND INSIGHTS LOGIC (UPDATED FOR FIRESTORE) ---

    window.saveMoodEntry = function() {
        const user = auth.currentUser;
        if (!user || typeof db === 'undefined') {
            showAlert('Error: Cannot save mood. Please ensure you are logged in.', 'error');
            return;
        }

        if (!selectedMood) {
            showAlert('Please select a mood first', 'error');
            return;
        }
        
        const checkedValues = Array.from(document.querySelectorAll('#step3 input[type="checkbox"]:checked')).map(cb => cb.value);
        
        const concerns = checkedValues.filter(val => ['academic-pressure', 'social-issues', 'family', 'health', 'financial', 'future-worries'].includes(val));
        const activities = checkedValues.filter(val => ['exercise', 'social-time', 'study', 'hobbies', 'relaxation', 'sleep-well'].includes(val));
        
        const additionalNotes = document.getElementById('additionalNotes')?.value || '';
        
        // Create mood entry
        const moodEntry = {
            userId: user.uid, // Tie entry to user ID
            mood: selectedMood,
            intensity: selectedIntensity,
            concerns: concerns,
            activities: activities,
            notes: additionalNotes,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
        };
        
        // --- SAVE TO FIRESTORE ---
        db.collection('moods').add(moodEntry)
            .then(() => {
                showAlert('Mood entry saved successfully!', 'success');
                
                // Show insights
                setTimeout(() => {
                    showMoodInsights(moodEntry);
                }, 1000);
                
                // Reset form
                resetForm();
            })
            .catch(error => {
                console.error("Error writing document: ", error);
                showAlert('Error saving mood to database. Check security rules.', 'error');
            });
    }
    
    window.skipQuestions = function() {
         saveMoodEntry(); 
    }

    function showMoodInsights(moodEntry) {
        
        // Generate insights
        const insights = generateInsights(moodEntry);
        updateInsightsContent(insights);
        
        // Move to the insights step (Step 4)
        nextStep(4);
    }
    
    async function getMoodHistory(limit = 7) {
        const user = auth.currentUser;
        if (!user || typeof db === 'undefined') return [];

        try {
            // Fetch mood data from Firestore for the current user
            const snapshot = await db.collection('moods')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => {
                const data = doc.data();
                // Convert timestamp object to a usable string for display
                data.date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'N/A';
                return data;
            });
        } catch (error) {
            console.error("Error fetching mood history:", error);
            showAlert('Could not load mood history from database.', 'error');
            return [];
        }
    }
    
    // --- INSIGHTS AND DISPLAY FUNCTIONS (Updated for async data) ---

    async function generateInsights(moodEntry) {
        const moodHistory = await getMoodHistory(); // Use new async function
        
        const insights = {
            trend: 'Your mood has been stable over the past week',
            suggestions: []
        };
        
        const recentMoods = moodHistory.slice(-7); 
        
        if (recentMoods.length >= 3) {
            const moodMap = {
                'joyful': 5, 'content': 4, 'neutral': 3, 
                'worried': 2, 'sad': 1, 'angry': 1, 
                'stressed': 1, 'lonely': 1
            };
            
            const moodValues = recentMoods.map(entry => moodMap[entry.mood] || 3);
            const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
            
            if (avgMood > 3.5) {
                insights.trend = 'Your mood has been positive overall! Keep up the great work.';
            } else if (avgMood < 2.5) {
                insights.trend = 'You\'ve been going through a tough time. Remember, it\'s okay to seek help.';
            }
        }
        
        // Generate suggestions based on current mood
        switch(moodEntry.mood) {
            case 'stressed':
            case 'worried':
                insights.suggestions = [
                    'Try our breathing exercises to calm your mind',
                    'Consider booking a session with a counsellor',
                    'Take a break and listen to calming sounds'
                ];
                break;
            case 'sad':
            case 'lonely':
                insights.suggestions = [
                    'Connect with our community for peer support',
                    'Try some positive affirmations',
                    'Consider reaching out to friends or family'
                ];
                break;
            case 'angry':
                insights.suggestions = [
                    'Take some deep breaths and count to 10',
                    'Try our guided meditation',
                    'Consider what might be triggering these feelings'
                ];
                break;
            default:
                insights.suggestions = [
                    'Keep up the great work!',
                    'Continue with your wellness routine',
                    'Share your positive energy with others'
                ];
        }
        
        return insights;
    }
    
    function updateInsightsContent(insights) {
        const trendElement = document.getElementById('trendAnalysisText');
        const suggestionsElement = document.getElementById('suggestedActionsText');
        
        if (trendElement) {
            trendElement.textContent = insights.trend;
        }
        
        if (suggestionsElement) {
            suggestionsElement.innerHTML = insights.suggestions
                .map(suggestion => `• ${suggestion}`)
                .join('<br>');
        }
    }
    
    function resetForm() {
        // Reset mood selection and buttons
        moodOptions.forEach(opt => {
            opt.classList.remove('selected');
        });
        selectedMood = null;
        nextStep1Btn.disabled = true;
        nextStep1Btn.textContent = 'Next: Rate Intensity';
        
        // Reset intensity
        if (intensityRange) {
            intensityRange.value = 5;
            intensityValue.textContent = '5';
        }
        selectedIntensity = 5;
        
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Reset textarea
        const notesTextarea = document.getElementById('additionalNotes');
        if (notesTextarea) {
            notesTextarea.value = '';
        }
        
        // Go back to step 1 (hide all other steps)
        nextStep(1);
    }
    
    
    // Global function to show history modal
    window.showMoodHistory = async function() {
        const moodHistory = await getMoodHistory(10); // Fetch last 10 entries
        
        if (moodHistory.length === 0) {
            showAlert('No mood history found. Start tracking your mood to see your progress!', 'info');
            return;
        }
        
        // Create modal to show mood history
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const historyHTML = moodHistory.map(entry => `
            <div class="history-item">
                <div class="history-date">${entry.date}</div>
                <div class="history-mood">
                    <span class="mood-emoji">${getMoodEmoji(entry.mood)}</span>
                    <span class="mood-name">${entry.mood}</span>
                    <span class="mood-intensity">(${entry.intensity}/10)</span>
                </div>
                ${entry.notes ? `<div class="history-notes">${entry.notes}</div>` : ''}
            </div>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Your Mood History</h3>
                <div class="mood-history-list">
                    ${historyHTML}
                </div>
                <button class="btn btn-primary close-button-footer">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Correct logic for closing the popup
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('close') || e.target.classList.contains('close-button-footer')) {
                modal.remove();
            }
        });
    };
    
    function getMoodEmoji(mood) {
        const moodEmojis = {
            'joyful': '😄',
            'content': '😊',
            'neutral': '😐',
            'worried': '😟',
            'sad': '😢',
            'angry': '😠',
            'stressed': '😰',
            'lonely': '😔'
        };
        return moodEmojis[mood] || '😐';
    }
    
    // ... rest of showAlert and CSS functions (omitted for brevity)
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            alert.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#ef4444';
        } else if (type === 'info') {
            alert.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        .close {
            position: absolute;
            right: 1rem;
            top: 1rem;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .history-item {
            padding: 1rem;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 0.5rem;
        }
        .history-date {
            font-weight: 600;
            color: #4F46E5;
            margin-bottom: 0.5rem;
        }
        .history-mood {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        .mood-emoji {
            font-size: 1.5rem;
        }
        .mood-name {
            text-transform: capitalize;
            font-weight: 500;
        }
        .mood-intensity {
            color: #64748b;
            font-size: 0.9rem;
        }
        .history-notes {
            color: #64748b;
            font-style: italic;
        }
        
        /* NEW STYLES FOR REDESIGN */
        .mood-icon-large {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100px;
            padding: 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: #fff;
            font-size: 1.1rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        .mood-icon-large:hover:not(.selected) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .mood-icon-large.selected {
            border-color: var(--primary-color, #4F46E5);
            background: var(--primary-light-color, #EEF2FF);
            color: var(--primary-color, #4F46E5);
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
            transform: scale(1.02);
        }
        .mood-icon-large::before {
            content: attr(data-mood-emoji); /* Placeholder for JS-injected emoji */
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .mood-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
    `;
    document.head.appendChild(style);
    
    // Initial setup to show the first step
    nextStep(1);
});