# Sound-Responsive Animation Controller

A web application that captures audio input through a device's microphone, analyzes sound patterns in real-time, and uses this data to control animations of images on an HTML canvas.

## Features

- **Real-time audio analysis** using Web Audio API
  - Volume level detection
  - Sudden sound detection (claps, snaps)
  - Sustained sound detection
  
- **Dynamic animations** that respond to sound
  - Multiple animation presets (bounce, rotate, scale, path follow)
  - Custom image upload support
  - Adjustable animation parameters
  
- **Intuitive UI**
  - Real-time volume visualization
  - Easy-to-use settings panel
  - Sound mapping reference guide

## How to Use

1. Open the application in a compatible web browser (Chrome, Firefox, Safari, Edge)
2. Click the "Start Microphone" button and allow microphone access
3. Make sounds to see the animation respond
4. Use the settings panel to customize the experience:
   - Adjust microphone sensitivity
   - Set volume thresholds
   - Change animation presets
   - Upload custom images
   - Adjust animation speed

## Technical Implementation

This application is built using:
- HTML5, CSS3, and vanilla JavaScript
- Web Audio API for audio capture and analysis
- Canvas API for rendering animations
- Responsive design using CSS flexbox and media queries

The application architecture consists of:
- **AudioManager**: Handles microphone access and audio analysis
- **AnimationController**: Manages canvas rendering and animation logic
- **UIController**: Handles user interface elements and interactions

## Browser Compatibility

The application requires modern browser features:
- Web Audio API
- Media Devices API (getUserMedia)
- Canvas API

Recommended browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Development and Future Enhancements

Potential future enhancements include:
- Multiple simultaneous animations
- Advanced audio analysis (frequency/pitch detection)
- Custom animation sequence creation
- Audio filtering options
- Social features for sharing configurations

## License

This project is open source and available under the MIT License. 