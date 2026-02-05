// MUSIC CONTROLLER - DEDICATED FILE FOR NEXT/PREV FUNCTIONS
// This file handles all music navigation to ensure it works properly

class MusicController {
    constructor() {
        this.currentAudio = null;
        this.currentTrackIndex = 0;
        this.musicFiles = [];
        this.isPlaying = false;
        this.isShuffleOn = true;
        this.volume = 1.0; // MAXIMUM VOLUME
        this.userInteractionSetup = false;
        
        // Bind event handlers to maintain proper 'this' context
        this.boundOnTrackEnded = this.onTrackEnded.bind(this);
        this.boundOnTrackError = this.onTrackError.bind(this);
        
        // AGGRESSIVE: Kill all audio every 100ms to prevent overlaps
        setInterval(() => {
            this.killAllAudioExceptCurrent();
        }, 100);
    }
    
    // Aggressive autoplay bypass - try multiple methods immediately
    setupImmediateAutoplay() {
        // Method 1: Try to create and play a silent audio immediately
        try {
            const silentAudio = new Audio();
            silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
            silentAudio.volume = 0.01;
            silentAudio.play().then(() => {
                console.log('🎵 Silent audio bypass successful - autoplay should work');
                this.autoplayEnabled = true;
            }).catch(() => {
                console.log('🎵 Silent audio bypass failed');
                this.autoplayEnabled = false;
            });
        } catch (error) {
            console.log('🎵 Silent audio creation failed');
            this.autoplayEnabled = false;
        }
        
        // Method 2: Setup immediate interaction capture
        this.setupAggressiveInteractionCapture();
    }
    
    // Capture ANY user interaction immediately
    setupAggressiveInteractionCapture() {
        const startMusicOnAnyInteraction = () => {
            if (!this.isPlaying && this.musicFiles.length > 0) {
                console.log('🎵 User interaction detected - starting music immediately');
                this.startMusic();
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', startMusicOnAnyInteraction);
            document.removeEventListener('keydown', startMusicOnAnyInteraction);
            document.removeEventListener('touchstart', startMusicOnAnyInteraction);
            document.removeEventListener('mousemove', startMusicOnAnyInteraction);
        };
        
        // Listen for ANY interaction
        document.addEventListener('click', startMusicOnAnyInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnAnyInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnAnyInteraction, { once: true });
        document.addEventListener('mousemove', startMusicOnAnyInteraction, { once: true });
    }
    
    // Load music files into the controller
    loadMusicFiles(files) {
        this.musicFiles = files;
        console.log(`🎵 MusicController loaded ${files.length} files:`, files.map(f => f.name));
        
        // Start with first track
        if (files.length > 0) {
            this.currentTrackIndex = 0;
        }
    }
    
    // Play specific track by index - SINGLE INSTANCE ENFORCEMENT
    async playTrack(index) {
        if (index < 0 || index >= this.musicFiles.length) {
            return false;
        }
        
        // AGGRESSIVE CLEANUP - Stop ALL audio to ensure only one plays
        this.stopAllAudio();
        
        // Wait longer for cleanup to complete and prevent AbortError
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const track = this.musicFiles[index];
        
        try {
            // Wait a bit to ensure all audio is stopped
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume;
            
            // Add event listeners BEFORE playing
            this.currentAudio.addEventListener('ended', this.boundOnTrackEnded);
            this.currentAudio.addEventListener('error', this.boundOnTrackError);
            
            // Ensure volume is set
            this.currentAudio.addEventListener('loadeddata', () => {
                if (this.currentAudio) {
                    this.currentAudio.volume = this.volume;
                    console.log(`🔊 Volume confirmed: ${this.currentAudio.volume}`);
                }
            });
            
            // Play with proper error handling
            const playPromise = this.currentAudio.play();
            if (playPromise !== undefined) {
                await playPromise;
                this.isPlaying = true;
                this.currentTrackIndex = index;
                
                console.log(`✅ SINGLE-PLAY SUCCESS: ${track.name} at volume ${this.currentAudio.volume}`);
                
                // Update UI
                this.updateUI();
                this.updateMusicListDisplay();
                
                return true;
            }
        } catch (error) {
            console.error(`❌ Failed to play ${track.name}:`, error);
            
            // Don't retry on AbortError to prevent multiple instances
            if (error.name === 'AbortError') {
                console.log('🛑 AbortError - not retrying to prevent conflicts');
                return false;
            }
            
            return false;
        }
    }
    
    // Update music list display to show currently playing track
    updateMusicListDisplay() {
        const musicItems = document.querySelectorAll('.music-item');
        musicItems.forEach((item, index) => {
            if (index === this.currentTrackIndex) {
                item.classList.add('active');
                // Update icon to show playing
                const icon = item.querySelector('.music-item-icon');
                if (icon) {
                    icon.textContent = this.isPlaying ? '🎵' : '🎶';
                }
            } else {
                item.classList.remove('active');
                // Update icon to show not playing
                const icon = item.querySelector('.music-item-icon');
                if (icon) {
                    icon.textContent = '🎶';
                }
            }
        });
    }
    
    // Next track function - SINGLE INSTANCE ENFORCEMENT
    async nextTrack() {
        console.log('🔄 Next track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files available');
            return false;
        }
        
        // Stop all audio first to prevent overlaps
        this.stopAllAudio();
        
        let nextIndex;
        
        if (this.isShuffleOn) {
            // Random track (different from current)
            do {
                nextIndex = Math.floor(Math.random() * this.musicFiles.length);
            } while (nextIndex === this.currentTrackIndex && this.musicFiles.length > 1);
        } else {
            // Sequential next
            nextIndex = (this.currentTrackIndex + 1) % this.musicFiles.length;
        }
        
        console.log(`🔄 Next: ${this.currentTrackIndex} → ${nextIndex}`);
        
        // Small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return await this.playTrack(nextIndex);
    }
    
