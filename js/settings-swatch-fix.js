/**
 * Settings panel color swatches fix
 * This script ensures that color swatches in the settings panel are visible
 */

document.addEventListener('DOMContentLoaded', function() {
    // Listen for settings panel becoming visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'settingsPanel' && 
                mutation.target.style.display === 'block') {
                // Panel is now visible, wait a bit for content to load
                setTimeout(fixSettingsColorSwatches, 100);
            }
        });
    });
    
    // Observe the settings panel for display changes
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        observer.observe(settingsPanel, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
        
        // Also check when clicking on the colors tab
        document.querySelectorAll('.tab-button').forEach(button => {
            if (button.getAttribute('data-tab') === 'colors') {
                button.addEventListener('click', function() {
                    setTimeout(fixSettingsColorSwatches, 100);
                });
            }
        });
    }
    
    // Function to fix color swatches in settings panel
    function fixSettingsColorSwatches() {
        console.log('Fixing settings panel color swatches');
        
        // First, make sure the custom colors container is visible
        const customColorsSetting = document.getElementById('customColorsSetting');
        if (customColorsSetting) {
            customColorsSetting.style.display = 'block';
        }
        
        // Fix swatches in the custom colors list
        const colorsList = document.getElementById('customColorsList');
        if (!colorsList) return;
        
        // Make the colors list a flex container
        colorsList.style.cssText = `
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            margin-top: 10px !important;
        `;
        
        // Fix each color swatch
        const swatches = colorsList.querySelectorAll('.color-swatch');
        console.log(`Found ${swatches.length} color swatches to fix in settings panel`);
        
        swatches.forEach((swatch, index) => {
            // Get the current color
            const color = swatch.style.backgroundColor || swatch.dataset.color || '#ff0000';
            
            // Apply direct styles to the swatch
            swatch.style.cssText = `
                position: relative !important;
                display: inline-block !important;
                width: 35px !important;
                height: 35px !important;
                margin: 5px !important;
                border-radius: 4px !important;
                border: 2px solid white !important;
                box-shadow: 0 0 6px rgba(0, 0, 0, 0.5) !important;
                cursor: pointer !important;
                opacity: 1 !important;
                overflow: visible !important;
                visibility: visible !important;
                background-color: ${color} !important;
            `;
            
            // Fix the remove button
            const button = swatch.querySelector('button');
        });
    }
});