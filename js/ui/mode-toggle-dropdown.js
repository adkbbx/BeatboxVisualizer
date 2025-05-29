/**
 * Mode Toggle Dropdown Controller
 * Handles the dropdown mode toggle functionality
 */

class ModeToggleDropdown {
    constructor() {
        this.button = document.getElementById('modeToggleButton');
        this.menu = document.getElementById('modeDropdownMenu');
        this.currentModeIcon = this.button?.querySelector('.current-mode-icon');
        this.currentModeText = this.button?.querySelector('.current-mode-text');
        this.dropdownArrow = this.button?.querySelector('.dropdown-arrow');
        
        this.isOpen = false;
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
            console.warn('[ModeToggleDropdown] Failed to load saved mode from localStorage:', error);
        }
        return null;
    }
    
    init() {
        if (!this.button || !this.menu) {
            console.warn('Mode toggle dropdown elements not found');
            return;
        }
        
        // Event listeners
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.button.contains(e.target) && !this.menu.contains(e.target)) {
                this.close();
            }
        });
        
        // Handle mode option clicks
        this.menu.addEventListener('click', (e) => {
            const modeOption = e.target.closest('.mode-option');
            if (modeOption) {
                const mode = modeOption.dataset.mode;
                this.selectMode(mode);
                this.close();
            }
        });
        
        // Keyboard navigation
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape') {
                this.close();
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
        
        // Initialize with current mode
        this.updateDisplay();
    }
    
    /**
     * Wait for ModeManager to become available and sync state
     */
    waitForModeManager() {
        const checkModeManager = () => {
            if (window.modeManager && typeof window.modeManager.getCurrentMode === 'function') {
                const modeManagerMode = window.modeManager.getCurrentMode();
                if (modeManagerMode !== this.currentMode) {
                    this.updateModeDisplay(modeManagerMode);
                }
            } else {
                // Check again after a short delay
                setTimeout(checkModeManager, 100);
            }
        };
        
        checkModeManager();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.menu.classList.add('open');
        this.button.setAttribute('aria-expanded', 'true');
        
        // Update active state in menu
        this.updateMenuActiveState();
    }
    
    close() {
        this.isOpen = false;
        this.menu.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');
    }
    
    selectMode(mode) {
        if (mode === this.currentMode) return;
        
        this.currentMode = mode;
        this.updateDisplay();
        
        // Trigger mode change event
        this.triggerModeChange(mode);
    }
    
    updateDisplay() {
        const modeConfig = {
            firework: {
                icon: '🎆',
                text: 'Fireworks'
            },
            bubble: {
                icon: '🫧',
                text: 'Bubbles'
            }
        };
        
        const config = modeConfig[this.currentMode];
        if (config && this.currentModeIcon && this.currentModeText) {
            this.currentModeIcon.textContent = config.icon;
            this.currentModeText.textContent = config.text;
        }
    }
    
    updateMenuActiveState() {
        // Remove active class from all options
        this.menu.querySelectorAll('.mode-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to current mode
        const activeOption = this.menu.querySelector(`[data-mode="${this.currentMode}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }
    
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

// Initialize the dropdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modeToggleDropdown = new ModeToggleDropdown();
}); 