    // Previous track function - SINGLE INSTANCE ENFORCEMENT
    async previousTrack() {
        console.log('🔄 Previous track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files available');
            return false;
        }
        
        // Stop all audio first to prevent overlaps
        this.stopAllAudio();
        
        let prevIndex;
        
        if (this.isShuffleOn) {
            // Random track (different from current)
            do {
                prevIndex = Math.floor(Math.random() * this.musicFiles.length);
            } while (prevIndex === this.currentTrackIndex && this.musicFiles.length > 1);
        } else {
            // Sequential previous
            prevIndex = this.currentTrackIndex === 0 ? this.musicFiles.length - 1 : this.currentTrackIndex - 1;
        }
        
        console.log(`🔄 Previous: ${this.currentTrackIndex} → ${prevIndex}`);
        
        // Small delay to ensure cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return await this.playTrack(prevIndex);
    }
    
    // Auto-start music with shuffle - AGGRESSIVE AUTOPLAY
    async startMusic() {
        console.log('🎵 Starting music automatically with shuffle');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files to start');
            return false;
        }
        
        // Shuffle the music files array for random playback
        this.shuffleMusicFiles();
        
        // Start with first track from shuffled list
        const startIndex = 0;
        console.log(`🎵 Auto-starting with shuffled track: ${this.musicFiles[startIndex].name}`);
        
        try {
            // AGGRESSIVE APPROACH: Try multiple methods simultaneously
            
            // Method 1: Direct play attempt (no delay)
            const directPlay = this.playTrack(startIndex);
            
            // Method 2: Force start with very low volume first
            const lowVolumePlay = this.tryLowVolumeStart(startIndex);
            
            // Method 3: Create multiple audio instances and try them all
            const multiInstancePlay = this.tryMultipleInstances(startIndex);
            
            // Wait for any of them to succeed
            const results = await Promise.allSettled([directPlay, lowVolumePlay, multiInstancePlay]);
            
            // Check if any succeeded
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'fulfilled' && results[i].value === true) {
                    console.log(`✅ Music started successfully with method ${i + 1}!`);
                    return true;
                }
            }
            
            console.log('⚠️ All autoplay methods failed, setting up interaction trigger');
            this.setupUserInteractionTrigger();
            return false;
            
        } catch (error) {
            console.log('❌ Auto-start failed:', error.message);
            this.setupUserInteractionTrigger();
            return false;
        }
    }
    
    // Try starting with very low volume first, then increase
    async tryLowVolumeStart(index) {
        try {
            const track = this.musicFiles[index];
            const audio = new Audio(track.file);
            audio.volume = 0.01; // Very low volume
            
            await audio.play();
            
            // If successful, gradually increase volume
            const increaseVolume = () => {
                if (audio.volume < this.volume) {
                    audio.volume = Math.min(audio.volume + 0.1, this.volume);
                    setTimeout(increaseVolume, 100);
                }
            };
            
            setTimeout(increaseVolume, 500);
            
            // Replace current audio
            this.stopAllAudio();
            this.currentAudio = audio;
            this.isPlaying = true;
            this.currentTrackIndex = index;
            
            // Add event listeners
            this.currentAudio.addEventListener('ended', this.boundOnTrackEnded);
            this.currentAudio.addEventListener('error', this.boundOnTrackError);
            
            console.log('✅ Low-volume bypass successful!');
            return true;
            
        } catch (error) {
            console.log('❌ Low-volume bypass failed:', error.message);
            return false;
        }
    }
    
    // Try creating multiple audio instances
    async tryMultipleInstances(index) {
        try {
            const track = this.musicFiles[index];
            const promises = [];
            
            // Create 3 different audio instances with slight variations
            for (let i = 0; i < 3; i++) {
                const audio = new Audio(track.file);
                audio.volume = this.volume * (0.8 + i * 0.1); // Slightly different volumes
                
                const promise = new Promise(async (resolve) => {
                    try {
                        await audio.play();
                        resolve({ success: true, audio });
                    } catch (error) {
                        resolve({ success: false, error });
                    }
                });
                
                promises.push(promise);
            }
            
            const results = await Promise.all(promises);
            
            // Use the first successful one
            for (const result of results) {
                if (result.success) {
                    this.stopAllAudio();
                    this.currentAudio = result.audio;
                    this.isPlaying = true;
                    this.currentTrackIndex = index;
                    
                    // Add event listeners
                    this.currentAudio.addEventListener('ended', this.boundOnTrackEnded);
                    this.currentAudio.addEventListener('error', this.boundOnTrackError);
                    
                    console.log('✅ Multi-instance bypass successful!');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.log('❌ Multi-instance bypass failed:', error.message);
            return false;
        }
    }
    
    // Force start music with multiple bypass techniques
    async forceStartMusic() {
        console.log('🎵 FORCE START: Attempting aggressive music start');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files for force start');
            return false;
        }
        
        const track = this.musicFiles[0];
        console.log(`🎵 FORCE START: ${track.name}`);
        
        try {
            // Stop everything first
            this.stopAllAudio();
            
            // Create audio with multiple bypass attempts
            const audio = new Audio();
            
            // Set source and properties
            audio.src = track.file;
            audio.volume = 0.1; // Start with low volume
            audio.preload = 'auto';
            
            // Try to load and play
            audio.load();
            
            // Wait for audio to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
                
                audio.addEventListener('canplaythrough', () => {
                    clearTimeout(timeout);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', () => {
                    clearTimeout(timeout);
                    reject(new Error('Load error'));
                }, { once: true });
            });
            
            // Now try to play
            await audio.play();
            
            // If successful, set proper volume and update controller
            audio.volume = this.volume;
            this.currentAudio = audio;
            this.isPlaying = true;
            this.currentTrackIndex = 0;
            
            // Add event listeners
            this.currentAudio.addEventListener('ended', this.boundOnTrackEnded);
            this.currentAudio.addEventListener('error', this.boundOnTrackError);
            
            console.log('✅ FORCE START SUCCESS!');
            this.updateUI();
            return true;
            
        } catch (error) {
            console.log('❌ FORCE START failed:', error.message);
            
            // Final fallback - setup interaction trigger
            this.setupUserInteractionTrigger();
            return false;
        }
    }
    
    // Setup user interaction trigger for autoplay - SINGLE INSTANCE ONLY
    setupUserInteractionTrigger() {
        console.log('🎵 Setting up user interaction trigger for music');
        
        // Prevent multiple triggers
        if (this.userInteractionSetup) {
            console.log('🎵 User interaction already set up, skipping');
            return;
        }
        this.userInteractionSetup = true;
        
        const startMusicOnInteraction = async (event) => {
            console.log('🎵 User interaction detected, starting music:', event.type);
            
            // Remove ALL event listeners immediately to prevent multiple triggers
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('keydown', startMusicOnInteraction);
            document.removeEventListener('touchstart', startMusicOnInteraction);
            
            try {
                // Stop any existing audio first
                this.stopAllAudio();
                
                const success = await this.playTrack(0);
                if (success) {
                    console.log('✅ Music started after user interaction');
                } else {
                    console.log('❌ Failed to start music after interaction');
                }
            } catch (error) {
                console.error('❌ Failed to start music after interaction:', error);
            }
        };
        
        // Add event listeners with { once: true } to ensure they only fire once
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
        
        console.log('🎵 User interaction triggers set up - music will start on first click/key/touch');
    }
    
    // Stop all audio instances to prevent conflicts
    stopAllAudio() {
        // Stop current music controller audio
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio.removeEventListener('ended', this.boundOnTrackEnded);
                this.currentAudio.removeEventListener('error', this.boundOnTrackError);
            } catch (error) {
                // Silent cleanup
            }
            this.currentAudio = null;
        }
        
        // Stop any global audio from old system
        if (window.currentAudio) {
            try {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
            } catch (error) {
                // Silent cleanup
            }
            window.currentAudio = null;
        }
        
        // AGGRESSIVE: Stop ALL audio elements on the entire page
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach((audio, index) => {
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0;
                // Remove the element completely
                if (audio.parentNode) {
                    audio.parentNode.removeChild(audio);
                }
            } catch (error) {
                // Silent cleanup
            }
        });
        
        this.isPlaying = false;
    }
    
    // Shuffle the music files array
    shuffleMusicFiles() {
        console.log('🔀 Shuffling music files for random playback');
        for (let i = this.musicFiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.musicFiles[i], this.musicFiles[j]] = [this.musicFiles[j], this.musicFiles[i]];
        }
        console.log('🔀 Music files shuffled:', this.musicFiles.map(f => f.name));
    }
    
    // Handle track ended
    onTrackEnded() {
        console.log('🔚 Track ended, playing next...');
        this.nextTrack();
    }
    
    // Handle track error
    onTrackError(error) {
        console.error('❌ Track error:', error);
        console.log('🔄 Trying next track due to error...');
        this.nextTrack();
    }
    
    // Update UI elements - FIXED WITH BETTER ERROR HANDLING
    updateUI() {
        if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.musicFiles.length) {
            const track = this.musicFiles[this.currentTrackIndex];
            
            // Update song name display
            const songNameElement = document.getElementById('integratedSongName');
            if (songNameElement) {
                songNameElement.textContent = track.name;
                console.log(`🎵 UI Updated: ${track.name}`);
            } else {
                console.log('⚠️ integratedSongName element not found');
            }
            
            // Update status
            const statusElement = document.getElementById('integratedSongStatus');
            if (statusElement) {
                statusElement.textContent = `Music: ${this.isShuffleOn ? 'ON' : 'OFF'} • Pictures: ON`;
            } else {
                console.log('⚠️ integratedSongStatus element not found');
            }
            
            // Update compact button
            const compactBtn = document.getElementById('compactMusicBtn');
            if (compactBtn) {
                if (this.isPlaying) {
                    compactBtn.classList.add('playing');
                } else {
                    compactBtn.classList.remove('playing');
                }
            } else {
                console.log('⚠️ compactMusicBtn element not found');
            }
        }
    }
    
    // Get current track info
    getCurrentTrack() {
        if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.musicFiles.length) {
            return this.musicFiles[this.currentTrackIndex];
        }
        return null;
    }
    
    // Set volume
    setVolume(vol) {
        this.volume = vol;
        if (this.currentAudio) {
            this.currentAudio.volume = vol;
        }
    }
    
    // Toggle shuffle
    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        console.log(`🔀 Shuffle ${this.isShuffleOn ? 'ON' : 'OFF'}`);
        this.updateUI();
    }
}

