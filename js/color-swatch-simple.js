/**
 * Simple color swatch management
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get necessary elements
  const colorsList = document.getElementById('customColorsList');
  const addColorButton = document.getElementById('addColor');
  const colorPicker = document.getElementById('colorPicker');
  
  if (!colorsList || !addColorButton || !colorPicker) return;
  
  // Update color swatches display
  function updateColorSwatches() {
    // Clear container
    colorsList.innerHTML = '';
    
    // Get stored colors
    let customColors = [];
    try {
      const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
      customColors = settings.colors?.customColors || [];
    } catch (e) {
    }
    
    // Show empty message or color swatches
    if (customColors.length === 0) {
      colorsList.innerHTML = '<div class="empty-colors-message">No custom colors added yet.</div>';
    } else {
      // Create color swatches
      customColors.forEach(color => {
        // Create swatch with empty button
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = color;
        
        // Create remove button (empty)
        const btn = document.createElement('button');
        btn.setAttribute('aria-label', 'Remove color');
        btn.title = 'Remove';
        
        // Remove color when clicked
        btn.addEventListener('click', e => {
          e.stopPropagation();
          removeColor(color);
        });
        
        // Add to DOM
        swatch.appendChild(btn);
        colorsList.appendChild(swatch);
      });
    }
  }
  
  // Add a new color
  function addColor(color) {
    let customColors = [];
    try {
      // Get current colors
      const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
      if (!settings.colors) settings.colors = {};
      customColors = settings.colors.customColors || [];
      
      // Add color if not already present
      if (!customColors.includes(color)) {
        customColors.push(color);
        settings.colors.customColors = customColors;
        localStorage.setItem('vibecoding-settings', JSON.stringify(settings));
      }
    } catch (e) {
    }
    
    // Update UI
    updateColorSwatches();
  }
  
  // Remove a color
  function removeColor(color) {
    try {
      // Get current colors
      const settings = JSON.parse(localStorage.getItem('vibecoding-settings')) || {};
      if (!settings.colors) settings.colors = {};
      let customColors = settings.colors.customColors || [];
      
      // Remove the color
      customColors = customColors.filter(c => c !== color);
      settings.colors.customColors = customColors;
      localStorage.setItem('vibecoding-settings', JSON.stringify(settings));
    } catch (e) {
    }
    
    // Update UI
    updateColorSwatches();
  }
  
  // Add color when button clicked
  addColorButton.addEventListener('click', () => {
    addColor(colorPicker.value);
  });
  
  // Initial update
  updateColorSwatches();
});
