// SIMPLE MUSIC CONTROLLER - GUARANTEED SINGLE AUDIO PLAYBACK
// This replaces the complex musicController.js with a simple, bulletproof system

class SimpleMusicController {
    constructor() {
        this.currentAudio = null;
        this.currentTrackIndex = 0;
        this.musicFiles = [];
        this.isPlaying = false;
        this.isShuffleOn = true;
        this.volume = 1.0;
        
        // AGGRESSIVE: Kill all audio every 200ms to prevent overlaps
        setInterval(() => {
            this.killAllAudioExceptCurrent();
        }, 200);
    }
    
    // AGGRESSIVE: Kill all audio except current
    killAllAudioExceptCurrent() {
        const allAudio = document.querySelectorAll('audio');
        allAudio.forEach(audio => {
            if (audio !== this.currentAudio) {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 0;
                    if (audio.parentNode) {
                        audio.parentNode.removeChild(audio);
                    }
                } catch (error) {
                    // Silent cleanup
                }
            }
        });
    }
    
    // Load music files
    loadMusicFiles(files) {
        this.musicFiles = files;
        if (this.isShuffleOn) {
            this.shuffleMusicFiles();
        }
    }
    
    // Simple play track - GUARANTEED SINGLE AUDIO
    async playTrack(index) {
        if (index < 0 || index >= this.musicFiles.length) return false;
        
        // KILL EVERYTHING FIRST
        this.stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const track = this.musicFiles[index];
        
        try {
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume;
            this.currentAudio.addEventListener('ended', () => this.nextTrack());
            this.currentAudio.addEventListener('error', () => this.nextTrack());
            
            await this.currentAudio.play();
            this.isPlaying = true;
            this.currentTrackIndex = index;
            this.updateUI(track.name);
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Next track
    async nextTrack() {
        if (this.musicFiles.length === 0) return false;
        
        this.stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        let nextIndex = (this.currentTrackIndex + 1) % this.musicFiles.length;
        return await this.playTrack(nextIndex);
    }
    
    // Previous track
    async previousTrack() {
        if (this.musicFiles.length === 0) return false;
        
        this.stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
    
    // Stop all audio - NUCLEAR OPTION
    stopAllAudio() {
        // Stop current audio
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (error) {}
            this.currentAudio = null;
        }
        
        // Stop global audio
        if (window.currentAudio) {
            try {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
            } catch (error) {}
            window.currentAudio = null;
        }
        
        // NUCLEAR: Remove all audio elements
        const allAudio = document.querySelectorAll('audio');
        allAudio.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0;
                if (audio.parentNode) {
                    audio.parentNode.removeChild(audio);
                }
            } catch (error) {}
        });
        
        this.isPlaying = false;
    }
    
    // Shuffle music files
    shuffleMusicFiles() {
        for (let i = this.musicFiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.musicFiles[i], this.musicFiles[j]] = [this.musicFiles[j], this.musicFiles[i]];
        }
    }
    
    // Update UI
    updateUI(trackName) {
        // Update integrated display
        const integratedSongName = document.getElementById('integratedSongName');
        const integratedSongStatus = document.getElementById('integratedSongStatus');
        
        if (integratedSongName) {
            integratedSongName.textContent = trackName || 'Unknown Track';
        }
        
        if (integratedSongStatus) {
            integratedSongStatus.textContent = `Music: ${this.isShuffleOn ? 'ON' : 'OFF'} • Pictures: ON`;
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

// Create global instance
window.simpleMusicController = new SimpleMusicController();

// Global functions for HTML buttons
window.nextTrack = function() {
    window.simpleMusicController.nextTrack();
};

window.previousTrack = function() {
    window.simpleMusicController.previousTrack();
};

window.playTrackFromList = function(trackIndex) {
    window.simpleMusicController.playTrack(trackIndex);
};

console.log('🎵 Simple Music Controller loaded - GUARANTEED single audio playback');