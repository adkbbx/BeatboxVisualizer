/**
 * Represents a single bubble with floating physics
 */
class Bubble {
    constructor(x, y, targetX, targetY, color, velocity, size) {
        // Handle default parameter manually for better compatibility
        if (size === undefined) size = 1.0;
        
        this.id = Date.now() + Math.random(); // Unique ID
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.velocity = velocity;
        this.size = size; // Size multiplier for the bubble
        this.exploded = false;
        this.alpha = 0.7; // Bubbles are more translucent than fireworks
        this.isNewest = false;
        this.selectedImageColor = color;
        this.selectedCustomImageId = null;
        this.hasReachedTarget = false;
        this.markedForExplosion = false;
        this.markedForPop = false; // Mark for sequential popping (like fireworks)
        this.markedForClusterPop = false; // Mark for cluster popping (new behavior for loud sounds)
        this.age = 0; // Track how long the bubble has existed
        this.maxAge = 1500; // Bubbles live longer than fireworks
        
        // Bubble-specific properties
        this.wobbleOffset = Math.random() * Math.PI * 2; // Random wobble phase
        this.wobbleSpeed = 0.01 + Math.random() * 0.01; // Gentle wobble frequency
        this.wobbleAmplitude = 0.3 + Math.random() * 0.4; // Moderate wobble intensity
        this.buoyancy = 0.98; // Resistance to gravity (bubbles float)
        this.shimmerPhase = Math.random() * Math.PI * 2; // For shimmer effect
        this.baseRadius = 8 + Math.random() * 12; // Base bubble size
        
        // Cluster appearance properties (realistic surface attachment)
        this.clusterSize = 1; // Number of visual bubbles to draw (1 = single bubble)
        this.clusterBubbles = []; // Array of foam bubble positions and properties
    }
    
    /**
     * Set up realistic foam cluster appearance based on surface attachment
     * @param {number} clusterSize - Approximate number of visual bubbles to display
     */
    setupClusterAppearance(clusterSize = 3) {
        this.clusterSize = clusterSize;
        this.clusterBubbles = [];
        
        // Main bubble radius for surface positioning
        const mainRadius = this.baseRadius * this.size * 1.4; // Same as main bubble
        
        // Create foam bubbles that attach to the main bubble's surface
        this.generateSurfaceFoam(clusterSize, mainRadius);
    }
    
    /**
     * Generate foam bubbles that attach to the main bubble's surface
     * @param {number} bubbleCount - Number of foam bubbles
     * @param {number} mainRadius - Radius of the main bubble
     */
    generateSurfaceFoam(bubbleCount, mainRadius) {
        this.clusterBubbles = [];
        
        for (let i = 0; i < bubbleCount; i++) {
            // Much more random angle distribution instead of regular intervals
            const baseAngle = Math.random() * Math.PI * 2; // Completely random base angle
            const angleVariation = (Math.random() - 0.5) * 1.5; // Additional random variation
            const angle = baseAngle + angleVariation;
            
            // Foam bubble size with more variation (20% to 80% of main bubble)
            const sizeVariation = 0.2 + Math.random() * 0.6; // Random between 0.2 and 0.8
            const foamRadius = mainRadius * sizeVariation;
            
            // Add randomization to distance from center for more organic clustering
            const baseDistance = mainRadius + foamRadius * 0.6; // Base distance for surface attachment
            const distanceVariation = (Math.random() - 0.5) * foamRadius * 0.4; // Random distance variation
            const distanceFromCenter = baseDistance + distanceVariation;
            
            const foamX = Math.cos(angle) * distanceFromCenter;
            const foamY = Math.sin(angle) * distanceFromCenter;
            
            this.clusterBubbles.push({
                offsetX: foamX,
                offsetY: foamY,
                radius: foamRadius,
                angle: angle,
                phase: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.003 + Math.random() * 0.003, // Very gentle movement
                alpha: 0.7 + Math.random() * 0.3, // Random transparency (70% to 100%)
                hue: Math.random() * 20 - 10 // Slight color variation
            });
        }
        
        // Sort by size (largest first) for better layering
        this.clusterBubbles.sort((a, b) => b.radius - a.radius);
    }
    