// Create global music controller instance
window.musicController = new MusicController();

// Global functions that the HTML buttons can call
window.nextTrack = function() {
    console.log('🎵 Global nextTrack called');
    window.musicController.nextTrack();
};

window.previousTrack = function() {
    console.log('🎵 Global previousTrack called');
    window.musicController.previousTrack();
};

window.startMusicController = function(musicFiles) {
    console.log('🎵 Starting music controller with files:', musicFiles);
    if (!window.musicController) {
        console.error('❌ Music controller not available!');
        return;
    }
    
    window.musicController.loadMusicFiles(musicFiles);
    
    // IMMEDIATE START - no delays
    console.log('🎵 Starting music IMMEDIATELY...');
    window.musicController.startMusic().then(success => {
        if (success) {
            console.log('✅ Music controller started successfully!');
        } else {
            console.log('⚠️ Music controller needs user interaction');
            
            // Try again with a more aggressive approach
            setTimeout(() => {
                console.log('🔄 Attempting aggressive music start...');
                window.musicController.forceStartMusic();
            }, 500);
        }
    });
};

// Global function to play specific track when clicked in music list
window.playTrackFromList = function(trackIndex) {
    console.log(`🎵 Playing track from list: ${trackIndex}`);
    if (window.musicController) {
        window.musicController.playTrack(trackIndex);
    }
};

console.log('🎵 MusicController.js loaded successfully');

// AGGRESSIVE AUTOPLAY: Try to start music as soon as possible
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 DOM loaded - attempting immediate music start');
    
    // Try to start music immediately when DOM is ready
    setTimeout(() => {
        if (window.musicController && window.musicController.musicFiles.length > 0) {
            console.log('🎵 Attempting immediate autoplay on DOM ready');
            window.musicController.startMusic();
        }
    }, 100);
});

// Also try when window fully loads
window.addEventListener('load', () => {
    console.log('🎵 Window loaded - attempting immediate music start');
    
    setTimeout(() => {
        if (window.musicController && window.musicController.musicFiles.length > 0 && !window.musicController.isPlaying) {
            console.log('🎵 Attempting immediate autoplay on window load');
            window.musicController.startMusic();
        }
    }, 200);
});

// Try on any user interaction with the page
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.musicController && window.musicController.musicFiles.length > 0 && !window.musicController.isPlaying) {
        console.log('🎵 Page became visible - attempting music start');
        window.musicController.startMusic();
    }
});