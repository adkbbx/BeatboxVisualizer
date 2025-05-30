/**
 * 🇺🇸 English Translations - Vibecoding Fireworks App
 * 
 * Master translation file containing all user-facing text content.
 * This serves as the template for all other language files.
 */

export const translations = {
    // UI Controls and Navigation
    ui: {
        buttons: {
            start: "Start",
            stop: "Stop",
            test: "Test",
            settings: "Settings",
            hide: "Hide",
            show: "Show",
            close: "Close Settings",
            reset: "Reset",
            load: "Load",
            preview: "Preview",
            discover: "Discover",
            clearAll: "Clear All",
            selectFiles: "Select Files",
            ok: "OK",
            cancel: "Cancel"
        },
        modes: {
            fireworks: "Fireworks",
            bubbles: "Bubbles"
        },
        tabs: {
            animationImages: "Animation Images",
            backgroundImages: "Background Images",
            presets: "Presets"
        },
        status: {
            starting: "Starting...",
            stopping: "Stopping...",
            loading: "Loading...",
            discovering: "Discovering...",
            clearing: "Clearing...",
            testing: "Testing...",
            uploading: "Uploading...",
            processing: "Processing..."
        },
        language: {
            selector: "Language",
            english: "English",
            japanese: "日本語",
            chineseSimplified: "简体中文",
            chineseTraditional: "繁體中文"
        }
    },

    // Audio System
    audio: {
        status: {
            active: "Audio status: active",
            inactive: "Audio status: inactive",
            starting: "Audio status: starting...",
            stopping: "Audio status: stopping...",
            error: "Audio status: error",
            failed: "Audio status: failed to start",
            denied: "Microphone Access Denied",
            unsupported: "Audio not supported in this browser"
        },
        instructions: {
            main: "Make LOUDER, SUSTAINED sounds to launch animations. Keep making sound to keep them rising. VERY LOUD sounds will trigger all active animations! 🔊",
            detection: "Make LOUDER, SUSTAINED sound to start animations",
            inactive: "Microphone inactive - no sound detected",
            tapToStart: "Tap the microphone button to start audio detection"
        },
        errors: {
            permissionDenied: "Microphone permission denied. Please enable microphone access in your browser settings.",
            deviceNotFound: "No microphone device found.",
            deviceBusy: "Microphone is being used by another application.",
            generic: "Unable to access microphone. Please check your device settings."
        },
        title: "🎤 Audio & Sound Settings",
        microphoneSensitivity: "Microphone Sensitivity",
        microphoneSensitivityDesc: "How sensitive the microphone is to your voice and sounds.",
        launchSensitivity: "Launch Sensitivity",
        launchSensitivityDesc: "How quiet your voice can be to still launch fireworks.",
        burstSensitivity: "Burst Sensitivity",
        burstSensitivityDesc: "How loud you need to be to explode all bubbles at once.",
        quickResponse: "Quick Response",
        quickResponseDesc: "How quickly the app responds to sudden sounds.",
        testSounds: "Test Animation Sounds",
        testSoundsDesc: "Play realistic launch and explosion sounds when testing animations (fireworks/bubbles).",
        soundVolume: "Sound Volume",
        soundVolumeDesc: "Volume level for animation sound effects.",
        volumeThreshold: "Volume Threshold",
        volumeThresholdDesc: "Minimum volume level required to trigger animations."
    },

    // Settings Panel
    settings: {
        title: "Animation Settings",
        tabs: {
            audio: "🎤 Audio",
            fireworks: "🎆 Fireworks",
            bubbles: "🫧 Bubbles",
            effects: "✨ Effects",
            images: "🖼️ Images",
            colors: "🎨 Colors"
        },
        audio: {
            title: "🎤 Audio & Sound Settings",
            microphoneSensitivity: "Microphone Sensitivity",
            microphoneSensitivityDesc: "How sensitive the microphone is to your voice and sounds.",
            launchSensitivity: "Launch Sensitivity",
            launchSensitivityDesc: "How quiet your voice can be to still launch fireworks.",
            burstSensitivity: "Burst Sensitivity",
            burstSensitivityDesc: "How loud you need to be to explode all bubbles at once.",
            quickResponse: "Quick Response",
            quickResponseDesc: "How quickly the app responds to sudden sounds.",
            testSounds: "Test Animation Sounds",
            testSoundsDesc: "Play realistic launch and explosion sounds when testing animations (fireworks/bubbles).",
            soundVolume: "Sound Volume",
            soundVolumeDesc: "Volume level for animation sound effects.",
            volumeThreshold: "Volume Threshold",
            volumeThresholdDesc: "Minimum volume level required to trigger animations."
        },
        fireworks: {
            title: "🎆 Fireworks Settings",
            launchControls: "🚀 Launch Controls",
            launchPosition: "🎯 Launch Position",
            positionMode: "Position Mode",
            positionModeDesc: "How fireworks are positioned along the bottom of the screen",
            centerOnly: "Center Only",
            rangeFromCenter: "Range from Center",
            randomAcrossScreen: "Random Across Screen",
            launchSpread: "Launch Spread",
            launchSpreadDesc: "Width of the launch zone (0% = center point, 100% = entire screen width)",
            centerOnlyLabel: "Center Only",
            fullWidthLabel: "Full Width",
            launchAngle: "📐 Launch Angle",
            angleMode: "Angle Mode",
            angleModeDesc: "How launch angles are determined",
            angleRange: "Angle Range",
            fixedAngle: "Fixed Angle",
            randomAngle: "Random Angle",
            centerAngle: "Center Angle",
            centerAngleDesc: "The main direction fireworks will launch toward",
            rightAngle: "45° (Right)",
            upAngle: "90° (Up)",
            leftAngle: "135° (Left)",
            angleSpread: "Angle Spread",
            angleSpreadDesc: "How much angles can vary from the center (±spread)",
            preciseAngle: "0° (Precise)",
            wideVariety: "45° (Wide Variety)",
            fixedAngleLabel: "Fixed Angle",
            fixedAngleDesc: "Fixed launch angle for all fireworks",
            rightFixed: "45° (Right)",
            straightUp: "90° (Straight Up)",
            leftFixed: "135° (Left)",
            launchPower: "🚀 Launch Power",
            launchPowerLabel: "Launch Power",
            launchPowerDesc: "How high fireworks reach (10% = 10% of screen height, 100% = 90% of screen height)",
            lowPower: "10% (Low)",
            highPower: "100% (High)",
            randomLaunchPower: "Random Launch Power",
            randomLaunchPowerDesc: "Each firework will have a different random launch power for more variety.",
            minimumPower: "Minimum Power",
            minimumPowerDesc: "Minimum launch power for random fireworks.",
            veryLow: "10% (Very Low)",
            high: "80% (High)",
            maximumPower: "Maximum Power",
            maximumPowerDesc: "Maximum launch power for random fireworks.",
            lowLabel: "20% (Low)",
            maximum: "100% (Maximum)",
            quickPresets: "⚡ Quick Presets",
            launchPattern: "Launch Pattern",
            selectPreset: "-- Select Preset --",
            presetDescription: "Choose a preset to quickly configure launch settings",
            fireworkAppearance: "✨ Firework Appearance",
            sizeSettings: "📏 Size Settings",
            fireworkSize: "Firework Size",
            fireworkSizeDesc: "Controls how big fireworks and uploaded images appear during explosions.",
            randomFireworkSizes: "Random Firework Sizes",
            randomFireworkSizesDesc: "Each firework will have a different random size for more variety.",
            smallestSize: "Smallest Size",
            smallestSizeDesc: "Minimum size for random fireworks.",
            largestSize: "Largest Size",
            largestSizeDesc: "Maximum size for random fireworks.",
            physicsAndBehavior: "⚙️ Physics & Behavior",
            physicsSettings: "🌍 Physics Settings",
            maxFireworksOnScreen: "Max Fireworks on Screen",
            maxFireworksOnScreenDesc: "Maximum number of fireworks that can be active at the same time.",
            gravityStrength: "Gravity Strength",
            gravityStrengthDesc: "How quickly fireworks fall back down (higher = faster falling).",
            smokeTrail: "Smoke Trail",
            smokeTrailDesc: "Intensity of the smoke trail behind rising fireworks.",
            maxFireworks: "Max Fireworks",
            maxFireworksDesc: "Maximum number of fireworks that can be active at once.",
            launchHeight: "Launch Height",
            launchHeightDesc: "How high fireworks launch before exploding.",
            explosionSize: "Explosion Size",
            explosionSizeDesc: "Size of firework explosions.",
            particleCount: "Particle Count",
            particleCountDesc: "Number of particles in each explosion.",
            gravity: "Gravity",
            gravityDesc: "How quickly particles fall after explosion.",
            fadeRate: "Fade Rate",
            fadeRateDesc: "How quickly particles fade away.",
            trailLength: "Trail Length",
            trailLengthDesc: "Length of the trails behind firework particles."
        },
        bubbles: {
            title: "🫧 Bubble Settings",
            launchControls: "🚀 Launch Controls",
            launchPosition: "🎯 Launch Position",
            positionMode: "Position Mode",
            positionModeDesc: "How bubbles are positioned along the bottom of the screen",
            centerOnly: "Center Only",
            rangeFromCenter: "Range from Center",
            randomAcrossScreen: "Random Across Screen",
            launchSpread: "Launch Spread",
            launchSpreadDesc: "Width of the launch zone (0% = center point, 100% = entire screen width)",
            centerOnlyLabel: "Center Only",
            fullWidthLabel: "Full Width",
            clusterSettings: "🫧 Cluster Settings",
            bubblesPerLaunch: "Bubbles per Launch",
            bubblesPerLaunchDesc: "Number of bubbles created each time you launch",
            noneCluster: "0 (None)",
            largeCluster: "8 (Large Cluster)",
            randomBubblesPerLaunch: "Random Bubbles per Launch",
            randomBubblesPerLaunchDesc: "Each launch will create a random number of bubbles for more variety.",
            minimumBubbles: "Minimum Bubbles",
            minimumBubblesDesc: "Minimum number of bubbles per launch.",
            singleBubble: "1 (Single)",
            mediumCluster: "5 (Medium)",
            maximumBubbles: "Maximum Bubbles",
            maximumBubblesDesc: "Maximum number of bubbles per launch.",
            smallCluster: "3 (Small)",
            largeClusterMax: "8 (Large Cluster)",
            clusterSpread: "Cluster Spread",
            clusterSpreadDesc: "How spread out bubbles are within each cluster",
            tightCluster: "5px (Tight)",
            wideCluster: "100px (Wide)",
            riseSpeed: "⬆️ Rise Speed",
            baseRiseSpeed: "Base Rise Speed",
            baseRiseSpeedDesc: "Base speed at which bubbles float upward",
            slowFloat: "0.5 (Slow Float)",
            fastRise: "5.0 (Fast Rise)",
            randomRiseSpeeds: "Random Rise Speeds",
            randomRiseSpeedsDesc: "Each bubble will have a different random rise speed for more variety.",
            minimumSpeed: "Minimum Speed",
            minimumSpeedDesc: "Minimum rise speed for random bubbles.",
            verySlow: "0.5 (Very Slow)",
            fastSpeed: "3.0 (Fast)",
            maximumSpeed: "Maximum Speed",
            maximumSpeedDesc: "Maximum rise speed for random bubbles.",
            moderateSpeed: "2.0 (Moderate)",
            veryFastSpeed: "5.0 (Very Fast)",
            quickPresets: "⚡ Quick Presets",
            bubblePattern: "Bubble Pattern",
            selectPreset: "-- Select Preset --",
            presetDescription: "Choose a preset to quickly configure bubble settings",
            bubbleAppearance: "✨ Bubble Appearance",
            sizeSettings: "📏 Size Settings",
            bubbleSize: "Bubble Size",
            bubbleSizeDesc: "Controls how big bubbles and uploaded images appear during pops.",
            randomBubbleSizes: "Random Bubble Sizes",
            randomBubbleSizesDesc: "Each bubble will have a different random size for more variety.",
            smallestBubbleSize: "Smallest Size",
            smallestBubbleSizeDesc: "Minimum size for random bubbles.",
            largestBubbleSize: "Largest Size",
            largestBubbleSizeDesc: "Maximum size for random bubbles.",
            popBehavior: "💥 Pop Behavior",
            testBubblePopHeightSettings: "🎯 Test Bubble Pop Height Settings",
            testBubbleAutoPopHeight: "Test Bubble Auto-Pop Height",
            testBubbleAutoPopHeightDesc: "Height where TEST BUBBLES automatically pop (10% = low in sky, 100% = high in sky)",
            lowInSky: "10% (Low in Sky)",
            highInSky: "100% (High in Sky)",
            randomTestBubblePopHeights: "Random Test Bubble Pop Heights",
            randomTestBubblePopHeightsDesc: "Each test bubble will pop at a different random height for more variety.",
            minimumPopHeight: "Minimum Pop Height",
            minimumPopHeightDesc: "Minimum pop height for random test bubbles (lower = closer to ground).",
            lowPop: "10% (Low)",
            highPop: "80% (High)",
            maximumPopHeight: "Maximum Pop Height",
            maximumPopHeightDesc: "Maximum pop height for random test bubbles (higher = closer to top).",
            moderatePop: "30% (Moderate)",
            veryHighPop: "100% (Very High)",
            popSettings: "⚙️ Pop Settings",
            maxBubblesOnScreen: "Max Bubbles on Screen",
            maxBubblesOnScreenDesc: "Maximum number of bubbles that can be active at the same time.",
            physicsAndBehavior: "⚙️ Physics & Behavior",
            physicsSettings: "🌍 Physics Settings",
            bubbleGravity: "Bubble Gravity",
            bubbleGravityDesc: "How much gravity affects bubbles (higher = fall faster).",
            wobbleIntensity: "Wobble Intensity",
            wobbleIntensityDesc: "How much bubbles wobble as they float (0 = straight up).",
            buoyancy: "Buoyancy",
            buoyancyDesc: "How well bubbles resist gravity (higher = float better).",
            maxBubbles: "Max Bubbles",
            maxBubblesDesc: "Maximum number of bubbles that can be active at once.",
            riseSpeedAlt: "Rise Speed",
            riseSpeedDescAlt: "How fast bubbles rise up the screen.",
            popIntensity: "Pop Intensity",
            popIntensityDesc: "Intensity of bubble pop animations.",
            transparency: "Transparency",
            transparencyDesc: "How transparent the bubbles appear.",
            wobble: "Wobble Effect",
            wobbleDesc: "How much bubbles wobble as they rise."
        },
        effects: {
            title: "✨ Visual Effects Settings",
            animationSpeed: "Animation Speed",
            animationSpeedDesc: "Overall speed of all animations (higher = faster, lower = slower motion).",
            explosionParticles: "Explosion Particles",
            explosionParticlesDesc: "Number of sparkly particles created when fireworks explode.",
            particleDuration: "Particle Duration",
            particleDurationDesc: "How long explosion particles stay visible before fading away.",
            smallestParticles: "Smallest Particles",
            smallestParticlesDesc: "Minimum size of individual explosion particles.",
            largestParticles: "Largest Particles",
            largestParticlesDesc: "Maximum size of individual explosion particles.",
            colorfulParticles: "Colorful Particles",
            colorfulParticlesDesc: "Use multiple colors for particles instead of single-color explosions.",
            glowEffect: "Glow Effect",
            glowEffectDesc: "Adds a beautiful glowing aura around fireworks and particles.",
            particleFadeSpeed: "Particle Fade Speed",
            particleFadeSpeedDesc: "How quickly particles fade away (higher = slower fading, longer lasting).",
            screenShake: "Screen Shake",
            screenShakeDesc: "Enable screen shake effects during intense animations.",
            particleTrails: "Particle Trails",
            particleTrailsDesc: "Enable trailing effects behind particles.",
            glow: "Glow Effects",
            glowDesc: "Enable glowing effects around animations.",
            blur: "Motion Blur",
            blurDesc: "Enable motion blur effects for fast-moving particles."
        },
        images: {
            title: "🖼️ Image Settings",
            autoRemoveBackgrounds: "Auto Remove Backgrounds",
            autoRemoveBackgroundsDesc: "Automatically remove white/solid backgrounds from uploaded firework images.",
            spinningImages: "Spinning Images",
            spinningImagesDesc: "Make uploaded images spin and rotate during firework explosions.",
            imageGravity: "Image Gravity",
            imageGravityDesc: "How fast images fall after exploding (0 = float forever, higher = fall faster).",
            backgroundImageOpacity: "Background Image Opacity",
            backgroundImageOpacityDesc: "How see-through the background slideshow images are (0 = invisible, 1 = solid).",
            backgroundTransition: "Background Transition",
            backgroundTransitionDesc: "How long it takes for background images to fade from one to the next.",
            backgroundDuration: "Background Duration",
            backgroundDurationDesc: "How long each background image is shown before changing to the next.",
            customImages: "Custom Images",
            customImagesDesc: "Use uploaded custom images in animations.",
            imageSize: "Image Size",
            imageSizeDesc: "Size of custom images in animations.",
            imageOpacity: "Image Opacity",
            imageOpacityDesc: "Transparency level of custom images.",
            rotation: "Image Rotation",
            rotationDesc: "Enable random rotation of custom images."
        },
        colors: {
            title: "🎨 Colors & Themes",
            colorTheme: "Color Theme",
            colorThemeDesc: "Choose a color style for your fireworks and particles.",
            vivid: "🌈 Vivid (Bright & Bold)",
            pastel: "🌸 Pastel (Soft & Gentle)",
            neon: "⚡ Neon (Electric & Glowing)",
            earthy: "🍂 Earthy (Natural & Warm)",
            monochrome: "⚫ Monochrome (Black & White)",
            custom: "🎨 Custom (Your Own Colors)",
            colorIntensity: "Color Intensity",
            colorIntensityDesc: "Adjusts the overall vividness of colors.",
            customColors: "Custom Colors",
            addColor: "Add Color",
            customColorsDesc: "Click a swatch to remove it.",
            noCustomColors: "No custom colors added yet",
            colorAdded: "Added {{color}} to palette",
            colorRemoved: "Removed {{color}} from palette", 
            colorAlreadyExists: "Color {{color}} already in palette",
            colorScheme: "Color Scheme",
            colorSchemeDesc: "Choose the color palette for animations.",
            brightness: "Brightness",
            brightnessDesc: "Overall brightness of animation colors.",
            saturation: "Saturation",
            saturationDesc: "Color intensity and vibrancy.",
            contrast: "Contrast",
            contrastDesc: "Difference between light and dark colors."
        },
        actions: {
            resetAll: "Reset All Settings",
            resetAllDesc: "Reset all settings to default values.",
            exportSettings: "Export Settings",
            importSettings: "Import Settings"
        }
    },

    // Preset System
    presets: {
        title: "Animation Presets",
        names: {
            classic: "🎆 Classic",
            wideCelebration: "🎉 Wide Celebration", 
            fountain: "⛲ Fountain",
            rocketStraight: "🚀 Straight Rockets",
            leftCascade: "↖️ Left Cascade",
            rightCascade: "↗️ Right Cascade",
            chaos: "🌪️ Chaos Mode",
            gentle: "🌸 Gentle Breeze",
            intense: "⚡ Intense Storm",
            rainbow: "🌈 Rainbow Burst",
            celebration: "🎉 Celebration (Large Clusters, Fast Rise)",
            fountainBubbles: "⛲ Fountain (Center, Many Bubbles)",
            stream: "🌊 Stream (Single Line, Steady)",
            chaosBubbles: "🌪️ Chaos Mode (Random Everything)",
            peaceful: "🕊️ Peaceful (Slow, Spread Out)",
            party: "🎊 Party (Fast, Everywhere)"
        },
        descriptions: {
            classic: "Traditional center launches with slight spread and moderate angles",
            wideCelebration: "Fireworks across entire screen with wide angle variety",
            fountain: "Continuous upward streams like a water fountain",
            rocketStraight: "Straight vertical rockets with minimal spread",
            leftCascade: "Beautiful cascading effects flowing to the left",
            rightCascade: "Beautiful cascading effects flowing to the right", 
            chaos: "Random chaotic explosions across the entire screen",
            gentle: "Soft, gentle animations with pastel colors",
            intense: "High-energy animations with bright, vibrant effects",
            rainbow: "Colorful rainbow-themed animations with all spectrum colors"
        },
        actions: {
            load: "Load Preset",
            preview: "Preview",
            save: "Save Preset",
            delete: "Delete Preset",
            discover: "🔍 Discover Presets",
            loadFolder: "📁 Load Preset Folder",
            clearAll: "🗑️ Clear All"
        },
        messages: {
            loaded: "Preset '{{name}}' loaded successfully",
            saved: "Preset saved as '{{name}}'",
            deleted: "Preset '{{name}}' deleted",
            cleared: "All presets cleared",
            discovering: "Discovering available presets...",
            noPresets: "No Presets Loaded",
            discoverInstructions: "Click \"Discover Presets\" to scan your /presets/ folder and find available preset collections.",
            loadError: "Failed to load preset",
            saveError: "Failed to save preset"
        },
        sections: {
            discovered: "📦 Discovered Presets",
            loaded: "📁 Loaded Presets"
        }
    },

    // Upload System
    upload: {
        instructions: {
            dragDrop: "Drag and drop custom images here",
            or: "or",
            selectFiles: "Select Files",
            selectBgFiles: "Select Background Files",
            fileTypes: "Supported: JPG, PNG, GIF (max 5MB each)",
            imageDescription: "Images will appear during firework explosions and bubble pops",
            backgroundDescription: "Background images will be displayed behind animations"
        },
        buttons: {
            selectFiles: "Select Files",
            selectBackground: "Select Background",
            removeAll: "Remove All",
            preview: "Preview Images"
        },
        messages: {
            uploading: "Uploading {{current}} of {{total}} files...",
            success: "{{count}} file(s) uploaded successfully",
            error: "Failed to upload {{filename}}",
            invalidType: "{{filename}} is not a supported image type",
            tooLarge: "{{filename}} is too large (max 5MB)",
            duplicate: "{{filename}} already exists",
            removed: "{{filename}} removed",
            cleared: "All images cleared"
        },
        errors: {
            noFiles: "No files selected",
            uploadFailed: "Upload failed",
            invalidFormat: "Invalid file format",
            fileTooLarge: "File size exceeds 5MB limit",
            networkError: "Network error during upload",
            serverError: "Server error during upload"
        }
    },

    // Error Messages
    errors: {
        microphone: {
            denied: "Microphone access denied",
            failed: "Failed to initialize microphone",
            unsupported: "Microphone not supported",
            busy: "Microphone is busy"
        },
        files: {
            tooLarge: "File is too large",
            invalidType: "Invalid file type",
            uploadFailed: "Upload failed",
            notFound: "File not found",
            corrupted: "File appears to be corrupted"
        },
        network: {
            offline: "No internet connection",
            timeout: "Request timed out",
            serverError: "Server error",
            forbidden: "Access forbidden"
        },
        browser: {
            compatibility: "Browser Compatibility Warning",
            unsupportedFeatures: "The following features are not supported in your browser:",
            modernBrowser: "Please try using a modern browser like Chrome, Firefox, Safari, or Edge."
        },
        generic: {
            unknown: "An unknown error occurred",
            tryAgain: "Please try again",
            contact: "Please contact support if the problem persists"
        }
    },

    // Success Messages
    success: {
        settings: {
            saved: "Settings saved successfully",
            reset: "Settings reset to defaults",
            imported: "Settings imported successfully",
            exported: "Settings exported successfully"
        },
        files: {
            uploaded: "Files uploaded successfully",
            removed: "File removed successfully",
            cleared: "All files cleared"
        },
        audio: {
            started: "Audio detection started",
            stopped: "Audio detection stopped",
            calibrated: "Microphone calibrated successfully"
        }
    },

    // Navigation and General UI
    navigation: {
        home: "Home",
        settings: "Settings",
        presets: "Presets",
        upload: "Upload",
        about: "About",
        help: "Help"
    },

    // Time and Date
    time: {
        now: "Now",
        today: "Today",
        yesterday: "Yesterday",
        minutes: "{{count}} minute(s) ago",
        hours: "{{count}} hour(s) ago",
        days: "{{count}} day(s) ago"
    },

    // Accessibility
    accessibility: {
        startButton: "Start animations",
        stopButton: "Stop animations",
        settingsButton: "Open settings panel",
        closeButton: "Close panel",
        volumeSlider: "Adjust volume sensitivity",
        languageSelector: "Select interface language",
        fileUpload: "Upload image files",
        presetSelector: "Choose animation preset"
    },

    // Help and Instructions
    help: {
        title: "How to Use",
        gettingStarted: "Getting Started",
        audioSetup: "Audio Setup",
        customization: "Customization",
        troubleshooting: "Troubleshooting",
        instructions: {
            step1: "1. Click 'Start' to begin audio detection",
            step2: "2. Make loud, sustained sounds to trigger animations",
            step3: "3. Use Settings to customize the experience",
            step4: "4. Upload custom images for personalized effects"
        }
    },

    // About Information
    about: {
        title: "Vibecoding Fireworks App",
        description: "An interactive audio-reactive animation experience",
        version: "Version {{version}}",
        credits: "Created with passion for visual art and technology",
        opensource: "Open source project",
        github: "View on GitHub"
    }
};

export default translations; 