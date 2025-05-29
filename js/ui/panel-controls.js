/**
 * Simplified Panel Controls
 * Handles control panel behavior with consistent button visibility
 */

export default function initializePanelControls(uiControllerInstance) {
    const toggleButton = document.getElementById('togglePanels');
    const appContainer = document.querySelector('.app-container');
    const audioVisualizer = document.querySelector('.audio-visualizer');
    const uploaderContainer = document.querySelector('.uploader-tabs-container');
    const mobileToggle = document.querySelector('.mobile-mode-toggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsButton = document.getElementById('toggleSettings');
    
    let panelsVisible = true;
    
    // Track key states to prevent repeated firing when held down
    let keysPressed = {
        space: false,
        h: false
    };
    
    /**
     * Toggle panel visibility
     * Hide panels but keep control panel visible with all buttons
     */
    function togglePanels() {
        panelsVisible = !panelsVisible;
        
        // Toggle class on app container for CSS styling
        appContainer.classList.toggle('hidden-panels', !panelsVisible);
        
        // Hide/show other panels
        if (audioVisualizer) {
            audioVisualizer.style.display = panelsVisible ? '' : 'none';
        }
        
        if (uploaderContainer) {
            uploaderContainer.style.display = panelsVisible ? '' : 'none';
        }
        
        if (mobileToggle) {
            mobileToggle.style.display = panelsVisible ? '' : 'none';
        }
        
        // Handle settings panel - close it when hiding panels
        if (!panelsVisible && settingsPanel && settingsPanel.style.display !== 'none') {
            settingsPanel.style.display = 'none';
            if (settingsButton) {
                settingsButton.classList.remove('settings-open');
            }
            
            // Notify UI controller if needed
            if (uiControllerInstance && typeof uiControllerInstance.notifySettingsPanelClosed === 'function') {
                uiControllerInstance.notifySettingsPanelClosed();
            }
        }
        
        // Update button text and icon
        updateToggleButton();
    }
    
    /**
     * Update toggle button appearance
     */
    function updateToggleButton() {
        if (toggleButton) {
            toggleButton.innerHTML = panelsVisible ? 
                '<span class="icon">👁️</span><span class="text">Hide</span>' : 
                '<span class="icon">👁️‍🗨️</span><span class="text">Show</span>';
            
            // Update aria-label for accessibility
            toggleButton.setAttribute('aria-label', 
                panelsVisible ? 'Hide panels' : 'Show panels');
            toggleButton.setAttribute('aria-pressed', !panelsVisible);
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(event) {
        // Skip if user is typing in an input
        if (document.activeElement.matches('input, textarea, select')) {
            return;
        }
        
        const key = event.key.toLowerCase();
        
        // 'H' key toggles panels
        if (key === 'h' && !event.ctrlKey && !event.altKey && !event.metaKey && !keysPressed.h) {
            event.preventDefault();
            keysPressed.h = true;
            togglePanels();
        }
        
        // Spacebar for test launch
        if (event.code === 'Space' && !event.ctrlKey && !event.altKey && !event.metaKey && !keysPressed.space) {
            event.preventDefault();
            keysPressed.space = true;
            
            // Determine current mode and launch appropriate test
            if (uiControllerInstance) {
                const currentMode = window.modeManager?.getCurrentMode() || 
                                  uiControllerInstance.animationController?.currentMode || 
                                  'firework';
                
                if (currentMode === 'bubble') {
                    uiControllerInstance.launchTestBubble?.();
                } else {
                    uiControllerInstance.launchTestFirework?.();
                }
            }
        }
    }
    
    /**
     * Initialize settings button indicator
     */
    function initializeSettingsButton() {
        if (settingsButton && uiControllerInstance) {
            // Add visual indicator when settings are open
            const originalOpenSettings = uiControllerInstance.openSettingsPanel;
            const originalCloseSettings = uiControllerInstance.closeSettingsPanel;
            
            if (typeof originalOpenSettings === 'function') {
                uiControllerInstance.openSettingsPanel = function() {
                    originalOpenSettings.call(this);
                    settingsButton.classList.add('settings-open');
                };
            }
            
            if (typeof originalCloseSettings === 'function') {
                uiControllerInstance.closeSettingsPanel = function() {
                    originalCloseSettings.call(this);
                    settingsButton.classList.remove('settings-open');
                };
            }
        }
    }
    
    /**
     * Handle responsive behavior
     */
    function handleResponsive() {
        const isMobile = window.innerWidth <= 767;
        const controlPanel = document.querySelector('.control-panel');
        
        if (controlPanel) {
            // Add mobile class for specific mobile styling if needed
            controlPanel.classList.toggle('mobile', isMobile);
        }
    }
    
    // Event listeners
    if (toggleButton) {
        toggleButton.addEventListener('click', togglePanels);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Reset key states when keys are released
    document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'h') {
            keysPressed.h = false;
        }
        
        if (event.code === 'Space') {
            keysPressed.space = false;
        }
    });
    
    // Responsive handling
    window.addEventListener('resize', handleResponsive);
    handleResponsive(); // Initial check
    
    // Initialize UI
    updateToggleButton();
    initializeSettingsButton();
    
    // Return public API
    return {
        togglePanels,
        isPanelsVisible: () => panelsVisible,
        showPanels: () => {
            if (!panelsVisible) togglePanels();
        },
        hidePanels: () => {
            if (panelsVisible) togglePanels();
        }
    };
}

// Keep the default export for compatibility
// export default initializePanelControls;