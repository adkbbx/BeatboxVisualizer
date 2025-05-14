// Improved Custom Colors Manager
class CustomColorsManager {
  constructor(containerId, colorManager, settingsManager) {
    this.container = document.getElementById(containerId);
    this.colorManager = colorManager;
    this.settingsManager = settingsManager;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add color button event listener
    const addColorButton = document.getElementById('addColor');
    if (addColorButton) {
      addColorButton.addEventListener('click', () => {
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
          this.addColor(colorPicker.value);
        }
      });
    }
  }

  addColor(color) {
    // Get current color settings
    const colorSettings = this.settingsManager.getSettings('colors');
    
    // Skip if color already exists
    if (colorSettings.customColors.includes(color)) {
      this.showMessage(`Color ${color} already in palette`);
      return;
    }
    
    // Add to settings
    const updatedColors = [...colorSettings.customColors, color];
    
    // Update settings
    this.updateColorSettings(updatedColors);
    
    // Show success message
    this.showMessage(`Added ${color} to palette`);
    
    // Update UI
    this.updateUI();
  }

  removeColor(color) {
    // Get current color settings
    const colorSettings = this.settingsManager.getSettings('colors');
    
    // Remove color
    const updatedColors = colorSettings.customColors.filter(c => c !== color);
    
    // Update settings
    this.updateColorSettings(updatedColors);
    
    // Show message
    this.showMessage(`Removed ${color} from palette`);
    
    // Update UI
    this.updateUI();
  }

  updateColorSettings(customColors) {
    // Update settings manager
    this.settingsManager.updateSettings('colors', { customColors });
    
    // Update color manager
    if (this.colorManager) {
      // Clear existing colors
      this.colorManager.clearCustomColors();
      
      // Add all colors
      customColors.forEach(color => {
        this.colorManager.addCustomColor(color);
      });
    }
  }

  updateUI() {
    if (!this.container) return;
    
    // Clear existing swatches
    this.container.innerHTML = '';
    
    // Get current colors
    const colorSettings = this.settingsManager.getSettings('colors');
    const { customColors } = colorSettings;
    
    // Show empty state or color swatches
    if (customColors.length === 0) {
      this.container.innerHTML = `
        <div class="empty-colors-message">
          No custom colors added yet
        </div>
      `;
    } else {
      // Create swatches for each color
      customColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.title = `${color} (click to remove)`;
        swatch.dataset.color = color;
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.title = `Remove ${color}`;
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeColor(color);
        });
        
        // Add event to swatch itself as alternative way to remove
        swatch.addEventListener('click', () => {
          this.removeColor(color);
        });
        
        // Append to container
        swatch.appendChild(removeBtn);
        this.container.appendChild(swatch);
      });
    }
  }

  showMessage(message) {
    // Create floating message
    const msgEl = document.createElement('div');
    msgEl.className = 'color-message';
    msgEl.textContent = message;
    
    // Add to body
    document.body.appendChild(msgEl);
    
    // Remove after delay
    setTimeout(() => {
      msgEl.classList.add('fade-out');
      setTimeout(() => msgEl.remove(), 500);
    }, 2000);
  }
}

// Export for use in main code
export default CustomColorsManager;
