// dashboard.js - Dashboard page functionality (MODIFIED)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded successfully');

    // Mood Map derived from history.js for consistent scoring
    const MOOD_MAP = {
        'joyful': 5, 'content': 4, 'neutral': 3,
        'worried': 2, 'sad': 1, 'angry': 1,
        'stressed': 2, 'lonely': 1
    };
    
    const MOOD_HISTORY_LIMIT = 7; 
    
    // Check for global Firebase objects before proceeding
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase services not initialized. Cannot fetch dashboard metrics.');
        // Fallback to update greeting only
        initializeDashboard();
    } else {
        // Main function to listen for auth state changes
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is logged in, start fetching dynamic data
                updateDashboardStats(user);
                
                // Update greeting with actual user name (if available)
                updateGreeting(user.displayName || user.email.split('@')[0]);
            } else {
                // User is not logged in, revert to generic or guest greeting
                updateGreeting('Guest');
                initializeDashboard(); // Still run dashboard initialization for basic UI
            }
        });
    }

    // Existing initialization calls
    initializeMoodTracker();
    initializeInstantRelief();
    initializeQuickAccess();
    loadTodaysPlan();
    loadRecommendedContent();
    initializeBottomNavigation();
    initializeModal();

    // --- NEW CORE FUNCTION: UPDATE STATS ---
    async function updateDashboardStats(user) {
        if (!user || typeof db === 'undefined') return;

        // 1. Fetch all mood entries for Day Streak & Mood Score
        const moodSnapshot = await db.collection('moods')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .get()
            .catch(error => {
                console.error("Error fetching mood data:", error);
                return { docs: [] };
            });
            
        const moodEntries = moodSnapshot.docs.map(doc => doc.data());
        
        // 2. Fetch all appointments for Sessions
        const sessionSnapshot = await db.collection('appointments')
            .where('userId', '==', user.uid)
            .get() 
            .catch(error => {
                console.error("Error fetching session data:", error);
                return { docs: [] };
            });
            
        const sessionsCount = sessionSnapshot.docs.length;
        
        // --- CALCULATION ---
        
        // A. Day Streak Calculation
        const streak = calculateDayStreak(moodEntries);
        
        // B. Mood Score Calculation (Average of last 7 mood entries)
        const moodScore = calculateMoodScore(moodEntries);
        
        // --- UPDATE UI ---
        document.getElementById('dayStreakValue').textContent = streak;
        document.getElementById('moodScoreValue').textContent = `${moodScore}%`;
        document.getElementById('sessionsValue').textContent = sessionsCount;

        // Update the weekly mood progress bar in the progress card
        const moodProgressFill = document.querySelector('.progress-item:nth-child(1) .progress-fill');
        const moodProgressValue = document.querySelector('.progress-item:nth-child(1) .progress-value');
        if (moodProgressFill) {
             // Use min(streak, 7) for the percentage bar
             const progressPercent = Math.min(streak / 7, 1) * 100;
             moodProgressFill.style.width = `${progressPercent}%`;
        }
        if (moodProgressValue) {
            moodProgressValue.textContent = `${Math.min(streak, 7)}/7 days`;
        }
    }
    
    function calculateDayStreak(moodEntries) {
        if (moodEntries.length === 0) return 0;

        // Map entries to unique, comparable date strings (YYYY-MM-DD)
        const uniqueDates = new Set(moodEntries.map(entry => {
            const date = entry.timestamp ? entry.timestamp.toDate() : new Date();
            return date.toISOString().split('T')[0];
        }));

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if there is an entry today or yesterday
        const todayStr = currentDate.toISOString().split('T')[0];
        
        // If there's an entry for today, start checking from today. Otherwise, check from yesterday.
        if (uniqueDates.has(todayStr)) {
            streak++;
        }
        
        // Always start checking from yesterday for the rest of the streak
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Loop backwards until a day is missed
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];

            if (uniqueDates.has(dateStr)) {
                streak++;
            } else {
                break;
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }

    function calculateMoodScore(moodEntries) {
        if (moodEntries.length === 0) return 0;
        
        // Take the latest 7 entries or all if less than 7
        const recentEntries = moodEntries.slice(0, MOOD_HISTORY_LIMIT);
        
        const totalMoodValue = recentEntries.reduce((sum, entry) => {
            const moodValue = MOOD_MAP[entry.mood] || 3;
            return sum + moodValue;
        }, 0);
        
        const averageMood = totalMoodValue / recentEntries.length;
        
        // Scale 1-5 average to 0-100% score (where 5 is 100% and 1 is 20%)
        const score = Math.round((averageMood / 5) * 100);
        
        return Math.min(score, 100); 
    }
    
    // --- MODIFIED EXISTING FUNCTION ---
    function initializeDashboard() {
        // Check if user is logged in or in guest mode (Now handled mostly by auth.onAuthStateChanged)
        const hasSeenAffirmation = sessionStorage.getItem('hasSeenAffirmation');
        if (!hasSeenAffirmation) {
            setTimeout(() => {
                showAffirmation();
            }, 1000); // Show after 1 second delay
        }
    }

    // --- NEW HELPER FOR GREETING (Original helper from dashboard.html JS) ---
    function updateGreeting(name) {
        const greetingText = document.querySelector('.greeting-text');
        const greetingEmoji = document.querySelector('.greeting-emoji');
        const hour = new Date().getHours();
        
        let greeting, emoji, finalName;
        
        if (name === 'Guest' || name === 'Anonymous') {
             finalName = 'Guest';
        } else {
             finalName = name;
        }
        
        if (hour < 12) {
            greeting = `Good morning, ${finalName}! `;
            emoji = '🌅';
        } else if (hour < 17) {
            greeting = `Good afternoon, ${finalName}! `;
            emoji = '☀️';
        } else {
            greeting = `Good evening, ${finalName}! `;
            emoji = '🌙';
        }
        
        if (greetingText) greetingText.textContent = greeting;
        if (greetingEmoji) greetingEmoji.textContent = emoji;
    }
    
    // --- RETAINED ORIGINAL DASHBOARD.JS FUNCTIONS ---
    
    function initializeMoodTracker() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(button => {
            button.addEventListener('click', function() {
                moodButtons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                showAlert('Mood recorded! Redirecting to detailed tracker.', 'success');
                // The original HTML button redirects to mood-tracker.html
                setTimeout(() => {
                    window.location.href = 'mood-tracker.html';
                }, 500); 
            });
        });
    }
    
    function initializeInstantRelief() {
        const reliefButtons = document.querySelectorAll('.relief-btn');
        reliefButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.querySelector('span').textContent.toLowerCase();
                switch(action) {
                    case 'breathing':
                        window.location.href = 'breathing-exercises.html';
                        break;
                    case 'calming sound':
                        window.location.href = 'sounds.html';
                        break;
                    case 'affirmation':
                        showAffirmation();
                        break;
                    case 'sos support': // This refers to the hardcoded SOS button that uses showSOSOptions
                        showSOSOptions();
                        break;
                }
            });
        });
    }
    
    function initializeQuickAccess() {
        const quickItems = document.querySelectorAll('.quick-actions-grid .action-btn');
        quickItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Actions are handled by HTML onclick, this is for other elements
            });
        });
    }
    
    function loadTodaysPlan() {
        const planList = document.querySelector('.plan-list');
        if (!planList) return;
        
        const currentHour = new Date().getHours();
        let activities = [];
        
        // Generate activities based on time of day
        if (currentHour < 12) {
            activities = [
                { time: '9:00 AM', title: 'Morning Meditation', description: '5-minute mindfulness session', completed: true },
                { time: '10:30 AM', title: 'Study Break', description: '10-minute breathing exercise', completed: false }
            ];
        } else if (currentHour < 18) {
            activities = [
                { time: '2:00 PM', title: 'Afternoon Check-in', description: 'Quick mood assessment', completed: false },
                { time: '4:00 PM', title: 'Physical Activity', description: '15-minute walk or stretch', completed: false }
            ];
        } else {
            activities = [
                { time: '8:00 PM', title: 'Evening Reflection', description: 'Journal your thoughts', completed: false },
                { time: '9:30 PM', title: 'Wind Down', description: 'Listen to calming sounds', completed: false }
            ];
        }
        
        planList.innerHTML = activities.map(activity => `
            <div class="plan-item ${activity.completed ? 'completed' : 'current'}">
                <div class="plan-time">${activity.time}</div>
                <div class="plan-content">
                    <h4>${activity.title} ${activity.completed ? '✓' : ''}</h4>
                    <p>${activity.description}</p>
                </div>
                ${activity.completed ? '<div class="plan-status completed">Complete</div>' : '<button class="btn btn-accent btn-small plan-btn" onclick="startActivity(\'' + activity.title + '\')">Start Now</button>'}
            </div>
        `).join('');
    }
    
    function loadRecommendedContent() {
        const articlesGrid = document.querySelector('.resources-grid');
        if (!articlesGrid) return;
        
        const recommendations = [
            {
                title: 'Managing Academic Stress',
                description: 'Evidence-based techniques to stay calm during exams',
                type: 'Article',
                duration: '🕰️ 8 min read',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Guided Sleep Meditation',
                description: 'Professional guided meditation for better sleep',
                type: 'Meditation',
                duration: '🎧 15 min audio',
                image: 'https://images.unsplash.com/photo-1540206458725-e34be856c28a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
            },
            {
                title: 'Building Healthy Relationships',
                description: 'Tips for meaningful connections and communication',
                type: 'Video',
                duration: '🎥 12 min watch',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
            }
        ];
        
        // This targets the specific resources-grid inside the last card in dashboard.html
        const resourcesCardGrid = document.querySelector('.resources-card .resources-grid');
        if (resourcesCardGrid) {
            resourcesCardGrid.innerHTML = recommendations.map(item => `
                <div class="resource-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="resource-content">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        <div class="resource-meta">
                            <span class="duration">${item.duration}</span>
                            <span class="type">${item.type}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    function initializeBottomNavigation() {
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // The actual logic is in auth-guard.js, this just ensures the link works
            });
        });
    }
    
    function initializeModal() {
        const modal = document.getElementById('affirmationModal');
        if (modal) {
             // Close modal when clicking the X button
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', window.closeAffirmation);
            }
            
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    window.closeAffirmation();
                }
            });
        }
    }
    
    // --- Global functions (made global for HTML access) ---
    window.startActivity = function(activityName) {
        showAlert(`Starting ${activityName}...`, 'success');
        
        // Navigate to appropriate page based on activity
        switch(activityName) {
            case 'Morning Meditation':
            case 'Study Break':
            case 'Afternoon Check-in':
                window.location.href = 'breathing-exercises.html';
                break;
            case 'Physical Activity':
                showAlert('Great! Take a walk or do some stretching.', 'info');
                break;
            case 'Evening Reflection':
                showAlert('Time for reflection! Consider journaling your thoughts.', 'info');
                break;
            case 'Wind Down':
                window.location.href = 'sounds.html';
                break;
        }
    };
    
    window.showAffirmation = function() {
        const hasSeenAffirmation = sessionStorage.getItem('hasSeenAffirmation');
        
        if (hasSeenAffirmation === 'true') {
            showAlert('You\'ve already seen today\'s affirmation! Check back tomorrow for a new one.', 'info');
            return;
        }
        
        const affirmations = [
            "You are capable, resilient, and worthy of happiness. Take one step at a time.",
            "Your mental health matters, and it's okay to not be okay sometimes.",
            "You have overcome challenges before, and you will overcome this one too.",
            "Progress, not perfection. Every small step counts.",
            "You are stronger than you think and braver than you believe.",
            "It's okay to take breaks and prioritize your well-being.",
            "You deserve compassion, especially from yourself.",
            "This feeling is temporary, and you have the strength to get through it."
        ];
        
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        
        // Use the existing modal in HTML
        const modal = document.getElementById('affirmationModal');
        const affirmationText = document.getElementById('affirmationText');
        
        if (modal && affirmationText) {
            affirmationText.textContent = randomAffirmation;
            modal.style.display = 'flex';
            
            // Mark affirmation as shown in this session
            sessionStorage.setItem('hasSeenAffirmation', 'true');
        } else {
            // Fallback to dynamic modal
            showModal('Today\'s Positive Affirmation', randomAffirmation, [
                { text: 'Got it!', action: 'close' }
            ]);
            
            // Mark affirmation as shown in this session
            sessionStorage.setItem('hasSeenAffirmation', 'true');
        }
    };
    
    window.closeAffirmation = function() {
        const modal = document.getElementById('affirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    window.showSOSOptions = function() {
        showModal('Emergency Support', 'If you\'re in immediate danger or having thoughts of self-harm, please reach out for help immediately.', [
            { text: 'Call Helpline', action: 'helpline' },
            { text: 'Chat with AI', action: 'chatbot' },
            { text: 'Book Counsellor', action: 'booking' },
            { text: 'Close', action: 'close' }
        ]);
    };
    
    // Helper functions
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
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
    
    function showModal(title, content, buttons) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex'; // Use flex for centering
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.closest('.modal').style.display='none'">&times;</span>
                <h3>${title}</h3>
                <p>${content}</p>
                <div class="modal-buttons">
                    ${buttons.map(btn => `<button class="btn btn-primary" data-action="${btn.action}">${btn.text}</button>`).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Button actions
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                
                switch(action) {
                    case 'close':
                        modal.style.display = 'none';
                        break;
                    case 'helpline':
                        alert('Calling National Helpline: 1800-599-0019');
                        modal.style.display = 'none';
                        break;
                    case 'chatbot':
                        window.location.href = 'chatbot.html';
                        break;
                    case 'booking':
                        window.location.href = 'booking.html';
                        break;
                }
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});