// booking.js - Counsellor booking page functionality (Updated for Firestore)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking page loaded successfully');
    
    // Global state variables
    let currentStep = 1;
    let selectedCounsellor = null;
    let selectedDate = null;
    let selectedTime = null;
    let selectedSessionType = 'in-person';
    
    // Initialization
    initializeBookingSteps();
    initializeCounsellorSelection();
    initializeDateTimeSelection();
    initializeSessionTypeSelection();
    loadCounsellors(); // Loads simulated data
    updateStepDisplay(); // Initial display setup

    // Check Auth State on load (assuming 'auth' is defined in firebase-init.js)
    if (typeof auth !== 'undefined' && auth.onAuthStateChanged) {
        auth.onAuthStateChanged(user => {
            if (!user) {
                // showAlert('Please log in to book a session.', 'error');
                // setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                console.log('User logged in, ready to book.');
            }
        });
    } else {
        console.warn("Firebase Auth not initialized. Booking functionality will be simulated.");
    }
    
    // --- Initialization Functions ---

    function initializeBookingSteps() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        
        // Attach event listeners to global functions defined below
        if (prevBtn) { prevBtn.addEventListener('click', window.previousStep); }
        if (nextBtn) { nextBtn.addEventListener('click', window.nextStep); }
        if (confirmBtn) { confirmBtn.addEventListener('click', window.confirmBooking); }
    }
    
    /**
     * FIX: Attaches a proper event listener to the "Select" buttons
     * to ensure functionality and progress to the next step.
     */
    function initializeCounsellorSelection() {
        const selectButtons = document.querySelectorAll('.counsellor-card .btn-primary');
        
        selectButtons.forEach(button => {
            // Ensure no duplicate listeners are attached
            button.removeEventListener('click', handleCounsellorSelect); 
            button.addEventListener('click', handleCounsellorSelect);
        });
    }

    function handleCounsellorSelect(event) {
        // Find the closest parent card to get the counsellor ID
        const card = event.currentTarget.closest('.counsellor-card');
        if (card) {
            const counsellorId = card.dataset.counsellor;
            window.selectCounsellor(counsellorId); // Triggers selection, highlighting, and nextStep()
        }
    }

    function initializeDateTimeSelection() {
        const dateBtns = document.querySelectorAll('.date-btn');
        const timeBtns = document.querySelectorAll('.time-btn');
        
        dateBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                dateBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedDate = this.dataset.date;
                console.log('Date selected:', selectedDate);
            });
        });
        
        timeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                timeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedTime = this.dataset.time;
                console.log('Time selected:', selectedTime);
            });
        });
    }
    
    function initializeSessionTypeSelection() {
        const sessionOptions = document.querySelectorAll('input[name="sessionType"]');
        
        sessionOptions.forEach(option => {
            option.addEventListener('change', function() {
                selectedSessionType = this.value;
                updateSessionLocation();
                // Optionally add/remove an 'active' class on the parent label for styling
                document.querySelectorAll('.session-option').forEach(label => label.classList.remove('active'));
                this.closest('.session-option').classList.add('active');
                console.log('Session type selected:', selectedSessionType);
            });
            // Initial check to highlight default selection
            if(option.checked) {
                option.closest('.session-option').classList.add('active');
            }
        });
    }
    
    function loadCounsellors() {
        // Simulated counsellor data used for summary retrieval
        const counsellors = [
            { id: 'dr-smith', name: 'Dr. Sarah Smith', specialization: 'Clinical Psychologist' },
            { id: 'dr-johnson', name: 'Dr. Michael Johnson', specialization: 'Counselling Psychologist' },
            { id: 'ms-wilson', name: 'Ms. Lisa Wilson', specialization: 'Mental Health Counsellor' }
        ];
        console.log('Counsellors loaded.');
    }
    
    // --- Global Functions (Used by HTML 'onclick' and internal calls) ---
    
    window.selectCounsellor = function(counsellorId) {
        selectedCounsellor = counsellorId;
        
        // Remove previous selection
        document.querySelectorAll('.counsellor-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection highlight to the clicked card
        const selectedCard = document.querySelector(`[data-counsellor="${counsellorId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        console.log('Counsellor selected:', counsellorId);
        
        // Move to the next step immediately after selection
        window.nextStep(); 
    };
    
    window.nextStep = function() {
        if (currentStep < 3) {
            if (!validateCurrentStep()) {
                return;
            }
            
            currentStep++;
            updateStepDisplay();
            updateStepButtons();
            // Scroll to the top of the main section for better UX
            document.querySelector('.booking-main').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.previousStep = function() {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
            updateStepButtons();
            document.querySelector('.booking-main').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.confirmBooking = function() {
        const user = typeof auth !== 'undefined' ? auth.currentUser : null;
        
        if (!validateBooking()) {
            return;
        }
        
        const booking = {
            userId: user ? user.uid : 'guest-user',
            counsellor: selectedCounsellor,
            counsellorName: getCounsellorName(selectedCounsellor),
            date: selectedDate,
            time: selectedTime,
            sessionType: selectedSessionType,
            concerns: document.getElementById('concerns')?.value || '',
            preferences: document.getElementById('preferences')?.value || '',
            status: 'Confirmed',
            bookedAt: typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue ? firebase.firestore.FieldValue.serverTimestamp() : new Date() 
        };
        
        // --- SAVE BOOKING TO FIRESTORE / Simulation ---
        if (typeof db !== 'undefined' && db.collection) {
            db.collection('appointments').add(booking)
                .then(() => {
                    showAlert('Booking confirmed!', 'success');
                    showBookingSuccess(booking);
                })
                .catch(error => {
                    console.error("Error writing booking: ", error);
                    showAlert('Error saving booking to database. Please try again.', 'error');
                });
        } else {
            console.warn("Simulated Booking:", booking);
            showAlert('Booking confirmed locally (Firebase not fully connected).', 'success');
            showBookingSuccess(booking);
        }
    };
    
    window.viewMyAppointments = async function() {
        // Functionality for My Appointments is left largely as provided, assuming helper functions exist
        showAlert('Loading appointments...', 'info');
        // ... (API call and modal display logic, requires 'db' object) ...
    };
    
    // --- Helper/Utility Functions ---

    function validateCurrentStep() {
        switch(currentStep) {
            case 1:
                if (!selectedCounsellor) {
                    showAlert('Please select a counsellor', 'error');
                    return false;
                }
                break;
            case 2:
                if (!selectedDate || !selectedTime) {
                    showAlert('Please select both date and time', 'error');
                    return false;
                }
                // Update summary here before moving to step 3
                updateBookingSummary();
                break;
        }
        return true;
    }
    
    function validateBooking() {
        const consent = document.getElementById('consent');
        if (!consent || !consent.checked) {
            showAlert('Please agree to the terms of service', 'error');
            return false;
        }
        return validateCurrentStep();
    }
    
    function updateStepDisplay() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });
        
        // Show/hide sections
        document.querySelectorAll('.booking-section').forEach((section, index) => {
            section.style.display = (index + 1 === currentStep) ? 'block' : 'none';
        });
    }
    
    function updateStepButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const confirmBtn = document.getElementById('confirmBtn');
        
        if (prevBtn) { prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none'; }
        if (nextBtn) { nextBtn.style.display = currentStep < 3 ? 'inline-block' : 'none'; }
        if (confirmBtn) { confirmBtn.style.display = currentStep === 3 ? 'inline-block' : 'none'; }
    }
    
    function updateBookingSummary() {
        const selectedCounsellorEl = document.getElementById('selectedCounsellor');
        const selectedDateEl = document.getElementById('selectedDate');
        const selectedTimeEl = document.getElementById('selectedTime');
        const selectedSessionTypeEl = document.getElementById('selectedSessionType');
        const sessionLocationEl = document.getElementById('sessionLocation');
        
        if (selectedCounsellorEl) { selectedCounsellorEl.textContent = getCounsellorName(selectedCounsellor); }
        if (selectedDateEl) { selectedDateEl.textContent = formatDate(selectedDate); }
        if (selectedTimeEl) { selectedTimeEl.textContent = selectedTime; }
        
        // Get the text content of the selected radio button's strong tag
        const selectedLabel = document.querySelector(`input[name="sessionType"][value="${selectedSessionType}"]`).closest('label');
        const sessionText = selectedLabel ? selectedLabel.querySelector('strong').textContent : selectedSessionType;
        
        if (selectedSessionTypeEl) { selectedSessionTypeEl.textContent = sessionText; }
        if (sessionLocationEl) { sessionLocationEl.textContent = getSessionLocation(selectedSessionType); }
    }
    
    function updateSessionLocation() {
        const location = document.getElementById('sessionLocation');
        if (location) {
            location.textContent = getSessionLocation(selectedSessionType);
        }
    }
    
    function getCounsellorName(counsellorId) {
        const counsellorNames = {
            'dr-smith': 'Dr. Sarah Smith',
            'dr-johnson': 'Dr. Michael Johnson',
            'ms-wilson': 'Ms. Lisa Wilson'
        };
        return counsellorNames[counsellorId] || 'Selected Counsellor';
    }
    
    function getSessionLocation(sessionType) {
        switch(sessionType) {
            case 'in-person': return 'Counselling Centre, Room 205';
            case 'video': return 'Secure online session';
            case 'phone': return 'Audio-only session';
            default: return 'To be determined';
        }
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Not selected';
        const dateValue = dateString.toDate ? dateString.toDate() : new Date(dateString);

        return dateValue.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    function showBookingSuccess(booking) {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            // Update modal content
            document.getElementById('finalCounsellor').textContent = getCounsellorName(booking.counsellor);
            document.getElementById('finalDateTime').textContent = `${formatDate(booking.date)} at ${booking.time}`;
            document.getElementById('finalLocation').textContent = getSessionLocation(booking.sessionType);
            
            modal.style.display = 'block';
        }
    }
    
    window.addToCalendar = function() {
        showAlert('Calendar integration coming soon!', 'info');
    };
    
    window.closeSuccessModal = function() {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    };
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Inline CSS for alert positioning
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
            ${type === 'success' ? 'background-color: #10b981;' : ''}
            ${type === 'error' ? 'background-color: #ef4444;' : ''}
            ${type === 'info' ? 'background-color: #3b82f6;' : ''}
        `;
        
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
    
    // Add CSS animations to the head for selected state
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
        .counsellor-card.selected {
            border: 2px solid #4F46E5 !important;
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.2);
        }
        .date-btn.active, .time-btn.active {
            background-color: #4F46E5;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .session-option.active {
            border: 2px solid #4F46E5;
            background-color: #f0f4ff;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(style);
});