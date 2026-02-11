// breathing-exercises.js - Fixed (preserves updated logic, small UI/selector fixes)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Breathing exercises page loaded successfully');

    let currentExercise = null;
    let isRunning = false;
    let timerInterval = null;
    let currentStepIndex = 0;
    let cycleCount = 0;
    let totalSecondsElapsed = 0;

    // --- Utility Functions ---
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function getExercisePattern(exerciseType) {
        const patterns = {
            'box-breathing': {
                name: 'Box Breathing',
                steps: [
                    { instruction: 'Breathe In', duration: 4, type: 'inhale' },
                    { instruction: 'Hold', duration: 4, type: 'hold' },
                    { instruction: 'Breathe Out', duration: 4, type: 'exhale' },
                    { instruction: 'Hold', duration: 4, type: 'hold' }
                ],
                totalCycles: 10
            },
            '4-7-8-breathing': {
                name: '4-7-8 Breathing',
                steps: [
                    { instruction: 'Breathe In', duration: 4, type: 'inhale' },
                    { instruction: 'Hold', duration: 7, type: 'hold' },
                    { instruction: 'Breathe Out', duration: 8, type: 'exhale' }
                ],
                totalCycles: 8
            },
            'belly-breathing': {
                name: 'Belly Breathing',
                steps: [
                    { instruction: 'Breathe In Slowly', duration: 5, type: 'inhale' },
                    { instruction: 'Hold', duration: 2, type: 'hold' },
                    { instruction: 'Breathe Out Slowly', duration: 6, type: 'exhale' }
                ],
                totalCycles: 12
            },
            'alternate-nostril': {
                name: 'Alternate Nostril Breathing',
                steps: [
                    { instruction: 'Close Right Nostril, Breathe In Left', duration: 4, type: 'inhale' },
                    { instruction: 'Hold Both Closed', duration: 4, type: 'hold' },
                    { instruction: 'Close Left Nostril, Breathe Out Right', duration: 4, type: 'exhale' },
                    { instruction: 'Breathe In Right', duration: 4, type: 'inhale' },
                    { instruction: 'Hold Both Closed', duration: 4, type: 'hold' },
                    { instruction: 'Close Right Nostril, Breathe Out Left', duration: 4, type: 'exhale' }
                ],
                totalCycles: 6
            },
            'coherent-breathing': {
                name: 'Coherent Breathing',
                steps: [
                    { instruction: 'Breathe In', duration: 5, type: 'inhale' },
                    { instruction: 'Breathe Out', duration: 5, type: 'exhale' }
                ],
                totalCycles: 20
            },
            'emergency-breathing': {
                name: 'Emergency Breathing',
                steps: [
                    { instruction: 'Breathe In', duration: 3, type: 'inhale' },
                    { instruction: 'Breathe Out', duration: 6, type: 'exhale' }
                ],
                totalCycles: 5
            }
        };

        return patterns[exerciseType] || patterns['box-breathing'];
    }

    function updateExerciseTitle(exerciseType) {
        const title = document.getElementById('exerciseTitle');
        if (title) {
            const pattern = getExercisePattern(exerciseType);
            title.textContent = pattern.name;
        }
    }

    function updateInstructions(exerciseType) {
        const instructionsContainer = document.getElementById('breathingInstructions');
        if (instructionsContainer) {
            const pattern = getExercisePattern(exerciseType);
            const stepsList = pattern.steps.map(step =>
                `<li>${step.instruction} for ${step.duration} seconds</li>`
            ).join('');

            instructionsContainer.innerHTML = `
                <h4>Instructions:</h4>
                <ol>
                    ${stepsList}
                    <li>Repeat the cycle (${pattern.totalCycles} times)</li>
                </ol>
            `;
        }
    }

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

    // --- Main State Management Functions ---
    function resetExercise() {
        isRunning = false;
        clearInterval(timerInterval);

        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const breathingText = document.getElementById('breathingText');
        const breathingTimer = document.getElementById('breathingTimer');
        const breathingCircle = document.getElementById('breathingCircle');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = 'Start';
        }
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (breathingText) breathingText.textContent = 'Ready to begin';
        if (breathingTimer) breathingTimer.textContent = '00:00';
        if (breathingCircle) {
            breathingCircle.style.transform = 'scale(1)';
            breathingCircle.style.backgroundColor = '#4F46E5';
        }
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0% Complete';

        currentStepIndex = 0;
        cycleCount = 0;
        totalSecondsElapsed = 0;
    }

    function completeExercise() {
        isRunning = false;
        clearInterval(timerInterval);

        const breathingText = document.getElementById('breathingText');
        const breathingTimer = document.getElementById('breathingTimer');

        if (breathingText) breathingText.textContent = 'Exercise Complete!';
        if (breathingTimer) breathingTimer.textContent = 'Well Done!';

        showAlert('Breathing exercise completed! Great job!', 'success');

        setTimeout(() => {
            resetExercise();
        }, 3000);
    }

    // --- Breathing Cycle Logic ---
    function runBreathingCycle() {
        const exercise = getExercisePattern(currentExercise);
        let stepTimer = 0;
        let cycleTotalDuration = exercise.steps.reduce((acc, step) => acc + step.duration, 0);
        const totalDurationSeconds = cycleTotalDuration * exercise.totalCycles;

        if (totalSecondsElapsed > 0) {
            let currentCycleTime = totalSecondsElapsed % cycleTotalDuration;
            for (let i = 0; i < exercise.steps.length; i++) {
                if (currentCycleTime < exercise.steps[i].duration) {
                    currentStepIndex = i;
                    stepTimer = currentCycleTime;
                    break;
                }
                currentCycleTime -= exercise.steps[i].duration;
            }
            cycleCount = Math.floor(totalSecondsElapsed / cycleTotalDuration);
        }

        // Clear any existing interval to avoid duplicates (safety)
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (!isRunning) return;

            const currentStepData = exercise.steps[currentStepIndex];
            const breathingText = document.getElementById('breathingText');
            const breathingTimer = document.getElementById('breathingTimer');
            const breathingCircle = document.getElementById('breathingCircle');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');

            if (breathingText) {
                breathingText.textContent = `${currentStepData.instruction} (${currentStepData.duration - stepTimer})`;
            }

            if (breathingCircle) {
                const progress = stepTimer / currentStepData.duration;
                let scale = 1.0;
                let color = '#6366F1';

                if (currentStepData.type === 'inhale') {
                    scale = 1 + (progress * 0.3);
                    color = '#4F46E5';
                } else if (currentStepData.type === 'exhale') {
                    scale = 1.3 - (progress * 0.3);
                    color = '#7C3AED';
                } else {
                    scale = 1.3;
                    color = '#6366F1';
                }

                breathingCircle.style.transform = `scale(${scale})`;
                breathingCircle.style.backgroundColor = color;
            }

            stepTimer++;
            totalSecondsElapsed++;

            if (breathingTimer) {
                breathingTimer.textContent = formatTime(totalSecondsElapsed);
            }

            if (stepTimer >= currentStepData.duration) {
                stepTimer = 0;
                currentStepIndex++;

                if (currentStepIndex >= exercise.steps.length) {
                    currentStepIndex = 0;
                    cycleCount++;

                    if (progressFill && progressText) {
                        const progress = Math.min((totalSecondsElapsed / totalDurationSeconds) * 100, 100);
                        progressFill.style.width = `${progress}%`;
                        progressText.textContent = `${Math.round(progress)}% Complete (Cycle ${cycleCount} of ${exercise.totalCycles})`;
                    }

                    if (cycleCount >= exercise.totalCycles) {
                        completeExercise();
                        return;
                    }
                }
            }
        }, 1000);
    }

    // --- Initialization and Event Handling ---
    function initializeExerciseSelection() {
        // Use the explicit start button class present in the updated HTML
        const startButtons = document.querySelectorAll('.exercise-card .start-exercise-btn');

        startButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const card = this.closest('.exercise-card');
                if (card) {
                    const exerciseType = card.dataset.exercise;
                    window.startExercise(exerciseType);
                }
            });
        });
    }

    function initializeBreathingModal() {
        const modal = document.getElementById('breathingModal');
        if (modal) {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    window.closeBreathingExercise();
                }
            });
        }
    }

    initializeExerciseSelection();
    initializeBreathingModal();

    // --- Global Functions (Exposed for HTML inline calls) ---
    window.startExercise = function(exerciseType) {
        currentExercise = exerciseType;
        const modal = document.getElementById('breathingModal');
        if (modal) {
            // Restore to 'block' to avoid layout/design shift unless your CSS expects flex
            modal.style.display = 'block';
            updateExerciseTitle(exerciseType);
            updateInstructions(exerciseType);
            resetExercise();
        }
    };

    window.startBreathingCycle = function() {
        if (isRunning) return;

        isRunning = true;

        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-block';

        runBreathingCycle();
    };

    window.pauseExercise = function() {
        if (!isRunning) return;

        isRunning = false;
        clearInterval(timerInterval);

        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const breathingText = document.getElementById('breathingText');

        if (startBtn) {
            startBtn.style.display = 'inline-block';
            startBtn.textContent = 'Resume';
        }
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (breathingText) breathingText.textContent = 'Paused';
    };

    window.stopExercise = function() {
        resetExercise();
    };

    window.closeBreathingExercise = function() {
        resetExercise();
        const modal = document.getElementById('breathingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    window.showBreathingGuide = function() {
        const modal = document.getElementById('breathingGuideModal');
        if (modal) {
            modal.style.display = 'block';
        }
    };

    window.quickBreathing = function() {
        showAlert('Starting quick Box Breathing exercise (10 cycles)...', 'info');
        window.startExercise('box-breathing');
        setTimeout(() => {
            window.startBreathingCycle();
        }, 500);
    };

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
        .breathing-circle {
            transition: all 0.5s ease;
        }
    `;
    document.head.appendChild(style);
});
// --- Guide modal close fixes (paste inside DOMContentLoaded) ---
(function fixGuideModalClose() {
    const guideModal = document.getElementById('breathingGuideModal');
    if (!guideModal) return;

    // 1) Ensure the visible "×" close control works
    const guideClose = guideModal.querySelector('.close');
    if (guideClose) {
        guideClose.style.cursor = 'pointer'; // UX hint
        guideClose.addEventListener('click', () => {
            guideModal.style.display = 'none';
        });
    }

    // 2) Close when clicking outside the modal-content
    guideModal.addEventListener('click', (e) => {
        // if user clicked exactly on the overlay (modal), close it
        if (e.target === guideModal) {
            guideModal.style.display = 'none';
        }
    });

    // 3) Safety: if some element is blocking pointer events, force pointer-events on the close
    if (guideClose) {
        guideClose.style.pointerEvents = 'auto';
        guideClose.style.zIndex = '10002';
    }

    // 4) Make sure modal-content and overlay have sensible z-index so close is clickable
    const modalContent = guideModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.zIndex = '10001';
        modalContent.style.pointerEvents = 'auto';
    }
})();
