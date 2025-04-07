// CustomImage.js
export class CustomImage {
    constructor(x, y, image, forcedColor = null) {
        this.x = x;
        this.y = y;
        this.image = image;
        
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
        
        // Visual properties
        this.scale = 0.1; // Start small
        this.targetScale = 0.8 + Math.random() * 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.opacity = 0.1;
        
        // Particle effect properties
        this.particles = [];
        this.particleCount = 6;
        this.particleSize = 1.5;
        this.particleSpeed = 0.5;
        
        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                distance: 0,
                opacity: 0.05,
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
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Skip problematic deltas
        if (deltaTime > 100 || deltaTime <= 0) return;

        const age = now - this.startTime;
        const lifeProgress = Math.min(1, age / this.lifeTime);
        const timeScale = deltaTime / 16; // Normalize to 60fps

        // Animation phases
        if (lifeProgress < 0.3) {
            // Opening phase
            const bloomProgress = this.ease(lifeProgress / 0.3);
            this.scale = 0.1 + bloomProgress * (this.targetScale - 0.1);
            this.opacity = 0.1 + bloomProgress * 0.9;
        } else if (lifeProgress > 0.7) {
            // Fade out phase
            const fadeProgress = (lifeProgress - 0.7) / 0.3;
            this.opacity = Math.max(0.1, 1.0 - fadeProgress);
            this.scale = this.targetScale * (1 - fadeProgress * 0.2);
        } else {
            // Full bloom phase
            const pulseAmount = Math.sin(age * 0.003) * 0.02;
            this.scale = this.targetScale * (1 + pulseAmount);
            this.opacity = 1.0;
        }

        // Rotate image
        this.rotation += this.rotationSpeed * timeScale;

        // Update particles
        this.particles.forEach((particle, index) => {
            if (lifeProgress < 0.3) {
                // Expanding phase
                particle.distance = this.ease(lifeProgress / 0.3) * this.image.width * 0.5;
                particle.opacity = 0.1 + this.ease(lifeProgress / 0.3) * 0.4;
            } else if (lifeProgress > 0.7) {
                // Fade out phase
                const fadeProgress = (lifeProgress - 0.7) / 0.3;
                particle.opacity = Math.max(0.1, 0.5 - fadeProgress);
                particle.distance *= 1.005;
                particle.angle += 0.01 * timeScale;
            } else {
                // Full bloom phase
                const pulsePhase = (age + index * 200) * 0.002;
                particle.opacity = 0.3 + Math.sin(pulsePhase) * 0.2;
                particle.distance = this.image.width * (0.5 + Math.sin(pulsePhase) * 0.05);
            }
        });
    }

    render(ctx) {
        if (this.opacity < 0.1) return;

        ctx.save();
        
        // Draw particles
        const { r, g, b } = this.dominantColor.rgb;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.05)`;
        ctx.shadowBlur = 3;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        ctx.globalAlpha = this.opacity * 0.1;
        
        this.particles.forEach(particle => {
            const x = this.x + Math.cos(particle.angle) * particle.distance;
            const y = this.y + Math.sin(particle.angle) * particle.distance;
            ctx.beginPath();
            ctx.arc(x, y, this.particleSize, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw the main image
        ctx.globalAlpha = Math.min(0.85, this.opacity);
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
        return age >= this.lifeTime || this.opacity < 0.1;
    }

    // Easing function for smooth animation
    ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
} 