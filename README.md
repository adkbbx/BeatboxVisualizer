# 🎆 VibeCoding - Sound-Responsive Animation Studio

A powerful web application that transforms sound into stunning visual experiences. Create dynamic fireworks and bubble animations that respond to your microphone input, with custom images, backgrounds, and comprehensive customization options.

## ✨ Features Overview

### 🎵 **Dual Animation Modes with Advanced Management**
- **🎆 Fireworks Mode**: Classic explosive animations with particle effects and realistic physics
- **🫧 Bubble Mode**: Floating bubble animations with natural movement and pop mechanics
- **Intelligent Mode Manager**: Seamless switching with state preservation and UI adaptation
- **Mode-Specific Settings**: Dedicated controls and presets for each animation type
- **Persistent Mode Memory**: Automatically remembers your preferred mode

### 🎤 **Professional Audio Analysis System**
- **Real-Time Audio Processing**: Advanced Web Audio API integration with frequency analysis
- **Multi-Threshold Detection**: Separate sensitivity controls for launch, burst, and sudden sounds
- **Sustained Sound Tracking**: Continuous audio monitoring with duration-based effects
- **Volume Categorization**: Smart classification of quiet, normal, and loud audio levels
- **Audio Visualization**: Real-time volume meter with microphone status indicators
- **Sound Effects Integration**: Realistic launch and explosion sounds for test animations

### 🚀 **Advanced Launch Control System**
- **Position Control**: Center-only, range-based, or full-screen random positioning
- **Angle Management**: Fixed angles, range-based variation, or completely random trajectories
- **Launch Power Settings**: Configurable height with random variation options
- **Launch Presets**: 7 built-in patterns including Classic, Wide Celebration, Fountain, Chaos Mode
- **Real-Time Adjustment**: Live parameter tuning with instant visual feedback
- **Physics Simulation**: Realistic gravity, velocity, and trajectory calculations

### 🎨 **Comprehensive Visual Customization**
- **Custom Image System**: Upload and manage your own images for animations
- **Background Manager**: Independent slideshow system with transition controls
- **Color Theme Engine**: 6 built-in themes plus custom color creation
- **Particle Effects**: Configurable explosion intensity, size, and behavior
- **Visual Effects**: Glow effects, smoke trails, and transparency controls
- **Size Variation**: Random or fixed sizing with min/max range controls

### 🎛️ **Advanced Settings Management**
- **Tabbed Settings Panel**: Organized controls for Audio, Fireworks, Bubbles, Effects, Images, and Colors
- **Persistent Storage**: All settings automatically saved and restored
- **Real-Time Updates**: Instant application of setting changes
- **Setting Validation**: Smart bounds checking and error prevention
- **Export/Import**: Save and share your configurations
- **Reset Functionality**: Quick restoration to default values

### 📦 **Preset System**
- **Preset Discovery**: Automatic scanning of `/presets/` folder for image collections
- **External Preset Loading**: Import preset folders using File System Access API
- **Preset Management**: Load, preview, and organize your image collections
- **Smart Categorization**: Automatic separation of animation and background images
- **Batch Operations**: Clear all images or load entire preset collections
- **Preset Validation**: Automatic checking for valid image formats and structure

### 📱 **Mobile-Optimized Experience**
- **Responsive Design**: Adaptive layout for all screen sizes and orientations
- **Touch-Friendly Controls**: Large buttons and intuitive gesture support
- **Mobile Mode Toggle**: Dedicated mobile interface for mode switching
- **Optimized Performance**: Battery-efficient rendering and processing
- **Landscape Support**: Full functionality in both portrait and landscape modes
- **Accessibility**: Screen reader support and keyboard navigation

### 🔧 **Performance & Technical Features**
- **Dual Canvas System**: Optimized rendering with background and animation layers
- **Memory Management**: Automatic cleanup and resource optimization
- **Frame Rate Control**: Adaptive performance scaling based on device capabilities
- **GPU Acceleration**: Hardware-accelerated rendering where available
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Error Recovery**: Graceful handling of audio and rendering failures