    /**
     * Update bubble position and state with floating physics
     * @param {number} gravity - Gravity effect to apply (reduced for bubbles)
     * @returns {boolean} - Whether the bubble has reached its peak height
     */
    update(gravity) {
        // Age the bubble
        this.age++;
        
        // Update individual cluster bubble animations
        this.clusterBubbles.forEach(clusterBubble => {
            clusterBubble.phase += clusterBubble.wobbleSpeed;
        });
        
        // Always apply gentle wobbling motion
        this.wobbleOffset += this.wobbleSpeed;
        const wobbleX = Math.sin(this.wobbleOffset) * this.wobbleAmplitude * 0.6; // Gentle wobble effect
        const wobbleY = Math.cos(this.wobbleOffset * 0.7) * this.wobbleAmplitude * 0.4; // Gentle wobble effect
        
        // Normal bubble physics
        if (!this.hasReachedTarget) {
            // Update position with wobble
            this.x += this.velocity.x + wobbleX;
            this.y += this.velocity.y + wobbleY;
            
            // Apply reduced gravity with buoyancy
            this.velocity.y += gravity * (1 - this.buoyancy);
            
            // Add slight upward drift for floating effect
            this.velocity.y -= 0.01;
            
            // Air resistance for bubbles (more than fireworks)
            this.velocity.x *= 0.995;
            this.velocity.y *= 0.998;
        }
        
        // Check if bubble has reached its peak (when vertical velocity becomes positive)
        const hasReachedPeak = this.velocity.y >= 0;
        
        // Update shimmer effect
        this.shimmerPhase += 0.05;
        
        return hasReachedPeak;
    }
    
    /**
     * Update the bubble after popping
     * @param {number} deltaTime - Time since last update
     * @returns {boolean} - Whether the bubble is fully faded
     */
    updateAfterExplosion(deltaTime) {
        // Faster fade for bubble cleanup
        this.alpha -= 0.06; 
        return this.alpha <= 0;
    }
    
    /**
     * Draw the bubble with realistic foam cluster appearance
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {ColorManager} colorManager - Color manager instance
     */
    draw(ctx, colorManager) {
        const color = colorManager.getColorWithAlpha(this.color, this.alpha);
        
        ctx.save();
        
        // Draw foam bubbles first (behind main bubble where they attach)
        this.clusterBubbles.forEach(foamBubble => {
            // Calculate foam bubble position with gentle animation
            const foamWobbleX = Math.sin(foamBubble.phase) * 0.5; // Very gentle wobble
            const foamWobbleY = Math.cos(foamBubble.phase * 0.9) * 0.3; // Very gentle wobble
            const foamX = this.x + foamBubble.offsetX + foamWobbleX;
            const foamY = this.y + foamBubble.offsetY + foamWobbleY;
            
            // Calculate foam bubble alpha
            const foamAlpha = this.alpha * foamBubble.alpha;
            
            // Draw foam bubble with clipping to show only the part outside main bubble
            this.drawSurfaceFoamBubble(ctx, foamX, foamY, foamBubble.radius, foamAlpha, foamBubble);
        });
        
        // Draw main bubble on top
        this.drawSingleBubble(ctx, this.x, this.y, this.size * 1.4, this.alpha, true);
        
        ctx.restore();
    }
    
    /**
     * Draw foam bubble attached to main bubble surface with proper clipping
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Foam bubble radius
     * @param {number} alpha - Alpha value
     * @param {Object} foamBubble - Foam bubble properties
     */
    drawSurfaceFoamBubble(ctx, x, y, radius, alpha, foamBubble) {
        // Main bubble radius for clipping
        const mainRadius = this.baseRadius * this.size * 1.4;
        
        // Calculate distance from foam bubble center to main bubble center
        const distanceToMain = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
        
        // Only draw if foam bubble extends beyond main bubble
        if (distanceToMain + radius > mainRadius) {
            ctx.save();
            
            // First draw the full foam bubble to a temporary canvas or use clipping
            // We want to show only the part OUTSIDE the main bubble
            
            // Create a clipping region that EXCLUDES the main bubble area
            // This will show only the protruding parts
            ctx.beginPath();
            // Create a large rectangle that covers the whole area
            ctx.rect(-10000, -10000, 20000, 20000);
            // Then subtract the main bubble area (counter-clockwise for hole)
            ctx.arc(this.x, this.y, mainRadius, 0, Math.PI * 2, true);
            ctx.clip();
            
            // Now draw the foam bubble - only the protruding part will be visible
            this.drawSimpleFoamBubble(ctx, x, y, radius, alpha, foamBubble);
            
            ctx.restore();
        }
    }
    
