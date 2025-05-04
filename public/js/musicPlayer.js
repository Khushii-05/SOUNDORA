// musicPlayer.js - Handles the audio player functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing music player');
    initMusicPlayer();
  });
  
  function initMusicPlayer() {
    // Get player elements
    const audioPlayer = document.getElementById('audio-player');
    const nowPlaying = document.getElementById('now-playing');
    
    if (!audioPlayer || !nowPlaying) {
      console.warn('Player elements not found, skipping player initialization');
      return;
    }
    
    // Set up audio player event listeners
    audioPlayer.addEventListener('play', updatePlayerState);
    audioPlayer.addEventListener('pause', updatePlayerState);
    audioPlayer.addEventListener('ended', songEnded);
    
    // Check for play buttons in the page
    setupPlayButtons();
    
    console.log('Music player initialized');
  }
  
  // Set up play buttons throughout the page
  function setupPlayButtons() {
    // This will find all elements with the play-btn class and attach event listeners
    const playButtons = document.querySelectorAll('.play-btn');
    
    playButtons.forEach(button => {
      button.addEventListener('click', function() {
        const songId = this.closest('[data-id]').dataset.id;
        const audioUrl = this.dataset.url;
        const title = this.dataset.title;
        const artist = this.dataset.artist;
        
        playSong(songId, audioUrl, title, artist);
      });
    });
  }
  
  // Function to play a song (this is called from HTML or from search results)
  function playSong(songId, audioUrl, title, artist) {
    console.log('Playing song:', { songId, audioUrl, title, artist });
    
    const audioPlayer = document.getElementById('audio-player');
    const nowPlaying = document.getElementById('now-playing');
    
    if (!audioPlayer || !nowPlaying) {
      console.error('Player elements not found');
      return;
    }
    
    // Update the audio source
    audioPlayer.src = audioUrl;
    
    // Update now playing text
    nowPlaying.textContent = `${title} by ${artist}`;
    
    // Start playing
    audioPlayer.play()
      .catch(error => {
        console.error('Error playing song:', error);
        nowPlaying.textContent = 'Error playing song';
      });
    
    // Store current song info in player
    audioPlayer.dataset.songId = songId;
    audioPlayer.dataset.title = title;
    audioPlayer.dataset.artist = artist;
  }
  
  // Update player state (called on play/pause events)
  function updatePlayerState() {
    const audioPlayer = document.getElementById('audio-player');
    const nowPlaying = document.getElementById('now-playing');
    
    if (!audioPlayer || !nowPlaying) return;
    
    // If nothing is loaded
    if (!audioPlayer.src || audioPlayer.src === '') {
      nowPlaying.textContent = 'Nothing playing';
      return;
    }
    
    const title = audioPlayer.dataset.title || 'Unknown Title';
    const artist = audioPlayer.dataset.artist || 'Unknown Artist';
    
    // Update based on play state
    if (audioPlayer.paused) {
      nowPlaying.textContent = `Paused: ${title} by ${artist}`;
    } else {
      nowPlaying.textContent = `Playing: ${title} by ${artist}`;
    }
  }
  
  // Called when song ends
  function songEnded() {
    const audioPlayer = document.getElementById('audio-player');
    const nowPlaying = document.getElementById('now-playing');
    
    if (!audioPlayer || !nowPlaying) return;
    
    // For now, just update the status
    const title = audioPlayer.dataset.title || 'Unknown Title';
    const artist = audioPlayer.dataset.artist || 'Unknown Artist'; 
    nowPlaying.textContent = `Ended: ${title} by ${artist}`;
    
    // Here you could implement "play next song" functionality
    // playNextSong();
  }