## 🚀 Quick Start

1. **Launch the Application**
   - Open `index.html` in any modern web browser
   - Chrome, Firefox, Safari, or Edge recommended for best performance

2. **Enable Audio Input**
   - Click the "🎤 Start" button in the control panel
   - Allow microphone access when prompted by your browser
   - Verify audio detection with the real-time volume meter

3. **Choose Your Animation Mode**
   - **Desktop**: Use the mode toggle dropdown in the top-right
   - **Mobile**: Tap the mode button in the main control panel
   - Switch between Fireworks 🎆 and Bubbles 🫧 anytime

4. **Upload Custom Content** (Optional)
   - **Animation Images**: Upload images that appear during explosions/pops
   - **Background Images**: Add ambient background visuals with slideshow
   - **Presets**: Load entire collections from the `/presets/` folder

5. **Test Your Setup**
   - Click "🎆 Test" to launch a sample animation
   - Adjust settings in the Settings panel (⚙️ button)
   - Fine-tune audio sensitivity for your environment

6. **Start Creating**
   - **Sustained sounds**: Launch new animations
   - **Loud bursts**: Trigger multiple effects simultaneously
   - **Continuous sound**: Keep animations active and rising

## 🎆 Fireworks Mode

### Core Features
- **Dynamic Launch System**: Fireworks rise with sustained audio input
- **Realistic Physics**: Gravity-based trajectories with velocity calculations
- **Particle Explosions**: Customizable burst effects with uploaded images
- **Smoke Trails**: Adjustable intensity trailing effects
- **Size Variation**: Random or fixed dimensions with range controls
- **Color Integration**: Theme-based colors with custom image color extraction

### Launch Controls
- **Position Modes**:
  - **Center Only**: All fireworks launch from screen center
  - **Range**: Configurable spread from center point (0-100% screen width)
  - **Random**: Completely random positioning across screen

- **Angle Controls**:
  - **Range Mode**: Center angle ± spread (e.g., 90° ± 30°)
  - **Fixed Mode**: All fireworks use same angle
  - **Random Mode**: Completely random trajectories

- **Power Settings**:
  - **Launch Height**: 10-100% of screen height
  - **Random Power**: Variable launch strength with min/max ranges
  - **Duration-Based**: Launch power scales with sustained sound duration

### Launch Presets
- **🎆 Classic**: Traditional center launches with slight spread
- **🎉 Wide Celebration**: Full-screen launches with wide angle variety
- **⛲ Fountain**: Center launches with very wide angles
- **🚀 Straight Rockets**: Various positions, always vertical
- **↖️ Left Cascade**: Fireworks leaning toward left side
- **↗️ Right Cascade**: Fireworks leaning toward right side
- **🌪️ Chaos Mode**: Completely random everything

### Physics & Behavior
- **Gravity Control**: Adjustable fall speed (0.01-0.2)
- **Max Fireworks**: Limit active fireworks (1-50)
- **Size Settings**: Base size (0.5-5.0x) with random variation
- **Smoke Trails**: Intensity control (0-100%)
- **Auto-Explosion**: Test fireworks explode at peak height

## 🫧 Bubble Mode

### Core Features
- **Realistic Bubble Physics**: Natural floating movement with wobble
- **Pop Mechanics**: Bubbles burst with satisfying visual effects
- **Cluster System**: Multiple bubbles per launch with spread control
- **Transparency Effects**: Realistic bubble appearance with light refraction
- **Sound Integration**: Launch and pop sound effects
- **Auto-Pop Heights**: Configurable altitude-based popping

### Launch Controls
- **Position Modes**: Same as fireworks (center, range, random)
- **Cluster Settings**:
  - **Bubbles per Launch**: 0-8 bubbles per sound trigger
  - **Cluster Spread**: How far apart bubbles spawn (5-100px)
  - **Random Clusters**: Variable bubble count per launch

- **Rise Speed Controls**:
  - **Base Speed**: 0.5-5.0 units per frame
  - **Random Speeds**: Variable rise rates with min/max ranges
  - **Speed Variation**: Each bubble can have different speeds

