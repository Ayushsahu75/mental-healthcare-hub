// sounds.js - Calming sounds page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sounds page loaded successfully');

    let sleepTimerTimeout = null;
    let timerEndTime = null;
    let timerInterval = null;

    // Map to hold all embedded HTMLAudioElement objects from the grid
    const audioElements = {};
    
    // Define all sound details
    const soundData = {
        'ocean': { title: 'Ocean Waves', icon: '🌊', src: 'ocean-waves.mp3' },
        'rain': { title: 'Rain', icon: '🌧️', src: 'rain.mp3' },
        'forest': { title: 'Forest', icon: '🌲', src: 'forest.mp3' },
        'fire': { title: 'Fireplace', icon: '🔥', src: 'fireplace.mp3' },
        'ambient': { title: 'Ambient Music', icon: '🎵', src: 'ambient-music.mp3' },
        'piano': { title: 'Piano', icon: '🎼', src: 'piano.mp3' },
        'singing-bowl': { title: 'Singing Bowl', icon: '🕉️', src: 'singing-bowl.mp3' },
        'bell': { title: 'Meditation Bell', icon: '🧘', src: 'meditation-bell.mp3' }
    };

    // --- Core Initialization ---

    initializeAudioMapping();
    initializeSoundSelection();
    initializeVolumeControls();
    initializeTimerControls();
    initializeCategoryTabs();
    initializeSoundMixer(); // Initialize mixer UI functions

    /** Creates a mapping of soundId to the actual HTMLAudioElement. */
    function initializeAudioMapping() {
        document.querySelectorAll('audio').forEach(audio => {
            const id = audio.id.replace('audio-', '');
            audioElements[id] = audio;
            // Ensure volume is initially set to 0.0 (slider default is 0/100)
            audio.volume = 0;
        });
    }

    // --- Helper Functions ---

    /** Gets the <audio> element from the map by sound ID. */
    function getAudioElement(soundId) {
        return audioElements[soundId];
    }

    /** Updates the floating player based on active grid sounds. */
    function updateFloatingPlayer() {
        // Collect all audio elements currently playing
        const playingSounds = Object.entries(audioElements)
            .filter(([id, audio]) => !audio.paused && audio.volume > 0);

        const floatingPlayer = document.getElementById('floatingPlayer');
        const playerTitle = document.getElementById('playerTitle');
        const playerIcon = document.getElementById('playerIcon');
        const playerPlayBtn = document.getElementById('playerPlayBtn');

        if (playingSounds.length > 0) {
            floatingPlayer.style.display = 'flex';
            
            // Determine display text and icon
            if (playingSounds.length > 1) {
                playerTitle.textContent = `Mix Active (${playingSounds.length})`;
                playerIcon.textContent = '🎧';
            } else {
                const [soundId, ] = playingSounds[0];
                playerTitle.textContent = soundData[soundId] ? soundData[soundId].title : 'Sound Playing';
                playerIcon.textContent = soundData[soundId] ? soundData[soundId].icon : '🎵';
            }
            
            // Check if ANY active sound is paused
            const isAnyPaused = playingSounds.some(([, audio]) => audio.paused);
            
            if (playerPlayBtn) {
                playerPlayBtn.textContent = isAnyPaused ? '▶️' : '⏸️';
            }
            
        } else {
            floatingPlayer.style.display = 'none';
        }
        
        // Ensure timer display is correct
        updateTimerDisplay();
    }

    // --- Single Sound Playback Logic (Refined) ---

    function initializeSoundSelection() {
        // Event listener for all play/pause buttons in the sound grid
        document.querySelectorAll('.sound-item .play-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const soundId = this.dataset.sound;
                toggleSoundPlayback(soundId);
            });
        });
    }

    function toggleSoundPlayback(soundId) {
        const audio = getAudioElement(soundId);
        const card = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
        const button = document.querySelector(`.play-btn[data-sound="${soundId}"]`);
        const slider = document.querySelector(`.volume-slider[data-sound="${soundId}"]`);
        
        if (!audio || !card || !button || !slider) return;

        if (audio.paused || audio.volume === 0) {
            // Start playback
            
            // Set default volume if starting from 0 (using the slider's 0-100 scale)
            if (audio.volume === 0) {
                const defaultVolume = 50;
                audio.volume = defaultVolume / 100; 
                slider.value = defaultVolume;
            }

            // Attempt playback
            audio.play().catch(error => {
                // Gracefully ignore browser autoplay restriction error
                console.error("Playback prevented by browser:", error);
            });
            
            card.classList.add('active');
            button.textContent = '⏸️';
        } else {
            // Pause playback
            audio.pause();
            card.classList.remove('active');
            button.textContent = '▶️';
        }
        updateFloatingPlayer();
    }

    function initializeVolumeControls() {
        // Event listener for all volume sliders in the sound grid
        document.querySelectorAll('.sound-item .volume-slider').forEach(slider => {
            slider.addEventListener('input', function() {
                const soundId = this.dataset.sound;
                const audio = getAudioElement(soundId);
                const card = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
                const button = document.querySelector(`.play-btn[data-sound="${soundId}"]`);

                if (!audio || !card || !button) return;
                
                // FIX: Convert 0-100 slider value to 0.0-1.0 audio volume
                const newVolume = parseFloat(this.value) / 100;
                audio.volume = newVolume;

                if (newVolume > 0 && audio.paused) {
                    // Start playing if volume is raised from 0 
                    audio.play().catch(e => console.error("Volume-initiated playback failed:", e));
                    card.classList.add('active');
                    button.textContent = '⏸️';
                } else if (newVolume === 0 && !audio.paused) {
                    // Pause playing if volume is set to 0
                    audio.pause();
                    card.classList.remove('active');
                    button.textContent = '▶️';
                } else if (newVolume > 0 && !audio.paused) {
                    // Keep active class and pause button visible if volume is adjusted while playing
                    card.classList.add('active');
                    button.textContent = '⏸️';
                }
                updateFloatingPlayer();
            });
        });
    }
    
    // --- Combined Playback Control (Global Functions) ---
    
    window.stopAllSounds = function() {
        // Stop all grid sounds and reset their UI
        Object.keys(audioElements).forEach(soundId => {
            const audio = getAudioElement(soundId);
            const card = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
            const button = document.querySelector(`.play-btn[data-sound="${soundId}"]`);
            const slider = document.querySelector(`.volume-slider[data-sound="${soundId}"]`);

            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0; // Explicitly set volume to 0
            }
            if (card) card.classList.remove('active');
            if (button) button.textContent = '▶️';
            if (slider) slider.value = 0;
            
            // Sync mixer UI if it's open
            const mixerSlider = document.querySelector(`.mixer-slider[data-sound="${soundId}"]`);
            if(mixerSlider) {
                mixerSlider.value = 0;
                mixerSlider.nextElementSibling.textContent = '0%';
            }
        });
        
        // Clear timer
        clearTimeout(sleepTimerTimeout);
        clearInterval(timerInterval);
        timerEndTime = null;
        document.getElementById('playerTimer').textContent = 'No Timer';
        
        // Reset timer button UI
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.timer-btn[data-minutes="0"]').classList.add('active');

        // Update UI
        updateFloatingPlayer();
        showAlert('All sounds stopped', 'info');
    };
    
    window.toggleAllPlayback = function() {
        // Check state by finding any playing sound
        const isCurrentlyPlaying = Object.values(audioElements).some(audio => !audio.paused && audio.volume > 0);

        Object.keys(audioElements).forEach(soundId => {
            const audio = getAudioElement(soundId);
            const card = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
            const button = document.querySelector(`.play-btn[data-sound="${soundId}"]`);
            
            if (audio.volume > 0) { // Only toggle sounds that have volume set
                if (isCurrentlyPlaying) {
                    // Pause all playing sounds
                    audio.pause();
                    if (card) card.classList.remove('active');
                    if (button) button.textContent = '▶️';
                } else {
                    // Play all sounds with volume > 0
                    audio.play().catch(e => console.error("Playback error during mass toggle:", e)); 
                    if (card) card.classList.add('active');
                    if (button) button.textContent = '⏸️';
                }
            }
        });
        
        updateFloatingPlayer();
    };

    // --- Timer Logic (Unchanged and Correct) ---
    
    function initializeTimerControls() {
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const minutes = parseInt(this.dataset.minutes);
                setSleepTimer(minutes);
            });
        });
        document.querySelector('.timer-btn[data-minutes="0"]').classList.add('active');
    }
    
    function setSleepTimer(minutes) {
        clearTimeout(sleepTimerTimeout);
        clearInterval(timerInterval);
        timerInterval = null;
        timerEndTime = null;

        if (minutes > 0) {
            const durationMilliseconds = minutes * 60 * 1000;
            timerEndTime = Date.now() + durationMilliseconds;
            
            showAlert(`Sleep timer set for ${minutes} minutes`, 'info');
            
            sleepTimerTimeout = setTimeout(() => {
                window.stopAllSounds();
                showAlert('Sleep timer finished. All sounds paused.', 'info');
            }, durationMilliseconds);

            timerInterval = setInterval(updateTimerDisplay, 1000);
        } else {
            showAlert('Sleep timer disabled', 'info');
        }
        updateFloatingPlayer();
    }
    
    function updateTimerDisplay() {
        const playerTimer = document.getElementById('playerTimer');
        if (!playerTimer) return;
        
        if (!timerEndTime) {
            playerTimer.textContent = 'No Timer';
            return;
        }

        const remainingMs = timerEndTime - Date.now();
        
        if (remainingMs <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            playerTimer.textContent = 'Timer Done';
            return;
        }

        const totalSeconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        playerTimer.textContent = display;
    }

    // --- Categories Tab Logic (Unchanged and Correct) ---

    function initializeCategoryTabs() {
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const targetCategory = this.dataset.category;
                document.querySelectorAll('.sound-category').forEach(cat => {
                    if (cat.id === targetCategory) {
                        cat.style.display = 'grid';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Sound Mixer Logic (Simplified and Centralized) ---

    function initializeSoundMixer() {
        window.showMixer = function() {
            const modal = document.getElementById('soundMixerModal');
            if (modal) {
                modal.style.display = 'block';
                initializeMixerControls(); // Re-render and sync controls every time
            }
        };
        
        window.closeMixer = function() {
            document.getElementById('soundMixerModal').style.display = 'none';
        };
        
        window.onclick = function(event) {
            const modal = document.getElementById('soundMixerModal');
            if (event.target == modal) {
                window.closeMixer();
            }
        }
    }
    
    /**
     * FIX & SIMPLIFICATION: Enforces the constraint that the sum of all mixer slider values must be 1.0 (100%).
     * Redistributes the excess or deficit proportionally across other sliders.
     * @param {HTMLElement} changedSlider The slider that was just moved.
     */
    function adjustMixerSlidersFor100Percent(changedSlider) {
        const targetTotal = 1.0;
        let changedValue = parseFloat(changedSlider.value);
        const changedSoundId = changedSlider.dataset.sound;
        
        const allSliders = Array.from(document.querySelectorAll('.mixer-slider'));
        const otherSliders = allSliders.filter(s => s !== changedSlider);

        // 1. Calculate the current volume sum of *other* active sliders
        let otherActiveTotal = 0;
        otherSliders.forEach(slider => {
            if (parseFloat(slider.value) > 0) {
                otherActiveTotal += parseFloat(slider.value);
            }
        });

        const remainingTarget = targetTotal - changedValue;
        
        if (remainingTarget < 0) {
            // Case 1: Changed slider exceeded 100% total, clamp it and set others to 0.
            changedSlider.value = targetTotal;
            changedValue = targetTotal;
            
            otherSliders.forEach(slider => {
                slider.value = 0;
                syncSliderToAudio(slider, 0);
            });
        } else if (otherActiveTotal > 0) {
            // Case 2: Proportional reduction/increase of other active sliders.
            otherSliders.forEach(slider => {
                const currentValue = parseFloat(slider.value);
                
                if (currentValue > 0) {
                    // Proportional calculation: (current weight / total of others) * remaining target
                    let newValue = (currentValue / otherActiveTotal) * remainingTarget;
                    
                    // Round to 2 decimal places (0.01 step)
                    newValue = Math.round(newValue * 100) / 100;
                    
                    slider.value = newValue;
                    syncSliderToAudio(slider, newValue);
                }
            });
        } else if (changedValue < 1.0) {
             // Case 3: Only the changed slider is non-zero, and it's less than 1.0. Nothing else to adjust.
             // Do nothing to other sliders, but still sync the current one.
        }
        
        // 2. Sync the changed slider's audio
        syncSliderToAudio(changedSlider, changedValue);

        // 3. Final Total Recalculation and Display
        let finalTotal = allSliders.reduce((sum, s) => sum + parseFloat(s.value), 0);
        finalTotal = Math.round(finalTotal * 100) / 100; // Final rounding check

        const totalVolumeDisplay = document.getElementById('mixer-total-percentage');
        if (totalVolumeDisplay) {
            totalVolumeDisplay.textContent = `${Math.round(finalTotal * 100)}%`;
        }

        updateFloatingPlayer();
    }
    
    /** Syncs a mixer slider's value to its corresponding audio element and main grid UI. */
    function syncSliderToAudio(slider, volume) {
        const soundId = slider.dataset.sound;
        const audio = getAudioElement(soundId);
        const card = document.querySelector(`.sound-card[data-sound-id="${soundId}"]`);
        const playBtn = document.querySelector(`.play-btn[data-sound="${soundId}"]`);
        const mainSlider = document.querySelector(`.volume-slider[data-sound="${soundId}"]`);
        const volumeDisplay = slider.nextElementSibling;

        if (!audio) return;

        audio.volume = volume;
        volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
        
        // Sync main grid UI
        if (mainSlider) {
            mainSlider.value = volume * 100;
        }

        // Sync playback and active state
        if (volume > 0) {
            if (audio.paused) {
                audio.play().catch(e => console.error("Mixer sync playback failed:", e));
            }
            if (card && playBtn) {
                card.classList.add('active');
                playBtn.textContent = '⏸️';
            }
        } else {
            audio.pause();
            if (card && playBtn) {
                card.classList.remove('active');
                playBtn.textContent = '▶️';
            }
        }
    }


    function initializeMixerControls() {
        const mixerGrid = document.querySelector('.mixer-grid');
        if (!mixerGrid) return;

        // Load saved mix or use default
        const savedMix = JSON.parse(localStorage.getItem('savedMix') || '{}');
        // Mixer sound IDs are now implicitly the remaining sounds after noise is removed from soundData
        const mixerSoundIds = Object.keys(soundData).filter(id => id !== 'piano' && id !== 'singing-bowl' && id !== 'bell');
        
        // Use the volume from the grid if the sound is currently playing there, otherwise use saved/default mix
        let initialMix = {};
        let initialTotal = 0;
        
        mixerSoundIds.forEach(id => {
            const audio = getAudioElement(id);
            // Use current audio volume (converted from 0.0-1.0 to 0-100) if it's playing
            if (audio && audio.volume > 0) {
                initialMix[id] = audio.volume;
            } else if (savedMix[id]) {
                initialMix[id] = savedMix[id];
            } else {
                // Default to 0 if not playing and not saved
                initialMix[id] = 0;
            }
            initialTotal += initialMix[id];
        });

        // If the total volume is less than 1% and we have a default mix, use the default proportional mix.
        if (initialTotal < 0.01) {
             const defaultMixProportional = {
                'ocean': 0.20, 'rain': 0.20, 'forest': 0.20, 
                'fire': 0.20, 'ambient': 0.20
            };
            initialMix = defaultMixProportional;
            initialTotal = 1.0;
        }


        // Clear existing content
        mixerGrid.innerHTML = '';


        mixerSoundIds.forEach(soundId => {
            const sound = soundData[soundId];
            const initialVolume = initialMix[soundId] || 0; 

            const mixerItem = document.createElement('div');
            mixerItem.className = 'mixer-item';
            mixerItem.innerHTML = `
                <label>${sound.icon} ${sound.title}</label>
                <input type="range" class="mixer-slider" min="0" max="1" value="${initialVolume}" step="0.01" data-sound="${soundId}">
                <span class="volume-display">${Math.round(initialVolume * 100)}%</span>
            `;
            mixerGrid.appendChild(mixerItem);
        });
        
        // Append the total display
        const totalVolumeDisplay = document.createElement('span');
        totalVolumeDisplay.id = 'mixer-total-percentage';

        const totalDisplayDiv = document.createElement('div');
        totalDisplayDiv.className = 'total-display mixer-item';
        totalDisplayDiv.innerHTML = '<label>Total Percentage:</label>';
        totalDisplayDiv.appendChild(totalVolumeDisplay);
        mixerGrid.appendChild(totalDisplayDiv);


        // Add event listeners to sliders
        const sliders = mixerGrid.querySelectorAll('.mixer-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', function() {
                // Call the 100% enforcement function
                adjustMixerSlidersFor100Percent(this); 
            });
        });
        
        // Run initial adjustment to correct any rounding errors in saved/default mix
        // Use the first slider as the trigger, the actual value will be preserved.
        if (sliders.length > 0) {
            adjustMixerSlidersFor100Percent(sliders[0]);
        }
    }
    
    // Global functions (needed if called directly from HTML)
    window.playMix = function() {
        // Since the mixers sliders already adjust the audio on 'input', 
        // clicking 'Play Mix' just closes the modal and confirms the state.
        showAlert('Sound mix started!', 'success');
        window.closeMixer();
    };

    window.saveMix = function() {
        const mixerSliders = document.querySelectorAll('.mixer-slider');
        const mixData = {};
        
        mixerSliders.forEach(slider => {
            mixData[slider.dataset.sound] = parseFloat(slider.value);
        });
        
        localStorage.setItem('savedMix', JSON.stringify(mixData));
        showAlert('Sound mix saved!', 'success');
        window.closeMixer();
    };
    
    // --- Alert Function (Unchanged and Correct) ---

    function showAlert(message, type) {
        // ... (The showAlert function remains the same)
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // CSS styles for alert
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
    
    // Add CSS animations and styles (Unchanged and Correct)
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
        .floating-player {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 100;
        }
        .mixer-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .mixer-item label {
            min-width: 120px;
            font-weight: 500;
        }
        .mixer-slider {
            flex: 1;
        }
        .volume-display {
            min-width: 40px;
            text-align: center;
            font-size: 0.9rem;
            color: #64748b;
        }
        .total-display {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 1.1rem;
            font-weight: 600;
        }
        .sound-card.active {
            border: 2px solid #a052ff;
            background-color: #f0e6ff;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 101; 
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto; 
            background-color: rgba(0,0,0,0.4); 
        }
        .modal-content {
            background-color: #fefefe;
            margin: 10% auto; 
            padding: 20px;
            border-radius: 12px;
            width: 80%; 
            max-width: 500px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            position: relative;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

});