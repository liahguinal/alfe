let currentImageIndex = 1;
let totalImages = 6; // Will be updated dynamically
let availableImages = [];
let isPlaying = true;
let slideshowInterval;
let isPictureShuffleOn = true; // Enable picture shuffle by default

// Music player variables
let currentAudio = null;
let currentTrackIndex = 0;
let isMusicPlaying = false;
let isMuted = false;
let isShuffleOn = true; // Enable shuffle by default
let isRepeatOn = false;
let musicFiles = [];
let filteredMusicFiles = [];
let isSystemReady = false;

// Your actual music files from the musics folder - just filenames
const actualMusicFiles = [
    '679 (1960\'s Soul Cover).mp3',
    'AYA  HEAVEN KNOWS (RNB Cover).mp3',
    'Be With You.mp3',
    'Beautiful Girls (1960\'s Soul Jazz).mp3',
    'BROCKHAMPTON - SUGAR (Lyrics).mp3',
    'Cean Jr. - YK (Official Audio).mp3',
    'Doja Cat - So High (Official Audio).mp3',
    'Don Toliver - You (feat. Travis Scott) [Official Audio].mp3',
    'Incomplete.mp3',
    'Justin Bieber - Confident ft. Chance The Rapper (Official Audio).mp3',
    'Justin Bieber - Right Here ft. Drake (Official Audio).mp3',
    'LeAnn Rimes - How Do I Live [Lyrics].mp3',
    'Lloyd - All I Need (Prod. Slade Da Monsta).mp3',
    'Maikee\'s Letters.mp3',
    'Mario - How Do I Breathe (Lyrics).mp3',
    'Mario - Let Me Love You.mp3',
    'Masiram (feat. Paul Royale).mp3',
    'Miguel - Sure Thing (Lyrics).mp3',
    'MYSB (Miss You so Bad).mp3',
    'Nickelback - Far Away  Lyrics.mp3',
    'One Wish.mp3',
    'Sexy Lady.mp3',
    'Tamia - Officially Missing You (Cover by Carl B).mp3',
    'Vedo - Fine Shyt (Official Audio).mp3',
    'Vedo - Yvette feat. Inayah Lamis (Lyric Video).mp3'
];

// Function to get proper music file path for deployment
function getMusicFilePath(filename) {
    // Try different path variations for deployment compatibility
    const paths = [
        `./musics/${filename}`,
        `musics/${filename}`,
        `/musics/${filename}`
    ];
    return paths[0]; // Use relative path with ./
}

// Available background GIFs
const backgroundGifs = [
    'gifs/love.gif',
    'gifs/stitch-dance.gif'
    // Add more GIFs here when you have them
    // 'gifs/another-gif.gif',
    // 'gifs/third-gif.gif'
];

let currentBackgroundIndex = 0; // Start with love.gif

// Hearts system variables
let globalHeartsInterval = null;
let loadingHeartsInterval = null;
let appHeartsInterval = null;
let backgroundHeartsInterval = null;

// Detect available images in the pics folder
async function detectAvailableImages() {
    availableImages = [];
    
    // Show "YES NA!" button after 4 seconds if scanning takes too long
    const yesNaBtn = document.getElementById('yesNaBtn');
    const yesNaTimeout = setTimeout(() => {
        if (yesNaBtn) {
            yesNaBtn.style.display = 'block';
        }
    }, 4000); // Show button after 4 seconds
    
    // Test for numbered images - check only the known available range
    const knownImages = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
    ];
    
    const imageCheckPromises = [];
    
    for (let i = 0; i < knownImages.length; i++) {
        const imageNumber = knownImages[i];
        const checkPromise = new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve(null); // Return null if timeout
            }, 200); // 200ms timeout per image
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(imageNumber); // Return image number if found
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(null); // Return null if not found
            };
            
            img.src = `pics/${imageNumber}.jpg`;
        });
        
        imageCheckPromises.push(checkPromise);
    }
    
    // Wait for all image checks to complete
    const results = await Promise.all(imageCheckPromises);
    
    // Filter out null results and add found images
    availableImages = results.filter(result => result !== null).sort((a, b) => a - b);
    
    // Clear the "YES NA!" timeout since we completed
    clearTimeout(yesNaTimeout);
    if (yesNaBtn) {
        yesNaBtn.style.display = 'none';
    }
    
    totalImages = availableImages.length;
    console.log(`Found ${totalImages} images: ${availableImages.join(', ')}`);
    
    // Update the UI with the image count
    const imageCountElement = document.getElementById('imageCount');
    if (imageCountElement) {
        imageCountElement.textContent = `${totalImages} images`;
    }
    
    // If no images found, fallback to original 6
    if (totalImages === 0) {
        availableImages = [1, 2, 3, 4, 5, 6];
        totalImages = 6;
        console.log('No additional images found, using default 6 images');
        if (imageCountElement) {
            imageCountElement.textContent = '6 images';
        }
    }
} // Start with love.gif // Start with love.gif

// Function to complete loading when "YES NA!" button is clicked
function completeLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.querySelector('.loading-text');
    
    // Set to complete
    loadingText.textContent = 'Ready to enjoy!';
    loadingProgress.style.width = '100%';
    
    // If no images were detected, use default
    if (availableImages.length === 0) {
        availableImages = [1, 2, 3, 4, 5, 6];
        totalImages = 6;
        const imageCountElement = document.getElementById('imageCount');
        if (imageCountElement) {
            imageCountElement.textContent = '6 images';
        }
    }
    
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        // Start slideshow and music after loading
        setTimeout(() => {
            startSlideshow();
            updateStatus();
            isSystemReady = true;
            
            // Start music immediately if available
            if (musicFiles.length > 0) {
                console.log('Starting music from completeLoading...');
                startBackgroundMusic();
            }
        }, 800);
    }, 500);
}

// Function to start music and slideshow with user interaction
function startMusicAndSlideshow() {
    const musicPromptOverlay = document.getElementById('musicPromptOverlay');
    
    // Hide the prompt
    if (musicPromptOverlay) {
        musicPromptOverlay.style.display = 'none';
    }
    
    // Start music with user interaction
    if (window.musicController && musicFiles.length > 0) {
        console.log('🎵 Starting music with user interaction...');
        window.musicController.startMusic();
    }
    
    // Ensure slideshow is running
    if (!isSystemReady) {
        startSlideshow();
        updateStatus();
        isSystemReady = true;
    }
}

// Initialize system with loading screen
async function initializeSystem() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.querySelector('.loading-text');
    
    // Start with 0% progress
    loadingProgress.style.width = '0%';
    
    try {
        // Step 1: Initialize - smooth progress to 10%
        loadingText.textContent = 'Initializing system...';
        await animateProgress(loadingProgress, 0, 10, 500);
        
        // Step 2: Start image scanning - progress to 30%
        loadingText.textContent = 'Scanning image gallery...';
        await animateProgress(loadingProgress, 10, 30, 800);
        
        // Step 3: Continue image detection with progress updates
        const imageDetectionPromise = detectAvailableImagesWithProgress(loadingProgress, loadingText);
        const imageTimeout = new Promise((resolve) => {
            setTimeout(() => {
                console.log('Image detection timeout - using defaults');
                resolve();
            }, 3000);
        });
        
        await Promise.race([imageDetectionPromise, imageTimeout]);
        
        // Step 4: Music loading with progress - 60% to 80%
        loadingText.textContent = 'Loading music library...';
        await animateProgress(loadingProgress, 60, 70, 500);
        
        const musicLoadPromise = loadMusicFilesWithProgress(loadingProgress, loadingText);
        const musicTimeout = new Promise((resolve) => {
            setTimeout(() => {
                console.log('Music timeout - continuing');
                resolve();
            }, 2000);
        });
        
        await Promise.race([musicLoadPromise, musicTimeout]);
        
        // Step 5: Final preparation - 90% to 95%
        loadingText.textContent = 'Preparing slideshow...';
        await animateProgress(loadingProgress, 90, 95, 400);
        
        // Step 6: Complete - 95% to 100%
        loadingText.textContent = 'Ready to enjoy!';
        await animateProgress(loadingProgress, 95, 100, 600);
        
        // Small pause to show 100%
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Hide loading screen
        loadingScreen.classList.add('fade-out');
        
        // Start slideshow and music IMMEDIATELY after loading
        setTimeout(() => {
            startSlideshow();
            updateStatus();
            isSystemReady = true;
            
            // Start music using the dedicated music controller - IMMEDIATE AUTO-START
            if (musicFiles.length > 0) {
                console.log('🎵 STARTING MUSIC WITH DEDICATED CONTROLLER');
                console.log(`🎵 Available music files: ${musicFiles.length}`);
                
                // AGGRESSIVE IMMEDIATE START - Multiple attempts
                if (window.musicController) {
                    console.log('🎵 Music controller available, starting AGGRESSIVELY...');
                    
                    // Attempt 1: Immediate start
                    window.startMusicController(musicFiles);
                    
                    // Attempt 2: Force start after very short delay
                    setTimeout(() => {
                        if (!window.musicController.isPlaying) {
                            console.log('🔄 First attempt failed, trying force start...');
                            window.musicController.forceStartMusic();
                        } else {
                            console.log('✅ Music successfully started on first attempt!');
                        }
                    }, 50);
                    
                    // Attempt 3: Final check and retry
                    setTimeout(() => {
                        if (!window.musicController.isPlaying) {
                            console.log('🔄 Final attempt: aggressive restart...');
                            window.musicController.startMusic();
                        }
                    }, 200);
                } else {
                    console.log('❌ Music controller not available');
                }
            } else {
                console.log('No music files loaded, music will not auto-start');
            }
        }, 500); // Reduced delay to 500ms
        
    } catch (error) {
        console.error('System initialization error:', error);
        // Force complete on any error
        completeLoading();
    }
}

// Smooth progress animation function with percentage display
async function animateProgress(progressElement, startPercent, endPercent, duration) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const percentDiff = endPercent - startPercent;
        
        function updateProgress() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentPercent = startPercent + (percentDiff * easeProgress);
            
            progressElement.style.width = currentPercent + '%';
            
            // Update percentage display if it exists
            const percentageDisplay = document.getElementById('loadingPercentage');
            if (percentageDisplay) {
                percentageDisplay.textContent = Math.round(currentPercent) + '%';
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(updateProgress);
    });
}

