/**
 * UIController handles user interface elements and interactions
 */
class UIController {
    constructor(audioManager, animationController) {
        this.audioManager = audioManager;
        this.animationController = animationController;
        
        // UI elements
        this.startButton = document.getElementById('startMicrophone');
        this.settingsButton = document.getElementById('toggleSettings');
        this.closeSettingsButton = document.getElementById('closeSettings');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.volumeLevel = document.getElementById('volumeLevel');
        this.audioStatus = document.getElementById('audioStatus');
        this.micDetection = document.getElementById('micDetection');
        
        // Settings elements
        this.sensitivitySlider = document.getElementById('sensitivitySlider');
        this.thresholdLowSlider = document.getElementById('thresholdLow');
        this.thresholdHighSlider = document.getElementById('thresholdHigh');
        this.suddenThresholdSlider = document.getElementById('suddenThreshold');
        
        // Microphone detection timers
        this.loudIndicatorTimer = null;
        this.suddenIndicatorTimer = null;
        this.sustainedIndicatorTimer = null;
        
        // Animation state tracking
        this.fireworksActive = false;
        this.activeSustainedSounds = 0;
        
        // Initialize UI
        this.initializeEventListeners();
    }
    
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Debug the initialization of event listeners
        console.log('[UIController] Initializing event listeners...');
        console.log('[UIController] Setting button references:', {
            startButton: !!this.startButton,
            settingsButton: !!this.settingsButton,
            closeSettingsButton: !!this.closeSettingsButton
        });

        const audioStatus = document.getElementById('audioStatus');

        // Simple click handler for debugging
        // Define the settings button handler
        if (this.settingsButton) {
            console.log('[UIController] Setting up settings button handler');
            
            // Remove any existing handlers to prevent duplicates
            this.settingsButton.removeEventListener('click', this.handleSettingsClick);
            
            // Define the handler function
            this.handleSettingsClick = () => {
                console.log('[UIController] SETTINGS BUTTON CLICKED!');
                
                // Use the new settings panel with inline styles
                const newSettingsPanel = document.getElementById('newSettingsPanel');
                
                if (!newSettingsPanel) {
                    console.error('[UIController] Could not find newSettingsPanel!');
                    return;
                }
                
                // Get the current display state
                const currentDisplay = window.getComputedStyle(newSettingsPanel).display;
                const isVisible = currentDisplay !== 'none';
                
                console.log('[UIController] Panel visibility state:', {
                    isVisible,
                    currentDisplay
                });
                
                // Connect the sliders if not already done
                if (!this.slidersConnected) {
                    console.log('[UIController] Connecting sliders (first time)');
                    this.connectSettingSliders();
                    this.slidersConnected = true;
                } else {
                    // Update the new sliders with current values from AudioManager
                    this.updateNewSlidersFromAudioManager();
                }
                
                // Toggle the panel visibility
                if (isVisible) {
                    // Hide panel if it's already visible
                    console.log('[UIController] Settings panel is visible, hiding it');
                    newSettingsPanel.style.display = 'none';
                } else {
                    // Show panel
                    console.log('[UIController] Settings panel is hidden, showing it');
                    newSettingsPanel.style.display = 'block';
                    console.log('[UIController] New settings panel displayed');
                }
            };
            
            // Extract slider connection to a method
            this.connectSettingSliders = () => {
                console.log('[UIController] Connecting settings sliders...');
                const newSettingsPanel = document.getElementById('newSettingsPanel');
                const pairs = [
                    ['newSensitivitySlider', 'sensitivitySlider'],
                    ['newThresholdLow', 'thresholdLow'],
                    ['newThresholdHigh', 'thresholdHigh'],
                    ['newSuddenThreshold', 'suddenThreshold']
                ];
                
                pairs.forEach(([newId, oldId]) => {
                    const newSlider = document.getElementById(newId);
                    const oldSlider = document.getElementById(oldId);
                    
                    if (newSlider && oldSlider) {
                        console.log(`[UIController] Connecting slider pair: ${newId} ↔ ${oldId}`);
                        
                        // Copy initial value from old to new
                        newSlider.value = oldSlider.value;
                        
                        // Sync changes from new to old AND directly update settings
                        newSlider.addEventListener('input', () => {
                            oldSlider.value = newSlider.value;
                            
                            // Directly call updateAudioSettings
                            this.updateAudioSettings();
                            
                            console.log(`[UIController] New slider changed: ${newId} → ${oldSlider.value}`);
                        });
                        
                        // Also sync changes from old to new (if someone changes the hidden sliders)
                        oldSlider.addEventListener('input', () => {
                            newSlider.value = oldSlider.value;
                            console.log(`[UIController] Old slider changed: ${oldId} → ${newSlider.value}`);
                        });
                    } else {
                        console.error(`[UIController] Could not find one of the sliders: ${newId} or ${oldId}`);
                        if (!newSlider) console.error(`Missing new slider: ${newId}`);
                        if (!oldSlider) console.error(`Missing old slider: ${oldId}`);
                    }
                });
                
                // Connect close button directly
                const newCloseButton = document.getElementById('newCloseSettings');
                if (newCloseButton) {
                    // Remove any existing handlers first
                    newCloseButton.onclick = null;
                    
                    // Add direct click handler
                    newCloseButton.addEventListener('click', () => {
                        console.log('[UIController] CLOSE BUTTON CLICKED!');
                        
                        // Log current settings when closing panel
                        this.logCurrentSettings();
                        
                        const panel = document.getElementById('newSettingsPanel');
                        if (panel) {
                            panel.style.display = 'none';
                            console.log('[UIController] New settings panel closed by button');
                        } else {
                            console.error('[UIController] Could not find settings panel to close!');
                        }
                    });
                    
                    console.log('[UIController] Close button handler attached directly');
                } else {
                    console.error('[UIController] Could not find close settings button!');
                }
            };
            
            // Add the handler
            this.settingsButton.addEventListener('click', this.handleSettingsClick);
            console.log('[UIController] Settings button handler attached');
        } else {
            console.error('[UIController] Could not find settings button!');
        }

