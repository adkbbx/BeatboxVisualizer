/**
 * Ultra Aggressive Black Background Remover
 * Specialized for completely removing black backgrounds from dark images
 */
class BlackBackgroundRemover {
    /**
     * Remove background from an image
     */
    removeBackground(imageData, ctx) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // First, detect the circular boundary
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Estimate the radius of the circular image
        const radius = this.estimateCircleRadius(data, width, height, centerX, centerY);
        
        // Aggressively remove black/dark pixels
        this.removeBlackPixels(data, width, height, centerX, centerY, radius);
        
        // Apply the modified data back to canvas
        ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Estimate the radius of a circular image
     */
    estimateCircleRadius(data, width, height, centerX, centerY) {
        // Sample points along horizontal and vertical axes
        const samplePoints = [];
        const step = 2; // Sample every 2 pixels for efficiency
        
        // Sample horizontal axis (left to right)
        for (let x = 0; x < width; x += step) {
            const index = (Math.floor(centerY) * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3;
            
            samplePoints.push({
                x: x,
                y: centerY,
                brightness: brightness
            });
        }
        
        // Sample vertical axis (top to bottom)
        for (let y = 0; y < height; y += step) {
            const index = (y * width + Math.floor(centerX)) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3;
            
            samplePoints.push({
                x: centerX,
                y: y,
                brightness: brightness
            });
        }
        
        // Find the edge points by detecting significant brightness changes
        const edgePoints = [];
        const brightnessThreshold = 30; // Brightness threshold to detect edges
        
        // Analyze horizontal points
        for (let i = 1; i < samplePoints.length - 1; i++) {
            const prev = samplePoints[i - 1];
            const curr = samplePoints[i];
            const next = samplePoints[i + 1];
            
            if (Math.abs(curr.brightness - prev.brightness) > brightnessThreshold ||
                Math.abs(curr.brightness - next.brightness) > brightnessThreshold) {
                edgePoints.push({
                    x: curr.x,
                    y: curr.y,
                    distance: Math.sqrt(Math.pow(curr.x - centerX, 2) + Math.pow(curr.y - centerY, 2))
                });
            }
        }
        
        // Calculate average distance (radius)
        if (edgePoints.length > 0) {
            const totalDistance = edgePoints.reduce((sum, point) => sum + point.distance, 0);
            return totalDistance / edgePoints.length;
        }
        
        // Fallback: estimate based on image dimensions
        return Math.min(width, height) * 0.45; // Assume circle is ~90% of the smallest dimension
    }
    
    /**
     * Ultra aggressive method for removing black/dark pixels
     */
    removeBlackPixels(data, width, height, centerX, centerY, radius) {
        // Very low threshold to catch even slightly dark pixels
        const darkThreshold = 80; // Higher value for more aggressive removal
        const saturationThreshold = 50; // Higher value for more aggressive removal
        
        // Add a small buffer to the radius to ensure we get all the black edges
        const radiusBuffer = radius * 1.05;
        
        // Process all pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // Skip if alpha is already 0
                if (data[index + 3] === 0) continue;
                
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Calculate distance from center
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                
                // If outside the circle radius with buffer, make transparent
                if (distance > radiusBuffer) {
                    data[index + 3] = 0;
                    continue;
                }
                
                // Calculate brightness and saturation
                const brightness = (r + g + b) / 3;
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max === 0 ? 0 : (max - min) / max * 255;
                
                // Conditions for making pixel transparent:
                // 1. Too dark (black/near black)
                // 2. Low saturation and dark (greyish-black)
                // 3. On the edge of the circle and dark
                if (brightness < darkThreshold || 
                    (saturation < saturationThreshold && brightness < 120) ||
                    (distance > radius * 0.95 && distance < radiusBuffer && brightness < 100)) {
                    
                    data[index + 3] = 0; // Make transparent
                }
            }
        }
    }
}

export default BlackBackgroundRemover;