# Sound-Responsive Fireworks with Custom Images

A web application that captures audio input through a device's microphone, analyzes sound patterns in real-time, and creates dynamic fireworks animations with custom uploaded images on an HTML canvas.

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
  
- **Intuitive UI**
  - Real-time volume visualization
  - Sound detection feedback
  - Easy-to-use settings panel
  - Responsive design for all devices

## How to Use

1. Open the application in a compatible web browser (Chrome, Firefox, Safari, Edge)
2. Click the "Start" button and allow microphone access
3. Make LOUDER, SUSTAINED sounds to launch fireworks
4. Continue making sound to keep fireworks rising
5. Make VERY LOUD sounds to burst all active fireworks
6. Upload custom images through the uploader panel
7. Use the settings panel to customize the experience:
   - Adjust microphone sensitivity
   - Set quiet and loud thresholds
   - Adjust sudden sound detection
   - Control firework size or enable random sizing
   - Customize particle effects and colors
   - Configure background image rotation

## Technical Implementation

This application is built using:
- HTML5, CSS3, and vanilla JavaScript (ES6 modules)
- Web Audio API for audio capture and analysis
- Canvas API for rendering animations
- Responsive design using CSS grid and flexbox

The application architecture consists of:
- **AudioManager**: Handles microphone access and real-time audio analysis
- **AnimationController**: Manages canvas rendering and animation loop
- **FireworkManager**: Controls firework lifecycle and effects
- **ParticleManager**: Handles particle systems for explosions
- **FlowerManager**: Manages custom image animations
- **UIController**: Handles user interface elements and interactions

## Browser Compatibility

The application requires modern browser features:
- Web Audio API
- Media Devices API (getUserMedia)
- Canvas API
- ES6 Module support

Recommended browsers:
- Chrome (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Edge (latest versions)

## Development and Future Enhancements

Potential future enhancements include:
- Enhanced image processing for uploaded images
- Multiple animation patterns for image display
- Advanced audio analysis (frequency/pitch detection)
- Performance optimizations for particle systems
- Custom formation designs for image animations

## License

This project is open source and available under the MIT License.