        this.startButton.addEventListener('click', () => {
            if (!this.startButton.classList.contains('active')) {
                // Start microphone
                this.startButton.classList.add('active');
                this.startButton.querySelector('.text').textContent = 'Stop';
                audioStatus.textContent = 'Audio status: active';
                audioStatus.className = 'active';
                this.startMicrophone();
            } else {
                // Stop microphone
                this.startButton.classList.remove('active');
                this.startButton.querySelector('.text').textContent = 'Start';
                audioStatus.textContent = 'Audio status: inactive';
                audioStatus.className = 'inactive';
                this.stopMicrophone();
            }
        });
        
        // Add a simple close settings button handler
        if (this.closeSettingsButton) {
            // Remove any existing handlers
            this.closeSettingsButton.removeEventListener('click', this.handleCloseSettings);
            
            // Add a simple handler
            this.handleCloseSettings = () => {
                console.log('[UIController] CLOSE SETTINGS BUTTON CLICKED!');
                const settingsPanel = document.getElementById('settingsPanel');
                
                // Force settings panel to be hidden
                console.log('[UIController] Forcing settings panel to hide');
                settingsPanel.style.display = 'none';
                settingsPanel.style.opacity = '0';
                settingsPanel.style.pointerEvents = 'none';
                settingsPanel.classList.add('hidden');
                
                // Add a visible notification for debugging
                const notification = document.createElement('div');
                notification.style.position = 'fixed';
                notification.style.bottom = '10px';
                notification.style.right = '10px';
                notification.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
                notification.style.color = 'white';
                notification.style.padding = '10px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '9999';
                notification.textContent = 'Settings panel closed!';
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            };
            
            // Add the handler
            this.closeSettingsButton.addEventListener('click', this.handleCloseSettings);
            console.log('[UIController] Close settings button handler attached');
        } else {
            console.error('[UIController] Could not find close settings button!');
        }
        
