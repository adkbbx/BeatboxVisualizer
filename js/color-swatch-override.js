/**
 * Override for color swatch creation in SettingsController
 */

// Wait for page load
document.addEventListener('DOMContentLoaded', function() {
  // Get references
  const colorsList = document.getElementById('customColorsList');
  const addColorButton = document.getElementById('addColor');
  const colorPicker = document.getElementById('colorPicker');
  
  if (!colorsList || !addColorButton || !colorPicker) {
    return; // Exit if elements don't exist
  }
  
  // Override the creation of color swatches
  function updateCustomColors() {
    // Clear the container
    colorsList.innerHTML = '';
    
    // Get colors from localStorage if available
    let customColors = [];
    try {
      const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
      customColors = settings.colors?.customColors || [];
    } catch (e) {
    }
    
    // If no colors, show empty message
    if (customColors.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-colors-message';
      emptyMsg.textContent = 'No custom colors added yet.';
      colorsList.appendChild(emptyMsg);
      return;
    }
    
    // Create color swatches
    customColors.forEach(color => {
      // Create the swatch element
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.title = color;
      
      // Create the remove button - EMPTY content, let CSS handle it
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.setAttribute('aria-label', 'Remove color');
      removeBtn.title = 'Remove';
      // Ensure button is empty
      removeBtn.innerHTML = '';
      
      // Remove button event
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        
        // Remove from stored colors
        const updatedColors = customColors.filter(c => c !== color);
        
        // Update local storage
        try {
          const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
          if (!settings.colors) settings.colors = {};
          settings.colors.customColors = updatedColors;
          localStorage.setItem('vibecoding-settings', JSON.stringify(settings));
        } catch (e) {
        }
        
        // Update the UI
        updateCustomColors();
      });
      
      // Add button to swatch
      swatch.appendChild(removeBtn);
      
      // Add to container
      colorsList.appendChild(swatch);
    });
  }
  
  // Handle adding colors
  addColorButton.addEventListener('click', () => {
    // Get the color
    const color = colorPicker.value;
    
    // Get current colors
    let customColors = [];
    try {
      const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
      if (!settings.colors) settings.colors = {};
      customColors = settings.colors.customColors || [];
      
      // Add the color if not already present
      if (!customColors.includes(color)) {
        customColors.push(color);
      }
      
      // Save back to localStorage
      settings.colors.customColors = customColors;
      localStorage.setItem('vibecoding-settings', JSON.stringify(settings));
    } catch (e) {
    }
    
    // Update the UI
    updateCustomColors();
  });
  
  // Initialize colors on page load
  updateCustomColors();
});
