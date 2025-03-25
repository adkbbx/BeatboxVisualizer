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
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

export default ColorManager; 