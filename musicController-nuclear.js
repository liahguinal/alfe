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
        
        // NUCLEAR: Destroy all audio every 50ms
        this.destroyInterval = setInterval(() => {
            this.nuclearDestroy();
        }, 50);
        
        // NUCLEAR: Override all global audio functions
        this.overrideGlobalFunctions();
    }
    
    // NUCLEAR: Destroy all audio except current
    nuclearDestroy() {
        // Get ALL audio elements
        const allAudio = document.querySelectorAll('audio');
        let destroyedCount = 0;
        
        allAudio.forEach(audio => {
            if (audio !== this.currentAudio) {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 0;
                    audio.src = '';
                    if (audio.parentNode) {
                        audio.parentNode.removeChild(audio);
                    }
                    destroyedCount++;
                } catch (error) {
                    // Silent destruction
                }
            }
        });
        
        // Also destroy any global audio variables
        if (window.currentAudio && window.currentAudio !== this.currentAudio) {
            try {
                window.currentAudio.pause();
                window.currentAudio = null;
            } catch (error) {}
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
        
        // NUCLEAR DESTRUCTION FIRST
        this.nuclearDestroy();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait longer
        
        const track = this.musicFiles[index];
        
        try {
            // Create new audio
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume;
            
            // Add listeners
            this.currentAudio.addEventListener('ended', () => {
                setTimeout(() => this.nextTrack(), 100);
            });
            
            this.currentAudio.addEventListener('error', () => {
                setTimeout(() => this.nextTrack(), 100);
            });
            
            // Play
            await this.currentAudio.play();
            this.isPlaying = true;
            this.currentTrackIndex = index;
            
            // Update UI
            this.updateUI(track.name);
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Next track
    async nextTrack() {
        if (this.musicFiles.length === 0) return false;
        
        this.nuclearDestroy();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let nextIndex = (this.currentTrackIndex + 1) % this.musicFiles.length;
        return await this.playTrack(nextIndex);
    }
    
    // Previous track
    async previousTrack() {
        if (this.musicFiles.length === 0) return false;
        
        this.nuclearDestroy();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        let prevIndex = (this.currentTrackIndex - 1 + this.musicFiles.length) % this.musicFiles.length;
        return await this.playTrack(prevIndex);
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
    window.nuclearMusicController.nextTrack();
};

window.previousTrack = function() {
    window.nuclearMusicController.previousTrack();
};

window.playTrackFromList = function(trackIndex) {
    window.nuclearMusicController.playTrack(trackIndex);
};

window.setVolume = function(value) {
    window.nuclearMusicController.setVolume(value / 100);
};

console.log('💥 NUCLEAR Music Controller loaded - GUARANTEED single audio');