### Bubble Presets
- **🫧 Gentle**: Small clusters, slow rise, moderate pop heights
- **🎉 Celebration**: Large clusters, fast rise, random pop heights
- **⛲ Fountain**: Center launches with many bubbles
- **🌊 Stream**: Single bubbles in steady stream
- **🌪️ Chaos**: Random everything for maximum variety
- **🕊️ Peaceful**: Slow, spread-out bubbles with gentle variations
- **🎊 Party**: Fast, energetic bubbles launching everywhere

### Physics & Behavior
- **Bubble Gravity**: How much gravity affects bubbles (0.005-0.05)
- **Wobble Intensity**: Side-to-side movement while rising (0-3.0)
- **Buoyancy**: Resistance to gravity (0.9-1.0)
- **Auto-Pop Height**: Altitude where test bubbles automatically pop
- **Random Pop Heights**: Variable pop altitudes for variety
- **Max Bubbles**: Limit active bubbles (5-50)

## 🎨 Customization System

### Audio Settings
- **Microphone Sensitivity**: Fine-tune input detection (0.5-4.0x)
- **Launch Threshold**: Minimum volume to trigger animations (0.02-0.2)
- **Burst Threshold**: Volume needed for multi-explosions (0.1-1.0)
- **Sudden Sound Detection**: Quick response sensitivity (0.05-0.3)
- **Test Sound Effects**: Enable/disable animation sounds
- **Sound Volume**: Master volume for all effects (0-100%)

### Visual Effects Settings
- **Animation Speed**: Global speed multiplier (0.1-2.0x)
- **Particle Count**: Explosion particle density (10-500)
- **Particle Lifespan**: How long particles stay visible (20-200 frames)
- **Particle Size Range**: Min/max particle dimensions
- **Colorful Particles**: Multi-color vs single-color explosions
- **Glow Effects**: Glowing aura around animations
- **Fade Resistance**: How quickly particles disappear (0.8-0.99)

### Image Management
- **Background Removal**: Auto-remove white/solid backgrounds from uploads
- **Image Rotation**: Spinning images during explosions
- **Image Gravity**: How fast images fall after exploding (0-3.0x)
- **Background Opacity**: Slideshow image transparency (0-100%)
- **Transition Time**: Background fade duration (0.5-5 seconds)
- **Display Duration**: How long each background shows (2-20 seconds)

### Color System
- **Built-in Themes**:
  - **🌈 Vivid**: Bright and bold colors
  - **🌸 Pastel**: Soft and gentle tones
  - **⚡ Neon**: Electric and glowing colors
  - **🍂 Earthy**: Natural and warm tones
  - **⚫ Monochrome**: Black and white only
  - **🎨 Custom**: Your own color palette

- **Color Intensity**: Adjust overall vividness (0.1-2.0x)
- **Custom Colors**: Create and manage your own color swatches
- **Color Extraction**: Automatic color detection from uploaded images

## 📦 Preset Management

### Preset Discovery
- **Automatic Scanning**: Finds preset folders in `/presets/` directory
- **Structure Validation**: Checks for proper `flowers/` and `skies/` subfolders
- **Image Detection**: Automatically counts and categorizes images
- **Format Support**: JPG, PNG, GIF, WebP in various cases
- **Preview Generation**: Thumbnail previews of preset contents

### Preset Loading
- **One-Click Loading**: Instant application of entire preset collections
- **Progress Tracking**: Visual feedback during large preset loads
- **Error Handling**: Graceful handling of missing or corrupted files
- **Batch Processing**: Efficient loading of multiple images
- **Memory Management**: Automatic cleanup of previous presets

### External Presets
- **File System Access**: Load presets from any folder on your device
- **Drag & Drop**: Direct folder dropping for preset import
- **Validation**: Automatic checking of folder structure and contents
- **Fallback Support**: Alternative loading methods for unsupported browsers
- **Cross-Platform**: Works on Windows, Mac, Linux, and mobile devices

