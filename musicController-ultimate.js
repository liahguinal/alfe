// ULTIMATE MUSIC CONTROLLER - ABSOLUTE SINGLE AUDIO WITH PRIMARY KEY SYSTEM
// This will use a primary key system to ensure ONLY ONE audio can exist

class UltimateMusicController {
    constructor() {
        this.currentAudio = null;
        this.currentTrackIndex = 0;
        this.musicFiles = [];
        this.isPlaying = false;
        this.isShuffleOn = true;
        this.volume = 1.0;
        this.primaryKey = null; // Unique identifier for current audio
        
        // ULTIMATE: Track ALL audio elements with unique IDs
        this.audioRegistry = new Map();
        this.nextAudioId = 1;
        this.isLoadingPhase = true; // NEW: Don't destroy during loading
        
        // ULTIMATE: Monitor and destroy every 1000ms (less aggressive)
        this.monitorInterval = setInterval(() => {
            if (!this.isLoadingPhase) { // Only monitor after loading
                this.ultimateMonitor();
            }
        }, 1000);
        
        // ULTIMATE: Override Audio constructor to track all audio
        this.overrideAudioConstructor();
        
        console.log('💎 ULTIMATE Music Controller loaded - PRIMARY KEY SYSTEM');
    }
    
    // ULTIMATE: Override Audio constructor to track everything
    overrideAudioConstructor() {
        const originalAudio = window.Audio;
        const self = this;
        
        window.Audio = function(src) {
            const audio = new originalAudio(src);
            const audioId = self.nextAudioId++;
            
            // Register this audio
            self.audioRegistry.set(audioId, {
                audio: audio,
                src: src,
                created: Date.now(),
                isPrimary: false
            });
            
            console.log(`🆔 ULTIMATE: Registered audio ${audioId} - ${src}`);
            
            // Add destroy listener
            audio.addEventListener('ended', () => {
                self.audioRegistry.delete(audioId);
                console.log(`🗑️ ULTIMATE: Unregistered audio ${audioId} (ended)`);
            });
            
            audio.addEventListener('error', () => {
                self.audioRegistry.delete(audioId);
                console.log(`🗑️ ULTIMATE: Unregistered audio ${audioId} (error)`);
            });
            
            return audio;
        };
    }
    
    // ULTIMATE: Monitor and destroy unauthorized audio
    ultimateMonitor() {
        if (this.isLoadingPhase) {
            return; // Don't monitor during loading phase
        }
        
        let destroyedCount = 0;
        
        // Check registry for unauthorized audio
        for (const [audioId, audioData] of this.audioRegistry.entries()) {
            if (!audioData.isPrimary && audioData.audio !== this.currentAudio) {
                try {
                    console.log(`💥 ULTIMATE: Destroying unauthorized audio ${audioId}`);
                    audioData.audio.pause();
                    audioData.audio.currentTime = 0;
                    audioData.audio.volume = 0;
                    audioData.audio.src = '';
                    this.audioRegistry.delete(audioId);
                    destroyedCount++;
                } catch (error) {
                    console.log(`💥 ULTIMATE: Error destroying audio ${audioId}:`, error.message);
                }
            }
        }
        
        // Also check DOM for any rogue audio elements
        const domAudio = document.querySelectorAll('audio');
        domAudio.forEach((audio, index) => {
            if (audio !== this.currentAudio) {
                try {
                    console.log(`💥 ULTIMATE: Destroying DOM audio ${index}`);
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 0;
                    if (audio.parentNode) {
                        audio.parentNode.removeChild(audio);
                    }
                    destroyedCount++;
                } catch (error) {
                    console.log(`💥 ULTIMATE: Error destroying DOM audio:`, error.message);
                }
            }
        });
        
        if (destroyedCount > 0) {
            console.log(`💥 ULTIMATE: Destroyed ${destroyedCount} unauthorized audio elements`);
        }
    }
    
    // Load music files
    loadMusicFiles(files) {
        this.musicFiles = files;
        this.isLoadingPhase = false; // Loading complete, enable monitoring
        if (this.isShuffleOn) {
            this.shuffleMusicFiles();
        }
        console.log(`💎 ULTIMATE: Loaded ${files.length} music files - monitoring enabled`);
    }
    