// Enhanced image detection with progress updates
async function detectAvailableImagesWithProgress(progressElement, loadingText) {
    availableImages = [];
    
    // Show "YES NA!" button after 4 seconds if scanning takes too long
    const yesNaBtn = document.getElementById('yesNaBtn');
    const yesNaTimeout = setTimeout(() => {
        if (yesNaBtn) {
            yesNaBtn.style.display = 'block';
        }
    }, 4000);
    
    // Test for numbered images - check only the known available images
    const knownImages = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
    ];
    const maxImages = knownImages.length;
    const imageCheckPromises = [];
    
    for (let i = 0; i < knownImages.length; i++) {
        const imageNumber = knownImages[i];
        const checkPromise = new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve(null); // Return null if timeout
            }, 200); // 200ms timeout per image
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(imageNumber); // Return image number if found
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(null); // Return null if not found
            };
            
            img.src = `pics/${imageNumber}.jpg`;
        });
        
        imageCheckPromises.push(checkPromise);
    }
    
    // Wait for all image checks to complete with progress updates
    let completedChecks = 0;
    const results = [];
    
    for (const promise of imageCheckPromises) {
        const result = await promise;
        results.push(result);
        completedChecks++;
        
        // Update progress from 30% to 60% based on completed checks
        const progress = 30 + ((completedChecks / maxImages) * 30);
        progressElement.style.width = progress + '%';
        
        // Count found images so far
        const foundCount = results.filter(r => r !== null).length;
        loadingText.textContent = `Scanning images... Found ${foundCount}`;
    }
    
    // Filter out null results and add found images
    availableImages = results.filter(result => result !== null).sort((a, b) => a - b);
    
    // Clear the "YES NA!" timeout
    clearTimeout(yesNaTimeout);
    if (yesNaBtn) {
        yesNaBtn.style.display = 'none';
    }
    
    totalImages = availableImages.length;
    console.log(`Found ${totalImages} images: ${availableImages.join(', ')}`);
    
    // Update the UI with the image count
    const imageCountElement = document.getElementById('imageCount');
    if (imageCountElement) {
        imageCountElement.textContent = `${totalImages} images`;
    }
    
    // If no images found, fallback to original 6
    if (totalImages === 0) {
        availableImages = [1, 2, 3, 4, 5, 6];
        totalImages = 6;
        console.log('No additional images found, using default 6 images');
        if (imageCountElement) {
            imageCountElement.textContent = '6 images';
        }
    }
    
    // Ensure we reach 60% progress
    progressElement.style.width = '60%';
    loadingText.textContent = `Found ${totalImages} images`;
}

// Enhanced music loading with progress updates
async function loadMusicFilesWithProgress(progressElement, loadingText) {
    musicFiles = [];
    
    const totalFiles = actualMusicFiles.length;
    let loadedCount = 0;
    
    console.log(`🎵 Loading ${totalFiles} music files from musics folder...`);
    
    // Load music files with progress updates
    const loadPromises = actualMusicFiles.map(async (filename, index) => {
        try {
            const audio = new Audio(getMusicFilePath(filename));
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.log(`⏰ Timeout loading: ${filename}`);
                    reject(new Error('Timeout'));
                }, 2000); // Increased timeout to 2000ms
                
                const onCanPlay = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    
                    // Clean up the filename for display
                    const displayName = filename
                        .replace(/\.[^/.]+$/, "")
                        .replace(/ \(Official Audio\)/g, "")
                        .replace(/ \(Lyrics\)/g, "")
                        .replace(/ \(Lyric Video\)/g, "")
                        .replace(/ \(Prod\. [^)]+\)/g, "")
                        .replace(/feat\./g, "ft.")
                        .trim();
                    
                    musicFiles.push({
                        name: displayName,
                        file: getMusicFilePath(encodeURIComponent(filename)),
                        duration: '0:00'
                    });
                    
                    loadedCount++;
                    console.log(`✅ Loaded: ${displayName} (${loadedCount}/${totalFiles})`);
                    
                    // Update progress from 70% to 90% based on music loaded
                    const progress = 70 + ((loadedCount / totalFiles) * 20);
                    progressElement.style.width = progress + '%';
                    loadingText.textContent = `Loading music... ${loadedCount}/${totalFiles}`;
                    
                    resolve();
                };
                
                const onError = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    
                    console.log(`❌ Failed to load: ${filename}`);
                    loadedCount++;
                    const progress = 70 + ((loadedCount / totalFiles) * 20);
                    progressElement.style.width = progress + '%';
                    loadingText.textContent = `Loading music... ${loadedCount}/${totalFiles}`;
                    
                    reject(new Error('Cannot load'));
                };
                
                audio.addEventListener('canplaythrough', onCanPlay);
                audio.addEventListener('error', onError);
                
                audio.volume = 0.01;
                audio.preload = 'metadata';
                audio.load();
            });
        } catch (error) {
            console.log(`❌ Could not load: ${filename}`);
            loadedCount++;
            const progress = 70 + ((loadedCount / totalFiles) * 20);
            progressElement.style.width = progress + '%';
            loadingText.textContent = `Loading music... ${loadedCount}/${totalFiles}`;
            return Promise.resolve();
        }
    });
    
    // Wait for all promises with overall timeout
    const allPromises = Promise.allSettled(loadPromises);
    const overallTimeout = new Promise((resolve) => {
        setTimeout(() => {
            console.log('⏰ Music loading timeout - continuing with loaded files');
            resolve();
        }, 3000); // Increased timeout to 3 seconds
    });
    
    await Promise.race([allPromises, overallTimeout]);
    
    filteredMusicFiles = [...musicFiles];
    console.log(`🎵 Successfully loaded ${musicFiles.length}/${totalFiles} music files`);
    
    // Shuffle the playlist if shuffle is enabled
    if (isShuffleOn && musicFiles.length > 0) {
        shufflePlaylist();
        console.log(`🔀 Playlist shuffled! Ready to play ${musicFiles.length} tracks`);
    }
    
    // Ensure we reach 90% progress
    progressElement.style.width = '90%';
    loadingText.textContent = `Loaded ${musicFiles.length} music files`;
}

// Load music files on startup
async function loadMusicFilesOnStartup() {
    musicFiles = [];
    
    // Load your actual music files with very short timeout
    const loadPromises = actualMusicFiles.map(async (filename) => {
        try {
            const audio = new Audio(`musics/${filename}`);
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout'));
                }, 300); // Increased timeout slightly to 300ms per file
                
                const onCanPlay = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    
                    // Clean up the filename for display
                    const displayName = filename
                        .replace(/\.[^/.]+$/, "") // Remove extension
                        .replace(/ \(Official Audio\)/g, "") // Remove (Official Audio)
                        .replace(/ \(Lyrics\)/g, "") // Remove (Lyrics)
                        .replace(/ \(Lyric Video\)/g, "") // Remove (Lyric Video)
                        .replace(/ \(Prod\. [^)]+\)/g, "") // Remove producer credits
                        .replace(/feat\./g, "ft.") // Standardize featuring
                        .trim();
                    
                    musicFiles.push({
                        name: displayName,
                        file: `musics/${encodeURIComponent(filename)}`,
                        duration: '0:00'
                    });
                    resolve();
                };
                
                const onError = () => {
                    clearTimeout(timeout);
                    audio.removeEventListener('canplaythrough', onCanPlay);
                    audio.removeEventListener('error', onError);
                    reject(new Error('Cannot load'));
                };
                
                audio.addEventListener('canplaythrough', onCanPlay);
                audio.addEventListener('error', onError);
                
                // Set a very low volume and try to load
                audio.volume = 0.01;
                audio.preload = 'metadata'; // Only load metadata first
                audio.load();
            });
        } catch (error) {
            console.log(`Could not load: ${filename}`);
            return Promise.resolve(); // Don't fail, just continue
        }
    });
    
    // Wait for all promises but don't fail if some don't load - with overall timeout
    const allPromises = Promise.allSettled(loadPromises);
    const overallTimeout = new Promise((resolve) => {
        setTimeout(() => {
            console.log('Music loading timeout - continuing with loaded files');
            resolve();
        }, 800); // Increased overall timeout to 800ms
    });
    
    await Promise.race([allPromises, overallTimeout]);
    
    filteredMusicFiles = [...musicFiles];
    console.log(`🎵 MUSIC LOADING COMPLETE: Found ${musicFiles.length} music files`);
    console.log('📋 Loaded tracks:', musicFiles.map(f => f.name));
    
    // Initialize the music controller with loaded files - IMMEDIATE START
    if (window.musicController && musicFiles.length > 0) {
        console.log('🎵 Initializing music controller from loadMusicFilesWithProgress');
        console.log(`🎵 Passing ${musicFiles.length} files to music controller`);
        
        // Start music controller immediately
        window.startMusicController(musicFiles);
        
        // Force start after short delay if not playing
        setTimeout(() => {
            if (window.musicController) {
                if (!window.musicController.isPlaying) {
                    console.log('🎵 Music not playing, forcing start...');
                    window.musicController.startMusic();
                } else {
                    console.log('✅ Music is already playing!');
                }
                // Update UI regardless
                window.musicController.updateUI();
            }
        }, 500);
    } else {
        console.log(`❌ Cannot start music controller: musicController=${!!window.musicController}, files=${musicFiles.length}`);
    }
    
    // Shuffle the playlist if shuffle is enabled
    if (isShuffleOn && musicFiles.length > 0) {
        shufflePlaylist();
    }
}

// Shuffle the playlist
function shufflePlaylist() {
    for (let i = musicFiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [musicFiles[i], musicFiles[j]] = [musicFiles[j], musicFiles[i]];
    }
    filteredMusicFiles = [...musicFiles];
    console.log('Playlist shuffled!');
}

// Background management functions
function changeBackground(gifPath) {
    const body = document.body;
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Update main background
    body.style.backgroundImage = `url('${gifPath}')`;
    
    // Set appropriate background size based on the GIF
    if (gifPath.includes('love.gif')) {
        body.style.backgroundSize = 'contain'; // Show whole love.gif
    } else {
        body.style.backgroundSize = 'cover'; // Keep stitch-dance.gif as cover
    }
    
    // Update loading screen background
    if (loadingScreen) {
        loadingScreen.style.backgroundImage = `url('${gifPath}')`;
        if (gifPath.includes('love.gif')) {
            loadingScreen.style.backgroundSize = 'contain';
        } else {
            loadingScreen.style.backgroundSize = 'cover';
        }
    }
    
    console.log(`Background changed to: ${gifPath}`);
}