### Preset Organization
- **Categorization**: Automatic separation of animation vs background images
- **Statistics**: Display of image counts and types
- **Management**: Clear individual presets or all images at once
- **Persistence**: Loaded presets remain until manually cleared
- **Preview System**: See preset contents before loading

## 📱 Mobile Experience

### Responsive Interface
- **Adaptive Layout**: Automatically adjusts to screen size and orientation
- **Touch Optimization**: Large, finger-friendly controls and buttons
- **Gesture Support**: Swipe and tap interactions throughout the interface
- **Collapsible Panels**: Space-efficient design with expandable sections
- **Mobile Mode Toggle**: Dedicated interface for easy mode switching

### Performance Optimization
- **Battery Efficiency**: Optimized rendering to preserve battery life
- **Memory Management**: Careful resource usage for mobile devices
- **Frame Rate Scaling**: Adaptive performance based on device capabilities
- **Touch Responsiveness**: Immediate feedback for all touch interactions
- **Orientation Support**: Full functionality in portrait and landscape

### Mobile-Specific Features
- **Simplified Controls**: Essential functions prioritized for small screens
- **Quick Access**: Most-used settings easily reachable
- **Visual Feedback**: Clear indication of active states and selections
- **Error Prevention**: Smart defaults and validation for mobile use
- **Accessibility**: Screen reader support and high contrast options

## 🛠 Technical Architecture

### Core Technologies
- **HTML5 Canvas**: Dual-layer rendering system for optimal performance
- **Web Audio API**: Professional-grade real-time audio processing
- **ES6 Modules**: Modern JavaScript architecture with clean separation
- **CSS Grid/Flexbox**: Responsive layout system for all devices
- **File System Access API**: Modern file handling for preset management

### System Components

#### Audio System
- **AudioManager**: Microphone capture and real-time analysis
- **AudioAnalyzer**: Frequency analysis and volume categorization
- **SustainedSoundDetector**: Continuous sound monitoring and tracking
- **SoundEffects**: Realistic audio feedback for animations

#### Animation System
- **AnimationController**: Main animation loop and canvas management
- **ModeManager**: Dual-mode system with intelligent switching
- **FireworkManager**: Firework physics, trajectories, and explosions
- **BubbleManager**: Bubble physics, floating behavior, and popping
- **ParticleManager**: Particle system for explosions and effects

#### Management Systems
- **LaunchControlsManager**: Advanced launch parameter management
- **PresetManager**: Preset discovery, loading, and organization
- **SettingsManager**: Configuration persistence and validation
- **ColorManager**: Color theme management and custom palette creation
- **ImageManager**: Custom image processing and explosion effects
- **BackgroundManager**: Independent background slideshow system

#### User Interface
- **UIController**: Main interface coordination and event handling
- **SettingsController**: Tabbed settings panel with real-time updates
- **PresetUI**: Preset discovery and management interface
- **ModeToggle**: Desktop and mobile mode switching components

### Performance Features
- **Dual Canvas Rendering**: Separate layers for background and animations
- **Memory Pool Management**: Efficient object reuse and cleanup
- **Frame Rate Adaptation**: Dynamic performance scaling
- **GPU Acceleration**: Hardware-accelerated rendering where supported
- **Lazy Loading**: On-demand resource loading for better startup times
- **Error Recovery**: Graceful degradation and automatic recovery

