/**
 * Manages color-related functionality for animations
 */
class ColorManager {
  constructor() {
    // Modern vivid color palette with improved saturation
    this.colors = [
      "#FF3366", // Vibrant Red
      "#36D1DC", // Bright Cyan
      "#FFDD4A", // Vivid Yellow
      "#66FF99", // Electric Green
      "#CC66FF", // Bright Purple
      "#FF6633", // Bright Orange
      "#00CCFF", // Azure
      "#FF66CC", // Pink
      "#99FF33", // Lime
      "#4D73FF", // Cobalt Blue
    ];

    // Complementary color pairs for special effects
    this.colorPairs = [
      ["#FF3366", "#66FFCC"], // Red + Teal
      ["#36D1DC", "#FF8833"], // Cyan + Orange
      ["#FFDD4A", "#4D73FF"], // Yellow + Blue
      ["#66FF99", "#FF66CC"], // Green + Pink
      ["#CC66FF", "#CCFF66"], // Purple + Lime
    ];
  }

  /**
   * Get a random color from the palette
   */
  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
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

    // Log color conversion for debugging
    console.debug('Color conversion:', {
      input: color,
      output: `rgba(${r}, ${g}, ${b}, ${alpha})`
    });

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
}

export default ColorManager; 