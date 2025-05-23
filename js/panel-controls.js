export function initializePanelControls(uiControllerInstance) {
    const toggleButton = document.getElementById('togglePanels');
    const appContainer = document.querySelector('.app-container');
    
    const controlPanel = document.querySelector('.control-panel');
    const audioVisualizer = document.querySelector('.audio-visualizer');
    const uploaderContainer = document.querySelector('.uploader-tabs-container');
    const settingsPanel = document.getElementById('settingsPanel');
    
    let panelsVisible = true;
    
    // Track key states to prevent repeated firing when held down
    let keysPressed = {
        space: false,
        h: false
    };

    function togglePanels() {
        panelsVisible = !panelsVisible;

        // Toggle the hidden-panels class on the app container
        if (appContainer) {
            appContainer.classList.toggle('hidden-panels', !panelsVisible);
            console.log('Panel visibility changed:', panelsVisible ? 'showing' : 'hiding');
            console.log('App container classes:', appContainer.className);
            
            // Debug: check if test button is visible
            const testButton = document.getElementById('testFirework');
            if (testButton) {
                console.log('Test button visibility - display:', getComputedStyle(testButton).display);
                console.log('Test button visibility - opacity:', getComputedStyle(testButton).opacity);
            }
        }

        // Toggle visibility of other panels (but NOT control panel when using hidden-panels approach)
        // The control panel visibility is handled by the hidden-panels CSS rules
        if (audioVisualizer) audioVisualizer.classList.toggle('is-hidden', !panelsVisible);
        if (uploaderContainer) uploaderContainer.classList.toggle('is-hidden', !panelsVisible);

        if (!panelsVisible) { // Hiding ALL panels
            // Use the passed uiControllerInstance
            const settingsPanelIsOpenAccordingToUIController = uiControllerInstance && uiControllerInstance.isSettingsPanelOpen;
            
            if (settingsPanelIsOpenAccordingToUIController) {
                // UIController will be notified to update its state
                if (typeof uiControllerInstance.notifySettingsPanelClosed === 'function') { // Use parameter
                    uiControllerInstance.notifySettingsPanelClosed(); // Use parameter
                }
            } else {
                // wasSettingsPanelOpenBeforeGlobalHide = false; // This logic was removed
            }
            // Always attempt to hide the settings panel when global hide is triggered
            if (settingsPanel) settingsPanel.classList.add('is-hidden');

        } else { // Showing panels (core panels already handled by toggle)
            // When showing, we DO NOT automatically reopen settings panel.
            // It must be explicitly opened via its own button.
            // We just need to ensure that if it was hidden by 'is-hidden', 
            // that class is removed so its own button can make it visible.
            // However, uiController.openSettingsPanel() already removes 'is-hidden'.
            // So, no specific action for settingsPanel is needed here when showing.
        }
        
        // Update both icon and text with consistent HTML structure
        toggleButton.innerHTML = panelsVisible ? 
            '<span class="icon">👁️</span><span class="text">Hide</span>' : 
            '<span class="icon">👁️‍🗨️</span><span class="text">Show</span>';
    }

    // Set initial button structure to ensure consistency
    toggleButton.innerHTML = '<span class="icon">👁️</span><span class="text">Hide</span>';

    // Button click handler
    toggleButton.addEventListener('click', togglePanels);

    // Keyboard shortcut handlers
    document.addEventListener('keydown', (event) => {
        // Only handle keyboard shortcuts when not typing in input fields
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // Handle 'H' key for panel toggle
        if (event.key.toLowerCase() === 'h' && 
            !event.ctrlKey && 
            !event.altKey && 
            !event.metaKey && 
            !keysPressed.h) {
            event.preventDefault();
            keysPressed.h = true;
            togglePanels();
        }

        // Handle Space bar for test firework launch
        if (event.code === 'Space' && 
            !event.ctrlKey && 
            !event.altKey && 
            !event.metaKey && 
            !keysPressed.space) {
            event.preventDefault();
            keysPressed.space = true;
            
            // Launch test firework if uiController is available
            if (uiControllerInstance && typeof uiControllerInstance.launchTestFirework === 'function') {
                uiControllerInstance.launchTestFirework();
                console.log('[panel-controls] Space bar pressed - launching test firework');
            } else {
                console.warn('[panel-controls] Space bar pressed but uiController not available or missing launchTestFirework method');
            }
        }
    });

    // Reset key states when keys are released
    document.addEventListener('keyup', (event) => {
        if (event.key.toLowerCase() === 'h') {
            keysPressed.h = false;
        }
        
        if (event.code === 'Space') {
            keysPressed.space = false;
        }
    });
}