        // Remove the duplicate event listener for the settings button
        // We're already handling it with this.handleSettingsClick
        
        // Settings change events
        const debugSettingsChange = () => {
            console.log('[UIController] Settings changed!');
            this.updateAudioSettings();
        };
        
        if (this.sensitivitySlider) {
            this.sensitivitySlider.addEventListener('input', debugSettingsChange);
            console.log('[UIController] Sensitivity slider handler attached');
        }
        
        if (this.thresholdLowSlider) {
            this.thresholdLowSlider.addEventListener('input', debugSettingsChange);
            console.log('[UIController] Threshold low slider handler attached');
        }
        
        if (this.thresholdHighSlider) {
            this.thresholdHighSlider.addEventListener('input', debugSettingsChange);
            console.log('[UIController] Threshold high slider handler attached');
        }
        
        if (this.suddenThresholdSlider) {
            this.suddenThresholdSlider.addEventListener('input', debugSettingsChange);
            console.log('[UIController] Sudden threshold slider handler attached');
        }
    }
    
    /**
     * Start microphone and animation
     */
    async startMicrophone() {
        console.log('[UIController] Starting microphone...');
        console.log('[UIController] Current state before start:', {
            audioManagerExists: !!this.audioManager,
            animationControllerExists: !!this.animationController,
            microphoneActive: this.startButton.classList.contains('active'),
            fireworksActive: this.fireworksActive,
            activeSustainedSounds: this.activeSustainedSounds
        });
        
        try {
            // Initialize audio manager
            console.log('[UIController] Initializing audio manager...');
            const success = await this.audioManager.initialize();
        
        if (success) {
            console.log('[UIController] Audio manager initialized successfully');
            
            // Set up audio callbacks
            console.log('[UIController] Setting up audio callbacks...');
            this.audioManager.onVolumeChange((volume, category) => {
                this.updateVolumeUI(volume);
                
                // Only process audio for meaningful volume levels
                if (volume < this.audioManager.noiseFloor) {
                    // Volume too low, don't process audio events
                    return;
                }
                
                // For loud sounds, burst all fireworks if any exist
                if (category === 'loud') {
                    if (this.animationController.fireworks.length > 0) {
                        this.showLoudDetection(`LOUD sound detected, level: ${volume.toFixed(4)} - BURSTING ALL fireworks!`);
                    } else {
                        this.showLoudDetection(`LOUD sound detected, level: ${volume.toFixed(4)} - No fireworks to burst`);
                    }
                    this.animationController.applyVolume(volume, category);
                }
            });
            
            // We're no longer using sudden sounds to trigger animations
            this.audioManager.onSuddenSound((volume) => {
                // Log but don't trigger animation
                if (volume > 0.1) {
                    console.log(`Sudden sound detected (${volume.toFixed(4)}) - animation disabled`);
                }
            });
            
            this.audioManager.onSustainedSound((volume, duration) => {
                // Only respond to significant volume (greater than 0.1) and duration over 250ms
                if (volume < 0.1) return null;
                
                // Debug logging to help diagnose issues
                console.log('UIController: Sustained sound detected', {volume, duration});
                
                this.showSustainedDetection(`SUSTAINED sound detected, duration: ${duration} level: ${volume.toFixed(4)}`);
                
                // Launch a new firework and get its ID
                const fireworkId = this.animationController.applySustainedSound(volume, duration);
                
                // Only increment active count if we actually created a firework
                if (fireworkId) {
                    this.activeSustainedSounds++;
                    this.fireworksActive = true;
                    console.log('UIController: New firework launched, ID:', fireworkId);
                }
                
                return fireworkId;
            });
            
            this.audioManager.onSustainedSoundEnd((id) => {
                // Handle the end of a sustained sound
                console.log('UIController: Sustained sound ended, ID:', id);
                this.showSustainedDetection(`Sustained sound ended - firework falling`);
                
                // Deactivate the firework but don't make it fall
                this.animationController.deactivateFirework(id);
                this.activeSustainedSounds--;
                
                if (this.activeSustainedSounds <= 0) {
                    this.activeSustainedSounds = 0;
                    this.fireworksActive = false;
                }
            });
            
            // Start audio and animation
            console.log('[UIController] Starting audio processing...');
            try {
                const audioStarted = this.audioManager.start();
                console.log('[UIController] Audio start result:', audioStarted);
            } catch (error) {
                console.error('[UIController] Error starting audio:', error);
                console.error('[UIController] Error stack:', error.stack);
            }
            
            console.log('[UIController] Starting animation...');
            try {
                this.animationController.start();
            } catch (error) {
                console.error('[UIController] Error starting animation:', error);
                console.error('[UIController] Error stack:', error.stack);
            }
            
            // Update UI
            console.log('[UIController] Updating UI for active microphone');
            this.startButton.disabled = false;
            this.audioStatus.textContent = 'Microphone Active';
            this.audioStatus.className = 'active';
            this.audioStatus.parentElement.classList.add('active');
            this.updateMicrophoneState(true);
        } else {
            console.error('[UIController] Failed to initialize audio manager');
            this.audioStatus.textContent = 'Microphone Access Denied';
            this.audioStatus.className = 'inactive';
            this.audioStatus.parentElement.classList.add('inactive');
            this.updateMicrophoneState(false);
        }
        } catch (error) {
            console.error('[UIController] Unexpected error in startMicrophone:', error);
            console.error('[UIController] Error stack:', error.stack);
            
            this.audioStatus.textContent = 'Microphone Error';
            this.audioStatus.className = 'inactive';
            this.audioStatus.parentElement.classList.add('inactive');
            this.updateMicrophoneState(false);
        }
    }
    
    /**
     * Stop microphone and animation
     */
    stopMicrophone(resetState = true) {
        console.log('[UIController] Stopping microphone and animation...');
        console.log('[UIController] Current state before stop:', {
            audioManagerExists: !!this.audioManager,
            animationControllerExists: !!this.animationController,
            microphoneActive: this.startButton.classList.contains('active'),
            fireworksActive: this.fireworksActive,
            activeSustainedSounds: this.activeSustainedSounds,
            resetUIState: resetState
        });
        
        try {
            // Stop audio
            console.log('[UIController] Stopping audio manager...');
            if (this.audioManager) {
                this.audioManager.stop();
            } else {
                console.warn('[UIController] Audio manager not available to stop');
            }
            
            // Stop animation
            console.log('[UIController] Stopping animation controller...');
            if (this.animationController) {
                this.animationController.stop();
            } else {
                console.warn('[UIController] Animation controller not available to stop');
            }
            
            this.fireworksActive = false;
            this.activeSustainedSounds = 0;
            
            if (resetState) {
                // Only reset UI state if explicitly requested
                console.log('[UIController] Resetting UI state as requested');
                this.startButton.classList.remove('active');
                this.startButton.querySelector('.text').textContent = 'Start';
                const audioStatus = document.getElementById('audioStatus');
                audioStatus.textContent = 'Audio status: inactive';
                audioStatus.className = 'inactive';
            } else {
                console.log('[UIController] Keeping UI state (temporary stop)');
            }
            
            this.startButton.disabled = false;
            this.audioStatus.textContent = 'Microphone Inactive';
            this.audioStatus.className = 'inactive';
            this.audioStatus.parentElement.classList.add('inactive');
            this.updateVolumeUI(0);
            this.micDetection.textContent = 'Microphone inactive - no sound detected';
            this.micDetection.className = 'mic-detection';
            this.updateMicrophoneState(false);
            
            console.log('[UIController] Microphone and animation stopped successfully');
        } catch (error) {
            console.error('[UIController] Error stopping microphone and animation:', error);
            console.error('[UIController] Error stack:', error.stack);
            
            // Try to reset UI state even if there was an error
            this.startButton.disabled = false;
            this.audioStatus.textContent = 'Microphone Error';
            this.audioStatus.className = 'inactive';
            this.updateMicrophoneState(false);
        }
    }
    
    /**
     * Update volume level UI
     */
    updateVolumeUI(volume) {
        // Update volume meter
        const levelBar = this.volumeLevel.querySelector('.level-bar');
        
        // Ensure volume is within bounds
        const boundedVolume = Math.max(0, Math.min(1, volume));
        
        // Reset any existing transitions and styles
        levelBar.style.transition = 'none';
        void levelBar.offsetHeight; // Force reflow
        
        // Set the width with transition
        levelBar.style.transition = 'all 0.1s ease-out';
        levelBar.style.width = `${boundedVolume * 100}%`;
        
        // Change color based on volume level
        if (volume <= this.audioManager.quietThreshold) {
            levelBar.style.background = 'linear-gradient(90deg, #2ecc71 0%, #3498db 100%)';
            levelBar.style.opacity = '0.7';
        } else if (volume >= this.audioManager.loudThreshold) {
            levelBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)';
            levelBar.style.opacity = '1';
            
            // Schedule a reset of the level bar
            requestAnimationFrame(() => {
                levelBar.style.transition = 'all 0.3s ease-out';
                levelBar.style.width = '0%';
                levelBar.style.opacity = '0.7';
                levelBar.style.background = 'linear-gradient(90deg, #2ecc71 0%, #3498db 100%)';
            });
        } else {
            // For medium volumes, interpolate between quiet and loud colors
            const normalizedVolume = (volume - this.audioManager.quietThreshold) / 
                (this.audioManager.loudThreshold - this.audioManager.quietThreshold);
            levelBar.style.background = 'linear-gradient(90deg, #3498db 0%, #f39c12 100%)';
            levelBar.style.opacity = 0.7 + (normalizedVolume * 0.3);
        }
    }
    
    /**
     * Show sustained sound detection in the mic test indicator
     */
    showSustainedDetection(message = "SUSTAINED sound detected!") {
        clearTimeout(this.sustainedIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-sustained';
        
        this.sustainedIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making louder sounds to launch more fireworks. VERY LOUD sound will burst all.' : 
                'Make LOUDER, SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Show loud sound detection in the mic test indicator
     */
    showLoudDetection(message = "LOUD sound detected!") {
        clearTimeout(this.loudIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-loud';
        
        // Reset the volume meter immediately for loud sounds
        this.updateVolumeUI(0);
        
        this.loudIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making louder sounds to launch more fireworks. VERY LOUD sound will burst all.' : 
                'Make LOUDER, SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Show sudden sound detection in the mic test indicator
     */
    showSuddenDetection(message = "SUDDEN sound detected!") {
        clearTimeout(this.suddenIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-sudden';
        
        this.suddenIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making sounds to launch more fireworks. LOUD sound will burst all.' : 
                'Make SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Update audio settings
     */
    updateAudioSettings() {
        try {
            // Get values directly from the DOM elements to ensure we have the latest values
            const sensitivitySlider = document.getElementById('sensitivitySlider');
            const thresholdLowSlider = document.getElementById('thresholdLow');
            const thresholdHighSlider = document.getElementById('thresholdHigh');
            const suddenThresholdSlider = document.getElementById('suddenThreshold');
            
            if (!sensitivitySlider || !thresholdLowSlider || !thresholdHighSlider || !suddenThresholdSlider) {
                console.error('[UIController] Cannot update settings - one or more sliders not found');
                return;
            }
            
            const sensitivity = parseFloat(sensitivitySlider.value);
            const quietThreshold = parseFloat(thresholdLowSlider.value);
            const loudThreshold = parseFloat(thresholdHighSlider.value);
            const suddenThreshold = parseFloat(suddenThresholdSlider.value);
            
            console.log('[UIController] Updating audio settings:', {
                sensitivity,
                quietThreshold,
                loudThreshold,
                suddenThreshold
            });
            
            // Update settings in AudioManager
            this.audioManager.updateSettings({
                sensitivity,
                quietThreshold,
                loudThreshold,
                suddenSoundThreshold: suddenThreshold
            });
            
            // Show a visual confirmation that settings were updated
            this.showSettingsConfirmation();
            
            console.log('[UIController] Audio settings updated successfully');
            
            // Log current settings to verify
            console.log('[UIController] Current AudioManager settings:', {
                sensitivity: this.audioManager.sensitivity,
                quietThreshold: this.audioManager.quietThreshold,
                loudThreshold: this.audioManager.loudThreshold,
                suddenSoundThreshold: this.audioManager.suddenSoundThreshold
            });
        } catch (error) {
            console.error('[UIController] Error updating audio settings:', error);
            console.error('[UIController] Error stack:', error.stack);
        }
    }
    
    /**
     * Show a brief visual confirmation that settings were updated
     */
    showSettingsConfirmation() {
        // Create a small notification
        const notification = document.createElement('div');
        notification.textContent = 'Settings updated';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        notification.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Fade out and remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Update new sliders with values directly from AudioManager
     */
    /**
     * Log the current settings to console
     */
    logCurrentSettings() {
        if (!this.audioManager) {
            console.error('[UIController] Cannot log settings - AudioManager not available');
            return;
        }
        
        console.log('=== CURRENT AUDIO SETTINGS ===');
        console.log(`Sensitivity: ${this.audioManager.sensitivity}`);
        console.log(`Quiet Threshold: ${this.audioManager.quietThreshold}`);
        console.log(`Loud Threshold: ${this.audioManager.loudThreshold}`);
        console.log(`Sudden Sound Threshold: ${this.audioManager.suddenSoundThreshold}`);
        console.log(`Noise Floor: ${this.audioManager.noiseFloor}`);
        console.log(`Sustained Sound Duration: ${this.audioManager.sustainedSoundDuration}ms`);
        console.log('=============================');
    }
    
    updateNewSlidersFromAudioManager() {
        // Make sure we have a valid AudioManager
        if (!this.audioManager) {
            console.error('[UIController] Cannot update sliders - AudioManager not available');
            return;
        }
        
        console.log('[UIController] Updating new sliders from AudioManager current values');
        
        // Get the new sliders
        const newSensitivitySlider = document.getElementById('newSensitivitySlider');
        const newThresholdLowSlider = document.getElementById('newThresholdLow');
        const newThresholdHighSlider = document.getElementById('newThresholdHigh');
        const newSuddenThresholdSlider = document.getElementById('newSuddenThreshold');
        
        // Update new sliders with current AudioManager values
        if (newSensitivitySlider) {
            newSensitivitySlider.value = this.audioManager.sensitivity;
        }
        
        if (newThresholdLowSlider) {
            newThresholdLowSlider.value = this.audioManager.quietThreshold;
        }
        
        if (newThresholdHighSlider) {
            newThresholdHighSlider.value = this.audioManager.loudThreshold;
        }
        
        if (newSuddenThresholdSlider) {
            newSuddenThresholdSlider.value = this.audioManager.suddenSoundThreshold;
        }
        
        console.log('[UIController] New sliders updated with:', {
            sensitivity: this.audioManager.sensitivity,
            quietThreshold: this.audioManager.quietThreshold,
            loudThreshold: this.audioManager.loudThreshold,
            suddenSoundThreshold: this.audioManager.suddenSoundThreshold
        });
    }
    
    updateMicrophoneState(isActive) {
        const micButton = document.getElementById('startMicrophone');
        const audioVisualizer = document.querySelector('.audio-visualizer');
        const audioStatus = document.getElementById('audioStatus');
        
        if (isActive) {
            micButton.classList.add('active');
            audioVisualizer.classList.remove('mic-inactive');
            audioVisualizer.classList.add('mic-active');
            audioStatus.textContent = 'Audio status: active';
            audioStatus.classList.add('active');
            audioStatus.classList.remove('inactive');
        } else {
            micButton.classList.remove('active');
            audioVisualizer.classList.remove('mic-active');
            audioVisualizer.classList.add('mic-inactive');
            audioStatus.textContent = 'Audio status: inactive';
            audioStatus.classList.remove('active');
            audioStatus.classList.add('inactive');
        }
    }
}

export default UIController;