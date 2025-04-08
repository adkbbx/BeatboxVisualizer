/**
 * Manages color-related functionality for animations
 * Enhanced with theme support and color adjustment
 */
class ColorManager {
  constructor() {
    // Add color themes
    this.themes = {
      Vivid: [
        "#FF3366", // Vibrant Red
        "#36D1DC", // Bright Cyan
        "#FFDD4A", // Vivid Yellow
        "#66FF99", // Electric Green
        "#CC66FF", // Bright Purple
        "#FF6633", // Bright Orange
        "#00CCFF", // Azure
        "#FF66CC", // Pink
        "#99FF33", // Lime
        "#4D73FF"  // Cobalt Blue
      ],
      Pastel: [
        "#FFC3A0", // Pastel Orange
        "#A0FFC3", // Pastel Green
        "#C3A0FF", // Pastel Purple
        "#FFD3E8", // Pastel Pink
        "#D3E8FF", // Pastel Blue
        "#FFF7A0", // Pastel Yellow
        "#F0C3FF", // Pastel Lavender
        "#A0FFEE", // Pastel Teal
        "#FFA0A0", // Pastel Red
        "#C9FFBF"  // Pastel Mint
      ],
      Neon: [
        "#FF00FF", // Magenta
        "#00FFFF", // Cyan
        "#FF0000", // Red
        "#00FF00", // Green
        "#FFFF00", // Yellow
        "#0000FF", // Blue
        "#FF00AA", // Hot Pink
        "#00FFAA", // Bright Teal
        "#AAFF00", // Bright Lime
        "#AA00FF"  // Bright Purple
      ],
      Monochrome: [
        "#FFFFFF", // White
        "#EEEEEE", // Light Gray 1
        "#CCCCCC", // Light Gray 2
        "#AAAAAA", // Medium Gray 1
        "#999999", // Medium Gray 2
        "#777777", // Medium Gray 3
        "#666666", // Dark Gray 1
        "#444444", // Dark Gray 2
        "#333333", // Dark Gray 3
        "#111111"  // Almost Black
      ]
    };
    
    // Complementary color pairs for special effects
    this.colorPairs = [
      ["#FF3366", "#66FFCC"], // Red + Teal
      ["#36D1DC", "#FF8833"], // Cyan + Orange
      ["#FFDD4A", "#4D73FF"], // Yellow + Blue
      ["#66FF99", "#FF66CC"], // Green + Pink
      ["#CC66FF", "#CCFF66"], // Purple + Lime
    ];
    
    // Current theme settings
    this.currentTheme = 'Vivid';
    this.customColors = [];
    this.colorIntensity = 1.0;
  }

  /**
   * Set the current color theme
   */
  setTheme(themeName) {
    if (this.themes[themeName] || themeName === 'Custom') {
      this.currentTheme = themeName;
      console.log(`Color theme changed to: ${themeName}`);
    }
  }
  
  /**
   * Set the color intensity/brightness
   */
  setIntensity(value) {
    this.colorIntensity = Math.max(0.5, Math.min(1.5, value));
    console.log(`Color intensity set to: ${this.colorIntensity}`);
  }
  
  /**
   * Add a custom color to the palette
   */
  addCustomColor(color) {
    if (!this.customColors.includes(color)) {
      this.customColors.push(color);
      console.log(`Added custom color: ${color}`);
    }
  }
  
  /**
   * Remove a custom color from the palette
   */
  removeCustomColor(color) {
    this.customColors = this.customColors.filter(c => c !== color);
    console.log(`Removed custom color: ${color}`);
  }

  /**
   * Get a random color from the current theme
   */
  getRandomColor() {
    let palette;
    
    if (this.currentTheme === 'Custom' && this.customColors.length > 0) {
      palette = this.customColors;
    } else if (this.themes[this.currentTheme]) {
      palette = this.themes[this.currentTheme];
    } else {
      // Fallback to Vivid theme if theme not found
      palette = this.themes.Vivid;
    }
    
    const randomIndex = Math.floor(Math.random() * palette.length);
    let color = palette[randomIndex];
    
    // Apply intensity adjustment if not 1.0
    if (this.colorIntensity !== 1.0) {
      color = this.adjustColorBrightness(color, this.colorIntensity);
    }
    
    return color;
  }

  /**
   * Get a random color pair
   */
  getRandomColorPair() {
    return this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
  }

  /**
   * Get a color with alpha transparency
   */
  getColorWithAlpha(color, alpha) {
    let r, g, b;

    if (typeof color === 'object') {
      if (color.rgb) {
        // Handle new color object format
        r = color.rgb.r;
        g = color.rgb.g;
        b = color.rgb.b;
      } else if (color.r !== undefined) {
        // Handle legacy RGB object format
        r = color.r;
        g = color.g;
        b = color.b;
      }
    } else if (typeof color === 'string') {
      // Handle hex color string
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Convert RGB values to hex color string
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  /**
   * Helper method to adjust color brightness
   */
  adjustColorBrightness(hex, factor) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Adjust brightness
    const adjustedR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const adjustedG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const adjustedB = Math.min(255, Math.max(0, Math.round(b * factor)));
    
    // Convert back to hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
  }
}

export default ColorManager;