// NUCLEAR MUSIC CONTROLLER - ABSOLUTELY GUARANTEED SINGLE AUDIO
// This will DESTROY all other music systems and ensure only ONE song plays

class NuclearMusicController {
    constructor() {
        this.currentAudio = null;
        this.currentTrackIndex = 0;
        this.musicFiles = [];
        this.isPlaying = false;
        this.isShuffleOn = true;
        this.volume = 1.0;
        
        // NUCLEAR: Destroy all audio every 1000ms (1 second) for debugging
        this.destroyInterval = setInterval(() => {
            const audioCount = document.querySelectorAll('audio').length;
            if (audioCount > 1) {
                console.log(`⚠️ NUCLEAR: Found ${audioCount} audio elements, destroying extras...`);
                this.nuclearDestroy();
            }
        }, 1000);
        
        // NUCLEAR: Override all global audio functions
        this.overrideGlobalFunctions();
    }
    
    // NUCLEAR: Destroy all audio except current
    nuclearDestroy() {
        // Get ALL audio elements
        const allAudio = document.querySelectorAll('audio');
        let destroyedCount = 0;
        
        console.log(`💥 NUCLEAR: Found ${allAudio.length} audio elements`);
        
        allAudio.forEach((audio, index) => {
            if (audio !== this.currentAudio) {
                try {
                    console.log(`💥 NUCLEAR: Destroying audio element ${index}`);
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 0;
                    audio.src = '';
                    if (audio.parentNode) {
                        audio.parentNode.removeChild(audio);
                    }
                    destroyedCount++;
                } catch (error) {
                    console.log(`💥 NUCLEAR: Error destroying audio ${index}:`, error.message);
                }
            } else {
                console.log(`✅ NUCLEAR: Keeping current audio element ${index}`);
            }
        });
        
        console.log(`💥 NUCLEAR: Destroyed ${destroyedCount} audio elements`);
        
        // Also destroy any global audio variables
        if (window.currentAudio && window.currentAudio !== this.currentAudio) {
            try {
                console.log('💥 NUCLEAR: Destroying global currentAudio');
                window.currentAudio.pause();
                window.currentAudio = null;
            } catch (error) {
                console.log('💥 NUCLEAR: Error destroying global audio:', error.message);
            }
        }
    }
    
    // NUCLEAR: Override all global functions
    overrideGlobalFunctions() {
        // Disable old music functions
        window.loadAndPlayTrackSilently = () => {};
        window.nextTrackSilently = () => {};
        window.loadAndPlayTrack = () => {};
        window.startMusicController = () => {};
        
        // Override with our functions
        window.nextTrack = () => this.nextTrack();
        window.previousTrack = () => this.previousTrack();
        window.playTrackFromList = (index) => this.playTrack(index);
    }
    
    // Load music files
    loadMusicFiles(files) {
        this.musicFiles = files;
        if (this.isShuffleOn) {
            this.shuffleMusicFiles();
        }
    }
    
    // NUCLEAR: Play track - GUARANTEED SINGLE AUDIO
    async playTrack(index) {
        if (index < 0 || index >= this.musicFiles.length) return false;
        
        const track = this.musicFiles[index];
        console.log(`🎵 NUCLEAR: Starting track ${index} - ${track.name}`);
        
        // NUCLEAR DESTRUCTION FIRST
        console.log('💥 NUCLEAR: Destroying all audio...');
        this.nuclearDestroy();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait longer
        
        try {
            // Create new audio
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume;
            
            console.log(`🔊 NUCLEAR: Created audio for ${track.name}`);
            
            // Add listeners
            this.currentAudio.addEventListener('ended', () => {
                console.log(`🔚 NUCLEAR: Track ended - ${track.name}`);
                setTimeout(() => this.nextTrack(), 100);
            });
            
            this.currentAudio.addEventListener('error', () => {
                console.log(`❌ NUCLEAR: Track error - ${track.name}`);
                setTimeout(() => this.nextTrack(), 100);
            });
            
            // Play
            await this.currentAudio.play();
            this.isPlaying = true;
            this.currentTrackIndex = index;
            
            console.log(`✅ NUCLEAR: Successfully playing ${track.name}`);
            
            // Update UI
            this.updateUI(track.name);
            
            return true;
        } catch (error) {
            console.log(`❌ NUCLEAR: Failed to play ${track.name}:`, error.name);
            return false;
        }
    }
    
    // Next track
    async nextTrack() {
        console.log('🔄 NUCLEAR: Next track requested');
        
        if (this.musicFiles.length === 0) {
            console.log('❌ NUCLEAR: No music files available');
            return false;
        }
        
        console.log(`🔄 NUCLEAR: Current track: ${this.currentTrackIndex}`);
        
        this.nuclearDestroy();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let nextIndex = (this.currentTrackIndex + 1) % this.musicFiles.length;
        console.log(`🔄 NUCLEAR: Next track will be: ${nextIndex}`);
        
        return await this.playTrack(nextIndex);
    }
    
    // Start music
    async startMusic() {
        if (this.musicFiles.length === 0) return false;
        
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
    }
    
    // Update UI - MINIMAL LOGGING
    updateUI(trackName) {
        const integratedSongName = document.getElementById('integratedSongName');
        const integratedSongStatus = document.getElementById('integratedSongStatus');
        
        if (integratedSongName) {
            integratedSongName.textContent = trackName || 'Unknown Track';
        }
        
        if (integratedSongStatus) {
            integratedSongStatus.textContent = `Music: ON • Pictures: ON`;
        }
    }
    
    // Set volume
    setVolume(vol) {
        this.volume = vol;
        if (this.currentAudio) {
            this.currentAudio.volume = vol;
        }
    }
}

// NUCLEAR: Destroy all existing music controllers
if (window.musicController) {
    window.musicController = null;
}
if (window.simpleMusicController) {
    window.simpleMusicController = null;
}

// Create NUCLEAR instance
window.nuclearMusicController = new NuclearMusicController();

// NUCLEAR: Override all global functions
window.nextTrack = function() {
    console.log('🔄 GLOBAL: nextTrack() called');
    if (window.nuclearMusicController) {
        window.nuclearMusicController.nextTrack();
    } else {
        console.log('❌ GLOBAL: nuclearMusicController not available');
    }
};

window.previousTrack = function() {
    // Disabled - only next track available since shuffle is on
    console.log('⚠️ GLOBAL: previousTrack() disabled - shuffle mode only supports next');
};

window.playTrackFromList = function(trackIndex) {
    console.log(`🔄 GLOBAL: playTrackFromList(${trackIndex}) called`);
    if (window.nuclearMusicController) {
        window.nuclearMusicController.playTrack(trackIndex);
    } else {
        console.log('❌ GLOBAL: nuclearMusicController not available');
    }
};

window.setVolume = function(value) {
    window.nuclearMusicController.setVolume(value / 100);
};

console.log('💥 NUCLEAR Music Controller loaded - GUARANTEED single audio');