// wearable-stats.js - Health dashboard page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Wearable stats page loaded successfully');
    
    let wearableData = {};
    let charts = {};
    
    // Initialize wearable stats
    initializeStats();
    initializeCharts();
    loadSampleData();
    
    function initializeStats() {
        // Initialize date selector
        const dateBtns = document.querySelectorAll('.date-btn');
        dateBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const direction = this.textContent.includes('←') ? -1 : 1;
                changeDate(direction);
            });
        });
        
        // Initialize sync button
        const syncBtn = document.getElementById('syncDeviceBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', syncDevice);
        }
    }
    
    function initializeCharts() {
        // Initialize Chart.js if available
        if (typeof Chart !== 'undefined') {
            initializeHeartRateChart();
            initializeSleepChart();
        }
    }
    
    function loadSampleData() {
        wearableData = {
            heartRate: {
                current: 72,
                average: 75,
                min: 65,
                max: 85,
                trend: 'stable',
                history: [70, 72, 75, 73, 71, 74, 72]
            },
            sleep: {
                duration: 7.5,
                deep: 2.2,
                light: 4.1,
                rem: 1.2,
                quality: 78,
                trend: 'improving',
                history: [6.5, 7.0, 7.2, 7.8, 7.5, 7.3, 7.5]
            },
            steps: {
                current: 8247,
                goal: 10000,
                trend: 'increasing',
                history: [6500, 7200, 8100, 8900, 8500, 9200, 8247]
            },
            stress: {
                level: 65,
                trend: 'decreasing',
                history: [75, 70, 68, 72, 65, 60, 65]
            }
        };
        
        updateStatsDisplay();
    }
    
    function updateStatsDisplay() {
        // Update heart rate
        updateMetricCard('heart-rate', {
            value: wearableData.heartRate.current,
            unit: 'BPM',
            status: getStatusFromTrend(wearableData.heartRate.trend),
            trend: wearableData.heartRate.trend
        });
        
        // Update sleep
        updateMetricCard('sleep', {
            value: wearableData.sleep.duration,
            unit: 'hours',
            status: getStatusFromTrend(wearableData.sleep.trend),
            trend: wearableData.sleep.trend
        });
        
        // Update steps
        updateMetricCard('steps', {
            value: wearableData.steps.current.toLocaleString(),
            unit: 'steps',
            status: wearableData.steps.current >= wearableData.steps.goal ? 'good' : 'warning',
            trend: wearableData.steps.trend
        });
        
        // Update stress
        updateMetricCard('stress', {
            value: wearableData.stress.level,
            unit: '%',
            status: getStatusFromTrend(wearableData.stress.trend),
            trend: wearableData.stress.trend
        });
    }
    
    function updateMetricCard(type, data) {
        const card = document.querySelector(`.${type}`);
        if (!card) return;
        
        const valueElement = card.querySelector('.metric-value');
        const unitElement = card.querySelector('.metric-unit');
        const statusElement = card.querySelector('.metric-status');
        
        if (valueElement) valueElement.textContent = data.value;
        if (unitElement) unitElement.textContent = data.unit;
        if (statusElement) {
            statusElement.textContent = data.status;
            statusElement.className = `metric-status ${data.status}`;
        }
    }
    
    function getStatusFromTrend(trend) {
        switch(trend) {
            case 'improving':
            case 'increasing':
                return 'good';
            case 'stable':
                return 'normal';
            case 'decreasing':
            case 'declining':
                return 'warning';
            default:
                return 'normal';
        }
    }
    
    function initializeHeartRateChart() {
        const ctx = document.getElementById('heartRateChart');
        if (!ctx) return;
        
        charts.heartRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Heart Rate (BPM)',
                    data: wearableData.heartRate.history,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 60,
                        max: 100
                    }
                }
            }
        });
    }
    
    function initializeSleepChart() {
        const ctx = document.getElementById('sleepChart');
        if (!ctx) return;
        
        charts.sleep = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sleep Duration (hours)',
                    data: wearableData.sleep.history,
                    backgroundColor: '#7C3AED',
                    borderColor: '#7C3AED',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
    
    // Global functions
    window.changeDate = function(direction) {
        const currentDateElement = document.getElementById('currentDate');
        if (!currentDateElement) return;
        
        const currentDate = new Date(currentDateElement.textContent);
        currentDate.setDate(currentDate.getDate() + direction);
        
        currentDateElement.textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Simulate loading new data
        showAlert('Loading data for selected date...', 'info');
        
        setTimeout(() => {
            // Update data based on new date
            updateDataForDate(currentDate);
            updateStatsDisplay();
            showAlert('Data updated successfully!', 'success');
        }, 1000);
    };
    
    window.syncDevice = function() {
        const syncBtn = document.getElementById('syncDeviceBtn');
        if (syncBtn) {
            syncBtn.disabled = true;
            syncBtn.textContent = 'Syncing...';
        }
        
        showAlert('Syncing with your wearable device...', 'info');
        
        setTimeout(() => {
            // Simulate new data after sync
            generateNewData();
            updateStatsDisplay();
            
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.textContent = 'Sync Device';
            }
            
            showAlert('Device synced successfully! Data updated.', 'success');
        }, 2000);
    };
    
    function updateDataForDate(date) {
        // Simulate different data for different dates
        const dayOfWeek = date.getDay();
        const variation = Math.sin(dayOfWeek) * 5;
        
        wearableData.heartRate.current = Math.round(72 + variation);
        wearableData.sleep.duration = Math.round((7.5 + variation * 0.1) * 10) / 10;
        wearableData.steps.current = Math.round(8247 + variation * 200);
        wearableData.stress.level = Math.round(65 + variation * 2);
    }
    
    function generateNewData() {
        // Generate realistic new data
        wearableData.heartRate.current = Math.round(70 + Math.random() * 20);
        wearableData.sleep.duration = Math.round((6 + Math.random() * 3) * 10) / 10;
        wearableData.steps.current = Math.round(5000 + Math.random() * 8000);
        wearableData.stress.level = Math.round(40 + Math.random() * 40);
        
        // Update history arrays
        wearableData.heartRate.history.shift();
        wearableData.heartRate.history.push(wearableData.heartRate.current);
        
        wearableData.sleep.history.shift();
        wearableData.sleep.history.push(wearableData.sleep.duration);
        
        wearableData.steps.history.shift();
        wearableData.steps.history.push(wearableData.steps.current);
        
        wearableData.stress.history.shift();
        wearableData.stress.history.push(wearableData.stress.level);
        
        // Update charts if they exist
        if (charts.heartRate) {
            charts.heartRate.data.datasets[0].data = wearableData.heartRate.history;
            charts.heartRate.update();
        }
        
        if (charts.sleep) {
            charts.sleep.data.datasets[0].data = wearableData.sleep.history;
            charts.sleep.update();
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
        .metric-status.good {
            color: #10b981;
        }
        .metric-status.warning {
            color: #f59e0b;
        }
        .metric-status.normal {
            color: #6b7280;
        }
        .overview-card {
            transition: transform 0.2s ease;
        }
        .overview-card:hover {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
});