function nextBackground() {
    if (backgroundGifs.length > 1) {
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundGifs.length;
        changeBackground(backgroundGifs[currentBackgroundIndex]);
    }
}

function randomBackground() {
    if (backgroundGifs.length > 1) {
        const randomIndex = Math.floor(Math.random() * backgroundGifs.length);
        currentBackgroundIndex = randomIndex;
        changeBackground(backgroundGifs[currentBackgroundIndex]);
    }
}

// Auto-rotate backgrounds every 2 minutes (optional)
function startBackgroundRotation() {
    if (backgroundGifs.length > 1) {
        setInterval(() => {
            nextBackground();
        }, 120000); // Change background every 2 minutes
        console.log('Background rotation started');
    }
}

// Start background music automatically - DISABLED (Using Music Controller Instead)
async function startBackgroundMusic() {
    console.log('🔄 startBackgroundMusic called - redirecting to music controller');
    
    // COMPLETELY DISABLED - Use music controller instead
    if (window.musicController && musicFiles.length > 0) {
        console.log('🎵 Starting music with dedicated controller');
        window.startMusicController(musicFiles);
        return true;
    }
    
    console.log('❌ Music controller not available or no music files');
    return false;
}

// Enhanced autoplay on interaction - DISABLED (Using Music Controller Instead)
function enableAutoplayOnInteraction() {
    console.log('🔄 enableAutoplayOnInteraction called - music controller handles this');
    
    // COMPLETELY DISABLED - Music controller handles interaction triggers
    if (window.musicController) {
        console.log('✅ Music controller will handle user interactions');
    }
}

// Create special hearts when music starts - UNLIMITED VERSION
function createMusicStartHearts() {
    const appHeartsContainer = document.getElementById('appFloatingHearts');
    if (!appHeartsContainer) return;
    
    // Create a bigger burst of hearts
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'app-floating-heart pulse';
            heart.textContent = '🩵';
            heart.style.left = (20 + Math.random() * 60) + '%';
            heart.style.animationDelay = '0s';
            heart.style.color = 'rgba(108, 198, 224, 0.7)';
            heart.style.fontSize = '1.2rem';
            
            appHeartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 12000);
        }, i * 200);
    }
    
    // Create continuous celebration hearts for 5 seconds
    let celebrationCount = 0;
    const celebrationInterval = setInterval(() => {
        if (celebrationCount >= 10) {
            clearInterval(celebrationInterval);
            return;
        }
        
        const heart = document.createElement('div');
        heart.className = 'app-floating-heart pulse';
        heart.textContent = '🩵';
        heart.style.left = (30 + Math.random() * 40) + '%';
        heart.style.animationDelay = '0s';
        heart.style.color = 'rgba(108, 198, 224, 0.6)';
        heart.style.fontSize = '1rem';
        
        appHeartsContainer.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 12000);
        
        celebrationCount++;
    }, 500);
}

// Load and play track silently - DISABLED (Using Music Controller Instead)
async function loadAndPlayTrackSilently() {
    console.log('🎵 loadAndPlayTrackSilently called - currentTrackIndex: ' + currentTrackIndex + ', musicFiles.length: ' + musicFiles.length);
    
    // COMPLETELY DISABLED - Use music controller instead
    console.log('🔄 Redirecting to music controller');
    
    if (window.musicController && window.musicController.musicFiles.length > 0) {
        console.log('🎵 Loading track: ' + musicFiles[currentTrackIndex].name + ' from ' + musicFiles[currentTrackIndex].file);
        console.log('🎵 Attempting to play: ' + musicFiles[currentTrackIndex].name);
        console.log('✅ NOW PLAYING: ' + musicFiles[currentTrackIndex].name);
        console.log('✅ DIRECT PLAY SUCCESS: ' + musicFiles[currentTrackIndex].name);
        
        // Use music controller to play current track
        return await window.musicController.playTrack(window.musicController.currentTrackIndex);
    }
    
    console.log('❌ Music controller not available or no tracks');
    return false;
}

// Next track silently (for background playback) - DISABLED (Using Music Controller Instead)
function nextTrackSilently() {
    console.log('🔄 nextTrackSilently called - redirecting to music controller');
    
    // COMPLETELY DISABLED - Use music controller instead
    if (window.musicController) {
        return window.musicController.nextTrack();
    }
    
    console.log('❌ Music controller not available');
    return false;
}

// Start the slideshow automatically - loops continuously
function startSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    
    slideshowInterval = setInterval(() => {
        if (isPlaying) {
            nextImage();
        }
    }, 4000); // Change image every 4 seconds for better viewing
    
    updateStatus();
}

// Stop the slideshow
function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    updateStatus();
}

// Toggle slideshow on image click
function toggleSlideshow() {
    const downloadOverlay = document.getElementById('downloadOverlay');
    
    console.log('toggleSlideshow called, isPlaying:', isPlaying);
    console.log('downloadOverlay element:', downloadOverlay);
    
    if (isPlaying) {
        // Pause slideshow and show download gallery
        isPlaying = false;
        stopSlideshow();
        generateThumbnailGallery();
        downloadOverlay.classList.add('show');
        console.log('Added show class to download overlay');
    } else {
        // Resume slideshow and hide download gallery
        isPlaying = true;
        startSlideshow();
        downloadOverlay.classList.remove('show');
        console.log('Removed show class from download overlay');
    }
}

// Generate thumbnail gallery for picture selection
function generateThumbnailGallery() {
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    if (!thumbnailGallery) return;
    
    thumbnailGallery.innerHTML = '';
    
    // Create thumbnails for all available images
    availableImages.forEach((imageNumber, index) => {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = 'thumbnail-item';
        thumbnailItem.dataset.imageNumber = imageNumber;
        
        let imageSrc;
        if (imageNumber < 0 && window.importedImages && window.importedImages[imageNumber]) {
            // Imported image
            imageSrc = window.importedImages[imageNumber];
        } else {
            // Regular image
            imageSrc = `pics/${imageNumber}.jpg`;
        }
        
        thumbnailItem.innerHTML = `
            <img class="thumbnail-img" src="${imageSrc}" alt="Image ${Math.abs(imageNumber)}" loading="lazy">
            <div class="thumbnail-overlay">
                <i class="fas fa-check thumbnail-check"></i>
            </div>
            <div class="thumbnail-number">${Math.abs(imageNumber)}</div>
        `;
        
        // Add click event to toggle selection
        thumbnailItem.addEventListener('click', () => {
            toggleThumbnailSelection(thumbnailItem);
        });
        
        thumbnailGallery.appendChild(thumbnailItem);
    });
    
    console.log(`Generated ${availableImages.length} thumbnails`);
}

// Toggle thumbnail selection
function toggleThumbnailSelection(thumbnailItem) {
    thumbnailItem.classList.toggle('selected');
    
    // Update download button text based on selections
    updateDownloadButtonText();
}

// Update download button text based on selected thumbnails
function updateDownloadButtonText() {
    const selectedThumbnails = document.querySelectorAll('.thumbnail-item.selected');
    const downloadAllBtn = document.querySelector('.all-btn');
    
    if (selectedThumbnails.length === 0) {
        downloadAllBtn.innerHTML = '<i class="fas fa-images"></i> Download All';
    } else {
        downloadAllBtn.innerHTML = `<i class="fas fa-download"></i> Download Selected (${selectedThumbnails.length})`;
    }
}

// Switch to next image with shuffle support
function nextImage() {
    if (isPictureShuffleOn) {
        // Shuffle mode: pick a random image that's different from current
        let nextImageNumber;
        do {
            nextImageNumber = availableImages[Math.floor(Math.random() * availableImages.length)];
        } while (nextImageNumber === currentImageIndex && availableImages.length > 1);
        switchToImage(nextImageNumber);
    } else {
        // Sequential mode: go to next image in order
        const currentIndex = availableImages.indexOf(currentImageIndex);
        const nextIndex = currentIndex >= availableImages.length - 1 ? 0 : currentIndex + 1;
        const nextImageNumber = availableImages[nextIndex];
        switchToImage(nextImageNumber);
    }
}

// Switch to specific image
function switchToImage(imageNumber) {
    const imageElement = document.getElementById('currentImage');
    
    // Add fade out effect
    imageElement.style.opacity = '0';
    imageElement.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        let imageSrc;
        
        if (imageNumber < 0 && window.importedImages && window.importedImages[imageNumber]) {
            // Imported image
            imageSrc = window.importedImages[imageNumber];
        } else {
            // Regular image
            imageSrc = `pics/${imageNumber}.jpg`;
        }
        
        // Update image source
        imageElement.src = imageSrc;
        imageElement.alt = `Gallery image ${Math.abs(imageNumber)}`;
        currentImageIndex = imageNumber;
        
        // Fade in effect
        setTimeout(() => {
            imageElement.style.opacity = '1';
            imageElement.style.transform = 'scale(1)';
        }, 50);
    }, 300);
}

// Update status indicator - SAFE VERSION
function updateStatus() {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    
    if (statusText) {
        if (isPlaying) {
            statusText.textContent = '▶️ Auto-playing...';
        } else {
            statusText.textContent = '⏸️ Paused - Click image to resume';
        }
    }
    
    if (statusIndicator) {
        if (isPlaying) {
            statusIndicator.className = 'status-indicator playing';
        } else {
            statusIndicator.className = 'status-indicator paused';
        }
    }
    
    // Also update the integrated music display
    updateCompactMusicDisplay();
}

// Download selected images or all images
function downloadAllImages(event) {
    event.stopPropagation();
    
    const selectedThumbnails = document.querySelectorAll('.thumbnail-item.selected');
    
    // Hide download overlay first
    const downloadOverlay = document.getElementById('downloadOverlay');
    downloadOverlay.classList.remove('show');
    isPlaying = true;
    startSlideshow();
    
    if (selectedThumbnails.length > 0) {
        // Download only selected images
        downloadSelectedImages(selectedThumbnails);
    } else {
        // Download all images
        downloadAll();
    }
}

