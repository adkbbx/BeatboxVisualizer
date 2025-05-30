/**
 * Manages different animation modes (fireworks, bubbles, etc.)
 */
class ModeManager {
    constructor(animationController) {
        this.animationController = animationController;
        this.availableModes = ['firework', 'bubble'];
        
        // Load saved mode from localStorage, fallback to 'firework' if none saved
        this.currentMode = this.loadSavedMode() || 'firework';
        
        // Initialize UI
        this.initializeModeUI();
    }
    
    /**
     * Initialize mode selection UI
     */
    initializeModeUI() {
        // Setup desktop toggle
        this.setupDesktopToggle();
        
        // Setup mobile button
        this.setupMobileButton();
        
        // Add event listeners
        this.setupModeEventListeners();
        
        // Initialize UI for current mode
        this.updateModeUI(this.currentMode);
        
        // Initialize the loaded mode
        this.initializeMode(this.currentMode);
        
        // Update settings for the loaded mode
        this.updateSettingsForMode(this.currentMode);
        
        // Add language change listener to update test button text
        this.setupLanguageCallback();
        
        // Notify animation controller of the initial mode
        if (this.animationController && this.animationController.switchMode) {
            this.animationController.switchMode(this.currentMode);
        }
    }
    
    /**
     * Setup desktop toggle in tab navigation
     */
    setupDesktopToggle() {
        const fireworkButton = document.getElementById('fireworkModeDesktop');
        const bubbleButton = document.getElementById('bubbleModeDesktop');
        
        if (fireworkButton && bubbleButton) {
            // Add data attributes if they don't exist
            if (!fireworkButton.getAttribute('data-mode')) {
                fireworkButton.setAttribute('data-mode', 'firework');
            }
            if (!bubbleButton.getAttribute('data-mode')) {
                bubbleButton.setAttribute('data-mode', 'bubble');
            }
        }
    }
    
    /**
     * Setup mobile mode toggle
     */
    setupMobileButton() {
        const fireworkButton = document.getElementById('fireworkModeMobile');
        const bubbleButton = document.getElementById('bubbleModeMobile');
        const mobileToggle = document.querySelector('.mode-toggle.mobile-toggle');
        
        if (fireworkButton && bubbleButton) {
            // Add data attributes if they don't exist
            if (!fireworkButton.getAttribute('data-mode')) {
                fireworkButton.setAttribute('data-mode', 'firework');
            }
            if (!bubbleButton.getAttribute('data-mode')) {
                bubbleButton.setAttribute('data-mode', 'bubble');
            }
            
            // Add individual click handlers for mobile mode options
            fireworkButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchMode('firework');
            });
            
            bubbleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchMode('bubble');
            });
        }
        
        if (mobileToggle) {
            // Keyboard support
            mobileToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const newMode = this.currentMode === 'firework' ? 'bubble' : 'firework';
                    this.switchMode(newMode);
                }
            });
            
            // Click support for entire toggle - make it more permissive
            mobileToggle.addEventListener('click', (e) => {
                // Handle clicks anywhere on the toggle
                const newMode = this.currentMode === 'firework' ? 'bubble' : 'firework';
                this.switchMode(newMode);
            });
        }
    }
    
    /**
     * Setup event listeners for mode buttons
     */
    setupModeEventListeners() {
        // Support desktop toggle mode options
        const modeButtons = document.querySelectorAll('.mode-option');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent toggle click
                const mode = button.getAttribute('data-mode');
                if (mode && mode !== 'toggle') {
                    this.switchMode(mode);
                }
            });
        });
        
        // Add keyboard and click support for desktop toggle
        const desktopToggle = document.querySelector('.mode-toggle.desktop-toggle');
        if (desktopToggle) {
            // Keyboard support
            desktopToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const newMode = this.currentMode === 'firework' ? 'bubble' : 'firework';
                    this.switchMode(newMode);
                }
            });
            
            // Click support for entire toggle (but not mode options)
            desktopToggle.addEventListener('click', (e) => {
                // Only handle clicks on the toggle background or slider
                if (e.target === desktopToggle || e.target.classList.contains('mode-slider')) {
                    const newMode = this.currentMode === 'firework' ? 'bubble' : 'firework';
                    this.switchMode(newMode);
                }
            });
        }
    }
    
    /**
     * Setup language change callback to update test button text
     */
    setupLanguageCallback() {
        if (window.i18n) {
            window.i18n.onLanguageChange(() => {
                this.updateTestButtonText();
            });
        } else {
            // Wait for i18n to be available and then set up the callback
            const checkI18n = setInterval(() => {
                if (window.i18n) {
                    clearInterval(checkI18n);
                    window.i18n.onLanguageChange(() => {
                        this.updateTestButtonText();
                    });
                    // Update button text once i18n is available
                    this.updateTestButtonText();
                }
            }, 100);
        }
    }
    
    /**
     * Update test button text with current translation
     */
    updateTestButtonText() {
        const testButton = document.getElementById('testFirework');
        if (testButton) {
            const textSpan = testButton.querySelector('.text');
            if (textSpan && window.i18n) {
                textSpan.textContent = window.i18n.t('ui.buttons.test');
            }
        }
    }
    
    /**
     * Switch to a different animation mode
     * @param {string} newMode - The mode to switch to ('firework' or 'bubble')
     */
    switchMode(newMode) {
        if (!this.availableModes.includes(newMode)) {
            console.warn(`Unknown mode: ${newMode}`);
            return;
        }
        
        if (this.currentMode === newMode) {
            return; // Already in this mode
        }
        
        // Clear current animations
        this.clearCurrentAnimations();
        
        // Update current mode
        const previousMode = this.currentMode;
        this.currentMode = newMode;
        
        // Initialize new mode if needed
        this.initializeMode(newMode);
        
        // Update sound effects for bubble mode if audio is ready
        if (newMode === 'bubble' && this.animationController.bubbleManager && window.audioManager?.soundEffects) {
            setTimeout(() => {
                this.animationController.bubbleManager.updateSoundEffects();
                if (this.animationController.bubbleManager.testBubbleManager) {
                    this.animationController.bubbleManager.testBubbleManager.updateSoundEffects(window.audioManager.soundEffects);
                    this.animationController.bubbleManager.testBubbleManager.setSoundEnabled(true);
                }
            }, 100);
        }
        
        // Update UI
        this.updateModeUI(newMode);
        
        // Update settings panel if needed
        this.updateSettingsForMode(newMode);
        
        // Notify animation controller
        if (this.animationController && this.animationController.switchMode) {
            this.animationController.switchMode(newMode);
        }
        
        // Trigger mode change event
        this.dispatchModeChangeEvent(previousMode, newMode);
        
        // Save current mode to localStorage
        this.saveModeToStorage(newMode);
    }
    
    /**
     * Clear current animations when switching modes
     */
    clearCurrentAnimations() {
        if (this.animationController) {
            // Clear fireworks
            if (this.animationController.fireworkManager) {
                this.animationController.fireworkManager.fireworks = [];
            }
            
            // Clear bubbles
            if (this.animationController.bubbleManager) {
                this.animationController.bubbleManager.bubbles = [];
            }
            
            // Clear particles
            if (this.animationController.particleManager) {
                this.animationController.particleManager.particles = [];
            }
        }
    }
    
    /**
     * Initialize a specific mode
     * @param {string} mode - Mode to initialize
     */
    initializeMode(mode) {
        if (mode === 'bubble' && this.animationController && !this.animationController.bubbleManager) {
            // Bubble manager will be created by animation controller
        }
    }
    
    /**
     * Update mode UI to reflect current mode
     * @param {string} activeMode - Currently active mode
     */
    updateModeUI(activeMode) {
        // Update desktop toggle mode options
        const modeButtons = document.querySelectorAll('.mode-option');
        modeButtons.forEach(button => {
            const buttonMode = button.getAttribute('data-mode');
            if (buttonMode === activeMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update desktop toggle slider position (if it exists)
        const desktopToggle = document.querySelector('.mode-toggle.desktop-toggle');
        if (desktopToggle) {
            if (activeMode === 'bubble') {
                desktopToggle.classList.add('bubble-mode');
            } else {
                desktopToggle.classList.remove('bubble-mode');
            }
        }
        
        // Update mobile toggle (if it exists)
        const mobileToggle = document.querySelector('.mode-toggle.mobile-toggle');
        if (mobileToggle) {
            const fireworkButton = document.getElementById('fireworkModeMobile');
            const bubbleButton = document.getElementById('bubbleModeMobile');
            
            // Update active states
            if (fireworkButton && bubbleButton) {
                if (activeMode === 'bubble') {
                    fireworkButton.classList.remove('active');
                    bubbleButton.classList.add('active');
                } else {
                    fireworkButton.classList.add('active');
                    bubbleButton.classList.remove('active');
                }
            }
            
            // Update toggle slider position
            if (activeMode === 'bubble') {
                mobileToggle.classList.add('bubble-mode');
            } else {
                mobileToggle.classList.remove('bubble-mode');
            }
        }
        
        // Update mode toggle button (if it exists)
        if (window.modeToggleButton && typeof window.modeToggleButton.updateModeDisplay === 'function') {
            // Only update if the button's mode is different to avoid loops
            if (window.modeToggleButton.getCurrentMode() !== activeMode) {
                window.modeToggleButton.updateModeDisplay(activeMode);
            }
        }
        
        // Update test button text and icon based on mode
        const testButton = document.getElementById('testFirework');
        if (testButton) {
            const textSpan = testButton.querySelector('.text');
            const iconSpan = testButton.querySelector('.icon');
            
            // Keep test button icon consistent regardless of mode
            if (textSpan) {
                // Use translation system instead of hardcoded text
                textSpan.textContent = window.i18n ? window.i18n.t('ui.buttons.test') : 'Test';
            }
            if (iconSpan) {
                // Always use lightning bolt for test button to distinguish from mode toggle
                iconSpan.textContent = '⚡';
            }
        }
        
        // Update settings tabs visibility based on mode
        this.updateSettingsTabsForMode(activeMode);
    }
    
    /**
     * Update settings panel for current mode
     * @param {string} mode - Current mode
     */
    updateSettingsForMode(mode) {
        // Update settings panel title
        const settingsTitle = document.querySelector('#settingsPanel h2');
        if (settingsTitle) {
            settingsTitle.textContent = mode === 'bubble' ? 'Bubble Settings' : 'Animation Settings';
        }
        
        // Update settings tabs for mode
        this.updateSettingsTabsForMode(mode);
    }
    
    /**
     * Update settings tabs visibility and labels for current mode
     * @param {string} mode - Current mode
     */
    updateSettingsTabsForMode(mode) {
        // Get fireworks and bubbles tab buttons
        const fireworksTab = document.querySelector('.tab-button[data-tab="fireworks"]');
        const bubblesTab = document.querySelector('.tab-button[data-tab="bubbles"]');
        const fireworksTabPane = document.querySelector('#fireworks-tab');
        const bubblesTabPane = document.querySelector('#bubbles-tab');
        
        if (mode === 'bubble') {
            // Hide fireworks tab, show bubbles tab
            if (fireworksTab) fireworksTab.style.display = 'none';
            if (bubblesTab) bubblesTab.style.display = 'inline-block';
            
            // Ensure only bubbles tab pane is active
            if (fireworksTabPane) {
                fireworksTabPane.classList.remove('active');
            }
            if (bubblesTabPane) {
                bubblesTabPane.classList.add('active');
            }
            
            // Update tab button states
            if (fireworksTab) fireworksTab.classList.remove('active');
            if (bubblesTab) bubblesTab.classList.add('active');
            
        } else {
            // Hide bubbles tab, show fireworks tab
            if (bubblesTab) bubblesTab.style.display = 'none';
            if (fireworksTab) fireworksTab.style.display = 'inline-block';
            
            // Ensure only fireworks tab pane is active
            if (bubblesTabPane) {
                bubblesTabPane.classList.remove('active');
            }
            if (fireworksTabPane) {
                fireworksTabPane.classList.add('active');
            }
            
            // Update tab button states
            if (bubblesTab) bubblesTab.classList.remove('active');
            if (fireworksTab) fireworksTab.classList.add('active');
        }
        
        // Save the active tab to localStorage for consistency
        const activeTabName = mode === 'bubble' ? 'bubbles' : 'fireworks';
        localStorage.setItem('vibecoding-active-settings-tab', activeTabName);
    }
    
    /**
     * Dispatch mode change event
     * @param {string} previousMode - Previous mode
     * @param {string} newMode - New mode
     */
    dispatchModeChangeEvent(previousMode, newMode) {
        const event = new CustomEvent('modeChanged', {
            detail: {
                previousMode,
                newMode,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Get current mode
     * @returns {string} Current mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    
    /**
     * Check if a mode is available
     * @param {string} mode - Mode to check
     * @returns {boolean} Whether mode is available
     */
    isModeAvailable(mode) {
        return this.availableModes.includes(mode);
    }
    
    /**
     * Load saved mode from localStorage
     * @returns {string|null} The saved mode or null if none exists
     */
    loadSavedMode() {
        try {
            const savedMode = localStorage.getItem('vibecoding_selected_mode');
            if (savedMode && this.availableModes.includes(savedMode)) {
                return savedMode;
            }
        } catch (error) {
            console.warn('[ModeManager] Failed to load saved mode from localStorage:', error);
        }
        return null;
    }
    
    /**
     * Save current mode to localStorage
     * @param {string} mode - The mode to save
     */
    saveModeToStorage(mode) {
        try {
            localStorage.setItem('vibecoding_selected_mode', mode);
        } catch (error) {
            console.warn('[ModeManager] Failed to save mode to localStorage:', error);
        }
    }
}

export default ModeManager; 