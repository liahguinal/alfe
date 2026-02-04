// MUSIC CONTROLLER - DEDICATED FILE FOR NEXT/PREV FUNCTIONS
// This file handles all music navigation to ensure it works properly

class MusicController {
    constructor() {
        this.currentAudio = null;
        this.currentTrackIndex = 0;
        this.musicFiles = [];
        this.isPlaying = false;
        this.isShuffleOn = true;
        this.volume = 0.8; // INCREASED VOLUME - was 0.6
        
        console.log('🎵 MusicController initialized with volume:', this.volume);
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
    
    // Play specific track by index - IMPROVED CONFLICT HANDLING
    async playTrack(index) {
        if (index < 0 || index >= this.musicFiles.length) {
            console.error(`❌ Invalid track index: ${index}`);
            return false;
        }
        
        // AGGRESSIVE CLEANUP - Stop ALL audio elements
        if (this.currentAudio) {
            console.log('🛑 Stopping current audio to prevent conflicts');
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio.removeEventListener('ended', this.onTrackEnded.bind(this));
            this.currentAudio.removeEventListener('error', this.onTrackError.bind(this));
            this.currentAudio = null;
        }
        
        // Also stop any global currentAudio from old system
        if (window.currentAudio) {
            console.log('🛑 Stopping global currentAudio to prevent conflicts');
            window.currentAudio.pause();
            window.currentAudio = null;
        }
        
        const track = this.musicFiles[index];
        console.log(`🎵 CLICK-TO-PLAY: Track ${index} - ${track.name}`);
        
        try {
            // Small delay to ensure previous audio is fully stopped
            await new Promise(resolve => setTimeout(resolve, 50));
            
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume; // Set volume immediately
            
            console.log(`🔊 Audio created with volume: ${this.volume} for ${track.name}`);
            
            // Add event listeners BEFORE playing
            this.currentAudio.addEventListener('ended', this.onTrackEnded.bind(this));
            this.currentAudio.addEventListener('error', this.onTrackError.bind(this));
            
            // Ensure volume is set before playing
            this.currentAudio.addEventListener('loadeddata', () => {
                this.currentAudio.volume = this.volume;
                console.log(`🔊 Volume confirmed: ${this.currentAudio.volume}`);
            });
            
            // Play with proper error handling
            const playPromise = this.currentAudio.play();
            if (playPromise !== undefined) {
                await playPromise;
                this.isPlaying = true;
                this.currentTrackIndex = index;
                
                console.log(`✅ CLICK-TO-PLAY SUCCESS: ${track.name} at volume ${this.currentAudio.volume}`);
                
                // Update UI
                this.updateUI();
                this.updateMusicListDisplay();
                
                return true;
            }
        } catch (error) {
            console.error(`❌ Failed to play ${track.name}:`, error);
            
            // If it's an AbortError, try again after a longer delay
            if (error.name === 'AbortError') {
                console.log('🔄 AbortError detected, retrying after cleanup...');
                await new Promise(resolve => setTimeout(resolve, 200));
                return this.playTrack(index); // Retry once
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
    
    // Next track function
    async nextTrack() {
        console.log('🔄 Next track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files available');
            return false;
        }
        
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
        return await this.playTrack(nextIndex);
    }
    
    // Previous track function
    async previousTrack() {
        console.log('🔄 Previous track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ No music files available');
            return false;
        }
        
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
        return await this.playTrack(prevIndex);
    }
    
    // Auto-start music with shuffle
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
            // Try to play immediately
            const success = await this.playTrack(startIndex);
            if (success) {
                console.log('✅ Music auto-started successfully!');
                return true;
            } else {
                console.log('⚠️ Auto-start failed, setting up user interaction trigger');
                this.setupUserInteractionTrigger();
                return false;
            }
        } catch (error) {
            console.log('⚠️ Auto-start blocked by browser, setting up user interaction trigger');
            this.setupUserInteractionTrigger();
            return false;
        }
    }
    
    // Setup user interaction trigger for autoplay
    setupUserInteractionTrigger() {
        console.log('🎵 Setting up user interaction trigger for music');
        
        const startMusicOnInteraction = async (event) => {
            console.log('🎵 User interaction detected, starting music:', event.type);
            
            try {
                const success = await this.playTrack(0);
                if (success) {
                    console.log('✅ Music started after user interaction');
                    // Remove event listeners after successful start
                    document.removeEventListener('click', startMusicOnInteraction);
                    document.removeEventListener('keydown', startMusicOnInteraction);
                    document.removeEventListener('touchstart', startMusicOnInteraction);
                }
            } catch (error) {
                console.error('❌ Failed to start music after interaction:', error);
            }
        };
        
        // Add multiple event listeners for user interaction
        document.addEventListener('click', startMusicOnInteraction, { once: true });
        document.addEventListener('keydown', startMusicOnInteraction, { once: true });
        document.addEventListener('touchstart', startMusicOnInteraction, { once: true });
        
        console.log('🎵 User interaction triggers set up - music will start on first click/key/touch');
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
    
    // Start music immediately after loading
    setTimeout(() => {
        console.log('🎵 Auto-starting music after controller initialization...');
        window.musicController.startMusic();
    }, 100);
};

// Global function to play specific track when clicked in music list
window.playTrackFromList = function(trackIndex) {
    console.log(`🎵 Playing track from list: ${trackIndex}`);
    if (window.musicController) {
        window.musicController.playTrack(trackIndex);
    }
};

console.log('🎵 MusicController.js loaded successfully');