// Download selected images
async function downloadSelectedImages(selectedThumbnails) {
    showNotification(`📥 Downloading ${selectedThumbnails.length} selected images...`);
    
    for (let i = 0; i < selectedThumbnails.length; i++) {
        const thumbnail = selectedThumbnails[i];
        const imageNumber = parseInt(thumbnail.dataset.imageNumber);
        
        try {
            let imageSrc;
            if (imageNumber < 0 && window.importedImages && window.importedImages[imageNumber]) {
                // Imported image
                imageSrc = window.importedImages[imageNumber];
            } else {
                // Regular image
                imageSrc = `pics/${imageNumber}.jpg`;
            }
            
            // Create download link
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = `ninya-gallery-${Math.abs(imageNumber)}.jpg`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
            
        } catch (error) {
            console.error(`Error downloading image ${imageNumber}:`, error);
        }
    }
    
    showNotification(`✅ Downloaded ${selectedThumbnails.length} selected images!`);
}

// Remove the old downloadCurrentImage function since we're using thumbnail selection now
// Cancel download and resume slideshow
function cancelDownload(event) {
    event.stopPropagation();
    
    const downloadOverlay = document.getElementById('downloadOverlay');
    downloadOverlay.classList.remove('show');
    isPlaying = true;
    startSlideshow();
}

// MUSIC PLAYER FUNCTIONS

// Toggle music player overlay
function toggleMusicPlayer() {
    const overlay = document.getElementById('musicPlayerOverlay');
    const compactBtn = document.getElementById('compactMusicBtn');
    
    if (overlay.classList.contains('show')) {
        closeMusicPlayer();
    } else {
        overlay.classList.add('show');
        displayMusicList(); // Use existing music files
        updateMusicDisplay();
        initializeShuffleButton(); // Set shuffle button state
        updateCompactButton();
    }
}

// Close music player
function closeMusicPlayer() {
    const overlay = document.getElementById('musicPlayerOverlay');
    overlay.classList.remove('show');
}

// Load music files from the music folder
async function loadMusicFiles() {
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '<div class="loading-music">Scanning music folder...</div>';
    
    // Common audio file extensions
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
    
    // Since we can't directly access the file system, we'll try common filenames
    const commonMusicFiles = [
        'song1.mp3', 'song2.mp3', 'song3.mp3', 'song4.mp3', 'song5.mp3',
        'music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3', 'music5.mp3',
        'track1.mp3', 'track2.mp3', 'track3.mp3', 'track4.mp3', 'track5.mp3',
        'audio1.mp3', 'audio2.mp3', 'audio3.mp3', 'audio4.mp3', 'audio5.mp3',
        '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3', '9.mp3', '10.mp3'
    ];
    
    musicFiles = [];
    
    // Test each potential music file
    for (let filename of commonMusicFiles) {
        try {
            const audio = new Audio(`music/${filename}`);
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => {
                    musicFiles.push({
                        name: filename.replace(/\.[^/.]+$/, ""), // Remove extension
                        file: `music/${filename}`,
                        duration: '0:00'
                    });
                    resolve();
                });
                audio.addEventListener('error', reject);
                audio.load();
            });
        } catch (error) {
            // File doesn't exist or can't be loaded, skip it
        }
    }
    
    filteredMusicFiles = [...musicFiles];
    displayMusicList();
}

// Display music list - WITH CLICK-TO-PLAY
function displayMusicList() {
    const musicList = document.getElementById('musicList');
    
    if (filteredMusicFiles.length === 0) {
        musicList.innerHTML = `
            <div class="loading-music">
                No music files found in the music folder.<br>
                Please add .mp3, .wav, or other audio files to the music folder.
            </div>
        `;
        return;
    }
    
    console.log('🎵 Displaying music list with click-to-play functionality');
    musicList.innerHTML = '';
    
    filteredMusicFiles.forEach((track, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item clickable-song';
        
        // Check if this is the currently playing track
        const isCurrentTrack = window.musicController && 
                              window.musicController.currentTrackIndex === index;
        
        if (isCurrentTrack) {
            musicItem.classList.add('active');
        }
        
        musicItem.innerHTML = `
            <div class="music-item-icon">${isCurrentTrack && window.musicController.isPlaying ? '🎵' : '🎶'}</div>
            <div class="music-item-info">
                <div class="music-item-name">${track.name}</div>
                <div class="music-item-duration">${track.duration}</div>
            </div>
        `;
        
        // Add click event for IMMEDIATE PLAY
        musicItem.addEventListener('click', () => {
            console.log(`🎵 Song clicked: ${track.name} (index: ${index})`);
            
            // Use the music controller for reliable playback
            if (window.musicController) {
                window.playTrackFromList(index);
            } else {
                // Fallback to old system
                console.log('🎵 Fallback to old playTrack');
                playTrack(index);
            }
        });
        
        // Add hover effect
        musicItem.addEventListener('mouseenter', () => {
            musicItem.style.backgroundColor = 'rgba(108, 198, 224, 0.1)';
        });
        
        musicItem.addEventListener('mouseleave', () => {
            musicItem.style.backgroundColor = '';
        });
        
        musicList.appendChild(musicItem);
    });
    
    console.log(`🎵 Music list displayed with ${filteredMusicFiles.length} clickable songs`);
}

// Search music
function searchMusic() {
    const searchTerm = document.getElementById('musicSearch').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredMusicFiles = [...musicFiles];
    } else {
        filteredMusicFiles = musicFiles.filter(track => 
            track.name.toLowerCase().includes(searchTerm)
        );
    }
    
    displayMusicList();
}

// Refresh music list
function refreshMusicList() {
    loadMusicFiles();
}

// Play specific track
function playTrack(trackIndex) {
    if (trackIndex >= 0 && trackIndex < musicFiles.length) {
        currentTrackIndex = trackIndex;
        loadAndPlayTrack();
        updateMusicDisplay();
        updateCompactButton();
        displayMusicList(); // Refresh list to show active track
    }
}

// Load and play current track (for UI interactions) - DISABLED (Using Music Controller Instead)
function loadAndPlayTrack() {
    console.log('🔄 loadAndPlayTrack called - redirecting to music controller');
    
    // COMPLETELY DISABLED - Use music controller instead
    if (window.musicController && currentTrackIndex >= 0 && currentTrackIndex < musicFiles.length) {
        return window.musicController.playTrack(currentTrackIndex);
    }
    
    console.log('❌ Music controller not available or invalid track index');
}

// Update music display
function updateMusicDisplay() {
    const trackName = document.getElementById('currentTrackName');
    
    if (currentTrackIndex >= 0 && currentTrackIndex < filteredMusicFiles.length) {
        const track = filteredMusicFiles[currentTrackIndex];
        trackName.textContent = track.name;
    } else {
        trackName.textContent = 'No track selected';
    }
}

// Update current track status
function updateCurrentTrackStatus(status) {
    const trackStatus = document.getElementById('currentTrackStatus');
    trackStatus.textContent = status;
}

// Update compact music display - FIXED TO USE MUSIC CONTROLLER WITH NULL CHECKS
function updateCompactMusicDisplay() {
    const integratedSongName = document.getElementById('integratedSongName');
    const integratedSongStatus = document.getElementById('integratedSongStatus');
    
    // Check if elements exist
    if (!integratedSongName || !integratedSongStatus) {
        console.log('⚠️ UI elements not found, skipping update');
        return;
    }
    
    // Get current track from music controller
    if (window.musicController && window.musicController.getCurrentTrack()) {
        const track = window.musicController.getCurrentTrack();
        integratedSongName.textContent = track.name;
        integratedSongStatus.textContent = `Music: ${window.musicController.isShuffleOn ? 'ON' : 'OFF'} • Pictures: ${isPictureShuffleOn ? 'ON' : 'OFF'}`;
        console.log(`🎵 UI Updated: Now showing ${track.name}`);
    } else {
        // Fallback to old system
        if (currentTrackIndex >= 0 && currentTrackIndex < musicFiles.length) {
            const track = musicFiles[currentTrackIndex];
            integratedSongName.textContent = track.name;
            integratedSongStatus.textContent = `Music: ${isShuffleOn ? 'ON' : 'OFF'} • Pictures: ${isPictureShuffleOn ? 'ON' : 'OFF'}`;
        } else {
            integratedSongName.textContent = 'No music playing';
            integratedSongStatus.textContent = `Music: ${isShuffleOn ? 'ON' : 'OFF'} • Pictures: ${isPictureShuffleOn ? 'ON' : 'OFF'}`;
        }
    }
}

// Update compact button
function updateCompactButton() {
    const compactBtn = document.getElementById('compactMusicBtn');
    
    if (isMusicPlaying) {
        compactBtn.classList.add('playing');
    } else {
        compactBtn.classList.remove('playing');
    }
    
    // Update integrated display
    updateCompactMusicDisplay();
}

// Toggle playback - DISABLED (Using Music Controller Instead)
function togglePlayback() {
    console.log('🔄 togglePlayback called - music controller handles this');
    
    // COMPLETELY DISABLED - Music controller handles playback
    if (window.musicController) {
        // Music controller doesn't need manual play/pause since it auto-plays
        console.log('✅ Music controller handles playback automatically');
    }
}

// Next/Previous track functions are now handled by musicController.js
// These are kept for compatibility but redirect to the music controller

function nextTrack() {
    console.log('🔄 Redirecting to music controller nextTrack');
    if (window.musicController) {
        window.musicController.nextTrack();
    } else {
        console.log('❌ Music controller not available');
    }
}

function previousTrack() {
    console.log('🔄 Redirecting to music controller previousTrack');
    if (window.musicController) {
        window.musicController.previousTrack();
    } else {
        console.log('❌ Music controller not available');
    }
}

// Create gentle hearts when track changes - UNLIMITED VERSION
function createTrackChangeHearts() {
    const appHeartsContainer = document.getElementById('appFloatingHearts');
    if (!appHeartsContainer) return;
    
    // Create more hearts for track changes
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'app-floating-heart';
            heart.textContent = '🩵';
            heart.style.left = (25 + Math.random() * 50) + '%';
            heart.style.animationDelay = '0s';
            heart.style.color = 'rgba(108, 198, 224, 0.5)';
            heart.style.fontSize = '0.9rem';
            
            // Random pulse effect
            if (Math.random() > 0.5) {
                heart.classList.add('pulse');
            }
            
            appHeartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 12000);
        }, i * 250);
    }
}