    // ULTIMATE: Play track with primary key system
    async playTrack(index) {
        if (index < 0 || index >= this.musicFiles.length) return false;
        
        const track = this.musicFiles[index];
        const newPrimaryKey = `track_${index}_${Date.now()}`;
        
        console.log(`💎 ULTIMATE: Starting track ${index} - ${track.name}`);
        console.log(`🔑 ULTIMATE: Primary key: ${newPrimaryKey}`);
        
        // ULTIMATE: Destroy everything first
        this.ultimateDestroy();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        try {
            // Create new audio with primary key
            this.currentAudio = new Audio(track.file);
            this.primaryKey = newPrimaryKey;
            this.currentAudio.volume = this.volume;
            
            // Mark as primary in registry
            for (const [audioId, audioData] of this.audioRegistry.entries()) {
                if (audioData.audio === this.currentAudio) {
                    audioData.isPrimary = true;
                    console.log(`🔑 ULTIMATE: Marked audio ${audioId} as PRIMARY`);
                    break;
                }
            }
            
            console.log(`🔊 ULTIMATE: Created PRIMARY audio for ${track.name}`);
            
            // Add listeners
            this.currentAudio.addEventListener('ended', () => {
                console.log(`🔚 ULTIMATE: PRIMARY track ended - ${track.name}`);
                setTimeout(() => this.nextTrack(), 500);
            });
            
            this.currentAudio.addEventListener('error', () => {
                console.log(`❌ ULTIMATE: PRIMARY track error - ${track.name}`);
                setTimeout(() => this.nextTrack(), 500);
            });
            
            // Play with user interaction check
            try {
                await this.currentAudio.play();
                this.isPlaying = true;
                this.currentTrackIndex = index;
                
                console.log(`✅ ULTIMATE: PRIMARY audio playing - ${track.name}`);
                console.log(`🔑 ULTIMATE: Active primary key: ${this.primaryKey}`);
                
                // Update UI
                this.updateUI(track.name);
                
                return true;
            } catch (playError) {
                if (playError.name === 'NotAllowedError') {
                    console.log('🔒 ULTIMATE: Autoplay blocked - waiting for user interaction');
                    this.setupUserInteractionTrigger();
                    return false;
                } else {
                    throw playError;
                }
            }
        } catch (error) {
            console.log(`❌ ULTIMATE: Failed to play ${track.name}:`, error.name);
            return false;
        }
    }
    
    // Setup user interaction trigger
    setupUserInteractionTrigger() {
        const startOnInteraction = () => {
            if (this.currentAudio && !this.isPlaying) {
                console.log('👆 ULTIMATE: User interaction detected - starting music');
                this.currentAudio.play().then(() => {
                    this.isPlaying = true;
                    console.log('✅ ULTIMATE: Music started after user interaction');
                    this.updateUI(this.musicFiles[this.currentTrackIndex].name);
                }).catch(error => {
                    console.log('❌ ULTIMATE: Still failed after interaction:', error.name);
                });
            }
            
            // Remove listeners
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
        };
        
        // Add interaction listeners
        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
        document.addEventListener('touchstart', startOnInteraction, { once: true });
        
        console.log('👆 ULTIMATE: Click anywhere to start music');
    }
    
