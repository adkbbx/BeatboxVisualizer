/**
 * BackgroundManager handles multiple background images, videos, and GIFs with smooth transitions
 * Now supports HTMLImageElement, HTMLVideoElement, and animated GIFs
 */
class BackgroundManager {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        if (!this.canvas) {
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Create GIF overlay container for animated GIFs
        this.createGifOverlay();
        
        // Changed from backgroundImages to backgroundMedia to support multiple types
        this.backgroundMedia = [];
        this.currentIndex = 0;
        this.nextIndex = 0;
        this.transitionProgress = 0;
        this.transitionDuration = 2000; // transition duration in ms
        this.displayDuration = 5000; // how long to display each item (ms)
        this.lastUpdateTime = 0;
        this.lastDrawTime = 0;
        this.isTransitioning = false;
        this.isActive = false;
        this.opacity = 0.8;
        this.animationFrameId = null;
        this.timeSinceLastTransition = 0;
        
        // Video-specific properties
        this.videoVolume = 0.0; // Mute videos by default
        this.videoLoop = true; // Loop videos
        this.videoFullDuration = true; // Play full video duration before transitioning
        this.currentVideo = null; // Track currently playing video
        this.nextVideo = null; // Track next video for transitions
        this.userInteracted = false; // Track if user has interacted with page
        
        // Default background color if no media
        this.defaultBackground = '#000000';
        
        // Bind video event handlers
        this.handleVideoLoaded = this.handleVideoLoaded.bind(this);
        this.handleVideoEnded = this.handleVideoEnded.bind(this);
        this.handleVideoError = this.handleVideoError.bind(this);
        this.handleUserInteraction = this.handleUserInteraction.bind(this);
        
        // Set up user interaction listeners for video autoplay
        this.setupUserInteractionListeners();
        
        // Set up window resize handler for GIF overlay
        this.setupResizeHandler();
    }
    