    /**
     * Draw a simple foam bubble with realistic soap bubble colors
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Bubble radius
     * @param {number} alpha - Alpha value
     * @param {Object} foamBubble - Foam bubble properties
     */
    drawSimpleFoamBubble(ctx, x, y, radius, alpha, foamBubble) {
        // Parse base color
        let r = 100, g = 150, b = 255; // Default blue
        if (this.color && this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }
        
        // Apply slight hue variation
        const variedR = Math.min(255, Math.max(0, r + foamBubble.hue));
        const variedG = Math.min(255, Math.max(0, g + foamBubble.hue * 0.5));
        const variedB = Math.min(255, Math.max(0, b + foamBubble.hue * 0.3));
        
        // Create simple gradient for foam bubble
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        
        // Solid, visible foam bubble
        const soapAlpha = alpha * 0.9; // Very visible
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * soapAlpha})`); // Bright highlight
        gradient.addColorStop(0.3, `rgba(${variedR}, ${variedG}, ${variedB}, ${0.7 * soapAlpha})`); // Main color
        gradient.addColorStop(0.8, `rgba(${variedR}, ${variedG}, ${variedB}, ${0.8 * soapAlpha})`); // Edge
        gradient.addColorStop(1, `rgba(${Math.max(0, variedR - 40)}, ${Math.max(0, variedG - 40)}, ${Math.max(0, variedB - 40)}, ${0.6 * soapAlpha})`); // Rim
        
        // Draw foam bubble
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add outline
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${Math.max(0, variedR - 60)}, ${Math.max(0, variedG - 60)}, ${Math.max(0, variedB - 60)}, ${0.8 * soapAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Add highlight
        const highlightRadius = radius * 0.25;
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.25, highlightRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * soapAlpha})`;
        ctx.fill();
    }
    
    /**
     * Draw a single bubble at specified position
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} sizeMultiplier - Size multiplier
     * @param {number} alpha - Alpha value
     * @param {boolean} isMainBubble - Whether this is the main bubble
     */
    drawSingleBubble(ctx, x, y, sizeMultiplier, alpha, isMainBubble = false) {
        // Calculate bubble radius with size multiplier
        const radius = this.baseRadius * sizeMultiplier;
        
        // Create radial gradient for bubble effect
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        
        // Parse color for gradient
        let r = 100, g = 150, b = 255; // Default blue
        if (this.color && this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }
        
        // Create bubble gradient with shimmer (much more intense for main bubble)
        const shimmerIntensity = isMainBubble ? 
            0.6 + 0.4 * Math.sin(this.shimmerPhase) : 
            0.4 + 0.3 * Math.sin(this.shimmerPhase);
        
        // Much higher alpha values for main bubble to stand out from foam
        const highlightAlpha = isMainBubble ? 0.8 * alpha : 0.5 * alpha;
        const mainColorAlpha = isMainBubble ? 0.6 * alpha : 0.3 * alpha;
        const edgeAlpha = isMainBubble ? 0.7 * alpha : 0.4 * alpha;
        const glowAlpha = isMainBubble ? 0.3 * alpha : 0.15 * alpha;
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${highlightAlpha})`); // Bright highlight
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${mainColorAlpha})`); // Strong main color
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${edgeAlpha})`); // Visible edge
        gradient.addColorStop(1, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${glowAlpha})`); // Outer glow
        
        // Draw main bubble
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add bubble outline (much thicker and more prominent for main bubble)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, ${isMainBubble ? 0.8 * alpha : 0.5 * alpha})`;
        ctx.lineWidth = isMainBubble ? 3 : 1.5; // Much thicker for main bubble
        ctx.stroke();
        
        // Add shimmer highlight
        const shimmerX = x - radius * 0.4;
        const shimmerY = y - radius * 0.4;
        const shimmerRadius = radius * (isMainBubble ? 0.4 : 0.3);
        
        const shimmerGradient = ctx.createRadialGradient(
            shimmerX, shimmerY, 0,
            shimmerX, shimmerY, shimmerRadius
        );
        shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmerIntensity * alpha})`);
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, shimmerRadius, 0, Math.PI * 2);
        ctx.fillStyle = shimmerGradient;
        ctx.fill();
        
        // Add large, prominent reflection spot for main bubble
        const reflectionRadius = radius * (isMainBubble ? 0.2 : 0.12);
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, reflectionRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${isMainBubble ? 0.9 * alpha : 0.6 * alpha})`;
        ctx.fill();
        
        // Add secondary reflection for main bubble only
        if (isMainBubble) {
            const secondaryReflectionRadius = radius * 0.08;
            ctx.beginPath();
            ctx.arc(x - radius * 0.35, y - radius * 0.35, secondaryReflectionRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * alpha})`;
            ctx.fill();
        }
    }
    
    /**
     * Set a custom image ID for this bubble
     * @param {string} imageId - ID of the custom image
     */
    setCustomImageId(imageId) {
        this.selectedCustomImageId = imageId;
    }
    
    /**
     * Check if this bubble should be automatically cleaned up
     * @returns {boolean} - Whether bubble is too old
     */
    isExpired() {
        return this.age >= this.maxAge;
    }
    
    /**
     * Get the current wobble position for external calculations
     * @returns {number} - Current wobble X offset
     */
    getWobbleOffset() {
        return Math.sin(this.wobbleOffset) * this.wobbleAmplitude;
    }
}

export default Bubble; 