# Sound-Responsive Fireworks with Custom Images

A web application that captures audio input through a device's microphone, analyzes sound patterns in real-time, and creates dynamic fireworks animations with custom uploaded images on an HTML canvas. Features independent background image animations and advanced visual effects.

## Features

- **Real-time audio analysis** using Web Audio API
  - Volume level detection
  - Sustained sound detection
  - Loud sound burst detection
  
- **Dynamic firework animations** that respond to sound
  - Fireworks rise with sustained sounds
  - Explosion effects with particle systems
  - Custom image display during explosions
  - Support for user-uploaded images
  - Random firework sizes with customizable ranges
  
- **Independent background image system**
  - Smooth transitions between multiple background images
  - Fully independent from firework animations
  - Customizable opacity, transition time, and display duration
  - Real-time settings control
  
- **Advanced dual canvas layer system**
  - Background canvas for image transitions (z-index: 1)
  - Animation canvas for fireworks and effects (z-index: 2)
  - UI elements positioned above everything (z-index: 10)
  - Optimal performance through layer separation
  
- **Comprehensive settings panel**
  - Audio sensitivity and threshold controls
  - Firework physics and visual customization
  - Particle effects configuration
  - Color themes and custom color palettes
  - Background animation controls
  - Real-time visual feedback
  
- **Intuitive UI**
  - Real-time volume visualization
  - Sound detection feedback
  - Tabbed image uploaders (firework images / background images)
  - Responsive design for all devices
  - Easy-to-use settings panel with organized tabs

## How to Use

1. Open the application in a compatible web browser (Chrome, Firefox, Safari, Edge)
2. Click the "Start" button and allow microphone access
3. Upload background images using the "Background Images" tab for ambient visuals
4. Upload custom images using the "Firework Images" tab for explosion effects
5. Make LOUDER, SUSTAINED sounds to launch fireworks
6. Continue making sound to keep fireworks rising
7. Make VERY LOUD sounds to burst all active fireworks
8. Use the settings panel to customize your experience:
   - **Audio tab**: Adjust microphone sensitivity and sound thresholds
   - **Fireworks tab**: Control physics, size, and launch behavior
   - **Particles tab**: Customize explosion particle effects
   - **Effects tab**: Configure visual effects and animation speed
   - **Colors tab**: Choose color themes or create custom palettes
   - **Background tab**: Control background image transitions and opacity

## Technical Implementation

This application is built using:
- HTML5, CSS3, and vanilla JavaScript (ES6 modules)
- Web Audio API for audio capture and analysis
- Dual Canvas API system for optimized rendering
- Responsive design using CSS grid and flexbox

The application architecture consists of:
- **AudioManager**: Handles microphone access and real-time audio analysis
- **AnimationController**: Manages animation canvas rendering and animation loop
- **BackgroundManager**: Manages independent background image transitions
- **FireworkManager**: Controls firework lifecycle and effects
- **ParticleManager**: Handles particle systems for explosions
- **FlowerManager**: Manages custom image animations
- **UIController**: Handles user interface elements and interactions
- **SettingsManager**: Manages audio and visual settings with localStorage persistence

## Recent Enhancements (May 2025)

### ✅ Dual Canvas Layer System
- **Problem Solved**: Fireworks were drawing behind background images
- **Solution**: Implemented separate canvas layers with proper z-index ordering
- **Benefits**: Independent animations, better performance, correct visual hierarchy

### ✅ Independent Background Animation System
- Background images transition smoothly every 5 seconds (customizable)
- Fully independent from firework triggers
- Real-time settings control for opacity, timing, and transitions
- Support for multiple background images with seamless cycling

### ✅ Random Firework Sizes
- Toggle control to enable/disable random firework sizes
- Customizable min/max size ranges
- Each firework can have unique random dimensions
- Settings persist in localStorage

### ✅ Enhanced Color System
- Fixed custom colors visibility bug
- Added complete Earthy color theme
- Improved color picker interface
- Better color theme selection

### ✅ Settings Integration
- All background controls properly connected
- Slider positions match actual values
- Real-time visual feedback
- Organized tabbed interface

## Browser Compatibility

The application requires modern browser features:
- Web Audio API
- Media Devices API (getUserMedia)
- Canvas API (with dual canvas support)
- ES6 Module support

Recommended browsers:
- Chrome (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Edge (latest versions)

## Performance Optimizations

- **Dual Canvas System**: Background and firework rendering optimized separately
- **Independent Animation Loops**: Background animations don't interfere with firework performance
- **GPU Acceleration**: CSS transforms and proper layering leverage hardware acceleration
- **Frame Rate Management**: Background animations limited to 30 FPS for optimal performance
- **Memory Management**: Automatic cleanup of old fireworks and particles

## Development and Future Enhancements

Potential future enhancements include:
- Enhanced image processing for uploaded images
- Multiple animation patterns for image display
- Advanced audio analysis (frequency/pitch detection)
- Custom formation designs for image animations
- Export functionality for recordings
- Social sharing capabilities

## Architecture Notes

The application uses a clean modular architecture with:
- **Separation of Concerns**: Each manager handles specific functionality
- **Independent Systems**: Background and firework animations operate separately
- **Event-Driven Communication**: Components communicate through events
- **Persistent Settings**: User preferences saved in localStorage
- **Responsive Design**: Optimized for desktop and mobile devices

## License

This project is open source and available under the MIT License.