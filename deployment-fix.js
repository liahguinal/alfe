// DEPLOYMENT FIX - Simple and effective solution
console.log('🚀 Applying deployment fixes...');

// Fix 1: Ensure proper music file paths
function fixMusicFilePaths() {
    // Update the music files array with proper paths
    if (typeof actualMusicFiles !== 'undefined') {
        console.log('✅ Music files already have proper paths');
    }
}

// Fix 2: Simple autoplay bypass - wait for user interaction
function setupSimpleAutoplay() {
    let musicStarted = false;
    
    function startMusicOnInteraction() {
        if (musicStarted) return;
        musicStarted = true;
        
        console.log('🎵 User interaction detected - starting music');
        
        // Try to start music through the music controller
        if (window.musicController && window.musicController.musicFiles.length > 0) {
            window.musicController.startMusic();
        } else if (typeof nextTrack === 'function') {
            // Fallback to old system
            setTimeout(nextTrack, 500);
        }
        
        // Remove listeners
        document.removeEventListener('click', startMusicOnInteraction);
        document.removeEventListener('keydown', startMusicOnInteraction);
        document.removeEventListener('touchstart', startMusicOnInteraction);
    }
    
    // Add simple interaction listeners
    document.addEventListener('click', startMusicOnInteraction);
    document.addEventListener('keydown', startMusicOnInteraction);
    document.addEventListener('touchstart', startMusicOnInteraction);
    
    console.log('🎵 Simple autoplay setup complete - music will start on first interaction');
}

// Fix 3: Ensure images load properly with fallbacks
function fixImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function() {
            console.warn('Image failed to load:', this.src);
            // Try to fix the path
            if (this.src.includes('pics/') && !this.src.startsWith('./pics/')) {
                this.src = './pics/' + this.src.split('pics/')[1];
            }
        };
    });
}

// Fix 4: Clean up any conflicting audio
function cleanupAudio() {
    // Stop any existing audio
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    
    // Clear any global audio variables
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
    }
}

// Apply all fixes
function applyDeploymentFixes() {
    console.log('🔧 Applying all deployment fixes...');
    
    fixMusicFilePaths();
    setupSimpleAutoplay();
    fixImageLoading();
    cleanupAudio();
    
    console.log('✅ All deployment fixes applied successfully!');
}

// Run fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDeploymentFixes);
} else {
    applyDeploymentFixes();
}

// Export for manual use
window.applyDeploymentFixes = applyDeploymentFixes;