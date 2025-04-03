// CustomImage.js
export class CustomImage {
    constructor(x, y, image, forcedColor = null) {
        console.log(`Creating custom image explosion at (${x}, ${y})`);
        this.x = x;
        this.y = y;
        this.image = image;
        
        // If forced color is provided, always use it
        if (forcedColor) {
            this.setForcedColor(forcedColor);
            console.log(`Using forced color for image: ${forcedColor}`);
        } else if (image.dominantColor) {
            // If image has pre-computed dominant color, use that
            this.dominantColor = image.dominantColor;
            console.log(`Using pre-computed image color: ${image.dominantColor.hex}`);
        } else {
            // Extract dominant color from image as last resort
            this.extractDominantColor();
            console.log(`Extracted color from image: ${this.dominantColor.hex}`);
        }
        
        // Animation properties
        this.startTime = Date.now();
        this.lastUpdateTime = this.startTime;
        this.lifeTime = 2000; // 2 seconds lifetime
        
        // Visual properties
        this.scale = 0.1; // Start small
        this.targetScale = 0.8 + Math.random() * 0.2; // Reduced scale variation
        this.rotation = Math.random() * Math.PI * 2; // Random initial rotation
        this.rotationSpeed = (Math.random() - 0.5) * 0.05; // Reduced rotation speed
        this.opacity = 0.1; // Start with slight visibility
        
        // Particle effect properties
        this.particles = [];
        this.particleCount = 6; // Fewer particles
        this.particleSize = 1.5; // Smaller particles
        this.particleSpeed = 0.5; // Slower particles
        
        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                distance: 0,
                opacity: 0.05, // Lower initial opacity
                speed: 0.3 + Math.random() * 0.3 // Slower particle speed
            });
        }
        
        console.debug('Custom image initialized:', {
            position: {x: this.x.toFixed(0), y: this.y.toFixed(0)},
            dominantColor: this.dominantColor,
            targetScale: this.targetScale.toFixed(2),
            rotation: (this.rotation * 180 / Math.PI).toFixed(1) + '°',
            rotationSpeed: (this.rotationSpeed * 180 / Math.PI).toFixed(1) + '°/s',
            lifetime: this.lifeTime + 'ms',
            initialOpacity: this.opacity.toFixed(2)
        });
    }

    extractDominantColor() {
        // Check if the image has a pre-computed dominant color (from ImageProcessor)
        if (this.image.dominantColor) {
            console.log('Using pre-computed dominant color from image:', this.image.dominantColor.hex);
            this.dominantColor = this.image.dominantColor;
            return;
        }
        
        // If no pre-computed color, extract it from the image
        console.log('No pre-computed color found, extracting from image...');
        
        // Create a temporary canvas to analyze the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.image.width;
        tempCanvas.height = this.image.height;
        
        // Draw the image
        tempCtx.drawImage(this.image, 0, 0);
        
        // Get image data from the center of the image
        const centerX = Math.floor(this.image.width / 2);
        const centerY = Math.floor(this.image.height / 2);
        const sampleSize = 20; // Sample a 20x20 area from center
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
            
            this.dominantColor = {
                rgb,
                hex
            };
            
            console.debug('Extracted color from image center:', {
                rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                hex: hex
            });
        } else {
            // Fallback color if no non-transparent pixels found
            this.dominantColor = {
                rgb: { r: 255, g: 220, b: 0 },
                hex: '#ffdc00'
            };
            console.warn('No non-transparent pixels found, using fallback color');
        }
    }

    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        if (deltaTime > 100 || deltaTime <= 0) {
            console.warn(`Skipping update due to large time delta: ${deltaTime}ms`);
            return;
        }

        const age = now - this.startTime;
        const lifeProgress = Math.min(1, age / this.lifeTime);
        const timeScale = deltaTime / 16; // Normalize to 60fps

        // Blooming animation phases
        if (lifeProgress < 0.3) {
            // Opening phase - smooth bloom
            const bloomProgress = this.ease(lifeProgress / 0.3);
            this.scale = 0.1 + bloomProgress * (this.targetScale - 0.1);
            this.opacity = 0.1 + bloomProgress * 0.9;
        } else if (lifeProgress > 0.7) {
            // Fade out phase - gentle fade
            const fadeProgress = (lifeProgress - 0.7) / 0.3;
            this.opacity = Math.max(0.1, 1.0 - fadeProgress);
            this.scale = this.targetScale * (1 - fadeProgress * 0.2);
        } else {
            // Full bloom phase - very subtle pulsing
            const pulseAmount = Math.sin(age * 0.003) * 0.02; // Reduced pulse
            this.scale = this.targetScale * (1 + pulseAmount);
            this.opacity = 1.0;
        }

        // Gentle rotation
        this.rotation += this.rotationSpeed * timeScale;

        // Update particles
        this.particles.forEach((particle, index) => {
            if (lifeProgress < 0.3) {
                // Particles expand during bloom
                particle.distance = this.ease(lifeProgress / 0.3) * this.image.width * 0.5; // Reduced particle spread
                particle.opacity = 0.1 + this.ease(lifeProgress / 0.3) * 0.4; // Reduced particle opacity
            } else if (lifeProgress > 0.7) {
                // Particles fade and spiral outward
                const fadeProgress = (lifeProgress - 0.7) / 0.3;
                particle.opacity = Math.max(0.1, 0.5 - fadeProgress);
                particle.distance *= 1.005; // Slower expansion
                particle.angle += 0.01 * timeScale; // Slower rotation
            } else {
                // Particles pulse during full bloom
                const pulsePhase = (age + index * 200) * 0.002;
                particle.opacity = 0.3 + Math.sin(pulsePhase) * 0.2; // Reduced particle opacity
                particle.distance = this.image.width * (0.5 + Math.sin(pulsePhase) * 0.05); // Reduced particle movement
            }
        });

        // Periodic state logging removed to reduce console noise
    }

    render(ctx) {
        if (this.opacity < 0.1) return;

        ctx.save();
        
        // Draw particles using flower's color
        ctx.shadowColor = `rgba(${this.dominantColor.rgb.r}, ${this.dominantColor.rgb.g}, ${this.dominantColor.rgb.b}, 0.05)`; // Very subtle glow
        ctx.shadowBlur = 3; // Minimal blur
        ctx.fillStyle = `rgba(${this.dominantColor.rgb.r}, ${this.dominantColor.rgb.g}, ${this.dominantColor.rgb.b}, 1)`;
        ctx.globalAlpha = this.opacity * 0.1; // Very subtle particles
        
        this.particles.forEach(particle => {
            const x = this.x + Math.cos(particle.angle) * particle.distance;
            const y = this.y + Math.sin(particle.angle) * particle.distance;
            ctx.beginPath();
            ctx.arc(x, y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw the flower with reduced opacity to prevent it from being too bright
        ctx.globalAlpha = Math.min(0.85, this.opacity); // Cap the opacity at 0.85
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Remove glow from the flower completely
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
        // Validate and normalize the hex color
        let normalizedHex = hexColor;
        
        // Make sure it has a # prefix
        if (!normalizedHex.startsWith('#')) {
            normalizedHex = '#' + normalizedHex;
        }
        
        // Validate it's a valid hex color
        if (!/^#[0-9A-F]{6}$/i.test(normalizedHex)) {
            console.warn(`Invalid hex color format provided: ${hexColor}, using fallback color`);
            normalizedHex = '#FF6A00'; // Fallback to orange
        }
        
        // Convert hex color to RGB
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

        console.log('Using forced color for image:', {
            color: normalizedHex,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        });
    }

    isDead() {
        const age = Date.now() - this.startTime;
        const dead = age >= this.lifeTime || this.opacity < 0.1;
        
        // Debug log for flower death removed to reduce console noise
        return dead;
    }

    // Easing function for smooth animation
    ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
} 