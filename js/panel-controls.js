export function initializePanelControls(uiControllerInstance) {
    const toggleButton = document.getElementById('togglePanels');
    const appContainer = document.querySelector('.app-container');
    
    const controlPanel = document.querySelector('.control-panel');
    const audioVisualizer = document.querySelector('.audio-visualizer');
    const uploaderContainer = document.querySelector('.uploader-tabs-container');
    const settingsPanel = document.getElementById('settingsPanel');
    
    let panelsVisible = true;

    function togglePanels() {
        panelsVisible = !panelsVisible;

        // Toggle visibility of core panels
        if (controlPanel) controlPanel.classList.toggle('is-hidden', !panelsVisible);
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

    // Keyboard shortcut handler
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'h' && 
            !event.ctrlKey && 
            !event.altKey && 
            !event.metaKey && 
            document.activeElement.tagName !== 'INPUT') {
            togglePanels();
        }
    });
}