/**
 * UIEventHandlers handles UI-related event listeners and interactions
 */
class UIEventHandlers {
    constructor(uiController) {
        this.uiController = uiController;
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for UI elements - simplified
     */
    setupEventListeners() {
        const audioStatus = document.getElementById('audioStatus');

        // Set up start/stop button with improved error handling
        if (this.uiController.startButton) {
            this.uiController.startButton.addEventListener('click', async () => {
                const button = this.uiController.startButton;
                const textElement = button.querySelector('.text');
                
                // Disable button during operation to prevent double-clicks
                button.disabled = true;
                
                try {
                    if (!button.classList.contains('active')) {
                        // Starting microphone
                        textElement.textContent = 'Starting...';
                        audioStatus.textContent = 'Audio status: starting...';
                        audioStatus.className = 'starting';
                        
                        const success = await this.uiController.startMicrophone();
                        
                        if (success !== false) {
                            // Success
                            button.classList.add('active');
                            textElement.textContent = 'Stop';
                            audioStatus.textContent = 'Audio status: active';
                            audioStatus.className = 'active';
                
                        } else {
                            // Failed
                            textElement.textContent = 'Start';
                            audioStatus.textContent = 'Audio status: failed to start';
                            audioStatus.className = 'error';
                
                            
                            // Reset error state after 3 seconds
                            setTimeout(() => {
                                if (audioStatus.className === 'error') {
                                    audioStatus.textContent = 'Audio status: inactive';
                                    audioStatus.className = 'inactive';
                                }
                            }, 3000);
                        }
                    } else {
                        // Stopping microphone
                        textElement.textContent = 'Stopping...';
                        audioStatus.textContent = 'Audio status: stopping...';
                        audioStatus.className = 'stopping';
                        
                        this.uiController.stopMicrophone();
                        
                        // Update UI
                        button.classList.remove('active');
                        textElement.textContent = 'Start';
                        audioStatus.textContent = 'Audio status: inactive';
                        audioStatus.className = 'inactive';
            
                    }
                } catch (error) {
                    console.error('❌ Error with microphone button:', error);
                    
                    // Reset to safe state
                    button.classList.remove('active');
                    textElement.textContent = 'Start';
                    audioStatus.textContent = 'Audio status: error';
                    audioStatus.className = 'error';
                    
                    // Reset error state after 3 seconds
                    setTimeout(() => {
                        if (audioStatus.className === 'error') {
                            audioStatus.textContent = 'Audio status: inactive';
                            audioStatus.className = 'inactive';
                        }
                    }, 3000);
                } finally {
                    // Re-enable button
                    button.disabled = false;
                }
            });
        }

        // Set up test button
        const testButton = document.getElementById('testFirework');
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.uiController.launchTestFirework();
            });
        }

        // Set up sliders
        this.setupSliders();
        
        // Load settings on initialization
        if (this.uiController.settingsManager) {
            // Update sliders from stored settings
            setTimeout(() => {
                if (this.uiController.updateSlidersFromAudioManager) {
                    this.uiController.updateSlidersFromAudioManager();
                }
            }, 500);
        }
    }

    /**
     * Set up settings button handler - simplified
     */
    setupSettingsButton() {
        // We've moved this functionality to UIController.initializeSettingsPanelControls()
        // No need to duplicate event handlers
    }

    /**
     * Set up close settings button handler - simplified
     */
    setupCloseSettingsButton() {
        // We've moved this functionality to UIController.initializeSettingsPanelControls()
        // No need to duplicate event handlers
    }

    /**
     * Set up settings sliders
     */
    setupSliders() {
        const updateSettings = () => this.uiController.updateAudioSettings();
        
        const sliders = [
            this.uiController.sensitivitySlider,
            this.uiController.thresholdLowSlider,
            this.uiController.thresholdHighSlider,
            this.uiController.suddenThresholdSlider
        ];
        
        sliders.forEach(slider => {
            if (slider) {
                slider.addEventListener('input', updateSettings);
            }
        });
    }
}

export default UIEventHandlers;