    // ULTIMATE: Destroy everything except primary
    ultimateDestroy() {
        console.log('💥 ULTIMATE: DESTROYING ALL AUDIO...');
        
        // Destroy all registered audio except current
        let destroyedCount = 0;
        for (const [audioId, audioData] of this.audioRegistry.entries()) {
            if (audioData.audio !== this.currentAudio) {
                try {
                    console.log(`💥 ULTIMATE: Destroying registered audio ${audioId}`);
                    audioData.audio.pause();
                    audioData.audio.currentTime = 0;
                    audioData.audio.volume = 0;
                    audioData.audio.src = '';
                    this.audioRegistry.delete(audioId);
                    destroyedCount++;
                } catch (error) {
                    console.log(`💥 ULTIMATE: Error destroying registered audio:`, error.message);
                }
            }
        }
        
        // Destroy current audio if exists
        if (this.currentAudio) {
            try {
                console.log('💥 ULTIMATE: Destroying current PRIMARY audio');
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio.volume = 0;
                this.currentAudio = null;
                this.primaryKey = null;
                this.isPlaying = false;
            } catch (error) {
                console.log('💥 ULTIMATE: Error destroying current audio:', error.message);
            }
        }
        
        // Destroy all DOM audio elements
        const domAudio = document.querySelectorAll('audio');
        domAudio.forEach((audio, index) => {
            try {
                console.log(`💥 ULTIMATE: Destroying DOM audio ${index}`);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0;
                if (audio.parentNode) {
                    audio.parentNode.removeChild(audio);
                }
                destroyedCount++;
            } catch (error) {
                console.log(`💥 ULTIMATE: Error destroying DOM audio:`, error.message);
            }
        });
        
        // Clear global audio
        if (window.currentAudio) {
            try {
                window.currentAudio.pause();
                window.currentAudio = null;
            } catch (error) {}
        }
        
        console.log(`💥 ULTIMATE: Destroyed ${destroyedCount} audio elements`);
        console.log(`🔑 ULTIMATE: Cleared primary key: ${this.primaryKey}`);
    }
    
    // Next track
    async nextTrack() {
        console.log('🔄 ULTIMATE: Next track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ ULTIMATE: No music files available');
            return false;
        }
        
        console.log(`🔄 ULTIMATE: Current track: ${this.currentTrackIndex}`);
        
        // ULTIMATE: Complete destruction
        this.ultimateDestroy();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let nextIndex = (this.currentTrackIndex + 1) % this.musicFiles.length;
        console.log(`🔄 ULTIMATE: Next track will be: ${nextIndex}`);
        
        return await this.playTrack(nextIndex);
    }
    
    // Start music
    async startMusic() {
        if (this.musicFiles.length === 0) return false;
        
        console.log('💎 ULTIMATE: Starting music system');
        
        if (this.isShuffleOn) {
            this.shuffleMusicFiles();
        }
        
        return await this.playTrack(0);
    }
    
    // Shuffle music files
    shuffleMusicFiles() {
        for (let i = this.musicFiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.musicFiles[i], this.musicFiles[j]] = [this.musicFiles[j], this.musicFiles[i]];
        }
        console.log('🔀 ULTIMATE: Music files shuffled');
    }
    
    // Update UI
    updateUI(trackName) {
        const integratedSongName = document.getElementById('integratedSongName');
        const integratedSongStatus = document.getElementById('integratedSongStatus');
        
        if (integratedSongName) {
            integratedSongName.textContent = trackName || 'Unknown Track';
        }
        
        if (integratedSongStatus) {
            integratedSongStatus.textContent = 'Music: ON • Pictures: ON';
        }
        
        console.log(`💎 ULTIMATE: UI updated - ${trackName}`);
    }
    
    // Set volume
    setVolume(vol) {
        this.volume = vol;
        if (this.currentAudio) {
            this.currentAudio.volume = vol;
        }
        console.log(`🔊 ULTIMATE: Volume set to ${vol}`);
    }
}

// ULTIMATE: Destroy all existing controllers
if (window.musicController) window.musicController = null;
if (window.simpleMusicController) window.simpleMusicController = null;
if (window.nuclearMusicController) window.nuclearMusicController = null;

// Create ULTIMATE instance
window.ultimateMusicController = new UltimateMusicController();

// ULTIMATE: Override all global functions
window.nextTrack = function() {
    console.log('🔄 GLOBAL: nextTrack() called');
    if (window.ultimateMusicController) {
        window.ultimateMusicController.nextTrack();
    } else {
        console.log('❌ GLOBAL: ultimateMusicController not available');
    }
};

window.previousTrack = function() {
    console.log('⚠️ GLOBAL: previousTrack() disabled - shuffle mode only');
};

window.playTrackFromList = function(trackIndex) {
    console.log(`🔄 GLOBAL: playTrackFromList(${trackIndex}) called`);
    if (window.ultimateMusicController) {
        window.ultimateMusicController.playTrack(trackIndex);
    } else {
        console.log('❌ GLOBAL: ultimateMusicController not available');
    }
};

window.setVolume = function(value) {
    if (window.ultimateMusicController) {
        window.ultimateMusicController.setVolume(value / 100);
    }
};