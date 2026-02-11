// history.js - Mood history display and analysis
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mood History page loaded successfully');

    let allMoodEntries = [];
    
    // Check for global 'auth' and 'db' object
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        showAlert('Firebase services not initialized. Please check firebase-init.js', 'error');
        return;
    }
    
    // Check Auth State on load and fetch data
    auth.onAuthStateChanged(user => {
        if (!user) {
            showAlert('Please log in to view your mood history.', 'error');
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            fetchMoodHistory(user.uid);
        }
    });

    const moodMap = {
        'joyful': 5, 'content': 4, 'neutral': 3, 
        'worried': 2, 'sad': 1, 'angry': 1, 
        'stressed': 2, 'lonely': 1
    };

    const moodEmojiMap = {
        'joyful': '😄', 'content': '😊', 'neutral': '😐', 
        'worried': '😟', 'sad': '😢', 'angry': '😠', 
        'stressed': '😰', 'lonely': '😔'
    };

    // --- Data Fetching ---
    async function fetchMoodHistory(userId) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const historyList = document.getElementById('moodHistoryList');
        const noHistory = document.getElementById('noHistory');
        
        loadingIndicator.textContent = "Fetching your data...";
        historyList.innerHTML = '';

        try {
            // Fetch mood data from Firestore for the current user, sorted by timestamp descending
            const snapshot = await db.collection('moods')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .get();

            allMoodEntries = snapshot.docs.map(doc => {
                const data = doc.data();
                data.id = doc.id;
                // Convert Firestore Timestamp object to JavaScript Date object
                data.date = data.timestamp ? data.timestamp.toDate() : new Date();
                data.formattedDate = data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                data.moodValue = moodMap[data.mood] || 3;
                return data;
            });
            
            loadingIndicator.style.display = 'none';

            if (allMoodEntries.length === 0) {
                noHistory.style.display = 'block';
                return;
            }

            renderMoodHistoryList(allMoodEntries);
            renderMoodTrendChart(allMoodEntries);

        } catch (error) {
            console.error("Error fetching mood history:", error);
            loadingIndicator.textContent = "Error loading history. Please try again.";
            showAlert('Could not load mood history from database.', 'error');
        }
    }
    
    // --- UI Rendering ---
    function renderMoodHistoryList(entries) {
        const historyList = document.getElementById('moodHistoryList');
        
        historyList.innerHTML = entries.map(entry => {
            const emoji = moodEmojiMap[entry.mood] || '❓';
            const intensity = entry.intensity || 'N/A';
            const concerns = entry.concerns && entry.concerns.length > 0 ? `<p><strong>Concerns:</strong> ${entry.concerns.join(', ')}</p>` : '';
            const activities = entry.activities && entry.activities.length > 0 ? `<p><strong>Activities:</strong> ${entry.activities.join(', ')}</p>` : '';
            const notes = entry.notes ? `<p class="italic-note">${entry.notes}</p>` : '';

            return `
                <div class="history-card">
                    <div class="history-header">
                        <div class="mood-summary">
                            <span class="mood-emoji">${emoji}</span>
                            <div class="mood-details">
                                <h4>${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)} <span class="intensity-score">(${intensity}/10)</span></h4>
                                <span class="timestamp">${entry.formattedDate}</span>
                            </div>
                        </div>
                        <button class="delete-btn" data-id="${entry.id}" onclick="deleteEntry('${entry.id}')">🗑️</button>
                    </div>
                    <div class="history-content">
                        ${concerns}
                        ${activities}
                        ${notes}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function renderMoodTrendChart(entries) {
        const ctx = document.getElementById('moodTrendChart');
        if (!ctx) return;
        
        // Sort entries chronologically for the chart
        const sortedEntries = [...entries].sort((a, b) => a.date - b.date);
        
        const labels = sortedEntries.map(entry => entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const data = sortedEntries.map(entry => entry.moodValue);

        // Map mood names to points for tooltip display
        const moodNames = sortedEntries.map(entry => entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1));
        
        if (Chart.getChart('moodTrendChart')) {
            Chart.getChart('moodTrendChart').destroy();
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Score (5=High, 1=Low)',
                    data: data,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                // Display Mood Name (e.g., Joyful (5))
                                return `${moodNames[context.dataIndex]} (${context.formattedValue}/5)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                if (value === 5) return 'Joyful (5)';
                                if (value === 4) return 'Content (4)';
                                if (value === 3) return 'Neutral (3)';
                                if (value === 2) return 'Worried (2)';
                                if (value === 1) return 'Sad/Angry (1)';
                                return null;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Mood Level'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    // --- Action Functions (Global) ---
    
    window.deleteEntry = async function(docId) {
        if (!confirm('Are you sure you want to delete this mood entry? This cannot be undone.')) {
            return;
        }

        try {
            await db.collection('moods').doc(docId).delete();
            showAlert('Mood entry deleted successfully.', 'success');
            // Re-fetch and re-render the list
            if (auth.currentUser) {
                 fetchMoodHistory(auth.currentUser.uid);
            }
        } catch (error) {
            console.error("Error removing document: ", error);
            showAlert('Error deleting entry. Please try again.', 'error');
        }
    };
    
    window.exportHistory = function() {
        if (allMoodEntries.length === 0) {
            showAlert('No history to export!', 'info');
            return;
        }
        
        let csv = "Timestamp,Mood,Intensity,Concerns,Activities,Notes\n";
        allMoodEntries.forEach(entry => {
            const timestamp = entry.date.toISOString();
            const mood = entry.mood;
            const intensity = entry.intensity;
            const concerns = entry.concerns ? entry.concerns.join('|') : '';
            const activities = entry.activities ? entry.activities.join('|') : '';
            const notes = entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '';
            
            csv += `${timestamp},${mood},${intensity},"${concerns}","${activities}",${notes}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "mood_history_export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Mood history exported to CSV!', 'success');
    };
    
    // --- Helper Functions ---
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
    
    // --- CSS for History Page (Local to this file for self-containment) ---
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
        
        .history-card {
            background: var(--gradient-card);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid var(--neutral-200);
            transition: all 0.3s ease;
        }
        
        .history-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(79, 70, 229, 0.1);
        }

        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.75rem;
        }
        
        .mood-summary {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .mood-emoji {
            font-size: 2.5rem;
            line-height: 1;
        }
        
        .mood-details h4 {
            margin: 0 0 0.25rem 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--neutral-900);
            text-transform: capitalize;
        }
        
        .intensity-score {
            font-size: 0.9rem;
            color: #4F46E5;
            font-weight: 700;
        }
        
        .timestamp {
            font-size: 0.85rem;
            color: var(--neutral-500);
        }

        .history-content p {
            margin: 0.5rem 0;
            font-size: 0.95rem;
            color: var(--neutral-700);
            line-height: 1.5;
        }

        .history-content strong {
            color: var(--neutral-800);
        }
        
        .history-content .italic-note {
             font-style: italic;
             color: var(--neutral-600);
             border-left: 3px solid #f1f5f9;
             padding-left: 10px;
        }
        
        .delete-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #ef4444;
            transition: transform 0.2s;
            padding: 8px;
            border-radius: 50%;
        }
        
        .delete-btn:hover {
            transform: scale(1.1);
            background: #fef2f2;
        }
        
        /* Chart specific style to ensure sizing works well */
        #moodTrendChart {
            max-height: 400px; 
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});