// ImageProcessor.js
export class ImageProcessor {
    constructor() {
        console.log('Initializing ImageProcessor...');
        this.maxSize = 150; // Maximum size for any dimension
        this.processedImages = new Map();
    }

    // Process uploaded image
    processImage(file) {
        return new Promise((resolve, reject) => {
            console.log(`Processing image: ${file.name}`);
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        // Create a temporary canvas for processing
                        const tempCanvas = document.createElement('canvas');
                        const tempCtx = tempCanvas.getContext('2d');

                        // Calculate scaled dimensions while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        const aspectRatio = width / height;

                        if (width > height) {
                            width = Math.min(width, this.maxSize);
                            height = width / aspectRatio;
                        } else {
                            height = Math.min(height, this.maxSize);
                            width = height * aspectRatio;
                        }

                        // Set canvas size to scaled dimensions
                        tempCanvas.width = width;
                        tempCanvas.height = height;

                        // Draw and process the image
                        tempCtx.drawImage(img, 0, 0, width, height);
                        
                        // Get image data for processing
                        const imageData = tempCtx.getImageData(0, 0, width, height);
                        this.removeBackground(imageData, tempCtx);
                        
                        // Extract the dominant color from the processed image
                        const dominantColor = this.extractDominantColor(tempCanvas);
                        
                        // Store the dominant color with the canvas
                        tempCanvas.dominantColor = dominantColor;

                        console.debug('Image processed with dimensions:', {
                            original: { width: img.width, height: img.height },
                            scaled: { width: width, height: height },
                            dominantColor: dominantColor
                        });

                        resolve(tempCanvas);
                    } catch (error) {
                        console.error('Error processing image:', error);
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Load image from file
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Remove background with improved algorithm
    removeBackground(imageData, ctx) {
        console.log('Removing background with enhanced algorithm...');
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        // First pass: Calculate average background color from edges
        const edgePixels = this.getEdgePixels(data, width, height);
        const bgColor = this.calculateAverageColor(edgePixels);
        console.debug('Detected background color:', bgColor);

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
        
        console.log('Background removal complete:', {
            totalPixels: pixelsProcessed,
            removedPixels: pixelsRemoved,
            retainedPixels: pixelsProcessed - pixelsRemoved
        });
    }

    // Get edge pixels for background color detection
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

    // Calculate average color from pixel array
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
    
    // Extract dominant color from the processed image canvas
    extractDominantColor(canvas) {
        console.log('Extracting dominant color from image...');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Get image data, skipping transparent border pixels
        const borderSkip = Math.ceil(width * 0.1); // Skip 10% from edges
        const sampleWidth = width - (borderSkip * 2);
        const sampleHeight = height - (borderSkip * 2);
        
        if (sampleWidth <= 0 || sampleHeight <= 0) {
            console.warn('Image too small for proper color sampling, using full image');
            const imageData = ctx.getImageData(0, 0, width, height);
            return this.findDominantColor(imageData.data, width, height);
        }
        
        const imageData = ctx.getImageData(
            borderSkip, borderSkip, 
            sampleWidth, sampleHeight
        );
        
        return this.findDominantColor(imageData.data, sampleWidth, sampleHeight);
    }
    
    // Find the dominant non-background color in the image data
    findDominantColor(data, width, height) {
        console.log('Finding dominant color in image data...');
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
            console.warn('No non-transparent pixels found, using default color');
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
            console.log('All colors filtered, relaxing criteria...');
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
            console.warn('No suitable dominant color found, using most frequent');
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
        
        console.log('Dominant color extracted:', {
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            hex: hex,
            pixelCount: maxCount,
            percentOfImage: ((maxCount / totalPixelsProcessed) * 100).toFixed(1) + '%'
        });
        
        return { rgb, hex };
    }

    // Validate image file
    validateImage(file) {
        console.log(`Validating image: ${file.name}`);
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            console.error(`Invalid file type: ${file.type}`);
            throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
        }

        if (file.size > maxSize) {
            console.error(`File too large: ${file.size} bytes`);
            throw new Error('File too large. Maximum size is 5MB.');
        }

        console.log('Image validation passed');
        return true;
    }
} 