// musicPlayer.js - Handles the music player functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - initializing music player');
  initMusicPlayer();
});

function initMusicPlayer() {
  const player = document.getElementById('player');
  const audioPlayer = document.getElementById('audio-player');
  const nowPlaying = document.getElementById('now-playing');
  
  if (!player || !audioPlayer) return;
  
  // Add styling to make the player more visible
  player.style.background = '#121212';
  player.style.padding = '15px';
  player.style.borderRadius = '5px';
  player.style.marginTop = '20px';
  player.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
  player.style.position = 'fixed';
  player.style.bottom = '0';
  player.style.left = '0';
  player.style.right = '0';
  player.style.zIndex = '1000';
  player.style.display = 'flex';
  player.style.flexDirection = 'column';
  player.style.alignItems = 'center';
  
  if (nowPlaying) {
    nowPlaying.style.color = '#fff';
    nowPlaying.style.marginBottom = '10px';
    nowPlaying.style.fontWeight = 'bold';
  }
  
  // Style the audio player
  audioPlayer.style.width = '100%';
  audioPlayer.style.maxWidth = '600px';
  
  // Set up event listeners for inline audio players
  setupInlineAudioPlayers();
}

function setupInlineAudioPlayers() {
  const inlineAudio = document.querySelectorAll('.music-item audio');
  const mainPlayer = document.getElementById('audio-player');
  const nowPlaying = document.getElementById('now-playing');
  
  inlineAudio.forEach(audio => {
    // When an inline player starts playing
    audio.addEventListener('play', function() {
      // Get song info
      const songEl = audio.closest('.music-item');
      const songInfo = songEl.querySelector('p');
      const title = songInfo.querySelector('strong').textContent;
      const artistText = songInfo.textContent;
      const artist = artistText.split('by ')[1].trim();
      
      // Update the main player
      if (mainPlayer) {
        // Stop the main player before setting new source
        mainPlayer.pause();
        
        // Set the source and play
        mainPlayer.src = audio.querySelector('source').src;
        mainPlayer.play();
        
        // Update now playing text
        if (nowPlaying) {
          nowPlaying.textContent = `Now Playing: ${title} by ${artist}`;
        }
        
        // Pause the inline player
        audio.pause();
      }
    });
  });
  
  // Main player events
  if (mainPlayer) {
    mainPlayer.addEventListener('ended', function() {
      if (nowPlaying) {
        nowPlaying.textContent = 'Nothing playing';
      }
    });
    
    mainPlayer.addEventListener('error', function(e) {
      console.error('Audio player error:', e);
      if (nowPlaying) {
        nowPlaying.textContent = 'Error playing audio';
      }
    });
  }
}

// Global function for playing a song from anywhere
window.playSongGlobal = function(audioUrl, title, artist) {
  const mainPlayer = document.getElementById('audio-player');
  const nowPlaying = document.getElementById('now-playing');
  
  if (mainPlayer) {
    // Stop any currently playing audio
    mainPlayer.pause();
    
    // Set new source and play
    mainPlayer.src = audioUrl;
    
    // Try playing with error handling
    mainPlayer.play().catch(error => {
      console.error('Error playing audio:', error);
      if (nowPlaying) {
        nowPlaying.textContent = 'Error playing audio';
      }
    });
    
    // Update now playing text
    if (nowPlaying) {
      nowPlaying.textContent = `Now Playing: ${title} by ${artist}`;
    }
  }
};

// Create custom player controls if needed
function createCustomControls() {
  const player = document.getElementById('player');
  const audioPlayer = document.getElementById('audio-player');
  
  if (!player || !audioPlayer) return;
  
  // Create control buttons
  const controls = document.createElement('div');
  controls.className = 'custom-controls';
  controls.style.display = 'flex';
  controls.style.alignItems = 'center';
  controls.style.justifyContent = 'center';
  controls.style.marginTop = '10px';
  
  // Play/Pause button
  const playPauseBtn = document.createElement('button');
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  playPauseBtn.className = 'control-btn play-pause';
  playPauseBtn.addEventListener('click', function() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audioPlayer.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });
  
  // Volume controls
  const volumeDown = document.createElement('button');
  volumeDown.innerHTML = '<i class="fas fa-volume-down"></i>';
  volumeDown.className = 'control-btn volume-down';
  volumeDown.addEventListener('click', function() {
    if (audioPlayer.volume >= 0.1) {
      audioPlayer.volume -= 0.1;
    }
  });
  
  const volumeUp = document.createElement('button');
  volumeUp.innerHTML = '<i class="fas fa-volume-up"></i>';
  volumeUp.className = 'control-btn volume-up';
  volumeUp.addEventListener('click', function() {
    if (audioPlayer.volume <= 0.9) {
      audioPlayer.volume += 0.1;
    }
  });
  
  // Add controls to the player
  controls.appendChild(volumeDown);
  controls.appendChild(playPauseBtn);
  controls.appendChild(volumeUp);
  
  // Style the controls
  const buttons = [playPauseBtn, volumeDown, volumeUp];
  buttons.forEach(btn => {
    btn.style.background = '#333';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.style.margin = '0 10px';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background-color 0.2s';
    
    btn.addEventListener('mouseover', function() {
      btn.style.backgroundColor = '#9900ff';
    });
    
    btn.addEventListener('mouseout', function() {
      btn.style.backgroundColor = '#333';
    });
  });
  
  player.appendChild(controls);
  
  // Update play/pause button based on audio state
  audioPlayer.addEventListener('play', function() {
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  });
  
  audioPlayer.addEventListener('pause', function() {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  });
  
  audioPlayer.addEventListener('ended', function() {
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  });
}