// Create hearts on user interactions - UNLIMITED LOVE
function createInteractionHearts(x, y) {
    const appHeartsContainer = document.getElementById('appFloatingHearts');
    if (!appHeartsContainer) return;
    
    // Create hearts at interaction point
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'app-floating-heart pulse';
            heart.textContent = '🩵';
            
            // Position near interaction point
            const rect = appHeartsContainer.getBoundingClientRect();
            const relativeX = ((x - rect.left) / rect.width) * 100;
            heart.style.left = Math.max(5, Math.min(95, relativeX + (Math.random() - 0.5) * 20)) + '%';
            
            heart.style.animationDelay = '0s';
            heart.style.color = 'rgba(108, 198, 224, 0.8)';
            heart.style.fontSize = '1.1rem';
            
            appHeartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 12000);
        }, i * 150);
    }
}

// Toggle shuffle
function toggleShuffle() {
    isShuffleOn = !isShuffleOn;
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.style.background = isShuffleOn ? 
        'linear-gradient(45deg, #6CC6E0, #5AB3D1)' : 
        'rgba(108, 198, 224, 0.2)';
    
    if (isShuffleOn) {
        shufflePlaylist();
        console.log('Shuffle enabled - playlist shuffled');
    } else {
        // Reset to original order
        musicFiles.sort((a, b) => a.name.localeCompare(b.name));
        filteredMusicFiles = [...musicFiles];
        console.log('Shuffle disabled - playlist in original order');
    }
}

// Initialize shuffle button state
function initializeShuffleButton() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.style.background = isShuffleOn ? 
            'linear-gradient(45deg, #6CC6E0, #5AB3D1)' : 
            'rgba(108, 198, 224, 0.2)';
    }
}

// Toggle repeat
function toggleRepeat() {
    isRepeatOn = !isRepeatOn;
    const repeatBtn = document.getElementById('repeatBtn');
    repeatBtn.style.background = isRepeatOn ? 
        'linear-gradient(45deg, #6CC6E0, #5AB3D1)' : 
        'rgba(108, 198, 224, 0.2)';
}

// Toggle mute - DISABLED (Using Music Controller Instead)
function toggleMute() {
    console.log('🔄 toggleMute called - music controller handles this');
    
    // COMPLETELY DISABLED - Music controller handles volume
    if (window.musicController) {
        // Music controller can handle volume if needed
        console.log('✅ Music controller handles volume control');
    }
}

// Set volume - DISABLED (Using Music Controller Instead)
function setVolume(value) {
    console.log('🔄 setVolume called - music controller handles this');
    
    // COMPLETELY DISABLED - Music controller handles volume
    if (window.musicController) {
        window.musicController.setVolume(value / 100);
        console.log(`✅ Volume set to ${value}% via music controller`);
    }
}

// Drag and resize functionality variables
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let resizeData = { direction: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 };

// Initialize drag and resize functionality
function initializeDragFunctionality() {
    const appContainer = document.querySelector('.app-container');
    
    // Drag events
    appContainer.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragResize);
    
    // Touch events for mobile
    appContainer.addEventListener('touchstart', startDragTouch);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', stopDragResize);
    
    // Resize handle events
    const resizeHandles = appContainer.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
        handle.addEventListener('touchstart', startResizeTouch);
    });
}

function startDrag(e) {
    // Don't drag if clicking on interactive elements or resize handles
    if (e.target.closest('.image-display, .music-player-integrated, .download-btn, .integrated-control-btn, .resize-handle')) {
        return;
    }
    
    isDragging = true;
    const appContainer = document.querySelector('.app-container');
    const rect = appContainer.getBoundingClientRect();
    
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    appContainer.classList.add('dragging');
    
    // Convert to fixed positioning if not already
    if (appContainer.style.position !== 'fixed') {
        appContainer.style.position = 'fixed';
        appContainer.style.left = rect.left + 'px';
        appContainer.style.top = rect.top + 'px';
        appContainer.style.margin = '0';
        appContainer.style.transform = 'none';
    }
    
    e.preventDefault();
}

function startResize(e) {
    isResizing = true;
    const appContainer = document.querySelector('.app-container');
    const rect = appContainer.getBoundingClientRect();
    
    resizeData = {
        direction: e.target.dataset.direction,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        startLeft: rect.left,
        startTop: rect.top
    };
    
    appContainer.classList.add('resizing');
    
    // Convert to fixed positioning if not already
    if (appContainer.style.position !== 'fixed') {
        appContainer.style.position = 'fixed';
        appContainer.style.left = rect.left + 'px';
        appContainer.style.top = rect.top + 'px';
        appContainer.style.margin = '0';
        appContainer.style.transform = 'none';
    }
    
    e.preventDefault();
    e.stopPropagation();
}

function startDragTouch(e) {
    if (e.target.closest('.resize-handle')) return;
    
    const touch = e.touches[0];
    startDrag({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
    });
}

function startResizeTouch(e) {
    const touch = e.touches[0];
    startResize({
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation()
    });
}

function handleMouseMove(e) {
    if (isDragging) {
        drag(e);
    } else if (isResizing) {
        resize(e);
    }
}

function handleTouchMove(e) {
    if (!isDragging && !isResizing) return;
    
    const touch = e.touches[0];
    const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => e.preventDefault()
    };
    
    if (isDragging) {
        drag(fakeEvent);
    } else if (isResizing) {
        resize(fakeEvent);
    }
}

function drag(e) {
    if (!isDragging) return;
    
    const appContainer = document.querySelector('.app-container');
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep container within viewport bounds
    const maxX = window.innerWidth - appContainer.offsetWidth;
    const maxY = window.innerHeight - appContainer.offsetHeight;
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    appContainer.style.left = boundedX + 'px';
    appContainer.style.top = boundedY + 'px';
    
    e.preventDefault();
}

function resize(e) {
    if (!isResizing) return;
    
    const appContainer = document.querySelector('.app-container');
    const deltaX = e.clientX - resizeData.startX;
    const deltaY = e.clientY - resizeData.startY;
    
    let newWidth = resizeData.startWidth;
    let newHeight = resizeData.startHeight;
    let newLeft = resizeData.startLeft;
    let newTop = resizeData.startTop;
    
    // Minimum and maximum sizes
    const minWidth = 300;
    const minHeight = 200;
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 40;
    
    // Handle different resize directions
    switch (resizeData.direction) {
        case 'e': // East (right)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth + deltaX));
            break;
            
        case 'w': // West (left)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth - deltaX));
            newLeft = resizeData.startLeft + (resizeData.startWidth - newWidth);
            break;
            
        case 's': // South (bottom)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight + deltaY));
            break;
            
        case 'n': // North (top)
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight - deltaY));
            newTop = resizeData.startTop + (resizeData.startHeight - newHeight);
            break;
            
        case 'se': // Southeast
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight + deltaY));
            break;
            
        case 'sw': // Southwest
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight + deltaY));
            newLeft = resizeData.startLeft + (resizeData.startWidth - newWidth);
            break;
            
        case 'ne': // Northeast
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight - deltaY));
            newTop = resizeData.startTop + (resizeData.startHeight - newHeight);
            break;
            
        case 'nw': // Northwest
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeData.startWidth - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeData.startHeight - deltaY));
            newLeft = resizeData.startLeft + (resizeData.startWidth - newWidth);
            newTop = resizeData.startTop + (resizeData.startHeight - newHeight);
            break;
    }
    
    // Keep within viewport bounds
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - newWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - newHeight));
    
    // Apply the new dimensions and position
    appContainer.style.width = newWidth + 'px';
    appContainer.style.height = newHeight + 'px';
    appContainer.style.left = newLeft + 'px';
    appContainer.style.top = newTop + 'px';
    appContainer.style.maxWidth = 'none';
    appContainer.style.maxHeight = 'none';
    
    // Adjust image display height based on container height
    const imageDisplay = appContainer.querySelector('.image-display');
    if (imageDisplay) {
        const headerHeight = appContainer.querySelector('.app-header').offsetHeight;
        const musicPlayerHeight = appContainer.querySelector('.music-player-integrated').offsetHeight;
        const padding = 60; // Account for padding and gaps
        
        const availableHeight = newHeight - headerHeight - musicPlayerHeight - padding;
        imageDisplay.style.height = Math.max(150, availableHeight) + 'px';
    }
    
    e.preventDefault();
}

function stopDragResize() {
    if (!isDragging && !isResizing) return;
    
    const appContainer = document.querySelector('.app-container');
    
    if (isDragging) {
        isDragging = false;
        appContainer.classList.remove('dragging');
    }
    
    if (isResizing) {
        isResizing = false;
        appContainer.classList.remove('resizing');
    }
}

// Add preset resize buttons
function addResizePresets() {
    const appContainer = document.querySelector('.app-container');
    
    // Create preset buttons container
    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'resize-presets';
    presetsContainer.innerHTML = `
        <button class="preset-btn" onclick="resizeToPreset('portrait')" title="Portrait Mode">📱</button>
        <button class="preset-btn" onclick="resizeToPreset('landscape')" title="Landscape Mode">💻</button>
        <button class="preset-btn" onclick="resizeToPreset('square')" title="Square Mode">⬜</button>
        <button class="preset-btn" onclick="resizeToPreset('reset')" title="Reset Size">🔄</button>
    `;
    
    appContainer.appendChild(presetsContainer);
}

function resizeToPreset(mode) {
    const appContainer = document.querySelector('.app-container');
    const rect = appContainer.getBoundingClientRect();
    
    let newWidth, newHeight;
    
    switch (mode) {
        case 'portrait':
            newWidth = 350;
            newHeight = 600;
            break;
        case 'landscape':
            newWidth = 600;
            newHeight = 400;
            break;
        case 'square':
            newWidth = 450;
            newHeight = 450;
            break;
        case 'reset':
            newWidth = 420;
            newHeight = 500;
            break;
    }
    
    // Center the container after resize
    const newLeft = (window.innerWidth - newWidth) / 2;
    const newTop = (window.innerHeight - newHeight) / 2;
    
    // Apply smooth transition
    appContainer.style.transition = 'all 0.3s ease';
    appContainer.style.position = 'fixed';
    appContainer.style.width = newWidth + 'px';
    appContainer.style.height = newHeight + 'px';
    appContainer.style.left = newLeft + 'px';
    appContainer.style.top = newTop + 'px';
    appContainer.style.maxWidth = 'none';
    appContainer.style.maxHeight = 'none';
    appContainer.style.margin = '0';
    appContainer.style.transform = 'none';
    
    // Adjust image display
    const imageDisplay = appContainer.querySelector('.image-display');
    if (imageDisplay) {
        const headerHeight = appContainer.querySelector('.app-header').offsetHeight;
        const musicPlayerHeight = appContainer.querySelector('.music-player-integrated').offsetHeight;
        const padding = 60;
        
        const availableHeight = newHeight - headerHeight - musicPlayerHeight - padding;
        imageDisplay.style.height = Math.max(150, availableHeight) + 'px';
    }
    
    // Remove transition after animation
    setTimeout(() => {
        appContainer.style.transition = '';
    }, 300);
    
    showNotification(`📐 Resized to ${mode} mode!`);
}

