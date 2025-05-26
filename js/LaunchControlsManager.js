/**
 * Launch Controls Manager
 * Manages the Launch Controls section in the fireworks settings
 */

class LaunchControlsManager {
    constructor() {
        this.presets = {
            'classic': {
                name: '🎆 Classic',
                description: 'Traditional center launches with slight spread and moderate angles',
                settings: {
                    launchSpread: 15,
                    launchSpreadMode: 'range',
                    launchAngleCenter: 90,
                    launchAngleSpread: 15,
                    launchAngleMode: 'range'
                }
            },
            'wide-celebration': {
                name: '🎉 Wide Celebration',
                description: 'Fireworks across entire screen with wide angle variety',
                settings: {
                    launchSpread: 90,
                    launchSpreadMode: 'range',
                    launchAngleCenter: 90,
                    launchAngleSpread: 30,
                    launchAngleMode: 'range'
                }
            },
            'fountain': {
                name: '⛲ Fountain',
                description: 'Center launches with very wide angles for fountain effect',
                settings: {
                    launchSpread: 5,
                    launchSpreadMode: 'range',
                    launchAngleCenter: 90,
                    launchAngleSpread: 45,
                    launchAngleMode: 'range'
                }
            },
            'rocket-straight': {
                name: '🚀 Straight Rockets',
                description: 'Various positions but always straight up launches',
                settings: {
                    launchSpread: 25,
                    launchSpreadMode: 'range',
                    launchAngleFixed: 90,
                    launchAngleMode: 'fixed'
                }
            },
            'left-cascade': {
                name: '↖️ Left Cascade',
                description: 'Fireworks that lean toward the left side',
                settings: {
                    launchSpread: 40,
                    launchSpreadMode: 'range',
                    launchAngleCenter: 120,
                    launchAngleSpread: 20,
                    launchAngleMode: 'range'
                }
            },
            'right-cascade': {
                name: '↗️ Right Cascade',
                description: 'Fireworks that lean toward the right side',
                settings: {
                    launchSpread: 40,
                    launchSpreadMode: 'range',
                    launchAngleCenter: 60,
                    launchAngleSpread: 20,
                    launchAngleMode: 'range'
                }
            },
            'chaos': {
                name: '🌪️ Chaos Mode',
                description: 'Completely random positions and angles for maximum variety',
                settings: {
                    launchSpread: 100,
                    launchSpreadMode: 'random',
                    launchAngleMode: 'random'
                }
            }
        };
        
        this.initializeEventListeners();
        this.loadSavedSettings();
    }
    
    /**
     * Initialize all event listeners for launch controls
     */
    initializeEventListeners() {
        // Launch Position Controls
        this.setupLaunchPositionControls();
        
        // Launch Angle Controls
        this.setupLaunchAngleControls();
        
        // Preset Controls
        this.setupPresetControls();
    }
    
    /**
     * Setup launch position controls
     */
    setupLaunchPositionControls() {
        const spreadSlider = document.getElementById('launchSpread');
        const spreadValue = document.getElementById('launchSpreadValue');
        const spreadMode = document.getElementById('launchSpreadMode');
        const spreadSetting = document.getElementById('launchSpreadSetting');
        
        if (spreadSlider && spreadValue) {
            spreadSlider.addEventListener('input', () => {
                spreadValue.textContent = spreadSlider.value;
                this.updateFireworkSettings({ launchSpread: parseInt(spreadSlider.value) });
                this.saveToLocalStorage('launchSpread', spreadSlider.value);
            });
        }
        
        if (spreadMode && spreadSetting) {
            spreadMode.addEventListener('change', () => {
                const mode = spreadMode.value;
                
                // Show/hide spread slider based on mode
                spreadSetting.style.display = (mode === 'center') ? 'none' : 'block';
                
                this.updateFireworkSettings({ launchSpreadMode: mode });
                this.saveToLocalStorage('launchSpreadMode', mode);
            });
        }
    }
    
