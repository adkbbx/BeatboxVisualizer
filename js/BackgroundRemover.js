/**
 * BackgroundRemover handles image background removal functionality
 */
class BackgroundRemover {
    /**
     * Remove background from an image
     */
    removeBackground(imageData, ctx) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // First pass: Calculate average background color from edges
        const edgePixels = this.getEdgePixels(data, width, height);
        const bgColor = this.calculateAverageColor(edgePixels);

        // Second pass: Remove background with dynamic threshold
        const threshold = 30; // Adjustable threshold for color difference
        let pixelsProcessed = 0;
        let pixelsRemoved = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate color difference from background
            const colorDiff = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );

            // If color is close to background, make it transparent
            if (colorDiff < threshold) {
                data[i + 3] = 0; // Set alpha to 0
                pixelsRemoved++;
            } else {
                // Enhance edges for better petal definition
                const edgeFactor = Math.min(1, colorDiff / (threshold * 2));
                data[i + 3] = Math.round(255 * edgeFactor);
            }
            pixelsProcessed++;
        }

        // Apply the modified data back to canvas
        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Get edge pixels for background color detection
     */
    getEdgePixels(data, width, height) {
        const edgePixels = [];
        const edgeSize = 2; // Sample pixels from outer edges

        // Sample from top and bottom edges
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < edgeSize; y++) {
                // Top edge
                const topIndex = (y * width + x) * 4;
                edgePixels.push({
                    r: data[topIndex],
                    g: data[topIndex + 1],
                    b: data[topIndex + 2]
                });

                // Bottom edge
                const bottomIndex = ((height - 1 - y) * width + x) * 4;
                edgePixels.push({
                    r: data[bottomIndex],
                    g: data[bottomIndex + 1],
                    b: data[bottomIndex + 2]
                });
            }
        }

        // Sample from left and right edges
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < edgeSize; x++) {
                // Left edge
                const leftIndex = (y * width + x) * 4;
                edgePixels.push({
                    r: data[leftIndex],
                    g: data[leftIndex + 1],
                    b: data[leftIndex + 2]
                });

                // Right edge
                const rightIndex = (y * width + (width - 1 - x)) * 4;
                edgePixels.push({
                    r: data[rightIndex],
                    g: data[rightIndex + 1],
                    b: data[rightIndex + 2]
                });
            }
        }

        return edgePixels;
    }

    /**
     * Calculate average color from pixel array
     */
    calculateAverageColor(pixels) {
        const sum = pixels.reduce((acc, pixel) => {
            return {
                r: acc.r + pixel.r,
                g: acc.g + pixel.g,
                b: acc.b + pixel.b
            };
        }, { r: 0, g: 0, b: 0 });

        return {
            r: Math.round(sum.r / pixels.length),
            g: Math.round(sum.g / pixels.length),
            b: Math.round(sum.b / pixels.length)
        };
    }
}

export default BackgroundRemover;