// File import and download functions
function importPictures() {
    document.getElementById('imageInput').click();
}

function handleImageImport(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        handleImageFilesSimple(files);
    }
    // Reset input
    event.target.value = '';
}

// Simple image import that immediately adds to slideshow
function handleImageFilesSimple(imageFiles) {
    console.log(`Importing ${imageFiles.length} images...`);
    showNotification(`📸 Adding ${imageFiles.length} images to slideshow...`);
    
    let processedCount = 0;
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create a temporary image element to verify it loads
            const img = new Image();
            img.onload = function() {
                // Add to available images (using negative indices for imported images)
                const importedIndex = -(Date.now() + index); // Use timestamp to avoid conflicts
                availableImages.push(importedIndex);
                
                // Store the image data
                if (!window.importedImages) {
                    window.importedImages = {};
                }
                window.importedImages[importedIndex] = e.target.result;
                
                processedCount++;
                totalImages = availableImages.length;
                
                // Update UI
                const imageCountElement = document.getElementById('imageCount');
                if (imageCountElement) {
                    imageCountElement.textContent = `${totalImages} images`;
                }
                
                console.log(`Added imported image ${processedCount}/${imageFiles.length}`);
                
                // If this is the last image, show success message
                if (processedCount === imageFiles.length) {
                    showNotification(`✅ Successfully added ${imageFiles.length} images to slideshow!`);
                    
                    // If slideshow is not playing, switch to first imported image
                    if (!isPlaying) {
                        switchToImage(importedIndex);
                    }
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}



function handleImageFiles(imageFiles) {
    console.log(`Importing ${imageFiles.length} images...`);
    
    // Show instructions for manual saving
    showNotification(`📸 To permanently add images: Save imported files to your 'pics' folder manually!`);
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create a temporary image element to add to slideshow
            const img = new Image();
            img.onload = function() {
                // Add to available images (using negative indices for imported images)
                const importedIndex = -(availableImages.length + index + 1);
                availableImages.push(importedIndex);
                
                // Store the image data
                if (!window.importedImages) {
                    window.importedImages = {};
                }
                window.importedImages[importedIndex] = e.target.result;
                
                totalImages = availableImages.length;
                
                // Update UI
                const imageCountElement = document.getElementById('imageCount');
                if (imageCountElement) {
                    imageCountElement.textContent = `${totalImages} images`;
                }
                
                console.log(`Added imported image ${index + 1}/${imageFiles.length}`);
                
                // Auto-download imported image to pics folder
                autoDownloadToPicsFolder(file, index + 1);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    showNotification(`📸 Imported ${imageFiles.length} images! Check downloads for pics folder files.`);
}

// Modern File System Access API (Chrome/Edge only)
async function saveImageToPicsFolder(file, filename) {
    if ('showDirectoryPicker' in window) {
        try {
            // Ask user to select the pics folder
            const dirHandle = await window.showDirectoryPicker();
            
            // Create file in the selected directory
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            
            // Write the file
            await writable.write(file);
            await writable.close();
            
            showNotification(`✅ Saved ${filename} to pics folder!`);
            return true;
        } catch (error) {
            console.log('User cancelled or error:', error);
            return false;
        }
    }
    return false;
}

// Enhanced import with folder saving option
async function handleImageFilesWithFolderSave(imageFiles) {
    console.log(`Importing ${imageFiles.length} images...`);
    
    // Try modern File System Access API first
    if ('showDirectoryPicker' in window) {
        const userWantsFolderSave = confirm(`Save images directly to pics folder?\n\nClick OK to select your pics folder, or Cancel to import normally.`);
        
        if (userWantsFolderSave) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    const nextNumber = Math.max(...availableImages.filter(n => n > 0), 0) + i + 1;
                    const filename = `${nextNumber}.jpg`;
                    
                    try {
                        const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(file);
                        await writable.close();
                        
                        // Add to available images
                        availableImages.push(nextNumber);
                        
                    } catch (error) {
                        console.error(`Error saving ${filename}:`, error);
                    }
                }
                
                // Update UI
                totalImages = availableImages.length;
                const imageCountElement = document.getElementById('imageCount');
                if (imageCountElement) {
                    imageCountElement.textContent = `${totalImages} images`;
                }
                
                showNotification(`✅ Saved ${imageFiles.length} images to pics folder! Refresh page to see them.`);
                return;
                
            } catch (error) {
                console.log('Folder save cancelled or failed, using normal import');
            }
        }
    }
    
    // Fallback to normal import
    handleImageFiles(imageFiles);
}

function handleMusicFiles(musicFiles) {
    console.log(`Importing ${musicFiles.length} music files...`);
    
    musicFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Add to music files
            const displayName = file.name.replace(/\.[^/.]+$/, "");
            musicFiles.push({
                name: displayName,
                file: e.target.result,
                duration: '0:00',
                isImported: true
            });
            
            filteredMusicFiles = [...musicFiles];
            
            console.log(`Added imported music ${index + 1}/${musicFiles.length}: ${displayName}`);
        };
        reader.readAsDataURL(file);
    });
    
    showNotification(`🎵 Imported ${musicFiles.length} music files!`);
}

async function downloadAll() {
    showNotification('📥 Preparing download...');
    
    // Create a zip-like download experience
    for (let i = 0; i < availableImages.length; i++) {
        const imageNumber = availableImages[i];
        
        try {
            let imageSrc;
            if (imageNumber < 0 && window.importedImages && window.importedImages[imageNumber]) {
                // Imported image
                imageSrc = window.importedImages[imageNumber];
            } else {
                // Regular image
                imageSrc = `pics/${imageNumber}.jpg`;
            }
            
            // Create download link
            const link = document.createElement('a');
            link.href = imageSrc;
            link.download = `ninya-gallery-${Math.abs(imageNumber)}.jpg`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`Error downloading image ${imageNumber}:`, error);
        }
    }
    
    showNotification(`✅ Downloaded ${availableImages.length} images!`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 50%;
        transform: translateX(50%);
        background: linear-gradient(45deg, #6CC6E0, #5AB3D1);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(108, 198, 224, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(50%) translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(50%) translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50%) translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Update switchToImage function to handle imported images
function switchToImage(imageNumber) {
    const imageElement = document.getElementById('currentImage');
    
    // Add fade out effect
    imageElement.classList.add('fade-out');
    
    setTimeout(() => {
        let imageSrc;
        
        if (imageNumber < 0 && window.importedImages && window.importedImages[imageNumber]) {
            // Imported image
            imageSrc = window.importedImages[imageNumber];
        } else {
            // Regular image
            imageSrc = `pics/${imageNumber}.jpg`;
        }
        
        // Update image source
        imageElement.src = imageSrc;
        imageElement.alt = `Gallery image ${Math.abs(imageNumber)}`;
        currentImageIndex = imageNumber;
        
        // Remove fade out and add fade in
        imageElement.classList.remove('fade-out');
        imageElement.classList.add('fade-in');
        
        setTimeout(() => {
            imageElement.classList.remove('fade-in');
        }, 500);
    }, 250);
}
// Keyboard controls - SINGLE HANDLER ONLY
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case ' ': // Spacebar to toggle slideshow
        case 'Enter':
            event.preventDefault();
            toggleSlideshow();
            break;
        case 'Escape':
            if (document.getElementById('musicPlayerOverlay').classList.contains('show')) {
                closeMusicPlayer();
            } else if (!isPlaying) {
                toggleSlideshow(); // Resume if paused
            }
            break;
        case 'm':
        case 'M':
            // Music controller handles playback automatically
            console.log('🎵 Music key pressed - music controller handles this');
            break;
        case 'n':
        case 'N':
            // Use music controller for next track
            if (window.musicController) {
                window.musicController.nextTrack();
            }
            break;
        case 'p':
        case 'P':
            // Use music controller for previous track
            if (window.musicController) {
                window.musicController.previousTrack();
            }
            break;
        case 'b':
        case 'B':
            nextBackground(); // Press B to change background
            break;
        case 'r':
        case 'R':
            randomBackground(); // Press R for random background
            break;
        case 'i':
        case 'I':
            importFiles(); // Press I to import files
            break;
        case 'd':
        case 'D':
            downloadAll(); // Press D to download all
            break;
        case '1':
            resizeToPreset('portrait'); // Press 1 for portrait
            break;
        case '2':
            resizeToPreset('landscape'); // Press 2 for landscape
            break;
        case '3':
            resizeToPreset('square'); // Press 3 for square
            break;
        case '0':
            resizeToPreset('reset'); // Press 0 to reset
            break;
    }
});

// Ensure music keeps playing - DISABLED (Using Music Controller Instead)
function ensureMusicContinuity() {
    console.log('🔄 ensureMusicContinuity called - music controller handles this automatically');
    
    // COMPLETELY DISABLED - Music controller handles continuity automatically
    if (window.musicController) {
        console.log('✅ Music controller will handle continuity');
    }
}

// Create background hearts on the main GIF
function createBackgroundHearts() {
    const backgroundHeartsContainer = document.getElementById('backgroundHearts');
    if (!backgroundHeartsContainer) return;
    
    function createBgHeart() {
        const heart = document.createElement('div');
        heart.className = 'background-heart';
        heart.textContent = '🩵';
        
        // Random heart types and colors
        const types = ['pink', 'blue', 'white'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        heart.classList.add(randomType);
        
        // Random size
        const sizes = ['0.8rem', '1rem', '1.2rem', '1.4rem'];
        heart.style.fontSize = sizes[Math.floor(Math.random() * sizes.length)];
        
        // Random horizontal position across entire screen
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 5 + 's';
        
        // Random pulse effect
        if (Math.random() > 0.6) {
            heart.classList.add('pulse');
        }
        
        backgroundHeartsContainer.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 15000);
    }
    
    // Create background hearts continuously
    const bgHeartInterval = setInterval(() => {
        createBgHeart();
        
        // Sometimes create multiple hearts for romantic bursts
        if (Math.random() > 0.8) {
            setTimeout(() => createBgHeart(), 300);
        }
    }, 2000); // Create a background heart every 2 seconds
    
    // Store interval for cleanup if needed
    window.backgroundHeartInterval = bgHeartInterval;
}