    /**
     * Setup launch angle controls
     */
    setupLaunchAngleControls() {
        const angleMode = document.getElementById('launchAngleMode');
        const angleCenter = document.getElementById('launchAngleCenter');
        const angleSpread = document.getElementById('launchAngleSpread');
        const angleFixed = document.getElementById('launchAngleFixed');
        
        const angleCenterValue = document.getElementById('launchAngleCenterValue');
        const angleSpreadValue = document.getElementById('launchAngleSpreadValue');
        const angleFixedValue = document.getElementById('launchAngleFixedValue');
        
        const rangeSettings = document.getElementById('launchAngleRangeSetting');
        const spreadSettings = document.getElementById('launchAngleSpreadSetting');
        const fixedSettings = document.getElementById('launchAngleFixedSetting');
        
        // Angle mode change
        if (angleMode) {
            angleMode.addEventListener('change', () => {
                const mode = angleMode.value;
                
                // Show/hide appropriate controls
                if (rangeSettings && spreadSettings && fixedSettings) {
                    rangeSettings.style.display = (mode === 'range') ? 'block' : 'none';
                    spreadSettings.style.display = (mode === 'range') ? 'block' : 'none';
                    fixedSettings.style.display = (mode === 'fixed') ? 'block' : 'none';
                }
                
                this.updateFireworkSettings({ launchAngleMode: mode });
                this.saveToLocalStorage('launchAngleMode', mode);
            });
        }
        
        // Center angle control
        if (angleCenter && angleCenterValue) {
            angleCenter.addEventListener('input', () => {
                const centerAngle = parseInt(angleCenter.value);
                angleCenterValue.textContent = centerAngle;
                
                // Calculate min/max from center and spread
                const spread = angleSpread ? parseInt(angleSpread.value) : 30;
                const minAngle = Math.max(45, centerAngle - spread);
                const maxAngle = Math.min(135, centerAngle + spread);
                
                this.updateFireworkSettings({ 
                    launchAngleCenter: centerAngle,
                    launchAngleMin: minAngle,
                    launchAngleMax: maxAngle
                });
                this.saveToLocalStorage('launchAngleCenter', centerAngle);
            });
        }
        
        // Spread control
        if (angleSpread && angleSpreadValue) {
            angleSpread.addEventListener('input', () => {
                const spread = parseInt(angleSpread.value);
                angleSpreadValue.textContent = spread;
                
                // Calculate min/max from center and spread
                const centerAngle = angleCenter ? parseInt(angleCenter.value) : 90;
                const minAngle = Math.max(45, centerAngle - spread);
                const maxAngle = Math.min(135, centerAngle + spread);
                
                this.updateFireworkSettings({
                    launchAngleSpread: spread,
                    launchAngleMin: minAngle,
                    launchAngleMax: maxAngle
                });
                this.saveToLocalStorage('launchAngleSpread', spread);
            });
        }
        
        // Fixed angle control
        if (angleFixed && angleFixedValue) {
            angleFixed.addEventListener('input', () => {
                const fixedAngle = parseInt(angleFixed.value);
                angleFixedValue.textContent = fixedAngle;
                
                this.updateFireworkSettings({ launchAngleFixed: fixedAngle });
                this.saveToLocalStorage('launchAngleFixed', fixedAngle);
            });
        }
    }
    
