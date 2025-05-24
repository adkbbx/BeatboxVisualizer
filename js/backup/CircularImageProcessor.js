/**
 * CircularImageProcessor - Special processor for circular images on black backgrounds
 * Focuses on extracting just the circular part of the image
 */
class CircularImageProcessor {
    /**
     * Process a circular image to extract just the circular part
     */
    processCircularImage(canvas) {
        try {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Get the image data
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Find the circle parameters
            const circleParams = this.detectCircle(data, width, height);
            if (!circleParams) {
                return canvas;
            }
            
            // Create a new canvas with the size of the circle
            const newSize = Math.ceil(circleParams.radius * 2.1); // Add a little margin
            const newCanvas = document.createElement('canvas');
            newCanvas.width = newSize;
            newCanvas.height = newSize;
            const newCtx = newCanvas.getContext('2d');
            
            // Clear the new canvas to transparent
            newCtx.clearRect(0, 0, newSize, newSize);
            
            // Create a circle clipping path
            newCtx.beginPath();
            newCtx.arc(newSize/2, newSize/2, circleParams.radius, 0, Math.PI * 2);
            newCtx.closePath();
            newCtx.clip();
            
            // Draw the original image, centered on the circle
            const sourceX = circleParams.centerX - circleParams.radius;
            const sourceY = circleParams.centerY - circleParams.radius;
            newCtx.drawImage(
                canvas, 
                sourceX, sourceY, circleParams.radius * 2, circleParams.radius * 2,
                0, 0, newSize, newSize
            );
            
            // Copy the dominant color from the original canvas
            if (canvas.dominantColor) {
                newCanvas.dominantColor = canvas.dominantColor;
            }
            
            return newCanvas;
        } catch (error) {
            return canvas; // Return original on error
        }
    }
    
    /**
     * Detect a circle in the image
     */
    detectCircle(data, width, height) {
        // First, try to detect circle edges
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        // Scan from center outward to find edges
        const brightnessSamples = this.sampleBrightness(data, width, height, centerX, centerY);
        
        // Analyze brightness samples to find circle radius
        const radius = this.findCircleRadius(brightnessSamples, width, height);
        
        if (radius) {
            return {
                centerX: centerX,
                centerY: centerY,
                radius: radius
            };
        }
        
        return null;
    }
    
    /**
     * Sample brightness values from center outward
     */
    sampleBrightness(data, width, height, centerX, centerY) {
        const maxRadius = Math.min(width, height) / 2;
        const samples = [];
        
        // Sample in 8 directions
        const directions = [
            {dx: 1, dy: 0},   // right
            {dx: 1, dy: 1},   // bottom-right
            {dx: 0, dy: 1},   // bottom
            {dx: -1, dy: 1},  // bottom-left
            {dx: -1, dy: 0},  // left
            {dx: -1, dy: -1}, // top-left
            {dx: 0, dy: -1},  // top
            {dx: 1, dy: -1}   // top-right
        ];
        
        // Sample each direction
        directions.forEach(dir => {
            const dirSamples = [];
            
            for (let r = 0; r < maxRadius; r++) {
                const x = Math.min(width - 1, Math.max(0, centerX + Math.floor(r * dir.dx)));
                const y = Math.min(height - 1, Math.max(0, centerY + Math.floor(r * dir.dy)));
                
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const brightness = (r + g + b) / 3;
                
                dirSamples.push({
                    radius: r,
                    brightness: brightness
                });
            }
            
            samples.push(dirSamples);
        });
        
        return samples;
    }
    
    /**
     * Find the radius of the circle from brightness samples
     */
    findCircleRadius(samples, width, height) {
        // Simple approach: find the point where brightness drops significantly
        const thresholdBrightness = 30; // Threshold for detecting dark background
        const edgeRadii = [];
        
        samples.forEach(dirSamples => {
            for (let i = 1; i < dirSamples.length; i++) {
                const curr = dirSamples[i];
                const prev = dirSamples[i - 1];
                
                // Look for transition from bright to dark
                if (prev.brightness > thresholdBrightness && curr.brightness <= thresholdBrightness) {
                    edgeRadii.push(curr.radius);
                    break;
                }
                
                // Also consider significant brightness drop
                if (i > 5 && prev.brightness - curr.brightness > 30) {
                    edgeRadii.push(curr.radius);
                    break;
                }
            }
        });
        
        // If we found edge points, average them
        if (edgeRadii.length > 0) {
            const sum = edgeRadii.reduce((acc, r) => acc + r, 0);
            return Math.floor(sum / edgeRadii.length);
        }
        
        // Default: use 45% of the smallest dimension
        return Math.min(width, height) * 0.45;
    }
}

export default CircularImageProcessor;