### File Organization
```
VibeCoding/
├── index.html                    # Main application entry point
├── css/                          # Stylesheets
│   ├── style.css                # Core application styles
│   ├── layout.css               # Responsive grid layout
│   ├── mobile-responsive.css    # Mobile optimizations
│   ├── settings.css             # Settings panel styles
│   ├── uploaders.css            # Upload interface styles
│   ├── presets.css              # Preset management styles
│   └── components.css           # Reusable UI components
├── js/                          # JavaScript modules
│   ├── main.js                  # Application initialization
│   ├── animationController.js   # Main animation coordination
│   ├── SoundEffects.js          # Audio feedback system
│   ├── audio/                   # Audio processing modules
│   │   ├── AudioManager.js      # Main audio controller
│   │   ├── AudioAnalyzer.js     # Real-time audio analysis
│   │   └── SustainedSoundDetector.js # Continuous sound tracking
│   ├── modes/                   # Animation mode system
│   │   ├── ModeManager.js       # Mode switching and management
│   │   ├── FireworkMode/        # Firework-specific components
│   │   │   ├── FireworkManager.js    # Firework physics and control
│   │   │   ├── FireworkFactory.js    # Firework creation and parameters
│   │   │   ├── TestFireworkManager.js # Test button functionality
│   │   │   └── ParticleManager.js    # Particle explosion system
│   │   └── BubbleMode/          # Bubble-specific components
│   │       ├── BubbleManager.js      # Bubble physics and control
│   │       └── TestBubbleManager.js  # Test button functionality
│   ├── managers/                # Core management systems
│   │   ├── LaunchControlsManager.js  # Advanced launch controls
│   │   ├── PresetManager.js          # Preset system management
│   │   ├── SettingsManager.js        # Configuration management
│   │   ├── ColorManager.js           # Color theme system
│   │   ├── ImageManager.js           # Custom image processing
│   │   ├── BackgroundManager.js      # Background slideshow
│   │   └── ClearManager.js           # Data clearing operations
│   ├── ui/                      # User interface components
│   │   ├── uiController.js      # Main UI coordination
│   │   ├── PresetUI.js          # Preset management interface
│   │   ├── panel-controls.js    # Control panel functionality
│   │   ├── mode-toggle-dropdown.js  # Mode switching UI
│   │   ├── tab-switcher.js      # Settings tab navigation
│   │   └── settings-swatch-fix.js   # Color swatch fixes
│   ├── settings/                # Settings system
│   │   ├── SettingsController.js     # Settings panel controller
│   │   ├── AnimationSettingsManager.js # Animation-specific settings
│   │   ├── DefaultSettings.js        # Default configuration values
│   │   ├── SettingsTabs.js          # Tab management
│   │   └── CustomColorsManager.js   # Custom color management
│   ├── effects/                 # Visual effects
│   │   ├── SmokeTrailEffect.js  # Firework smoke trails
│   │   ├── SoundVisualization.js # Audio visualization
│   │   └── CustomImage.js       # Custom image explosion effects
│   ├── utils/                   # Utility functions
│   │   ├── ImageProcessor.js    # Image processing and optimization
│   │   ├── ColorExtractor.js    # Color analysis from images
│   │   └── BackgroundRemover.js # Background removal algorithms
│   └── uploaders/               # File upload handling
│       ├── direct-image-uploader.js     # Animation image uploads
│       └── direct-background-uploader.js # Background image uploads
├── sounds/                      # Audio assets
│   ├── launch.mp3              # Firework launch sound
│   ├── burst.mp3               # Explosion sound
│   ├── bubble-launch.mp3       # Bubble creation sound
│   └── bubble-pop.mp3          # Bubble pop sound
└── presets/                    # Image preset collections
    ├── example-preset/         # Example preset folder
    │   ├── flowers/            # Animation images
    │   └── skies/              # Background images
    └── README.md               # Preset creation guide
```

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome**: Version 80+ (Recommended for best performance)
- **Firefox**: Version 75+ (Full feature support)
- **Safari**: Version 13+ (iOS and macOS)
- **Edge**: Version 80+ (Chromium-based)

### Required Features
- **Web Audio API**: For real-time audio processing
- **Media Devices API**: For microphone access (getUserMedia)
- **Canvas API**: For dual-layer rendering system
- **ES6 Modules**: For modern JavaScript architecture
- **CSS Grid/Flexbox**: For responsive layout
- **File System Access API**: For external preset loading (optional)

### Feature Degradation
- **File System Access**: Falls back to file input for unsupported browsers
- **Audio Context**: Graceful handling of audio permission denials
- **Canvas Support**: Error recovery for rendering failures
- **Mobile Optimization**: Adaptive performance scaling