    /**
     * Setup preset controls
     */
    setupPresetControls() {
        const presetSelect = document.getElementById('launchPreset');
        const presetDescription = document.getElementById('presetDescription');
        
        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                const presetKey = presetSelect.value;
                if (presetKey && this.presets[presetKey]) {
                    this.applyPreset(presetKey);
                    if (presetDescription) {
                        presetDescription.textContent = this.presets[presetKey].description;
                    }
                } else if (presetDescription) {
                    presetDescription.textContent = 'Choose a preset to quickly configure launch settings';
                }
            });
        }
    }
    
    /**
     * Update firework settings
     */
    updateFireworkSettings(settings) {
        if (window.animationController && window.animationController.fireworkManager) {
            // Update the manager settings
            window.animationController.fireworkManager.updateSettings(settings);
            
            // Also update the factory directly to ensure immediate effect
            if (window.animationController.fireworkManager.fireworkFactory) {
                window.animationController.fireworkManager.fireworkFactory.updateSettings(settings);
            }
        } else {
            console.warn('Firework manager not available for settings update');
        }
    }
    
    /**
     * Apply a preset configuration
     */
    applyPreset(presetKey) {
        const preset = this.presets[presetKey];
        if (!preset) return;
        
        const settings = preset.settings;
        
        // Update UI elements
        this.updateUIElement('launchSpread', settings.launchSpread);
        this.updateUIElement('launchSpreadMode', settings.launchSpreadMode);
        this.updateUIElement('launchAngleCenter', settings.launchAngleCenter);
        this.updateUIElement('launchAngleSpread', settings.launchAngleSpread);
        this.updateUIElement('launchAngleMode', settings.launchAngleMode);
        this.updateUIElement('launchAngleFixed', settings.launchAngleFixed);
        
        // Trigger change events to update the system
        this.triggerUIUpdates();
        
        // Save all settings
        Object.entries(settings).forEach(([key, value]) => {
            if (value !== undefined) {
                this.saveToLocalStorage(key, value);
            }
        });
        

    }
    
    /**
     * Update a UI element value
     */
    updateUIElement(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.value = value;
            
            // Update display value if it exists
            const valueDisplay = document.getElementById(id + 'Value');
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }
        }
    }
    
    /**
     * Trigger UI update events
     */
    triggerUIUpdates() {
        const elements = [
            'launchSpread', 'launchSpreadMode', 'launchAngleCenter', 
            'launchAngleSpread', 'launchAngleMode', 'launchAngleFixed'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.dispatchEvent(new Event('change'));
                element.dispatchEvent(new Event('input'));
            }
        });
    }
    
    /**
     * Refresh preset dropdown
     */
    refreshPresetDropdown() {
        const presetSelect = document.getElementById('launchPreset');
        if (presetSelect) {
            presetSelect.innerHTML = `
                <option value="">-- Select Preset --</option>
                ${Object.entries(this.presets).map(([key, preset]) => 
                    `<option value="${key}">${preset.name}</option>`
                ).join('')}
            `;
        }
    }
    
    /**
     * Save to localStorage
     */
    saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(`launchControls_${key}`, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save launch control setting:', key, error);
        }
    }
    
    /**
     * Load from localStorage
     */
    loadFromLocalStorage(key, defaultValue = null) {
        try {
            const saved = localStorage.getItem(`launchControls_${key}`);
            return saved !== null ? JSON.parse(saved) : defaultValue;
        } catch (error) {
            console.warn('Failed to load launch control setting:', key, error);
            return defaultValue;
        }
    }
    
    /**
     * Load all saved settings
     */
    loadSavedSettings() {
        // Load and apply saved values
        const settings = {
            launchSpread: this.loadFromLocalStorage('launchSpread', 20),
            launchSpreadMode: this.loadFromLocalStorage('launchSpreadMode', 'range'),
            launchAngleCenter: this.loadFromLocalStorage('launchAngleCenter', 90),
            launchAngleSpread: this.loadFromLocalStorage('launchAngleSpread', 30),
            launchAngleMode: this.loadFromLocalStorage('launchAngleMode', 'range'),
            launchAngleFixed: this.loadFromLocalStorage('launchAngleFixed', 90)
        };
        
        // Apply to UI
        Object.entries(settings).forEach(([key, value]) => {
            this.updateUIElement(key, value);
        });
        
        // Load custom presets
        const customPresets = this.loadFromLocalStorage('customLaunchPresets');
        if (customPresets) {
            try {
                const parsed = JSON.parse(customPresets);
                this.presets = { ...this.presets, ...parsed };
                this.refreshPresetDropdown();
            } catch (error) {
                console.warn('Failed to load custom presets:', error);
            }
        }
        
        // Trigger updates
        this.triggerUIUpdates();
        
        // Also apply the loaded settings directly to the firework system
        this.updateFireworkSettings(settings);
    }

    /**
     * Get value from UI element
     */
    getElementValue(id) {
        const element = document.getElementById(id);
        if (element) {
            return element.type === 'range' ? parseInt(element.value) : element.value;
        }
        return null;
    }
}

export default LaunchControlsManager;