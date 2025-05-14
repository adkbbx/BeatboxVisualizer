// improved-background-settings.js
// This script completely overhauls the background transition system

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to initialize
    setTimeout(initializeImprovedBackgroundSystem, 1000);
    
    function initializeImprovedBackgroundSystem() {
        // Find the BackgroundManager instance(s)
        let bgManager = null;
        
        // Check common places where the BackgroundManager might be
        if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
            bgManager = window.backgroundSystem.backgroundManager;
        } else if (window._directBackgroundUploader && window._directBackgroundUploader.backgroundManager) {
            bgManager = window._directBackgroundUploader.backgroundManager;
        } else {
            // Search other possible locations
            for (let key in window) {
                try {
                    if (window[key] && 
                        typeof window[key] === 'object' && 
                        window[key].backgroundManager &&
                        typeof window[key].backgroundManager === 'object' &&
                        typeof window[key].backgroundManager.draw === 'function') {
                        
                        bgManager = window[key].backgroundManager;
                        break;
                    }
                } catch (e) {
                    // Ignore errors when accessing object properties
                }
            }
        }
        
        if (!bgManager) {
            setTimeout(initializeImprovedBackgroundSystem, 3000);
            return;
        }
        
        // Get the settings sliders
        const opacitySlider = document.getElementById('bgOpacity');
        const transitionSlider = document.getElementById('bgTransitionTime');
        const displaySlider = document.getElementById('bgDisplayTime');
        
        // Get the value display elements
        const opacityValue = document.getElementById('bgOpacityValue');
        const transitionValue = document.getElementById('bgTransitionValue');
        const displayValue = document.getElementById('bgDisplayValue');
        
        // Validate that we have all necessary elements
        if (!opacitySlider || !transitionSlider || !displaySlider) {
            setTimeout(initializeImprovedBackgroundSystem, 2000);
            return;
        }
        
        // Replace the BackgroundManager's update and startTransition methods to ensure proper timing
        if (bgManager) {
            // Store original methods
            const originalUpdate = bgManager.update;
            const originalStartTransition = bgManager.startTransition;
            const originalUpdateSettings = bgManager.updateSettings;
            
            // Store transition start time for accurate timing
            bgManager._lastTransitionStartTime = 0;
            bgManager._lastImageChangeTime = 0;
            
            // Override update method
            bgManager.update = function(timestamp) {
                // Call original update for basic functionality
                originalUpdate.call(this, timestamp);
                
                // If not active or no images, do nothing
                if (!this.isActive || this.backgroundImages.length < 2) return;
                
                // Initialize last change time if needed
                if (!this._lastImageChangeTime) {
                    this._lastImageChangeTime = timestamp;
                }
                
                // Check if we're currently transitioning
                if (this.isTransitioning) {
                    // If in transition, update progress based on elapsed time and transition duration
                    const elapsed = timestamp - this._lastTransitionStartTime;
                    this.transitionProgress = Math.min(1, elapsed / this.transitionDuration);
                    
                    // If transition completes, update state
                    if (this.transitionProgress >= 1) {
                        this.transitionProgress = 0;
                        this.isTransitioning = false;
                        this.currentIndex = this.nextIndex;
                        
                        // Record when we completed the transition
                        this._lastImageChangeTime = timestamp;
                    }
                } else {
                    // Not transitioning - check if it's time to start a new transition
                    const displayElapsed = timestamp - this._lastImageChangeTime;
                    
                    if (displayElapsed >= this.displayDuration && this.backgroundImages.length > 1) {
                        // Start transition
                        this.isTransitioning = true;
                        this.transitionProgress = 0;
                        this._lastTransitionStartTime = timestamp;
                        
                        // Calculate next image index
                        this.nextIndex = (this.currentIndex + 1) % this.backgroundImages.length;
                    }
                }
            };
            
            // Override startTransition method
            bgManager.startTransition = function() {
                this.isTransitioning = true;
                this.transitionProgress = 0;
                this._lastTransitionStartTime = performance.now();
                
                // Calculate next image index
                this.nextIndex = (this.currentIndex + 1) % this.backgroundImages.length;
            };
            
            // Override updateSettings method
            bgManager.updateSettings = function(settings) {
                if (originalUpdateSettings) {
                    originalUpdateSettings.call(this, settings);
                }
                
                if (settings.opacity !== undefined) {
                    this.opacity = settings.opacity;
                }
                
                if (settings.transitionDuration !== undefined) {
                    this.transitionDuration = settings.transitionDuration;
                }
                
                if (settings.displayDuration !== undefined) {
                    this.displayDuration = settings.displayDuration;
                }
                
                // Force application of settings
                this._lastImageChangeTime = performance.now();
            };
            
            // Apply initial settings from sliders
            const settings = {
                opacity: parseFloat(opacitySlider.value),
                transitionDuration: parseFloat(transitionSlider.value) * 1000, // Convert to ms
                displayDuration: parseFloat(displaySlider.value) * 1000 // Convert to ms
            };
            
            bgManager.updateSettings(settings);
        }
        
        // Set up event listeners for sliders
        // Remove any previous listeners to avoid duplicates
        opacitySlider.onchange = null;
        opacitySlider.oninput = null;
        transitionSlider.onchange = null;
        transitionSlider.oninput = null;
        displaySlider.onchange = null;
        displaySlider.oninput = null;
        
        // Function to update background settings directly
        function updateBackgroundSettings() {
            if (!bgManager) return;
            
            const settings = {
                opacity: parseFloat(opacitySlider.value),
                transitionDuration: parseFloat(transitionSlider.value) * 1000, // Convert to ms
                displayDuration: parseFloat(displaySlider.value) * 1000 // Convert to ms
            };
            
            // Update display values
            if (opacityValue) opacityValue.textContent = settings.opacity.toFixed(2);
            if (transitionValue) transitionValue.textContent = settings.transitionDuration / 1000;
            if (displayValue) displayValue.textContent = settings.displayDuration / 1000;
            
            // Directly update background manager properties
            bgManager.opacity = settings.opacity;
            bgManager.transitionDuration = settings.transitionDuration;
            bgManager.displayDuration = settings.displayDuration;
            
            // Call update method
            bgManager.updateSettings(settings);
            
            // Save settings to localStorage
            saveBackgroundSettings(settings);
        }
        
        // Add input event listeners
        opacitySlider.addEventListener('input', updateBackgroundSettings);
        transitionSlider.addEventListener('input', updateBackgroundSettings);
        displaySlider.addEventListener('input', updateBackgroundSettings);
        
        // Add change event listeners (for mobile)
        opacitySlider.addEventListener('change', updateBackgroundSettings);
        transitionSlider.addEventListener('change', updateBackgroundSettings);
        displaySlider.addEventListener('change', updateBackgroundSettings);
        
        // Load settings from localStorage
        loadBackgroundSettings();
    }
    
    // Function to save background settings to localStorage
    function saveBackgroundSettings(settings) {
        try {
            localStorage.setItem('improvedBackgroundSettings', JSON.stringify(settings));
        } catch (e) {
            // Silently fail if localStorage is not available
        }
    }

    // Function to load background settings from localStorage
    function loadBackgroundSettings() {
        try {
            const savedSettings = localStorage.getItem('improvedBackgroundSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                // Get sliders and value displays
                const opacitySlider = document.getElementById('bgOpacity');
                const transitionSlider = document.getElementById('bgTransitionTime');
                const displaySlider = document.getElementById('bgDisplayTime');
                const opacityValue = document.getElementById('bgOpacityValue');
                const transitionValue = document.getElementById('bgTransitionValue');
                const displayValue = document.getElementById('bgDisplayValue');

                if (opacitySlider) opacitySlider.value = settings.opacity;
                if (transitionSlider) transitionSlider.value = settings.transitionDuration / 1000;
                if (displaySlider) displaySlider.value = settings.displayDuration / 1000;
                
                if (opacityValue) opacityValue.textContent = settings.opacity.toFixed(2);
                if (transitionValue) transitionValue.textContent = settings.transitionDuration / 1000;
                if (displayValue) displayValue.textContent = settings.displayDuration / 1000;

                // Find bgManager again (it might not be available when this is first called)
                let bgManager = null;
                if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
                    bgManager = window.backgroundSystem.backgroundManager;
                } else if (window._directBackgroundUploader && window._directBackgroundUploader.backgroundManager) {
                    bgManager = window._directBackgroundUploader.backgroundManager;
                } else {
                    for (let key in window) {
                        try {
                            if (window[key] && typeof window[key] === 'object' && window[key].backgroundManager) {
                                bgManager = window[key].backgroundManager;
                                break;
                            }
                        } catch (e) {}
                    }
                }
                
                if (bgManager && bgManager.updateSettings) {
                    bgManager.updateSettings(settings);
                }
            }
        } catch (e) {
             // Silently fail if localStorage is not available or data is corrupted
        }
    }
});