    /**
     * Set up window resize handler
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            // Update canvas size
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            
            // GIF overlay automatically resizes with CSS 100% width/height
            // No additional handling needed for the overlay itself
        });
    }
    
    /**
     * Create overlay container for animated GIFs
     */
    createGifOverlay() {
        // Remove existing overlay if present
        const existingOverlay = document.getElementById('gifBackgroundOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create new overlay
        this.gifOverlay = document.createElement('div');
        this.gifOverlay.id = 'gifBackgroundOverlay';
        this.gifOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0;
            transition: opacity ${this.transitionDuration}ms ease-in-out;
        `;
        
        // Insert before the animation canvas but after background canvas
        const animationCanvas = document.getElementById('animationCanvas');
        if (animationCanvas && animationCanvas.parentNode) {
            animationCanvas.parentNode.insertBefore(this.gifOverlay, animationCanvas);
        } else {
            document.body.appendChild(this.gifOverlay);
        }
    }
    
    /**
     * Add a new background media item (image, video, or GIF)
     * @param {HTMLImageElement|HTMLVideoElement} media - The media to add
     * @param {string} type - The type: 'image', 'video', or 'gif'
     * @param {Object} options - Additional options (duration for videos, etc.)
     */
    addBackgroundMedia(media, type = 'image', options = {}) {
        const mediaItem = {
            element: media,
            type: type,
            loaded: false,
            duration: options.duration || null, // For videos
            filename: options.filename || 'Unknown'
        };
        
        if (type === 'video') {
            this.setupVideo(media, mediaItem);
        } else {
            // For images and GIFs, check if already loaded
            if (media.complete && media.naturalWidth > 0) {
                mediaItem.loaded = true;
            } else {
                media.onload = () => {
                    mediaItem.loaded = true;
                };
            }
        }
        
        this.backgroundMedia.push(mediaItem);
        
        // Start the background cycle if it's the first item and not already active
        if (this.backgroundMedia.length > 0 && !this.isActive) {
            this.startIndependentLoop();
        }
        
        return this.backgroundMedia.length - 1;
    }
    
    /**
     * Setup video element with proper settings
     * @param {HTMLVideoElement} video - The video element
     * @param {Object} mediaItem - The media item object
     */
    setupVideo(video, mediaItem) {
        // Configure video settings for autoplay compatibility
        video.muted = true; // CRITICAL: Must be muted for autoplay
        video.autoplay = true; // Enable autoplay attribute
        video.playsInline = true; // Required for iOS autoplay
        video.loop = false; // Don't loop by default - let the system handle transitions
        video.volume = this.videoVolume;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous'; // Handle CORS if needed
        
        // Add event listeners
        video.addEventListener('loadeddata', () => {
            mediaItem.loaded = true;
            mediaItem.duration = video.duration;
            this.handleVideoLoaded(video, mediaItem);
        });
        
        video.addEventListener('canplay', () => {
            mediaItem.loaded = true;
            
            // Immediately try to start video if this is the current video
            if (this.backgroundMedia.length === 1 && !this.isActive) {
                this.startIndependentLoop();
            }
            
            // If this is the first video added, set it as current and try to play
            if (this.backgroundMedia.length === 1) {
                this.currentVideo = video;
                this.currentIndex = 0;
                this.attemptAutoplay(video);
            }
        });
        
        video.addEventListener('playing', () => {
            // Video started playing successfully
        });
        
        video.addEventListener('ended', () => {
            this.handleVideoEnded(video, mediaItem);
        });
        
        video.addEventListener('error', (e) => {
            this.handleVideoError(video, mediaItem, e);
        });
        
        // Force load the video
        video.load();
    }
    
    /**
     * Handle video loaded event
     */
    handleVideoLoaded(video, mediaItem) {
        // Video loaded successfully
    }
    
    /**
     * Handle video ended event
     */
    handleVideoEnded(video, mediaItem) {
        // If this video is currently playing and there are multiple media items,
        // the transition will be handled by the shouldStartTransition() logic
        if (video === this.currentVideo && this.backgroundMedia.length > 1) {
            // Current video ended, transition will occur on next update cycle
        } else if (video === this.currentVideo && this.backgroundMedia.length === 1) {
            // Only one video, restart it if loop is enabled
            if (this.videoLoop) {
                video.currentTime = 0;
                video.play().catch(e => console.warn('Video replay failed:', e));
            }
        }
    }
    
    /**
     * Handle video error event
     */
    handleVideoError(video, mediaItem, error) {
        console.error(`Video error for ${mediaItem.filename}:`, error);
        mediaItem.loaded = false;
    }
    
    /**
     * Set up user interaction listeners to enable video autoplay
     */
    setupUserInteractionListeners() {
        const events = ['click', 'touchstart', 'keydown'];
        
        const enableVideoPlayback = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                
                // Try to start playing current video if we have one
                if (this.currentVideo && this.currentVideo.paused) {
                    this.playVideo(this.currentVideo);
                }
                
                // Remove listeners since we only need this once
                events.forEach(event => {
                    document.removeEventListener(event, enableVideoPlayback);
                });
            }
        };
        
        // Add listeners for user interaction
        events.forEach(event => {
            document.addEventListener(event, enableVideoPlayback, { once: true });
        });
    }
    
    /**
     * Handle user interaction for video autoplay
     */
    handleUserInteraction() {
        this.userInteracted = true;
        if (this.currentVideo && this.currentVideo.paused) {
            this.playVideo(this.currentVideo);
        }
    }
    
    /**
     * Attempt to autoplay video (muted autoplay should work immediately)
     * @param {HTMLVideoElement} video - The video to autoplay
     */
    attemptAutoplay(video) {
        if (!video) return;
        
        // Ensure video is properly configured for autoplay
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;
        
        // Try to play the video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.currentVideo = video;
            }).catch(error => {
                console.warn('Autoplay failed:', error.message);
                
                // Even if autoplay fails, set as current video for drawing
                this.currentVideo = video;
                
                // Try again after a short delay
                setTimeout(() => {
                    video.play().catch(e => {
                        console.warn('Second autoplay attempt failed:', e.message);
                    });
                }, 100);
            });
        } else {
            // Older browsers that don't return a promise
            this.currentVideo = video;
        }
    }
    
    /**
     * Legacy method for backward compatibility
     * @param {HTMLImageElement} image - The image to add
     */
    addBackgroundImage(image) {
        return this.addBackgroundMedia(image, 'image');
    }
    
    /**
     * Add a background video
     * @param {HTMLVideoElement} video - The video to add
     * @param {Object} options - Additional options
     */
    addBackgroundVideo(video, options = {}) {
        return this.addBackgroundMedia(video, 'video', options);
    }
    
    /**
     * Add a background GIF
     * @param {HTMLImageElement} gif - The GIF to add
     * @param {Object} options - Additional options
     */
    addBackgroundGIF(gif, options = {}) {
        return this.addBackgroundMedia(gif, 'gif', options);
    }
    
    /**
     * Remove a background media item by index
     * @param {number} index - The index of the media to remove
     */
    removeBackgroundMedia(index) {
        if (index >= 0 && index < this.backgroundMedia.length) {
            const mediaItem = this.backgroundMedia[index];
            
            // Clean up video if it's being removed
            if (mediaItem.type === 'video') {
                this.stopVideo(mediaItem.element);
            }
            
            this.backgroundMedia.splice(index, 1);
            
            // Reset current index if needed
            if (this.currentIndex >= this.backgroundMedia.length) {
                this.currentIndex = 0;
            }
            
            // Stop if no media left
            if (this.backgroundMedia.length === 0) {
                this.stop();
            }
        }
    }
    
    /**
     * Legacy method for backward compatibility
     */
    removeBackgroundImage(index) {
        return this.removeBackgroundMedia(index);
    }
    
    /**
     * Clear all background media
     */
    clearBackgroundMedia() {
        // Stop all videos before clearing
        this.backgroundMedia.forEach(mediaItem => {
            if (mediaItem.type === 'video') {
                this.stopVideo(mediaItem.element);
            }
        });
        
        this.backgroundMedia = [];
        this.currentIndex = 0;
        this.nextIndex = 0;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.currentVideo = null;
        this.nextVideo = null;
        this.stop();
        
        // Clear the canvas
        if (this.canvas && this.ctx) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.defaultBackground;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Clear the GIF overlay
        this.hideGifOverlay();
    }
    
    /**
     * Legacy method for backward compatibility
     */
    clearBackgroundImages() {
        return this.clearBackgroundMedia();
    }
    
    /**
     * Stop a video and remove its event listeners
     * @param {HTMLVideoElement} video - The video to stop
     */
    stopVideo(video) {
        if (video && video.tagName === 'VIDEO') {
            video.pause();
            video.currentTime = 0;
            // Remove event listeners to prevent memory leaks
            video.removeEventListener('loadeddata', this.handleVideoLoaded);
            video.removeEventListener('ended', this.handleVideoEnded);
            video.removeEventListener('error', this.handleVideoError);
        }
    }
    
    /**
     * Play a video
     * @param {HTMLVideoElement} video - The video to play
     */
    playVideo(video) {
        if (video && video.tagName === 'VIDEO') {
            if (video.readyState >= 2) {
                video.currentTime = 0;
                return video.play().then(() => {
                    // Video started playing successfully
                }).catch(e => {
                    console.warn('Video play failed:', e.name, e.message);
                    
                    if (e.name === 'NotAllowedError' && !this.userInteracted) {
                        // Create a user-friendly notification
                        this.showAutoplayNotification();
                    }
                });
            } else {
                console.warn(`Video not ready to play. ReadyState: ${video.readyState}`);
                // Retry after a short delay
                setTimeout(() => {
                    if (video.readyState >= 2) {
                        this.playVideo(video);
                    }
                }, 100);
            }
        }
    }
    
    /**
     * Show a notification to user about autoplay policy
     */
    showAutoplayNotification() {
        // Only show once
        if (document.querySelector('.autoplay-notification')) {
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = 'autoplay-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
            border: 2px solid #ff6b6b;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 16px;">🎬 Video Background Ready</div>
            <div style="font-size: 14px; margin-bottom: 10px;">Click anywhere on the page to start video playback</div>
            <div style="font-size: 12px; opacity: 0.8;">(This is required by browser autoplay policies)</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after user interacts
        const removeNotification = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
        
        // Remove on click anywhere
        document.addEventListener('click', removeNotification, { once: true });
        
        // Auto-remove after 10 seconds
        setTimeout(removeNotification, 10000);
    }
    
    /**
     * Pause a video
     * @param {HTMLVideoElement} video - The video to pause
     */
    pauseVideo(video) {
        if (video && video.tagName === 'VIDEO') {
            video.pause();
        }
    }
    
    /**
     * Initialize activity state and timers
     */
    _initializeActivity() {
        if (this.backgroundMedia.length > 0) {
            this.isActive = true;
            this.lastUpdateTime = 0;
            this.timeSinceLastTransition = 0;
            
            // Always set up the first media as current
            this.currentIndex = 0;
            this.nextIndex = this.backgroundMedia.length > 1 ? 1 : 0;
            this.isTransitioning = false;
            this.transitionProgress = 0;
            
            // Set current video and attempt autoplay if it's a video
            const currentMedia = this.backgroundMedia[this.currentIndex];
            if (currentMedia && currentMedia.type === 'video' && currentMedia.loaded) {
                this.currentVideo = currentMedia.element;
                this.attemptAutoplay(this.currentVideo);
            } else if (currentMedia && currentMedia.type === 'video') {
                // Video not loaded yet, it will be set as current when canplay fires
            } else {
                this.currentVideo = null;
            }
        } else {
            this.isActive = false;
        }
    }
    
    /**
     * Start the independent background update and draw loop
     */
    startIndependentLoop() {
        if (this.isActive && this.animationFrameId) {
            return;
        }
        
        this._initializeActivity();

        if (!this.isActive) {
            return;
        }

        const loop = (timestamp) => {
            if (!this.isActive) {
                this.animationFrameId = null;
                return;
            }
            
            // Limit to 30 FPS for background to reduce load
            const now = performance.now();
            if (!this.lastDrawTime) this.lastDrawTime = now;
            if (now - this.lastDrawTime < 33) { // ~30 FPS
                this.animationFrameId = requestAnimationFrame(loop);
                return;
            }
            this.lastDrawTime = now;
            
            this.update(timestamp);
            this.draw();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }
    
    /**
     * Stop the background cycle and its independent loop
     */
    stop() {
        this.isActive = false;
        
        // Stop all videos
        if (this.currentVideo) {
            this.pauseVideo(this.currentVideo);
            this.currentVideo = null;
        }
        if (this.nextVideo) {
            this.pauseVideo(this.nextVideo);
            this.nextVideo = null;
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Update the background state
     * @param {number} timestamp - Current animation timestamp
     */
    update(timestamp) {
        if (!this.isActive || this.backgroundMedia.length === 0) {
            return;
        }
        
        if (this.lastUpdateTime === 0) { 
            this.lastUpdateTime = timestamp;
        }

        const deltaTime = timestamp - this.lastUpdateTime;
        this.lastUpdateTime = timestamp;
        
        if (this.isTransitioning) {
            this.transitionProgress += deltaTime / this.transitionDuration;
            
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 0;
                this.isTransitioning = false;
                
                // Stop previous video and start next one
                if (this.currentVideo) {
                    this.pauseVideo(this.currentVideo);
                }
                
                this.currentIndex = this.nextIndex;
                const currentMedia = this.backgroundMedia[this.currentIndex];
                
                if (currentMedia && currentMedia.type === 'video' && currentMedia.loaded) {
                    this.currentVideo = currentMedia.element;
                    this.playVideo(this.currentVideo);
                } else {
                    this.currentVideo = null;
                }
                
                if (this.nextVideo) {
                    this.pauseVideo(this.nextVideo);
                    this.nextVideo = null;
                }
                
                this.timeSinceLastTransition = 0;
            }
        } else {
            this.timeSinceLastTransition += deltaTime;
            
            if (this.backgroundMedia.length > 1 && this.shouldStartTransition()) {
                this.startTransition();
            }
        }
    }
    
    /**
     * Determine if it's time to start a transition based on media type
     * @returns {boolean} - True if should start transition
     */
    shouldStartTransition() {
        const currentMedia = this.backgroundMedia[this.currentIndex];
        
        if (!currentMedia || !currentMedia.loaded) {
            // If current media not loaded, use display duration
            return this.timeSinceLastTransition >= this.displayDuration;
        }
        
        if (currentMedia.type === 'video' && this.videoFullDuration) {
            // For videos with full duration enabled, check if video has ended or reached its duration
            const video = currentMedia.element;
            
            if (!video || video.readyState < 2) {
                // Video not ready, use display duration as fallback
                return this.timeSinceLastTransition >= this.displayDuration;
            }
            
            // Check if video has ended
            if (video.ended) {
                return true;
            }
            
            // Check if video is near its end (within 100ms)
            if (video.duration && video.currentTime >= (video.duration - 0.1)) {
                return true;
            }
            
            // Check for videos that might be stuck or very long (max 10 minutes)
            const maxVideoDisplayTime = Math.max(this.displayDuration, Math.min((video.duration * 1000) || this.displayDuration, 600000));
            if (this.timeSinceLastTransition >= maxVideoDisplayTime) {
                return true;
            }
            
            return false;
        } else {
            // For images, GIFs, or videos with full duration disabled, use the standard display duration
            return this.timeSinceLastTransition >= this.displayDuration;
        }
    }
    
    /**
     * Draw the current background
     */
    draw() {
        if (!this.canvas || !this.ctx) {
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.backgroundMedia.length === 0) {
            this.ctx.fillStyle = this.defaultBackground;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.hideGifOverlay();
            return;
        }
        
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        
        if (this.isTransitioning && this.backgroundMedia.length > 1) {
            // Handle transitions between different media types
            const currentMedia = this.backgroundMedia[this.currentIndex];
            const nextMedia = this.backgroundMedia[this.nextIndex];
            
            // Always draw canvas content for non-GIF media or during transitions
            if (currentMedia.type !== 'gif' || this.transitionProgress < 0.5) {
                this.drawMedia(currentMedia, 1 - this.transitionProgress);
            }
            
            if (nextMedia.type !== 'gif' || this.transitionProgress > 0.5) {
                this.drawMedia(nextMedia, this.transitionProgress);
            }
            
            // Handle GIF overlay transitions with better timing
            this.handleGifTransition(currentMedia, nextMedia);
        } else {
            // Draw only the current media
            const currentMedia = this.backgroundMedia[this.currentIndex];
            
            // Draw non-GIF media to canvas
            if (currentMedia.type !== 'gif') {
                this.drawMedia(currentMedia, 1);
                this.hideGifOverlay();
            } else {
                // For GIFs, keep a black background on canvas and use overlay
                this.ctx.fillStyle = this.defaultBackground;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.showGifOverlay(currentMedia);
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Handle GIF overlay during transitions
     * @param {Object} currentMedia - Current media item
     * @param {Object} nextMedia - Next media item
     */
    handleGifTransition(currentMedia, nextMedia) {
        if (!this.gifOverlay) return;
        
        if (currentMedia && currentMedia.type === 'gif' && nextMedia && nextMedia.type === 'gif') {
            // Transitioning between two GIFs - cross-fade using CSS
            this.transitionGifOverlay(currentMedia, nextMedia);
        } else if (currentMedia && currentMedia.type === 'gif' && nextMedia && nextMedia.type !== 'gif') {
            // Transitioning from GIF to non-GIF - fade out GIF overlay gradually
            this.fadeOutGifOverlay();
        } else if (currentMedia && currentMedia.type !== 'gif' && nextMedia && nextMedia.type === 'gif') {
            // Transitioning from non-GIF to GIF - prepare and fade in GIF overlay
            this.transitionToGif(nextMedia);
        } else {
            // Neither is GIF - ensure overlay is hidden
            if (this.gifOverlay.style.opacity !== '0') {
                this.hideGifOverlay();
            }
        }
    }
    
    /**
     * Handle smooth transition from non-GIF to GIF
     * @param {Object} gifMedia - The GIF media item
     */
    transitionToGif(gifMedia) {
        if (!this.gifOverlay || !gifMedia || !gifMedia.element) return;
        
        // Prepare the GIF overlay but keep it invisible initially
        if (this.transitionProgress < 0.1) {
            this.gifOverlay.style.backgroundImage = `url("${gifMedia.element.src}")`;
            this.gifOverlay.style.display = 'block';
            this.gifOverlay.style.opacity = '0';
        }
        
        // Start fading in the GIF when transition is 25% complete
        // This ensures canvas content is still visible during early transition
        if (this.transitionProgress >= 0.25) {
            const adjustedProgress = (this.transitionProgress - 0.25) / 0.75; // Normalize to 0-1
            this.gifOverlay.style.opacity = (this.opacity * adjustedProgress).toString();
        }
    }
    
    /**
     * Fade out GIF overlay gradually during transition
     */
    fadeOutGifOverlay() {
        if (!this.gifOverlay) return;
        
        // Keep GIF visible during early part of transition (until 75% complete)
        // This prevents flashing by keeping the GIF visible while canvas content fades in
        if (this.transitionProgress <= 0.75) {
            this.gifOverlay.style.opacity = this.opacity.toString();
        } else {
            // Start fading out the GIF only in the final 25% of transition
            const adjustedProgress = (this.transitionProgress - 0.75) / 0.25; // Normalize to 0-1
            this.gifOverlay.style.opacity = (this.opacity * (1 - adjustedProgress)).toString();
        }
    }
    
    /**
     * Show GIF overlay with specific GIF
     * @param {Object} gifMedia - The GIF media item
     */
    showGifOverlay(gifMedia) {
        if (!this.gifOverlay || !gifMedia || !gifMedia.element) return;
        
        this.gifOverlay.style.backgroundImage = `url("${gifMedia.element.src}")`;
        this.gifOverlay.style.opacity = this.opacity;
        this.gifOverlay.style.display = 'block';
    }
    
    /**
     * Hide GIF overlay
     */
    hideGifOverlay() {
        if (this.gifOverlay) {
            this.gifOverlay.style.opacity = '0';
            setTimeout(() => {
                if (this.gifOverlay) {
                    this.gifOverlay.style.backgroundImage = '';
                    this.gifOverlay.style.display = 'none';
                }
            }, this.transitionDuration);
        }
    }
    
    /**
     * Transition between two GIFs
     * @param {Object} currentGif - Current GIF media
     * @param {Object} nextGif - Next GIF media
     */
    transitionGifOverlay(currentGif, nextGif) {
        if (!this.gifOverlay || !nextGif || !nextGif.element) return;
        
        // For now, just switch to the next GIF
        // TODO: Could implement more sophisticated GIF-to-GIF transitions
        if (this.transitionProgress > 0.5) {
            this.showGifOverlay(nextGif);
        }
    }
    
    /**
     * Draw a single background media item with specified opacity
     * @param {Object} mediaItem - The media item to draw
     * @param {number} opacity - The opacity to use (0-1)
     */
    drawMedia(mediaItem, opacity) {
        if (!mediaItem || !mediaItem.loaded) {
            return;
        }
        
        // Skip GIFs - they're handled by CSS overlay to preserve animation
        if (mediaItem.type === 'gif') {
            return;
        }
        
        const element = mediaItem.element;
        this.ctx.globalAlpha = this.opacity * opacity;
        
        // Check if element is ready for drawing
        if (mediaItem.type === 'video') {
            // For videos, check multiple ready states
            if (element.readyState < 2) {
                return;
            }
            // Additional check for video dimensions
            if (element.videoWidth === 0 || element.videoHeight === 0) {
                return;
            }
        } else {
            if (!element.complete) return; // Image not loaded
        }
        
        // Calculate dimensions to cover the canvas while maintaining aspect ratio
        const canvasRatio = this.canvas.width / this.canvas.height;
        let mediaRatio;
        
        if (mediaItem.type === 'video') {
            mediaRatio = element.videoWidth / element.videoHeight;
        } else {
            mediaRatio = element.width / element.height;
        }
        
        // Handle invalid ratios
        if (!mediaRatio || mediaRatio <= 0) {
            console.warn(`Invalid media ratio for ${mediaItem.filename}:`, mediaRatio);
            return;
        }
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (mediaRatio > canvasRatio) {
            // Media is wider than canvas (relative to height)
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * mediaRatio;
            offsetX = (this.canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Media is taller than canvas (relative to width)
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / mediaRatio;
            offsetX = 0;
            offsetY = (this.canvas.height - drawHeight) / 2;
        }
        
        try {
            // Draw the media
            this.ctx.drawImage(element, offsetX, offsetY, drawWidth, drawHeight);
        } catch (error) {
            console.error(`Failed to draw ${mediaItem.type}: ${mediaItem.filename}`, error);
        }
    }
    
    /**
     * Start a transition to the next media
     */
    startTransition() {
        if (this.backgroundMedia.length < 2) return;
        
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.timeSinceLastTransition = 0;
        
        // Calculate next media index
        this.nextIndex = (this.currentIndex + 1) % this.backgroundMedia.length;
        
        // If next media is a video, start loading/preparing it
        const nextMedia = this.backgroundMedia[this.nextIndex];
        if (nextMedia && nextMedia.type === 'video' && nextMedia.loaded) {
            this.nextVideo = nextMedia.element;
            // Don't start playing yet, wait for transition to complete
        }
    }
    
    /**
     * Update settings
     * @param {Object} settings - The settings to update
     */
    updateSettings(settings) {
        if (settings.opacity !== undefined) {
            this.opacity = Math.max(0, Math.min(1, settings.opacity));
            // Update GIF overlay opacity if visible
            if (this.gifOverlay && this.gifOverlay.style.opacity !== '0') {
                this.gifOverlay.style.opacity = this.opacity;
            }
        }
        
        if (settings.transitionDuration !== undefined) {
            this.transitionDuration = settings.transitionDuration;
            // Update GIF overlay transition duration
            if (this.gifOverlay) {
                this.gifOverlay.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
            }
        }
        
        if (settings.displayDuration !== undefined) {
            this.displayDuration = settings.displayDuration;
        }
        
        if (settings.videoVolume !== undefined) {
            this.videoVolume = Math.max(0, Math.min(1, settings.videoVolume));
            // Update volume for all videos
            this.backgroundMedia.forEach(mediaItem => {
                if (mediaItem.type === 'video') {
                    mediaItem.element.volume = this.videoVolume;
                }
            });
        }
        
        if (settings.videoLoop !== undefined) {
            this.videoLoop = settings.videoLoop;
            // Note: Individual video loop setting is not applied here
            // because we handle looping logic in shouldStartTransition()
            // for proper video duration-based transitions
        }
        
        if (settings.videoFullDuration !== undefined) {
            this.videoFullDuration = settings.videoFullDuration;
        }
    }
    
    /**
     * Get information about loaded media
     * @returns {Array} Array of media info objects
     */
    getMediaInfo() {
        return this.backgroundMedia.map((mediaItem, index) => ({
            index,
            type: mediaItem.type,
            filename: mediaItem.filename,
            loaded: mediaItem.loaded,
            duration: mediaItem.duration,
            isCurrentVideo: mediaItem.type === 'video' && mediaItem.element === this.currentVideo,
            isPlaying: mediaItem.type === 'video' && mediaItem.element === this.currentVideo && !mediaItem.element.paused,
            readyState: mediaItem.type === 'video' ? mediaItem.element.readyState : 'N/A',
            videoWidth: mediaItem.type === 'video' ? mediaItem.element.videoWidth : 'N/A',
            videoHeight: mediaItem.type === 'video' ? mediaItem.element.videoHeight : 'N/A',
            currentTime: mediaItem.type === 'video' ? mediaItem.element.currentTime?.toFixed(1) : 'N/A',
            paused: mediaItem.type === 'video' ? mediaItem.element.paused : 'N/A',
            muted: mediaItem.type === 'video' ? mediaItem.element.muted : 'N/A',
            autoplay: mediaItem.type === 'video' ? mediaItem.element.autoplay : 'N/A'
        }));
    }
    
    /**
     * Debug method to check slideshow status
     */
    getDebugInfo() {
        return {
            isActive: this.isActive,
            mediaCount: this.backgroundMedia.length,
            currentIndex: this.currentIndex,
            nextIndex: this.nextIndex,
            isTransitioning: this.isTransitioning,
            transitionProgress: this.transitionProgress,
            animationFrameId: this.animationFrameId,
            canvasSize: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'No canvas',
            currentVideo: this.currentVideo ? this.currentVideo.src.substring(0, 50) + '...' : 'None',
            userInteracted: this.userInteracted,
            settings: {
                displayDuration: this.displayDuration,
                transitionDuration: this.transitionDuration,
                videoFullDuration: this.videoFullDuration,
                videoLoop: this.videoLoop,
                videoVolume: this.videoVolume,
                opacity: this.opacity
            },
            mediaInfo: this.getMediaInfo()
        };
    }
    
    /**
     * Manual method to start video playback (useful for debugging)
     */
    forcePlayCurrentVideo() {
        if (this.currentVideo) {
            this.userInteracted = true; // Override interaction requirement
            return this.playVideo(this.currentVideo);
        } else {
            return Promise.resolve();
        }
    }
    
    /**
     * Check if current video is actually playing
     */
    isVideoPlaying() {
        if (this.currentVideo) {
            const isPlaying = !this.currentVideo.paused && !this.currentVideo.ended && this.currentVideo.readyState > 2;
            return isPlaying;
        } else {
            return false;
        }
    }
    
    /**
     * Quick diagnostic tool - run this in console for debugging
     */
    diagnoseVideo() {
        const mediaInfo = this.getMediaInfo();
        const videoCount = mediaInfo.filter(m => m.type === 'video').length;
        const gifCount = mediaInfo.filter(m => m.type === 'gif').length;
        const imageCount = mediaInfo.filter(m => m.type === 'image').length;
        
        console.log('🔍 MEDIA DIAGNOSTIC REPORT');
        console.log('==========================');
        console.log(`📊 Media Summary:`);
        console.log(`  Total media items: ${this.backgroundMedia.length}`);
        console.log(`  Videos: ${videoCount} | GIFs: ${gifCount} | Images: ${imageCount}`);
        console.log(`  Current index: ${this.currentIndex} | Is active: ${this.isActive}`);
        
        if (this.backgroundMedia.length > 0) {
            console.log(`\n📋 Media Details:`);
            mediaInfo.forEach((media, index) => {
                const isCurrent = index === this.currentIndex;
                console.log(`  [${index}] ${media.filename} (${media.type.toUpperCase()})${isCurrent ? ' ⭐ CURRENT' : ''}`);
                if (media.type === 'video') {
                    console.log(`    Playing: ${media.isPlaying} | Time: ${media.currentTime}s / ${media.duration}s`);
                }
            });
        }
        
        if (this.backgroundMedia.length === 0) {
            console.log(`\n❌ No media found. Upload images, videos, or GIFs first.`);
        }
    }
}

export default BackgroundManager;
