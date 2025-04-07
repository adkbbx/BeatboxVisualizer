/**
 * UIEventHandlers handles UI-related event listeners and interactions
 */
class UIEventHandlers {
    constructor(uiController) {
        this.uiController = uiController;
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for UI elements
     */
    setupEventListeners() {
        const audioStatus = document.getElementById('audioStatus');

        // Set up start/stop button
        if (this.uiController.startButton) {
            this.uiController.startButton.addEventListener('click', () => {
                if (!this.uiController.startButton.classList.contains('active')) {
                    // Start microphone
                    this.uiController.startButton.classList.add('active');
                    this.uiController.startButton.querySelector('.text').textContent = 'Stop';
                    audioStatus.textContent = 'Audio status: active';
                    audioStatus.className = 'active';
                    this.uiController.startMicrophone();
                } else {
                    // Stop microphone
                    this.uiController.startButton.classList.remove('active');
                    this.uiController.startButton.querySelector('.text').textContent = 'Start';
                    audioStatus.textContent = 'Audio status: inactive';
                    audioStatus.className = 'inactive';
                    this.uiController.stopMicrophone();
                }
            });
        }

        // Set up settings button
        if (this.uiController.settingsButton) {
            this.setupSettingsButton();
        }

        // Set up close settings button
        if (this.uiController.closeSettingsButton) {
            this.setupCloseSettingsButton();
        }

        // Set up sliders
        this.setupSliders();
        
        // Initialize settings connection
        // This ensures settings are loaded from storage on page load
        if (!this.uiController.slidersConnected) {
            setTimeout(() => {
                this.uiController.connectSettingSliders();
                this.uiController.slidersConnected = true;
                
                // Update both slider sets with current values
                this.uiController.updateNewSlidersFromAudioManager();
            }, 500);
        }
    }

    /**
     * Set up settings button handler
     */
    setupSettingsButton() {
        this.uiController.handleSettingsClick = () => {
            const newSettingsPanel = document.getElementById('newSettingsPanel');
            if (!newSettingsPanel) return;
            
            // Get current display state
            const currentDisplay = window.getComputedStyle(newSettingsPanel).display;
            const isVisible = currentDisplay !== 'none';
            
            // Connect the sliders if not already done
            if (!this.uiController.slidersConnected) {
                this.uiController.connectSettingSliders();
                this.uiController.slidersConnected = true;
            } 
            
            // Always update slider values from current settings
            this.uiController.updateNewSlidersFromAudioManager();
            
            // Toggle the panel visibility
            newSettingsPanel.style.display = isVisible ? 'none' : 'block';
            
            // If we're closing the panel, save settings
            if (isVisible && this.uiController.settingsManager) {
                this.uiController.settingsManager.saveSettingsToStorage();
            }
        };
        
        this.uiController.settingsButton.addEventListener('click', this.uiController.handleSettingsClick);
    }

    /**
     * Set up close settings button handler
     */
    setupCloseSettingsButton() {
        this.uiController.handleCloseSettings = () => {
            const settingsPanel = document.getElementById('settingsPanel');
            
            // Force settings panel to be hidden
            settingsPanel.style.display = 'none';
            settingsPanel.style.opacity = '0';
            settingsPanel.style.pointerEvents = 'none';
            settingsPanel.classList.add('hidden');
            
            // Save settings when closing
            if (this.uiController.settingsManager) {
                this.uiController.settingsManager.saveSettingsToStorage();
            }
        };
        
        this.uiController.closeSettingsButton.addEventListener('click', this.uiController.handleCloseSettings);
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