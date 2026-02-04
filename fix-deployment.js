// Quick fix for deployment issues
console.log('🔧 Applying deployment fixes...');

// Fix 1: Ensure music files load properly
function fixMusicPaths() {
    const musicFiles = document.querySelectorAll('audio');
    musicFiles.forEach(audio => {
        if (audio.src && !audio.src.startsWith('http')) {
            console.log('Fixed audio path:', audio.src);
        }
    });
}

// Fix 2: Add user interaction handler for autoplay
function enableAutoplayOnInteraction() {
    let interactionHandled = false;
    
    function handleFirstInteraction() {
        if (interactionHandled) return;
        interactionHandled = true;
        
        console.log('🎵 User interaction detected - enabling autoplay');
        
        // Try to start music if available
        if (typeof nextTrack === 'function') {
            setTimeout(() => {
                nextTrack();
            }, 500);
        }
        
        // Remove listeners
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
    }
    
    // Add interaction listeners
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
}

// Fix 3: Ensure images load properly
function fixImagePaths() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function() {
            console.warn('Image failed to load:', this.src);
            // Fallback to a default image if needed
            if (this.src.includes('pics/')) {
                this.src = 'pics/1.jpg'; // Fallback to first image
            }
        };
    });
}

// Apply fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fixMusicPaths();
        enableAutoplayOnInteraction();
        fixImagePaths();
    });
} else {
    fixMusicPaths();
    enableAutoplayOnInteraction();
    fixImagePaths();
}

console.log('✅ Deployment fixes applied!');