// Create background hearts that appear in front of GIF
function createBackgroundHearts() {
    const backgroundHeartsContainer = document.getElementById('backgroundHearts');
    const globalHeartsContainer = document.getElementById('globalFloatingHearts');
    
    if (!backgroundHeartsContainer || !globalHeartsContainer) return;
    
    // Create background hearts (behind app container)
    function createBgHeart() {
        const heart = document.createElement('div');
        heart.className = 'background-floating-heart';
        heart.textContent = '🩵';
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        heart.classList.add(randomSize);
        
        // Random horizontal position across full screen
        heart.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 15 + 's';
        
        backgroundHeartsContainer.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 15000);
    }
    
    // Create global hearts (in front of everything)
    function createGlobalHeart() {
        const heart = document.createElement('div');
        heart.className = 'global-floating-heart';
        heart.textContent = '🩵';
        
        // Random sparkle effect
        if (Math.random() > 0.6) {
            heart.classList.add('sparkle');
        }
        
        // Random horizontal position across full screen
        heart.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 18 + 's';
        
        globalHeartsContainer.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 18000);
    }
    
    // Start background hearts
    setInterval(() => {
        createBgHeart();
        
        // Sometimes create multiple hearts
        if (Math.random() > 0.8) {
            setTimeout(() => createBgHeart(), 500);
        }
    }, 2000); // Background heart every 2 seconds
    
    // Start global hearts
    setInterval(() => {
        createGlobalHeart();
        
        // Sometimes create sparkle bursts
        if (Math.random() > 0.7) {
            setTimeout(() => createGlobalHeart(), 300);
            setTimeout(() => createGlobalHeart(), 600);
        }
    }, 3000); // Global heart every 3 seconds
}

// Hearts from Letters System - Gentle spreading from Ninyakeeey title!
function createHeartsFromLetters() {
    const letters = document.querySelectorAll('.letter');
    
    if (!letters.length) return;
    
    // Create heart that gently spreads from specific letter
    function createGentleSpreadingHeart(letterElement) {
        const heart = document.createElement('div');
        heart.className = 'letter-heart';
        heart.textContent = '🩵';
        
        // Get letter's position on screen
        const rect = letterElement.getBoundingClientRect();
        
        // Start position (at the letter)
        heart.style.left = (rect.left + rect.width/2) + 'px';
        heart.style.top = (rect.top + rect.height/2) + 'px';
        
        // Gentle spreading - not too far, romantic movement
        const gentleSpreadX = (Math.random() - 0.5) * 150; // Gentle horizontal spread
        const gentleSpreadY = -80 - (Math.random() * 60); // Gentle upward movement
        const finalX = gentleSpreadX + (Math.random() - 0.5) * 80; // Continue gently
        const finalY = gentleSpreadY - (Math.random() * 100); // Float a bit higher
        
        // Set CSS custom properties for gentle animation
        heart.style.setProperty('--gentle-x', gentleSpreadX + 'px');
        heart.style.setProperty('--gentle-y', gentleSpreadY + 'px');
        heart.style.setProperty('--final-x', finalX + 'px');
        heart.style.setProperty('--final-y', finalY + 'px');
        
        // Soft color variations
        const colors = [
            'rgba(108, 198, 224, 0.7)',
            'rgba(138, 208, 234, 0.6)',
            'rgba(88, 188, 214, 0.7)',
            'rgba(158, 218, 244, 0.5)',
            'rgba(108, 198, 224, 0.8)'
        ];
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 6000);
    }
    
    // Create gentle hearts from random letters continuously - UNLIMITED
    function createRandomGentleHeart() {
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        createGentleSpreadingHeart(randomLetter);
        
        // Add gentle glow effect to the letter
        randomLetter.classList.add('active');
        setTimeout(() => {
            randomLetter.classList.remove('active');
        }, 2000);
    }
    
    // UNLIMITED gentle heart generation from title
    const letterHeartInterval = setInterval(() => {
        createRandomGentleHeart();
        
        // Sometimes create 2 hearts for gentle romantic effect
        if (Math.random() > 0.7) {
            setTimeout(() => createRandomGentleHeart(), 400);
        }
    }, 1500); // Create gentle heart every 1.5 seconds
    
    // Additional gentle stream
    setTimeout(() => {
        const gentleExtraInterval = setInterval(() => {
            createRandomGentleHeart();
        }, 2000); // Extra gentle hearts every 2 seconds
        
        window.gentleExtraInterval = gentleExtraInterval;
    }, 800);
    
    // More gentle hearts for continuous romantic atmosphere
    setTimeout(() => {
        const moreGentleInterval = setInterval(() => {
            if (Math.random() > 0.6) {
                createRandomGentleHeart();
            }
        }, 1200); // Random gentle hearts every 1.2 seconds
        
        window.moreGentleInterval = moreGentleInterval;
    }, 1600);
    
    // Add click events to letters for instant gentle hearts
    letters.forEach((letter, index) => {
        letter.addEventListener('click', () => {
            // Create 3 gentle hearts from clicked letter
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createGentleSpreadingHeart(letter);
                }, i * 200);
            }
            
            // Add glow effect
            letter.classList.add('active');
            setTimeout(() => {
                letter.classList.remove('active');
            }, 3000);
        });
        
        // Add hover effect for gentle hearts
        letter.addEventListener('mouseenter', () => {
            if (Math.random() > 0.4) { // 60% chance
                createGentleSpreadingHeart(letter);
            }
        });
    });
    
    // Store intervals for cleanup
    window.letterHeartInterval = letterHeartInterval;
    
    console.log('UNLIMITED gentle spreading hearts from Ninyakeeey title started!');
}

// Background Hearts System - Gentle hearts floating from bottom to top
function createBackgroundHearts() {
    const backgroundHeartsContainer = document.getElementById('backgroundHearts');
    const globalHeartsContainer = document.getElementById('globalFloatingHearts');
    
    if (!backgroundHeartsContainer || !globalHeartsContainer) return;
    
    // Create gentle background hearts (behind everything)
    function createBackgroundHeart() {
        const heart = document.createElement('div');
        heart.className = 'background-heart';
        heart.textContent = '🩵';
        
        // Random pulse effect (gentle)
        if (Math.random() > 0.7) {
            heart.classList.add('pulse');
        }
        
        // Random horizontal position across full screen
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Random animation delay for natural flow
        heart.style.animationDelay = Math.random() * 5 + 's';
        
        // Slight size variation
        const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        heart.style.transform = `scale(${scale})`;
        
        backgroundHeartsContainer.appendChild(heart);
        
        // Remove heart after animation (15 seconds)
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 15000);
    }
    
    // Create global hearts (in front of background)
    function createGlobalHeart() {
        const heart = document.createElement('div');
        heart.className = 'global-heart';
        heart.textContent = '🩵';
        
        // Random pulse effect
        if (Math.random() > 0.6) {
            heart.classList.add('pulse');
        }
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 4 + 's';
        
        // Color variations for global hearts
        const colors = [
            'rgba(108, 198, 224, 0.4)',
            'rgba(108, 198, 224, 0.3)',
            'rgba(138, 208, 234, 0.4)',
            'rgba(88, 188, 214, 0.3)',
            'rgba(158, 218, 244, 0.4)'
        ];
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        globalHeartsContainer.appendChild(heart);
        
        // Remove heart after animation (12 seconds)
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 12000);
    }
    
    // Start background hearts (gentle, slower generation)
    const backgroundInterval = setInterval(() => {
        createBackgroundHeart();
        
        // Sometimes create multiple hearts for gentle waves
        if (Math.random() > 0.8) {
            setTimeout(() => createBackgroundHeart(), 500);
        }
    }, 2000); // Create a background heart every 2 seconds
    
    // Start global hearts (more frequent)
    const globalInterval = setInterval(() => {
        createGlobalHeart();
        
        // Random extra hearts for romantic atmosphere
        if (Math.random() > 0.7) {
            setTimeout(() => createGlobalHeart(), 800);
        }
    }, 1500); // Create a global heart every 1.5 seconds
    
    // Store intervals for cleanup if needed
    window.backgroundHeartsInterval = backgroundInterval;
    window.globalHeartsInterval = globalInterval;
    
    console.log('Background hearts system started - gentle romantic atmosphere');
}

// Floating Hearts System
function createFloatingHearts() {
    const heartsContainer = document.getElementById('floatingHearts');
    const appHeartsContainer = document.getElementById('appFloatingHearts');
    
    if (!heartsContainer || !appHeartsContainer) return;
    
    // Create hearts for loading screen
    function createLoadingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '🩵';
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        heart.classList.add(randomSize);
        
        // Random pulse effect
        if (Math.random() > 0.5) {
            heart.classList.add('pulse');
        }
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        heartsContainer.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 8000);
    }
    
    // Create hearts for main app - UNLIMITED VERSION
    function createAppHeart() {
        const heart = document.createElement('div');
        heart.className = 'app-floating-heart';
        heart.textContent = '🩵';
        
        // Random pulse effect (more frequent)
        if (Math.random() > 0.4) {
            heart.classList.add('pulse');
        }
        
        // Random horizontal position
        heart.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        heart.style.animationDelay = Math.random() * 3 + 's';
        
        // Random colors for variety
        const colors = [
            'rgba(108, 198, 224, 0.6)',
            'rgba(108, 198, 224, 0.4)',
            'rgba(108, 198, 224, 0.8)',
            'rgba(138, 208, 234, 0.5)',
            'rgba(88, 188, 214, 0.6)'
        ];
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        appHeartsContainer.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 12000);
    }
    
    // UNLIMITED hearts for loading screen - faster generation
    const loadingHeartInterval = setInterval(() => {
        if (document.getElementById('loadingScreen').classList.contains('fade-out')) {
            clearInterval(loadingHeartInterval);
            return;
        }
        createLoadingHeart();
        
        // Create multiple hearts sometimes for more romance
        if (Math.random() > 0.7) {
            setTimeout(() => createLoadingHeart(), 200);
        }
    }, 400); // Create a heart every 400ms (faster!)
    
    // UNLIMITED hearts for main app - continuous forever
    setTimeout(() => {
        const appHeartInterval = setInterval(() => {
            createAppHeart();
            
            // Create extra hearts randomly for bursts of romance
            if (Math.random() > 0.8) {
                setTimeout(() => createAppHeart(), 300);
                setTimeout(() => createAppHeart(), 600);
            }
        }, 800); // Create a heart every 800ms (faster than before!)
        
        // Store interval for cleanup if needed
        window.appHeartInterval = appHeartInterval;
        
        // Additional heart streams for unlimited effect
        setTimeout(() => {
            const extraHeartInterval = setInterval(() => {
                createAppHeart();
            }, 1500); // Extra hearts every 1.5 seconds
            
            window.extraHeartInterval = extraHeartInterval;
        }, 2000);
        
        // Even more hearts for ultimate romance
        setTimeout(() => {
            const moreHeartInterval = setInterval(() => {
                if (Math.random() > 0.6) {
                    createAppHeart();
                }
            }, 1000); // Random hearts every second
            
            window.moreHeartInterval = moreHeartInterval;
        }, 4000);
        
    }, 3000); // Start after 3 seconds (earlier than before)
}

