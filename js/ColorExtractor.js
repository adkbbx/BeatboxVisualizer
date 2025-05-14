/**
 * ColorExtractor extracts dominant colors from images
 */
class ColorExtractor {
    /**
     * Extract dominant color from a canvas
     */
    extractDominantColor(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Get image data, skipping transparent border pixels
        const borderSkip = Math.ceil(width * 0.1); // Skip 10% from edges
        const sampleWidth = width - (borderSkip * 2);
        const sampleHeight = height - (borderSkip * 2);
        
        if (sampleWidth <= 0 || sampleHeight <= 0) {
            const imageData = ctx.getImageData(0, 0, width, height);
            return this.findDominantColor(imageData.data, width, height);
        }
        
        const imageData = ctx.getImageData(
            borderSkip, borderSkip, 
            sampleWidth, sampleHeight
        );
        
        return this.findDominantColor(imageData.data, sampleWidth, sampleHeight);
    }
    
    /**
     * Find the dominant non-background color in the image data
     */
    findDominantColor(data, width, height) {
        // Create buckets for different color ranges (simplified color quantization)
        const colorBuckets = {};
        const bucketSize = 24; // Larger bucket size for better grouping
        let totalPixelsProcessed = 0;
        
        // Process all pixels
        for (let i = 0; i < data.length; i += 4) {
            // Skip transparent or nearly transparent pixels
            if (data[i + 3] < 128) continue;
            
            // Get RGB values and round to buckets to group similar colors
            const r = Math.floor(data[i] / bucketSize) * bucketSize;
            const g = Math.floor(data[i + 1] / bucketSize) * bucketSize;
            const b = Math.floor(data[i + 2] / bucketSize) * bucketSize;
            
            // Create bucket key and increment count
            const key = `${r},${g},${b}`;
            if (!colorBuckets[key]) {
                colorBuckets[key] = {
                    count: 0,
                    r: data[i],       // Store original values for accuracy
                    g: data[i + 1],
                    b: data[i + 2]
                };
            }
            
            colorBuckets[key].count++;
            totalPixelsProcessed++;
        }
        
        // If no valid pixels found (all transparent), return a default color
        if (totalPixelsProcessed === 0) {
            return {
                rgb: { r: 255, g: 100, b: 100 }, // Default to bright pink/red
                hex: '#ff6464'
            };
        }
        
        // Find the bucket with the most pixels (excluding very dark or light colors)
        let dominantKey = null;
        let maxCount = 0;
        
        for (const key in colorBuckets) {
            const bucket = colorBuckets[key];
            const [r, g, b] = key.split(',').map(Number);
            
            // Skip very light colors (likely background)
            const brightness = (r + g + b) / 3;
            if (brightness > 220) continue;
            
            // Skip very dark colors
            if (brightness < 30) continue;
            
            // Skip very desaturated colors (likely background/grayscale)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            if (saturation < 0.1) continue;
            
            if (bucket.count > maxCount) {
                maxCount = bucket.count;
                dominantKey = key;
            }
        }
        
        // If all colors were filtered out, try again without the saturation filter
        if (!dominantKey) {
            console.log('No dominant color found with saturation filter, trying without');
            for (const key in colorBuckets) {
                const bucket = colorBuckets[key];
                const [r, g, b] = key.split(',').map(Number);
                
                // Only skip very light colors
                const brightness = (r + g + b) / 3;
                if (brightness > 240) continue;
                
                if (bucket.count > maxCount) {
                    maxCount = bucket.count;
                    dominantKey = key;
                }
            }
        }
        
        // If still no dominant color, use the most frequent color regardless
        if (!dominantKey) {
            console.log('No dominant color found, using most frequent color');
            for (const key in colorBuckets) {
                if (colorBuckets[key].count > maxCount) {
                    maxCount = colorBuckets[key].count;
                    dominantKey = key;
                }
            }
        }
        
        // Get the actual color values from the bucket
        const dominantBucket = colorBuckets[dominantKey];
        const rgb = {
            r: dominantBucket.r,
            g: dominantBucket.g,
            b: dominantBucket.b
        };
        
        // Convert to hex
        const hex = '#' + [rgb.r, rgb.g, rgb.b]
            .map(x => {
                const hex = Math.round(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');
        
        return { rgb, hex };
    }
}

export default ColorExtractor;