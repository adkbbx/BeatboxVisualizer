// CustomImage.js
export class CustomImage {
    constructor(x, y, image, forcedColor, sizeMultiplier) {
        // Handle default parameters manually for better compatibility
        if (forcedColor === undefined) forcedColor = null;
        if (sizeMultiplier === undefined) sizeMultiplier = 1.0;
        
        console.log(`🖼️ Creating CustomImage at (${x}, ${y}) with size ${sizeMultiplier}`); // Debug log
        
        this.x = x;
        this.y = y;
        this.image = image;
        this.sizeMultiplier = sizeMultiplier; // Store size multiplier
        
        // Physics properties for gravity effect - FIXED: More natural movement
        this.velocityX = (Math.random() - 0.5) * 0.1; // Much smaller horizontal drift for natural look
        this.velocityY = -0.2 + Math.random() * 0.1; // Gentler initial upward velocity
        this.baseGravity = 0.015; // Slightly reduced gravity for smoother fall
        this.airResistance = 0.998; // Slightly more air resistance
        
        // Set color based on priority: forced color > pre-computed > extracted
        if (forcedColor) {
            this.setForcedColor(forcedColor);
        } else if (image.dominantColor) {
            this.dominantColor = image.dominantColor;
        } else {
            this.extractDominantColor();
        }
        
        // Animation properties
        this.startTime = Date.now();
        this.lastUpdateTime = this.startTime;
        this.lifeTime = 2000; // 2 seconds lifetime
        
        // Visual properties - FIXED: Restored proper visibility while keeping smooth movement
        this.scale = 0.2 * sizeMultiplier; // Start visible but small
        this.targetScale = (0.8 + Math.random() * 0.3) * sizeMultiplier; // Good size range
        this.currentScale = this.scale; // Track actual current scale separately
        this.rotation = 0; // Start with no rotation
        this.rotationSpeed = 0; // No rotation by default
        this.opacity = 0.3; // Start clearly visible
        
        // Check if rotation is enabled in settings
        const rotationEnabled = document.getElementById('imageRotation')?.checked || false;
        if (rotationEnabled) {
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        }
        
        // Particle effect properties - scale particles too
        this.particles = [];
        this.particleCount = 6;
        this.particleSize = 1.5 * sizeMultiplier; // Scale particle size
        this.particleSpeed = 0.5;
        
        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                distance: 0,
                opacity: 0.15, // Start with some visibility
                speed: 0.3 + Math.random() * 0.3
            });
        }
    }

    extractDominantColor() {
        // Check if already has pre-computed color
        if (this.image.dominantColor) {
            this.dominantColor = this.image.dominantColor;
            return;
        }
        
        // Create temporary canvas for analysis
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.image.width;
        tempCanvas.height = this.image.height;
        
        // Draw the image
        tempCtx.drawImage(this.image, 0, 0);
        
        // Sample the center area
        const centerX = Math.floor(this.image.width / 2);
        const centerY = Math.floor(this.image.height / 2);
        const sampleSize = 20;
        const imageData = tempCtx.getImageData(
            centerX - sampleSize/2,
            centerY - sampleSize/2,
            sampleSize,
            sampleSize
        );
        
        // Calculate average color
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            // Skip transparent pixels
            if (imageData.data[i + 3] > 128) {
                r += imageData.data[i];
                g += imageData.data[i + 1];
                b += imageData.data[i + 2];
                count++;
            }
        }
        
        if (count > 0) {
            // Calculate average RGB values
            const rgb = {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count)
            };
            
            // Convert to hex
            const hex = '#' + [rgb.r, rgb.g, rgb.b]
                .map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                })
                .join('');
            
            this.dominantColor = { rgb, hex };
        } else {
            // Fallback color if no non-transparent pixels
            this.dominantColor = {
                rgb: { r: 255, g: 220, b: 0 },
                hex: '#ffdc00'
            };
        }
    }

    update() {
        const now = Date.now();
        const deltaTime = Math.min(32, now - this.lastUpdateTime); // Cap delta time to prevent large jumps
        this.lastUpdateTime = now;
        
        // Skip frame if delta time is invalid
        if (deltaTime <= 0) return;

        const age = now - this.startTime;
        const lifeProgress = Math.min(1, age / this.lifeTime);
        const timeScale = Math.min(2, deltaTime / 16); // Cap time scale and normalize to 60fps

        // Apply gravity physics - update position based on velocity - FIXED: Smoother movement
        this.x += this.velocityX * timeScale;
        this.y += this.velocityY * timeScale;
        
        // Apply gravity to vertical velocity with user-controlled multiplier
        const gravityMultiplier = window.imageGravityMultiplier || 1.0;
        this.velocityY += this.baseGravity * gravityMultiplier * timeScale;
        
        // Apply air resistance to both velocities - reduce horizontal drift over time
        this.velocityX *= Math.pow(this.airResistance, timeScale);
        this.velocityY *= Math.pow(this.airResistance, timeScale);
        
        // Gradually reduce horizontal movement for more natural fall
        this.velocityX *= Math.pow(0.995, timeScale);

        // FIXED: Proper animation phases with good visibility
        if (lifeProgress < 0.25) {
            // Opening phase - smooth bloom from visible to full
            const bloomProgress = this.easeOutCubic(lifeProgress / 0.25);
            this.currentScale = this.scale + bloomProgress * (this.targetScale - this.scale);
            this.opacity = 0.3 + bloomProgress * 0.6; // Start visible (0.3), go to full (0.9)
        } else if (lifeProgress > 0.75) {
            // Fade out phase - smooth fade with slight shrink
            const fadeProgress = (lifeProgress - 0.75) / 0.25;
            const fadeEase = this.easeInCubic(fadeProgress);
            this.opacity = Math.max(0, 0.9 * (1 - fadeEase));
            this.currentScale = this.targetScale * (1 - fadeEase * 0.15); // Slightly more shrink for clean exit
        } else {
            // Stable phase - full visibility, no pulse
            this.currentScale = this.targetScale;
            this.opacity = 0.9;
        }

        // Store the scale for rendering
        this.scale = this.currentScale;

        // Only update rotation if rotation speed is non-zero
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed * timeScale;
        }

        // Update particles with simpler, less distracting movement
        this.particles.forEach((particle, index) => {
            if (lifeProgress < 0.25) {
                // Expanding phase
                particle.distance = this.easeOutCubic(lifeProgress / 0.25) * this.image.width * 0.4;
                particle.opacity = this.easeOutCubic(lifeProgress / 0.25) * 0.3;
            } else if (lifeProgress > 0.75) {
                // Fade out phase
                const fadeProgress = (lifeProgress - 0.75) / 0.25;
                particle.opacity = Math.max(0, 0.3 * (1 - fadeProgress));
                particle.distance *= 1.002; // Much slower expansion
            } else {
                // Stable phase - gentle subtle movement
                const pulsePhase = (age + index * 300) * 0.001; // Slower pulse
                particle.opacity = 0.2 + Math.sin(pulsePhase) * 0.05; // Very subtle opacity change
                particle.distance = this.image.width * (0.4 + Math.sin(pulsePhase) * 0.02); // Very subtle size change
            }
        });
    }

    render(ctx) {
        if (this.opacity < 0.02) return; // Very low threshold so images render

        // Debug log for first few frames
        if (Date.now() - this.startTime < 500) {
            console.log(`🎨 Rendering image at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}) opacity: ${this.opacity.toFixed(2)} scale: ${this.scale.toFixed(2)}`);
        }

        ctx.save();
        
        // Draw particles
        const { r, g, b } = this.dominantColor.rgb;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
        ctx.shadowBlur = 3;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        ctx.globalAlpha = this.opacity * 0.2; // More visible particles
        
        this.particles.forEach(particle => {
            const x = this.x + Math.cos(particle.angle) * particle.distance;
            const y = this.y + Math.sin(particle.angle) * particle.distance;
            ctx.beginPath();
            ctx.arc(x, y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw the main image with full opacity
        ctx.globalAlpha = Math.min(1.0, this.opacity); // Full opacity for images
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.drawImage(
            this.image,
            -this.image.width/2, -this.image.height/2,
            this.image.width, this.image.height
        );
        
        ctx.restore();
    }

    // Set a forced color instead of extracting from the image
    setForcedColor(hexColor) {
        // Normalize the hex color
        let normalizedHex = hexColor;
        
        // Add # prefix if missing
        if (!normalizedHex.startsWith('#')) {
            normalizedHex = '#' + normalizedHex;
        }
        
        // Validate and use fallback if invalid
        if (!/^#[0-9A-F]{6}$/i.test(normalizedHex)) {
            normalizedHex = '#FF6A00'; // Fallback to orange
        }
        
        // Convert hex to RGB
        const hex = normalizedHex.replace('#', '');
        const rgb = {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };

        this.dominantColor = {
            rgb,
            hex: normalizedHex
        };
    }

    isDead() {
        const age = Date.now() - this.startTime;
        return age >= this.lifeTime || this.opacity < 0.02; // Lower threshold for death
    }

    // Easing functions for smooth animation - FIXED: Better easing functions
    ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // Smooth ease out cubic for natural blooming
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Smooth ease in cubic for natural fading
    easeInCubic(t) {
        return t * t * t;
    }
} 