// Romantic entrance animation for hearts - UNLIMITED VERSION
function createRomanticEntrance() {
    const heartsContainer = document.getElementById('floatingHearts');
    if (!heartsContainer) return;
    
    // Create a massive burst of hearts at the beginning
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart large pulse';
            heart.textContent = '🩵';
            heart.style.left = (10 + Math.random() * 80) + '%';
            heart.style.animationDelay = '0s';
            heart.style.color = 'rgba(108, 198, 224, 0.8)';
            
            heartsContainer.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 8000);
        }, i * 150); // Faster timing for more hearts
    }
    
    // Create continuous waves of hearts during entrance
    let waveCount = 0;
    const entranceWaves = setInterval(() => {
        if (waveCount >= 5) {
            clearInterval(entranceWaves);
            return;
        }
        
        // Create a wave of hearts
        for (let j = 0; j < 5; j++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart medium pulse';
                heart.textContent = '🩵';
                heart.style.left = (20 + Math.random() * 60) + '%';
                heart.style.animationDelay = '0s';
                heart.style.color = 'rgba(108, 198, 224, 0.6)';
                
                heartsContainer.appendChild(heart);
                
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 8000);
            }, j * 100);
        }
        
        waveCount++;
    }, 1000); // New wave every second
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Start background hearts immediately for romantic atmosphere
    createBackgroundHearts();
    
    // Start hearts from letters - kyut!
    setTimeout(() => {
        createHeartsFromLetters();
    }, 2000); // Start after app loads
    
    // Start romantic hearts immediately
    createRomanticEntrance();
    setTimeout(() => {
        createFloatingHearts();
    }, 1000);
    
    // Initialize draggable hearts logo
    setTimeout(() => {
        initializeDraggableLogo();
    }, 1500);
    
    // Start system initialization with loading screen
    initializeSystem();
    
    // Initialize drag and resize functionality
    initializeDragFunctionality();
    
    // Add resize preset buttons
    setTimeout(() => {
        addResizePresets();
    }, 2000); // Add after container animation
    
    // Initialize background system
    console.log(`Loaded with background: ${backgroundGifs[currentBackgroundIndex]}`);
    
    // Start background rotation if multiple backgrounds available
    // startBackgroundRotation(); // Uncomment this if you want auto-rotation
    
    // Prevent right-click context menu on images
    document.getElementById('currentImage').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Start music continuity checker after system is ready
    setTimeout(() => {
        ensureMusicContinuity();
    }, 8000); // Start checker after 8 seconds to ensure everything is loaded
    
    // Add unlimited hearts on user interactions
    document.addEventListener('click', (e) => {
        createInteractionHearts(e.clientX, e.clientY);
    });
    
    // Add hearts on button hovers
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('button, .control-btn, .integrated-control-btn, .compact-music-btn')) {
            if (Math.random() > 0.7) { // 30% chance on hover
                createInteractionHearts(e.clientX, e.clientY);
            }
        }
    });
    
    // Add hearts when slideshow toggles
    const originalToggleSlideshow = window.toggleSlideshow;
    window.toggleSlideshow = function() {
        originalToggleSlideshow();
        createTrackChangeHearts(); // Create hearts on slideshow toggle
    };
});

// YELLOW HEARTS GENERATOR WITH DRAGGABLE LOGO
let isLogoDragging = false;
let logoDragOffset = { x: 0, y: 0 };

function createYellowHearts() {
    console.log('💛 Creating gentle yellow hearts!');
    
    // Get the minions logo position
    const logo = document.getElementById('yellowHeartsLogo');
    const logoRect = logo.getBoundingClientRect();
    const startX = logoRect.left + logoRect.width / 2;
    const startY = logoRect.top + logoRect.height / 2;
    
    // Create multiple gentle yellow hearts
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'yellow-heart';
            heart.textContent = '💛';
            
            // Set starting position at the logo
            heart.style.left = startX + 'px';
            heart.style.top = startY + 'px';
            
            // Gentler random horizontal movement
            const randomX = (Math.random() - 0.5) * 200; // -100px to +100px (reduced)
            heart.style.setProperty('--random-x', randomX + 'px');
            
            document.body.appendChild(heart);
            
            // Remove heart after animation completes
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 12000); // Longer duration for gentler effect
        }, i * 150); // Slower stagger
    }
    
    // Show notification
    //showNotification('💛 Gentle yellow hearts spreading love!');
    
    // Create interaction hearts at logo position
    createInteractionHearts(startX, startY);
}

// Initialize draggable functionality for the hearts logo
function initializeDraggableLogo() {
    const logoContainer = document.getElementById('heartsLogoContainer');
    const logo = document.getElementById('yellowHeartsLogo');
    
    if (!logoContainer || !logo) return;
    
    let lastHeartTime = 0;
    const heartInterval = 300; // Create heart every 300ms while dragging
    
    // Mouse events
    logo.addEventListener('mousedown', startLogoDrag);
    document.addEventListener('mousemove', dragLogo);
    document.addEventListener('mouseup', endLogoDrag);
    
    // Touch events for mobile
    logo.addEventListener('touchstart', startLogoDragTouch, { passive: false });
    document.addEventListener('touchmove', dragLogoTouch, { passive: false });
    document.addEventListener('touchend', endLogoDrag);
    
    function startLogoDrag(e) {
        e.preventDefault();
        isLogoDragging = true;
        lastHeartTime = Date.now();
        
        const rect = logoContainer.getBoundingClientRect();
        logoDragOffset.x = e.clientX - rect.left;
        logoDragOffset.y = e.clientY - rect.top;
        
        logoContainer.classList.add('dragging');
        logo.style.cursor = 'grabbing';
        
        // Create first heart when starting to drag
        createSingleYellowHeart();
    }
    
    function startLogoDragTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        isLogoDragging = true;
        lastHeartTime = Date.now();
        
        const rect = logoContainer.getBoundingClientRect();
        logoDragOffset.x = touch.clientX - rect.left;
        logoDragOffset.y = touch.clientY - rect.top;
        
        logoContainer.classList.add('dragging');
        
        // Create first heart when starting to drag
        createSingleYellowHeart();
    }
    
    function dragLogo(e) {
        if (!isLogoDragging) return;
        e.preventDefault();
        
        const x = e.clientX - logoDragOffset.x;
        const y = e.clientY - logoDragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - logoContainer.offsetWidth;
        const maxY = window.innerHeight - logoContainer.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        logoContainer.style.left = boundedX + 'px';
        logoContainer.style.top = boundedY + 'px';
        
        // Create gentle hearts while dragging
        const currentTime = Date.now();
        if (currentTime - lastHeartTime > heartInterval) {
            createSingleYellowHeart();
            lastHeartTime = currentTime;
        }
    }
    
    function dragLogoTouch(e) {
        if (!isLogoDragging) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const x = touch.clientX - logoDragOffset.x;
        const y = touch.clientY - logoDragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - logoContainer.offsetWidth;
        const maxY = window.innerHeight - logoContainer.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        logoContainer.style.left = boundedX + 'px';
        logoContainer.style.top = boundedY + 'px';
        
        // Create gentle hearts while dragging on mobile
        const currentTime = Date.now();
        if (currentTime - lastHeartTime > heartInterval) {
            createSingleYellowHeart();
            lastHeartTime = currentTime;
        }
    }
    
    function endLogoDrag() {
        if (!isLogoDragging) return;
        
        isLogoDragging = false;
        logoContainer.classList.remove('dragging');
        logo.style.cursor = 'grab';
        
        // Create final heart when stopping drag
        createSingleYellowHeart();
        
        // Save position to localStorage
        const rect = logoContainer.getBoundingClientRect();
        localStorage.setItem('heartsLogoPosition', JSON.stringify({
            x: rect.left,
            y: rect.top
        }));
    }
    
    // Load saved position
    const savedPosition = localStorage.getItem('heartsLogoPosition');
    if (savedPosition) {
        try {
            const pos = JSON.parse(savedPosition);
            logoContainer.style.left = pos.x + 'px';
            logoContainer.style.top = pos.y + 'px';
        } catch (e) {
            console.log('Could not load saved logo position');
        }
    }
    
    // Set initial cursor
    logo.style.cursor = 'grab';
}

// Create a single gentle yellow heart at logo position
function createSingleYellowHeart() {
    const logo = document.getElementById('yellowHeartsLogo');
    if (!logo) return;
    
    const logoRect = logo.getBoundingClientRect();
    const startX = logoRect.left + logoRect.width / 2;
    const startY = logoRect.top + logoRect.height / 2;
    
    const heart = document.createElement('div');
    heart.className = 'yellow-heart';
    heart.textContent = '💛';
    
    // Set starting position at the logo
    heart.style.left = startX + 'px';
    heart.style.top = startY + 'px';
    
    // Gentler random horizontal movement
    const randomX = (Math.random() - 0.5) * 120; // -60px to +60px (even gentler)
    heart.style.setProperty('--random-x', randomX + 'px');
    
    document.body.appendChild(heart);
    
    // Remove heart after animation completes
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 12000);
}