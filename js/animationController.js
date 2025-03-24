/**
 * Enhanced AnimationController handles canvas rendering and animation logic
 */
class AnimationController {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.isActive = false;
  
      // Fireworks array - strictly controlled
      this.fireworks = [];
      this.particles = [];
  
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
  
      // Animation properties
      this.lastTime = 0;
      this.gravity = 0.08;
  
      // Debug mode for logging
      this.debug = false;
  
      // Flag to prevent duplicate launches
      this.launchingFirework = false;
  
      // Global settings
      this.settings = {
        particleCount: 120,      // More particles for richer explosions
        particleLifespan: 1.2,   // Longer lifespan for particles
        fadeResistance: 0.95,    // Slower fade-out
        glowEffect: true,        // Enable glow effects
        trailLength: 2.5,        // Longer trails
        shimmerEffect: true,     // Enable color shimmer
        useMultiColor: true      // Enable multi-color explosions
      };
  
      // Resize handling
      this.resizeHandler = this.handleResize.bind(this);
      window.addEventListener("resize", this.resizeHandler);
      this.handleResize();
  
      console.log("Enhanced animation controller initialized");
    }
  
    /**
     * Starts the animation loop
     */
    start() {
      this.isActive = true;
      console.log("Animation started");
      this.animate(0);
      return true;
    }
  
    /**
     * Stops the animation loop
     */
    stop() {
      this.isActive = false;
      console.log("Animation stopped");
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
  
      // Clear canvas with improved fade effect for better trail persistence
      this.ctx.fillStyle = this.settings.glowEffect 
        ? "rgba(0, 0, 0, 0.15)" 
        : "rgba(0, 0, 0, 0.2)"; // Subtler fade for glow effect
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Update and draw fireworks and particles
      this.updateFireworks(deltaTime);
      this.updateParticles(deltaTime);
  
      // Periodically log state for debugging
      if (this.debug && Math.random() < 0.005) {
        console.log(`Currently managing ${this.fireworks.length} fireworks`);
        console.log(`Currently managing ${this.particles.length} particles`);
      }
  
      // Continue animation loop
      requestAnimationFrame((time) => this.animate(time));
    }
  
    /**
     * Update all fireworks
     */
    updateFireworks(deltaTime) {
      if (this.fireworks.length === 0) return;
  
      // Set composite operation for glow effect
      if (this.settings.glowEffect) {
        this.ctx.globalCompositeOperation = "lighter";
      }
  
      // Process each firework
      for (let i = 0; i < this.fireworks.length; i++) {
        const firework = this.fireworks[i];
  
        // Calculate speed damping
        const heightRatio = firework.y / this.canvas.height;
        const speedDampening = Math.max(0.85, heightRatio * 1.05);
  
        // Update firework position based on active state
        if (firework.active) {
          // Move firework upward with slight drift for realism
          firework.x += (firework.vx + (Math.random() * 0.2 - 0.1)) * (deltaTime / 16) * speedDampening;
          firework.y += firework.vy * (deltaTime / 16) * speedDampening;
  
          // Gradually reduce upward velocity
          firework.vy *= 0.995;
          
          // Add sparkles along the path (small random particles)
          if (Math.random() < 0.3) {
            this.particles.push({
              x: firework.x + (Math.random() * 3 - 1.5),
              y: firework.y + (Math.random() * 3 - 1.5),
              vx: (Math.random() * 1 - 0.5) * 0.3,
              vy: (Math.random() * 1 - 0.5) * 0.3,
              r: parseInt(firework.color.slice(1, 3), 16),
              g: parseInt(firework.color.slice(3, 5), 16),
              b: parseInt(firework.color.slice(5, 7), 16),
              alpha: 0.7,
              startAlpha: 0.7,
              size: Math.random() * 1.2 + 0.5,
              originalSize: Math.random() * 1.2 + 0.5
            });
          }
        } else {
          // Apply gravity when inactive with slight drift for realism
          firework.vy += this.gravity * 0.3 * (deltaTime / 16);
          firework.vx += (Math.random() * 0.1 - 0.05) * (deltaTime / 16); // Add slight horizontal drift
          firework.x += firework.vx * (deltaTime / 16) * 0.98;
          firework.y += firework.vy * (deltaTime / 16);
        }
  
        // Draw enhanced trail
        const trailLength = this.settings.trailLength;
        const gradient = this.ctx.createLinearGradient(
          firework.x, firework.y,
          firework.x - firework.vx * speedDampening * trailLength,
          firework.y - firework.vy * speedDampening * trailLength
        );
        
        gradient.addColorStop(0, firework.color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        this.ctx.beginPath();
        this.ctx.moveTo(firework.x, firework.y);
        this.ctx.lineTo(
          firework.x - firework.vx * speedDampening * trailLength,
          firework.y - firework.vy * speedDampening * trailLength
        );
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
  
        // Draw firework with glow effect
        if (this.settings.glowEffect) {
          // Outer glow
          this.ctx.beginPath();
          this.ctx.arc(firework.x, firework.y, 6, 0, Math.PI * 2);
          const glow = this.ctx.createRadialGradient(
            firework.x, firework.y, 0,
            firework.x, firework.y, 6
          );
          glow.addColorStop(0, firework.color);
          glow.addColorStop(1, "rgba(255, 255, 255, 0)");
          this.ctx.fillStyle = glow;
          this.ctx.fill();
        }
        
        // Draw firework center
        this.ctx.beginPath();
        this.ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.fill();
  
        // Remove if off screen
        if (
          firework.y > this.canvas.height ||
          firework.x < -20 ||
          firework.x > this.canvas.width + 20
        ) {
          this.fireworks.splice(i, 1);
          i--;
          if (this.debug) {
            console.log("Firework removed - went offscreen");
          }
        }
      }
      
      // Reset composite operation
      this.ctx.globalCompositeOperation = "source-over";
    }
  
    /**
     * Update particles
     */
    updateParticles(deltaTime) {
      // Set composite operation for glow effect
      if (this.settings.glowEffect) {
        this.ctx.globalCompositeOperation = "lighter";
      }
      
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
  
        // Shimmer effect - slightly vary RGB values
        if (this.settings.shimmerEffect && Math.random() < 0.1) {
          particle.r = Math.min(255, Math.max(0, particle.r + (Math.random() * 10 - 5)));
          particle.g = Math.min(255, Math.max(0, particle.g + (Math.random() * 10 - 5)));
          particle.b = Math.min(255, Math.max(0, particle.b + (Math.random() * 10 - 5)));
        }
  
        // Move particle with realistic physics
        particle.x += particle.vx * (deltaTime / 16);
        particle.y += particle.vy * (deltaTime / 16);
  
        // Apply physics with more realistic damping
        particle.vx *= 0.97;
        particle.vy *= 0.97;
        particle.vy += this.gravity * 0.12 * (deltaTime / 16);
  
        // Fade out more gradually for longer-lasting effect
        particle.alpha -= (0.01 * this.settings.particleLifespan) * (deltaTime / 16);
        
        // Size based on alpha with more gradual reduction
        particle.size = particle.originalSize * Math.pow(particle.alpha / particle.startAlpha, 1.2);
  
        // Draw enhanced particle
        if (particle.alpha > 0.01) {
          // Draw particle with glow
          if (this.settings.glowEffect && particle.size > 1) {
            // Create glow around larger particles
            const glow = this.ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 2.5
            );
            
            const particleColor = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha * 0.3})`;
            glow.addColorStop(0, particleColor);
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = glow;
            this.ctx.fill();
          }
          
          // Draw main particle
          this.ctx.beginPath();
          this.ctx.arc(
            particle.x,
            particle.y,
            Math.max(0.5, particle.size),
            0,
            Math.PI * 2
          );
          
          this.ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha})`;
          this.ctx.fill();
  
          // Add trail for larger particles
          if (particle.size > 1.5 && Math.random() < 0.4) {
            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(
              particle.x - particle.vx * 2,
              particle.y - particle.vy * 2
            );
            this.ctx.strokeStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha * 0.5})`;
            this.ctx.lineWidth = particle.size * 0.5;
            this.ctx.stroke();
          }
        }
  
        // Remove faded particles
        if (particle.alpha <= 0.01 || particle.size < 0.2) {
          this.particles.splice(i, 1);
          i--;
        }
      }
      
      // Reset composite operation
      this.ctx.globalCompositeOperation = "source-over";
    }
  
    /**
     * Create explosion effect with enhanced visuals
     */
    createExplosion(x, y, color) {
      // Parse base color into RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
  
      // Select a color pair for multi-color explosions
      let secondaryColor = color;
      if (this.settings.useMultiColor) {
        const randomPair = this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
        if (randomPair[0] === color) {
          secondaryColor = randomPair[1];
        } else {
          secondaryColor = randomPair[0];
        }
      }
      
      // Parse secondary color
      const sr = parseInt(secondaryColor.slice(1, 3), 16);
      const sg = parseInt(secondaryColor.slice(3, 5), 16);
      const sb = parseInt(secondaryColor.slice(5, 7), 16);
  
      // Select explosion type (0-3) for variety
      const explosionType = Math.floor(Math.random() * 4);
      
      // Create main explosion particles
      const particleCount = this.settings.particleCount;
      const burstSpeed = 2 + Math.random() * 1.5; // Randomize burst speed
  
      for (let i = 0; i < particleCount; i++) {
        // Create varied explosion patterns based on type
        let angle, speed, size;
        
        switch(explosionType) {
          case 0: // Standard circular burst
            angle = Math.random() * Math.PI * 2;
            speed = (Math.random() * 2.5 + 1.5) * burstSpeed;
            break;
          case 1: // Ring explosion
            angle = Math.random() * Math.PI * 2;
            speed = (Math.random() * 0.5 + 2.5) * burstSpeed; // More uniform speed
            break;
          case 2: // Directional burst (upward focused)
            angle = Math.random() * Math.PI - Math.PI/2 - Math.PI/4; // -135° to 45°
            speed = (Math.random() * 2.5 + 1.5) * burstSpeed;
            break;
          case 3: // Spiral pattern
            angle = (i / particleCount) * Math.PI * 8;
            speed = (1.5 + Math.sin(angle) * 0.5) * burstSpeed;
            break;
        }
        
        // Size with slight randomization
        size = Math.random() * 2.5 + 1;
        
        // Determine color: primary, secondary or mixed
        let particleR, particleG, particleB;
        
        if (this.settings.useMultiColor) {
          // Randomize between primary, secondary, and variations 
          if (Math.random() < 0.6) {
            // Primary color with variation
            particleR = Math.min(255, Math.max(0, r + (Math.random() * 50 - 25)));
            particleG = Math.min(255, Math.max(0, g + (Math.random() * 50 - 25)));
            particleB = Math.min(255, Math.max(0, b + (Math.random() * 50 - 25)));
          } else {
            // Secondary color with variation
            particleR = Math.min(255, Math.max(0, sr + (Math.random() * 50 - 25)));
            particleG = Math.min(255, Math.max(0, sg + (Math.random() * 50 - 25)));
            particleB = Math.min(255, Math.max(0, sb + (Math.random() * 50 - 25)));
          }
        } else {
          // Single color with variation
          particleR = Math.min(255, Math.max(0, r + (Math.random() * 50 - 25)));
          particleG = Math.min(255, Math.max(0, g + (Math.random() * 50 - 25)));
          particleB = Math.min(255, Math.max(0, b + (Math.random() * 50 - 25)));
        }
  
        // Create the particle with enhanced properties
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: Math.floor(particleR),
          g: Math.floor(particleG),
          b: Math.floor(particleB),
          alpha: 1,
          startAlpha: 1,
          size: size,
          originalSize: size,
          // Add slight trajectory variation over time
          drift: {
            vx: (Math.random() * 0.4 - 0.2),
            vy: (Math.random() * 0.4 - 0.2)
          }
        });
      }
  
      // Create white/bright spark highlights
      const sparkCount = 25;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 3;
        const size = Math.random() * 2 + 1.5;
  
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 255,
          g: 255,
          b: 255,
          alpha: 1,
          startAlpha: 1,
          size: size,
          originalSize: size
        });
      }
  
      // Create dim outer glow particles
      const glowCount = 15;
      for (let i = 0; i < glowCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const size = Math.random() * 5 + 3;
  
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: r,
          g: g,
          b: b,
          alpha: 0.3,
          startAlpha: 0.3,
          size: size,
          originalSize: size,
          // Slower fade for glow particles
          fadeRate: 0.005
        });
      }
  
      if (this.debug) {
        console.log(
          `Created enhanced explosion at ${x.toFixed(0)}, ${y.toFixed(
            0
          )} with color ${color}, type ${explosionType}`
        );
      }
    }
  
    /**
     * Launch a single firework with enhanced visuals
     */
    launchFirework() {
      // Prevent launching if already in progress
      if (this.launchingFirework) {
        if (this.debug)
          console.log("Prevented duplicate launch - already in progress");
        return null;
      }
  
      this.launchingFirework = true;
  
      // Set launch position with more randomization
      const horizontalMargin = this.canvas.width * 0.15;
      const bottomMargin = 40;
      const startX =
        horizontalMargin +
        Math.random() * (this.canvas.width - horizontalMargin * 2);
      const startY = this.canvas.height - bottomMargin + (Math.random() * 20 - 10);
  
      // Multiple targeting strategies for variety
      let targetX, targetY;
      
      // Random targeting strategy (0-2)
      const targetingStrategy = Math.floor(Math.random() * 3);
      
      switch(targetingStrategy) {
        case 0: // Center focus with randomization
          targetX = this.canvas.width / 2 + (Math.random() * 0.5 - 0.25) * this.canvas.width;
          targetY = this.canvas.height * (0.1 + Math.random() * 0.15);
          break;
        case 1: // Wide spread
          targetX = Math.random() * this.canvas.width;
          targetY = this.canvas.height * (0.15 + Math.random() * 0.2);
          break;
        case 2: // Height variation (high shots)
          targetX = startX + (Math.random() * 0.3 - 0.15) * this.canvas.width;
          targetY = this.canvas.height * (0.05 + Math.random() * 0.1);
          break;
      }
  
      // Calculate trajectory with slight arc
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const canvasHeightFactor = Math.min(1, this.canvas.height / 800);
      const speed = (8 + Math.random() * 3) * canvasHeightFactor;
  
      // Velocity components with slight variations for realism
      const vx = Math.cos(angle) * speed * (1 + Math.random() * 0.1 - 0.05);
      const vy = Math.sin(angle) * speed * (1 + Math.random() * 0.1 - 0.05);
  
      // Select color with improved randomization
      let color;
      // Occasionally (20% chance) use gold/silver for special fireworks
      if (Math.random() < 0.2) {
        color = Math.random() < 0.5 ? "#FFD700" : "#C0C0C0"; // Gold or Silver
      } else {
        color = this.colors[Math.floor(Math.random() * this.colors.length)];
      }
  
      // Create firework with enhanced properties
      const firework = {
        x: startX,
        y: startY,
        vx: vx,
        vy: vy,
        color: color,
        active: true,
        id: Date.now() + Math.random(),
        // Add trail effect properties
        trail: [],
        trailLength: 5 + Math.floor(Math.random() * 3)
      };
  
      // Add to array
      this.fireworks.push(firework);
  
      if (this.debug) {
        console.log(
          `Enhanced firework launched from ${startX.toFixed(0)}, ${startY.toFixed(
            0
          )} with color ${color}, strategy ${targetingStrategy}`
        );
      }
  
      // Reset launch flag after delay
      setTimeout(() => {
        this.launchingFirework = false;
      }, 200);
  
      return firework.id;
    }
  
    /**
     * Deactivate a firework
     */
    deactivateFirework(id) {
      for (const firework of this.fireworks) {
        if (firework.id === id) {
          firework.active = false;
          if (this.debug) {
            console.log(`Firework deactivated ${id}`);
          }
          break;
        }
      }
    }
  
    /**
     * Explode all fireworks
     */
    explodeAllFireworks() {
      if (this.fireworks.length === 0) {
        if (this.debug) console.log("No active fireworks to explode");
        return;
      }
  
      if (this.debug) {
        console.log(`Exploding ${this.fireworks.length} active fireworks`);
      }
  
      // Create explosions for each firework
      for (const firework of this.fireworks) {
        this.createExplosion(firework.x, firework.y, firework.color);
      }
  
      // Clear all fireworks
      this.fireworks = [];
    }
  
    /**
     * Handle canvas resize
     */
    handleResize() {
      const container = this.canvas.parentNode;
      const rect = container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  
    /**
     * Handle sustained sound
     */
    applySustainedSound(volume, duration) {
      // Requirements check
      if (volume < 0.1 || duration < 500) {
        return null;
      }
  
      // Limit number of fireworks
      if (this.fireworks.length >= 5) {
        if (this.debug) console.log("Maximum fireworks reached (5)");
        return null;
      }
  
      if (this.debug) {
        console.log("Launching new firework for sustained sound");
      }
  
      return this.launchFirework();
    }
  
    /**
     * Handle volume changes
     */
    applyVolume(volume, category) {
      if (category === "loud") {
        if (this.debug) {
          console.log("Loud sound detected, checking for fireworks to explode");
        }
  
        if (this.fireworks.length > 0) {
          this.explodeAllFireworks();
        } else {
          if (this.debug) console.log("No active fireworks to explode");
        }
      }
    }
  
    /**
     * Handle sudden sound event - DISABLED
     */
    applySuddenSound(volume) {
      // Disable sudden sound animations
      if (this.debug) {
        console.log(
          `Sudden sound detected (level: ${volume.toFixed(
            4
          )}) - animations disabled`
        );
      }
      // Not launching any fireworks for sudden sounds
      return null;
    }
  
    /**
     * Clean up resources
     */
    destroy() {
      window.removeEventListener("resize", this.resizeHandler);
    }
  }

//   reduce the speed for the firework launch and make sure it doesn't go out of the canvas by managing its speed and distance from the canvas border also remove the test firework button also clear the white footprint it leave behind to normal slowly after firework