## 🎯 Use Cases

### Entertainment & Events
- **Interactive Parties**: Sound-responsive visuals that react to music and conversation
- **Live Music Visualization**: Real-time audio-visual experiences for concerts
- **Gaming Integration**: Interactive sound-based gameplay elements
- **Art Installations**: Digital art pieces with audio interaction
- **Streaming Overlays**: Engaging visual backgrounds for live streams

### Educational Applications
- **Audio Science**: Visualize sound wave concepts and frequency analysis
- **Physics Demonstrations**: Particle motion, gravity, and trajectory physics
- **Creative Coding**: Learn web technologies and animation programming
- **STEM Education**: Interactive demonstrations of scientific concepts
- **Music Education**: Visual representation of rhythm and volume

### Professional Uses
- **Presentation Enhancement**: Dynamic backgrounds for engaging presentations
- **Digital Signage**: Responsive environmental displays for public spaces
- **Therapy Applications**: Calming bubble animations for relaxation therapy
- **Accessibility Tools**: Visual feedback for audio-based interactions
- **Research**: Audio-visual correlation studies and user interaction research

### Creative Projects
- **Interactive Art**: Sound-responsive installations and exhibitions
- **Music Videos**: Real-time visual generation synchronized to audio
- **Performance Art**: Live visual accompaniment to musical performances
- **Social Media**: Engaging content creation with custom visuals
- **Personal Expression**: Create unique visual experiences with your own images

## 🔧 Development & Customization

### Getting Started
1. **Clone or Download**: Get the project files to your local machine
2. **Local Server**: Serve files through a local web server (required for modules)
3. **Browser Testing**: Test across different browsers and devices
4. **Customization**: Modify settings, add new presets, or extend functionality

### Adding Custom Presets
1. **Create Folder**: Make a new folder in `/presets/` directory
2. **Add Subfolders**: Create `flowers/` and `skies/` subdirectories
3. **Add Images**: Place animation images in `flowers/`, backgrounds in `skies/`
4. **Supported Formats**: JPG, PNG, GIF, WebP (max 5MB per image)
5. **Discovery**: Use "Discover Presets" button to scan for new presets

### Extending Functionality
- **New Animation Modes**: Add to `/js/modes/` directory
- **Custom Effects**: Extend `/js/effects/` with new visual effects
- **Additional Audio Analysis**: Enhance `/js/audio/` modules
- **UI Components**: Add new interface elements in `/js/ui/`
- **Settings Categories**: Extend settings system with new tabs

### Performance Tuning
- **Canvas Resolution**: Adjust rendering resolution for performance
- **Particle Limits**: Reduce particle counts for slower devices
- **Frame Rate**: Implement adaptive frame rate limiting
- **Memory Management**: Optimize image loading and cleanup
- **Audio Buffer Size**: Adjust for latency vs performance balance

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to the license terms.

## 🙏 Acknowledgments

- **Web Audio API Community**: For audio processing techniques and best practices
- **Canvas Animation Tutorials**: For rendering optimization and animation principles
- **Mobile-First Design**: For responsive design patterns and touch optimization
- **Accessibility Guidelines**: For inclusive web application development
- **Open Source Community**: For inspiration and collaborative development practices

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the Repository**: Create your own copy of the project
2. **Create Feature Branch**: Work on new features in dedicated branches
3. **Test Thoroughly**: Ensure compatibility across browsers and devices
4. **Document Changes**: Update README and code comments as needed
5. **Submit Pull Request**: Share your improvements with the community

### Areas for Contribution
- **New Animation Modes**: Additional visual effects and behaviors
- **Audio Analysis**: Enhanced sound detection and processing
- **Mobile Optimization**: Further performance improvements for mobile devices
- **Accessibility**: Screen reader support and keyboard navigation
- **Internationalization**: Multi-language support for global users

---

**Made with ❤️ for the creative coding community**

*Transform your sound into visual magic with VibeCoding!*

**🎆 Ready to create? Launch the app and let your voice paint the sky! 🎆**