// // musicPlayer.js - Handles the audio player functionality
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM loaded - initializing music player');
//     initMusicPlayer();
//   });
  
//   function initMusicPlayer() {
//     // Get player elements
//     const audioPlayer = document.getElementById('audio-player');
//     const nowPlaying = document.getElementById('now-playing');
    
//     if (!audioPlayer || !nowPlaying) {
//       console.warn('Player elements not found, skipping player initialization');
//       return;
//     }
    
//     // Set up audio player event listeners
//     audioPlayer.addEventListener('play', updatePlayerState);
//     audioPlayer.addEventListener('pause', updatePlayerState);
//     audioPlayer.addEventListener('ended', songEnded);
    
//     // Check for play buttons in the page
//     setupPlayButtons();
    
//     console.log('Music player initialized');
//   }
  
//   // Set up play buttons throughout the page
//   function setupPlayButtons() {
//     // This will find all elements with the play-btn class and attach event listeners
//     const playButtons = document.querySelectorAll('.play-btn');
    
//     playButtons.forEach(button => {
//       button.addEventListener('click', function() {
//         const songId = this.closest('[data-id]').dataset.id;
//         const audioUrl = this.dataset.url;
//         const title = this.dataset.title;
//         const artist = this.dataset.artist;
        
//         playSong(songId, audioUrl, title, artist);
//       });
//     });
//   }
  
//   // Function to play a song (this is called from HTML or from search results)
//   function playSong(songId, audioUrl, title, artist) {
//     console.log('Playing song:', { songId, audioUrl, title, artist });
    
//     const audioPlayer = document.getElementById('audio-player');
//     const nowPlaying = document.getElementById('now-playing');
    
//     if (!audioPlayer || !nowPlaying) {
//       console.error('Player elements not found');
//       return;
//     }
    
//     // Update the audio source
//     audioPlayer.src = audioUrl;
    
//     // Update now playing text
//     nowPlaying.textContent = `${title} by ${artist}`;
    
//     // Start playing
//     audioPlayer.play()
//       .catch(error => {
//         console.error('Error playing song:', error);
//         nowPlaying.textContent = 'Error playing song';
//       });
    
//     // Store current song info in player
//     audioPlayer.dataset.songId = songId;
//     audioPlayer.dataset.title = title;
//     audioPlayer.dataset.artist = artist;
//   }
  
//   // Update player state (called on play/pause events)
//   function updatePlayerState() {
//     const audioPlayer = document.getElementById('audio-player');
//     const nowPlaying = document.getElementById('now-playing');
    
//     if (!audioPlayer || !nowPlaying) return;
    
//     // If nothing is loaded
//     if (!audioPlayer.src || audioPlayer.src === '') {
//       nowPlaying.textContent = 'Nothing playing';
//       return;
//     }
    
//     const title = audioPlayer.dataset.title || 'Unknown Title';
//     const artist = audioPlayer.dataset.artist || 'Unknown Artist';
    
//     // Update based on play state
//     if (audioPlayer.paused) {
//       nowPlaying.textContent = `Paused: ${title} by ${artist}`;
//     } else {
//       nowPlaying.textContent = `Playing: ${title} by ${artist}`;
//     }
//   }
  
//   // Called when song ends
//   function songEnded() {
//     const audioPlayer = document.getElementById('audio-player');
//     const nowPlaying = document.getElementById('now-playing');
    
//     if (!audioPlayer || !nowPlaying) return;
    
//     // For now, just update the status
//     const title = audioPlayer.dataset.title || 'Unknown Title';
//     const artist = audioPlayer.dataset.artist || 'Unknown Artist'; 
//     nowPlaying.textContent = `Ended: ${title} by ${artist}`;
    
//     // Here you could implement "play next song" functionality
//     // playNextSong();
//   }