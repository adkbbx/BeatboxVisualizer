/**
 * Mode Toggle Button Controller
 * Handles the simple mode toggle button functionality
 */

class ModeToggleButton {
    constructor() {
        this.button = document.getElementById('modeToggleButton');
        this.currentMode = this.loadSavedMode() || 'firework'; // Load from storage instead of hardcoding
        
        this.init();
    }
    
    /**
     * Load saved mode from localStorage
     * @returns {string|null} The saved mode or null if none exists
     */
    loadSavedMode() {
        try {
            const savedMode = localStorage.getItem('vibecoding_selected_mode');
            if (savedMode && ['firework', 'bubble'].includes(savedMode)) {
                return savedMode;
            }
        } catch (error) {
            console.warn('[ModeToggleButton] Failed to load saved mode from localStorage:', error);
        }
        return null;
    }
    
    init() {
        if (!this.button) {
            console.warn('Mode toggle button element not found');
            return;
        }
        
        // Event listeners
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMode();
        });
        
        // Keyboard navigation
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMode();
            }
        });
        
        // Listen for mode changes from other sources (like ModeManager)
        window.addEventListener('modeChanged', (e) => {
            if (e.detail && e.detail.newMode && e.detail.newMode !== this.currentMode) {
                this.currentMode = e.detail.newMode;
                this.updateDisplay();
            }
        });
        
        // Also listen for the custom modeChange event
        document.addEventListener('modeChange', (e) => {
            if (e.detail && e.detail.mode && e.detail.mode !== this.currentMode) {
                this.currentMode = e.detail.mode;
                this.updateDisplay();
            }
        });
        
        // Listen for when ModeManager becomes available
        this.waitForModeManager();
        
        // Add language change listener to update mode text
        this.setupLanguageCallback();
        
        // Initialize with current mode
        this.updateDisplay();
    }
    
    /**
     * Toggle between firework and bubble modes
     */
    toggleMode() {
        const newMode = this.currentMode === 'firework' ? 'bubble' : 'firework';
        this.selectMode(newMode);
    }
    
    /**
     * Select a specific mode
     * @param {string} mode - The mode to select ('firework' or 'bubble')
     */
    selectMode(mode) {
        if (mode === this.currentMode) return;
        
        this.currentMode = mode;
        this.updateDisplay();
        
        // Trigger mode change event
        this.triggerModeChange(mode);
    }
    
    /**
     * Update the button display based on current mode
     */
    updateDisplay() {
        const modeConfig = {
            firework: {
                icon: '🎆',
                text: window.i18n ? window.i18n.t('ui.modes.fireworks') : 'Fireworks',
                className: ''
            },
            bubble: {
                icon: '🫧',
                text: window.i18n ? window.i18n.t('ui.modes.bubbles') : 'Bubbles',
                className: 'bubble-mode'
            }
        };
        
        const config = modeConfig[this.currentMode];
        if (config && this.button) {
            const iconElement = this.button.querySelector('.icon');
            const textElement = this.button.querySelector('.text');
            
            if (iconElement) {
                iconElement.textContent = config.icon;
            }
            
            if (textElement) {
                textElement.textContent = config.text;
            }
            
            // Update button class for styling
            this.button.classList.remove('bubble-mode');
            if (config.className) {
                this.button.classList.add(config.className);
            }
        }
    }
    
    /**
     * Trigger mode change events
     * @param {string} mode - The new mode
     */
    triggerModeChange(mode) {
        // Dispatch custom event for mode change
        const event = new CustomEvent('modeChange', {
            detail: { mode }
        });
        document.dispatchEvent(event);
        
        // Also trigger the existing mode manager if available
        if (window.modeManager && typeof window.modeManager.switchMode === 'function') {
            window.modeManager.switchMode(mode);
        }
        
        // Update any existing mode toggles for compatibility
        this.updateLegacyModeToggles(mode);
    }
    
    /**
     * Update legacy mode toggle elements for backward compatibility
     * @param {string} mode - The new mode
     */
    updateLegacyModeToggles(mode) {
        // Update any existing mode toggle elements for backward compatibility
        const legacyToggles = document.querySelectorAll('.mode-option[data-mode]');
        legacyToggles.forEach(toggle => {
            if (toggle.dataset.mode === mode) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        });
        
        // Update mode toggle classes if they exist
        const modeToggles = document.querySelectorAll('.mode-toggle');
        modeToggles.forEach(toggle => {
            toggle.classList.remove('bubble-mode');
            if (mode === 'bubble') {
                toggle.classList.add('bubble-mode');
            }
        });
    }
    
    /**
     * Wait for mode manager to become available and sync
     */
    waitForModeManager() {
        const checkModeManager = () => {
            if (window.modeManager && typeof window.modeManager.getCurrentMode === 'function') {
                const managerMode = window.modeManager.getCurrentMode();
                if (managerMode && managerMode !== this.currentMode) {
                    this.currentMode = managerMode;
                    this.updateDisplay();
                }
            } else {
                // Keep checking until ModeManager is available
                setTimeout(checkModeManager, 100);
            }
        };
        
        // Start checking after a short delay
        setTimeout(checkModeManager, 100);
    }
    
    /**
     * Setup language change callback
     */
    setupLanguageCallback() {
        if (window.i18n && typeof window.i18n.onLanguageChange === 'function') {
            window.i18n.onLanguageChange(() => {
                this.updateDisplay();
            });
        } else {
            // Wait for i18n system to be available
            const checkI18n = () => {
                if (window.i18n && typeof window.i18n.onLanguageChange === 'function') {
                    window.i18n.onLanguageChange(() => {
                        this.updateDisplay();
                    });
                } else {
                    setTimeout(checkI18n, 100);
                }
            };
            setTimeout(checkI18n, 100);
        }
    }
    
    // Public method to set mode programmatically
    setMode(mode) {
        this.selectMode(mode);
    }
    
    // Public method to update mode without triggering events (for sync from ModeManager)
    updateModeDisplay(mode) {
        if (mode === this.currentMode) return;
        
        this.currentMode = mode;
        this.updateDisplay();
    }
    
    // Public method to get current mode
    getCurrentMode() {
        return this.currentMode;
    }
}

// Initialize the button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modeToggleButton = new ModeToggleButton();
}); 