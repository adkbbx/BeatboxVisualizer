/**
 * SettingsManager handles settings-related functionality
 */
class SettingsManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // Local cache of settings to handle before AudioAnalyzer is initialized
        this.settingsCache = {
            sensitivity: 1.5,
            quietThreshold: 0.06,
            loudThreshold: 0.4,
            suddenSoundThreshold: 0.15,
            backgroundRemovalEnabled: true,
            imageRotation: false,
            glowEffect: false,
            testSoundEnabled: true,
            randomFireworkSize: false
        };
        
        // Try to load settings from localStorage
        this.loadSettingsFromStorage();
    }
    
    /**
     * Load settings from localStorage if available
     */
    loadSettingsFromStorage() {
        try {
            const savedSettings = localStorage.getItem('vibecoding-settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                this.settingsCache = { ...this.settingsCache, ...parsedSettings };
                
                // Apply these settings to AudioManager if it's initialized
                if (this.audioManager && this.audioManager.audioAnalyzer) {
                    this.audioManager.updateSettings(this.settingsCache);
                }
                
                // Apply UI settings
                this.applyUISettings();
            }
        } catch (error) {
        }
    }
    
    /**
     * Apply UI settings to form elements
     */
    applyUISettings() {
        // Apply toggle settings
        const toggleSettings = [
            'backgroundRemovalEnabled',
            'imageRotation',
            'glowEffect', 
            'testSoundEnabled',
            'randomFireworkSize'
        ];
        
        toggleSettings.forEach(settingId => {
            const element = document.getElementById(settingId);
            if (element && this.settingsCache[settingId] !== undefined) {
                element.checked = this.settingsCache[settingId];
            }
        });
    }
    
    /**
     * Save current settings to localStorage
     */
    saveSettingsToStorage() {
        try {
            // Get current settings
            const currentSettings = this.getCurrentSettings();
            
            // Also include UI toggle settings
            const toggleSettings = [
                'backgroundRemovalEnabled',
                'imageRotation',
                'glowEffect',
                'testSoundEnabled', 
                'randomFireworkSize'
            ];
            
            toggleSettings.forEach(settingId => {
                const element = document.getElementById(settingId);
                if (element) {
                    currentSettings[settingId] = element.checked;
                }
            });
            
            // Save to localStorage
            localStorage.setItem('vibecoding-settings', JSON.stringify(currentSettings));
        } catch (error) {
        }
    }
    
    /**
     * Get current settings from AudioAnalyzer or local cache
     */
    getCurrentSettings() {
        // If AudioAnalyzer is available, get settings from there
        if (this.audioManager && this.audioManager.audioAnalyzer) {
            return this.audioManager.audioAnalyzer.getSettings();
        }
        
        // Otherwise return cached settings
        return this.settingsCache;
    }

    /**
     * Set up and update audio setting sliders
     */
    connectSettingSliders() {
        const sliderIds = [
            'sensitivitySlider',
            'thresholdLow',
            'thresholdHigh',
            'suddenThreshold'
        ];
        
        // Load settings from storage or AudioAnalyzer
        const currentSettings = this.getCurrentSettings();
        
        // Update sliders with current settings
        sliderIds.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                // Set slider values based on current settings
                if (id === 'sensitivitySlider') slider.value = currentSettings.sensitivity;
                if (id === 'thresholdLow') slider.value = currentSettings.quietThreshold;
                if (id === 'thresholdHigh') slider.value = currentSettings.loudThreshold;
                if (id === 'suddenThreshold') slider.value = currentSettings.suddenSoundThreshold;
                
                // Add listener to update settings when value changes
                slider.addEventListener('input', () => {
                    this.updateAudioSettings();
                });
            }
        });
        
        // Connect toggle settings
        this.connectToggleSettings();
    }
    
    /**
     * Connect toggle setting event listeners
     */
    connectToggleSettings() {
        const toggleSettings = [
            'backgroundRemovalEnabled',
            'imageRotation',
            'glowEffect',
            'testSoundEnabled',
            'randomFireworkSize'
        ];
        
        toggleSettings.forEach(settingId => {
            const toggle = document.getElementById(settingId);
            if (toggle) {
                // Add listener to save settings when changed
                toggle.addEventListener('change', () => {
                    this.saveSettingsToStorage();
                    this.showSettingsConfirmation();
                });
            }
        });
    }

    /**
     * Update audio settings from sliders - simplified
     */
    updateAudioSettings() {
        try {
            // Get values from sliders
            const sensitivitySlider = document.getElementById('sensitivitySlider');
            const thresholdLowSlider = document.getElementById('thresholdLow');
            const thresholdHighSlider = document.getElementById('thresholdHigh');
            const suddenThresholdSlider = document.getElementById('suddenThreshold');
            
            // Use default values if sliders are not available
            const sensitivity = parseFloat(sensitivitySlider?.value || 1.5);
            const quietThreshold = parseFloat(thresholdLowSlider?.value || 0.06);
            const loudThreshold = parseFloat(thresholdHighSlider?.value || 0.4);
            const suddenThreshold = parseFloat(suddenThresholdSlider?.value || 0.15);
            
            // Update settings cache
            this.settingsCache = {
                sensitivity,
                quietThreshold,
                loudThreshold,
                suddenSoundThreshold: suddenThreshold
            };
            
            // Update settings in AudioManager if available
            if (this.audioManager) {
                this.audioManager.updateSettings(this.settingsCache);
            }
            
            // Save to localStorage for persistence
            this.saveSettingsToStorage();
            
            // Show confirmation
            this.showSettingsConfirmation();
        } catch (error) {
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
     * Update sliders with values from AudioManager/AudioAnalyzer - simplified
     */
    updateSlidersFromAudioManager() {
        // Get current settings
        const currentSettings = this.getCurrentSettings();
        
        // Update sliders with current values
        const sliderMappings = {
            'sensitivitySlider': 'sensitivity',
            'thresholdLow': 'quietThreshold',
            'thresholdHigh': 'loudThreshold',
            'suddenThreshold': 'suddenSoundThreshold'
        };
        
        // Update each slider if it exists
        Object.entries(sliderMappings).forEach(([sliderId, settingKey]) => {
            const slider = document.getElementById(sliderId);
            if (slider && currentSettings[settingKey] !== undefined) {
                slider.value = currentSettings[settingKey];
                
                // Update corresponding value display if it exists
                const valueDisplay = document.getElementById(sliderId.replace('Slider', 'Value')
                                                              .replace('new', '')
                                                              .replace('Low', 'LowValue')
                                                              .replace('High', 'HighValue'));
                if (valueDisplay) {
                    valueDisplay.textContent = currentSettings[settingKey];
                }
            }
        });
    }
}

export default SettingsManager;