/**
 * AnimationController handles canvas rendering and animation logic
 */
class AnimationController {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        
        // Fireworks array
        this.fireworks = [];
        this.particles = [];
        
        // Colors for fireworks
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
            '#FF00FF', '#00FFFF', '#FFA500', '#800080'
        ];
        
        // Animation properties
        this.lastTime = 0;
        this.gravity = 0.1;
        
        // Debug mode
        this.debug = true;
        
        // Bind the resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        this.handleResize();
        
        // Log that the controller was initialized
        console.log('Animation controller initialized');
        if (this.debug) {
            console.log('Canvas dimensions:', this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Starts the animation loop
     */
    start() {
        this.isActive = true;
        console.log('Animation started');
        
        // Initial firework for visual confirmation
        if (this.debug) {
            setTimeout(() => {
                this.launchFirework();
                console.log('Initial test firework launched');
            }, 500);
        }
        
        this.animate(0);
        return true;
    }
    
    /**
     * Stops the animation loop
     */
    stop() {
        this.isActive = false;
        return true;
    }
    
    /**
     * Main animation loop
     */
    animate(timestamp) {
        if (!this.isActive) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime || 16;
        this.lastTime = timestamp;
        
        // Clear canvas with fade effect for trail
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw fireworks
        this.updateFireworks(deltaTime);
        this.updateParticles(deltaTime);
        
        // Continue animation loop
        requestAnimationFrame((time) => this.animate(time));
    }
    
    /**
     * Update fireworks
     */
    updateFireworks(deltaTime) {
        for (let i = 0; i < this.fireworks.length; i++) {
            const firework = this.fireworks[i];
            
            // Move firework
            firework.x += firework.vx * (deltaTime / 16);
            firework.y += firework.vy * (deltaTime / 16);
            firework.vy += this.gravity * (deltaTime / 16);
            
            // Draw firework
            this.ctx.beginPath();
            this.ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = firework.color;
            this.ctx.fill();
            
            // Check if firework should explode
            if (firework.vy >= 0) {
                // Create explosion
                this.createExplosion(firework.x, firework.y, firework.color);
                this.fireworks.splice(i, 1);
                i--;
                
                // Log explosion for debugging
                if (this.debug) {
                    console.log('Firework exploded at', firework.x, firework.y);
                }
            }
        }
    }
    
    /**
     * Update particles
     */
    updateParticles(deltaTime) {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // Move particle
            particle.x += particle.vx * (deltaTime / 16);
            particle.y += particle.vy * (deltaTime / 16);
            particle.vy += this.gravity * 0.5 * (deltaTime / 16);
            
            // Fade out
            particle.alpha -= 0.01 * (deltaTime / 16);
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha})`;
            this.ctx.fill();
            
            // Remove faded particles
            if (particle.alpha <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
    
    /**
     * Create an explosion effect
     */
    createExplosion(x, y, color) {
        // Parse the color into rgb components
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // Create particles
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            // Random velocity in all directions
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: r,
                g: g,
                b: b,
                alpha: 1
            });
        }
    }
    
    /**
     * Launch a firework at a random position
     */
    launchFirework() {
        // Random starting position at bottom
        const startX = Math.random() * this.canvas.width;
        const endX = startX + (Math.random() * 100 - 50);
        const endY = Math.random() * (this.canvas.height * 0.5);
        
        // Calculate initial velocity to reach target
        const angle = Math.atan2(endY - this.canvas.height, endX - startX);
        const speed = 12 + Math.random() * 3;
        
        // Random color
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Create firework
        this.fireworks.push({
            x: startX,
            y: this.canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color
        });
        
        if (this.debug) {
            console.log('Firework launched from', startX, this.canvas.height);
        }
    }
    
    /**
     * Multiple fireworks for special effects
     */
    launchMultipleFireworks(count = 3) {
        console.log(`Launching ${count} fireworks`);
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.launchFirework();
            }, i * 200);
        }
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        // Get the container size
        const container = this.canvas.parentNode;
        const rect = container.getBoundingClientRect();
        
        // Update canvas size
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.debug) {
            console.log('Canvas resized to', this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Apply volume level to animation
     */
    applyVolume(volume, category) {
        // For loud sounds, launch fireworks occasionally
        if (category === 'loud' && Math.random() > 0.7) {
            this.launchFirework();
        }
    }
    
    /**
     * Handle sudden sound event
     */
    applySuddenSound(volume) {
        // Launch fireworks for sudden sounds (claps)
        const fireworkCount = Math.max(1, Math.floor(volume * 5));
        this.launchMultipleFireworks(fireworkCount);
    }
    
    /**
     * Handle sustained sound event
     */
    applySustainedSound(volume, duration) {
        // For long sustained sounds, create continuous fireworks
        if (duration > 1000 && Math.random() > 0.8) {
            this.launchFirework();
        }
    }
    
    /**
     * Update animation settings
     */
    updateSettings(settings) {
        // No specific settings needed for fireworks currently
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
    }
} 