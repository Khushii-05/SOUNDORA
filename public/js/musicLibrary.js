// musicLibrary.js - Manages the music library functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - initializing library');
  initLibrary();
  
  // Set up search functionality
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const searchResults = document.getElementById('search-results');
  
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  // Set up playlist creation
  const createPlaylistForm = document.getElementById('create-playlist-form');
  if (createPlaylistForm) {
    createPlaylistForm.addEventListener('submit', createPlaylist);
  }
});

async function initLibrary() {
  console.log('Initializing library...');
  try {
    await fetchPlaylists();
    await fetchSongs();
  } catch (error) {
    console.error('Error initializing library:', error);
    displayErrorMessage('Failed to load library content. Please try again later.');
  }
}

async function fetchPlaylists() {
  try {
    const response = await fetch('/api/playlists', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Server error response:', text);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response is not JSON:', contentType);
      return; // Skip processing if not JSON
    }
    
    const data = await response.json();
    console.log('Playlists loaded:', data);
  } catch (error) {
    console.error('Failed to fetch playlists:', error);
    // Don't throw - we want to continue even if playlists fail
  }
}

async function fetchSongs() {
  try {
    const response = await fetch('/api/songs', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Server error response:', text);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Response is not JSON:', contentType);
      return; // Skip processing if not JSON
    }
    
    const songs = await response.json();
    console.log('Songs loaded:', songs);
    
    // Update the UI with the fetched songs
    updateRecentlyUploadedSongs(songs);
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    // Don't throw - we want to continue even if songs fail
  }
}

// Update the "Recently Uploaded" section with actual songs
function updateRecentlyUploadedSongs(songs) {
  const musicGrid = document.querySelector('.music-grid');
  if (!musicGrid) return;
  
  // Clear existing content
  musicGrid.innerHTML = '';
  
  if (!songs || songs.length === 0) {
    musicGrid.innerHTML = '<p style="color: white;">No songs uploaded yet.</p>';
    return;
  }
  
  // Add each song to the grid
  songs.forEach(song => {
    const songElement = document.createElement('div');
    songElement.className = 'music-item';
    songElement.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    
    songElement.innerHTML = `
      <div class="music-content">
        <div class="music-icon"><i class="fas fa-music"></i></div>
        <p><strong>${song.title}</strong> by ${song.artist}</p>
        <audio controls>
          <source src="${song.audioUrl}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        ${getPlaylistButton(song._id)}
      </div>
    `;
    
    musicGrid.appendChild(songElement);
  });
  
  // Set up event listeners for the audio players
  setupAudioPlayers();
}

// Helper function to get the "Add to Playlist" button HTML
function getPlaylistButton(songId) {
  // Only show the button if user is logged in
  const isLoggedIn = document.querySelector('.sidebar').innerHTML.includes('PROFILE');
  if (isLoggedIn) {
    return `
      <button class="add-btn" onclick="showAddToPlaylistModal('${songId}')">
        <i class="fas fa-plus"></i> Add to Playlist
      </button>
    `;
  }
  return '';
}

// Set up the audio players
function setupAudioPlayers() {
  const audioElements = document.querySelectorAll('.music-item audio');
  const mainPlayer = document.getElementById('audio-player');
  const nowPlaying = document.getElementById('now-playing');
  
  audioElements.forEach(audio => {
    // Add event listeners to each audio element
    audio.addEventListener('play', function() {
      // Pause all other audio elements
      audioElements.forEach(a => {
        if (a !== audio) a.pause();
      });
      
      // Update main player
      if (mainPlayer) {
        const songTitle = audio.parentElement.querySelector('strong').textContent;
        const artistName = audio.parentElement.querySelector('p').textContent.split('by ')[1];
        
        mainPlayer.src = audio.querySelector('source').src;
        mainPlayer.play();
        
        if (nowPlaying) {
          nowPlaying.textContent = `Now Playing: ${songTitle} by ${artistName}`;
        }
      }
    });
  });
  
  // Set up the main player
  if (mainPlayer) {
    mainPlayer.addEventListener('ended', function() {
      if (nowPlaying) {
        nowPlaying.textContent = 'Nothing playing';
      }
    });
  }
}

async function performSearch() {
  const query = document.getElementById('search-input').value.trim();
  const searchResults = document.getElementById('search-results');
  
  if (!query) {
    return;
  }
  
  try {
    searchResults.innerHTML = '<p>Searching...</p>';
    searchResults.classList.add('active');
    
    const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Server error response:', text);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response but got ' + contentType);
    }
    
    const data = await response.json();
    
    if (data.success === false) {
      throw new Error(data.message || 'Search failed');
    }
    
    displaySearchResults(data.songs || []);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = `<div class="error-message">Search failed: ${error.message}</div>`;
  }
}

function displaySearchResults(songs) {
  const searchResults = document.getElementById('search-results');
  
  if (!songs || songs.length === 0) {
    searchResults.innerHTML = '<div class="error-message">No songs found</div>';
    return;
  }
  
  let html = '';
  songs.forEach(song => {
    html += `
      <div class="song-result" data-id="${song._id}">
        <div class="song-info">
          <div class="song-result-title">${song.title}</div>
          <div class="song-result-artist">${song.artist}</div>
        </div>
        <div class="song-result-controls">
          <button class="play-btn" onclick="playSong('${song._id}', '${song.audioUrl}', '${song.title}', '${song.artist}')">
            <i class="fas fa-play"></i> Play
          </button>
          <button class="add-to-playlist-btn" onclick="showAddToPlaylistModal('${song._id}')">
            <i class="fas fa-plus"></i> Add
          </button>
        </div>
      </div>
    `;
  });
  
  searchResults.innerHTML = html;
}

async function createPlaylist(event) {
  event.preventDefault();
  
  const nameInput = event.target.elements.name;
  const playlistName = nameInput.value.trim();
  
  if (!playlistName) {
    displayErrorMessage('Please enter a playlist name');
    return;
  }
  
  try {
    const response = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name: playlistName }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Server error response:', text);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Clear input and reload the page to show the new playlist
      nameInput.value = '';
      window.location.reload();
    } else {
      throw new Error(data.message || 'Failed to create playlist');
    }
  } catch (error) {
    console.error('Create playlist error:', error);
    displayErrorMessage(`Failed to create playlist: ${error.message}`);
  }
}

function displayErrorMessage(message) {
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Find a good place to insert it (near the top of the content)
  const libraryContent = document.querySelector('.library-content');
  if (libraryContent) {
    libraryContent.insertBefore(errorDiv, libraryContent.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Function to show the add to playlist modal
function showAddToPlaylistModal(songId) {
  // Implementation depends on your modal system
  // For now, let's create a simple one
  console.log('Show add to playlist modal for song:', songId);
  
  // First, get the user's playlists
  fetch('/api/playlists', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to fetch playlists');
    return response.json();
  })
  .then(data => {
    // Create modal HTML
    let modalHTML = `
      <div id="playlist-modal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Add to Playlist</h2>
          <ul class="playlist-list">
    `;
    
    if (data && data.length > 0) {
      data.forEach(playlist => {
        modalHTML += `
          <li>
            <button onclick="addSongToPlaylist('${songId}', '${playlist._id}')">
              ${playlist.name}
            </button>
          </li>
        `;
      });
    } else {
      modalHTML += `<li>No playlists available. Create one first!</li>`;
    }
    
    modalHTML += `
          </ul>
        </div>
      </div>
    `;
    
    // Add modal to the page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    const modal = document.getElementById('playlist-modal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.onclick = function() {
      modalContainer.remove();
    };
    
    window.onclick = function(event) {
      if (event.target === modal) {
        modalContainer.remove();
      }
    };
  })
  .catch(error => {
    console.error('Error fetching playlists for modal:', error);
    displayErrorMessage('Failed to load playlists. Please try again.');
  });
}

// Function to add a song to a playlist
function addSongToPlaylist(songId, playlistId) {
  fetch(`/api/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ songId }),
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to add song to playlist');
    return response.json();
  })
  .then(data => {
    // Close modal
    const modal = document.getElementById('playlist-modal');
    if (modal) {
      modal.parentElement.remove();
    }
    
    // Show success message
    displaySuccessMessage('Song added to playlist successfully!');
  })
  .catch(error => {
    console.error('Error adding song to playlist:', error);
    displayErrorMessage('Failed to add song to playlist. Please try again.');
  });
}

// Function to display success messages
function displaySuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.style.color = '#ffffff';
  successDiv.style.backgroundColor = 'rgba(0, 153, 0, 0.2)';
  successDiv.style.padding = '15px';
  successDiv.style.borderRadius = '4px';
  successDiv.style.margin = '10px 0';
  successDiv.style.textAlign = 'center';
  successDiv.textContent = message;
  
  const libraryContent = document.querySelector('.library-content');
  if (libraryContent) {
    libraryContent.insertBefore(successDiv, libraryContent.firstChild);
    
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
}

// Global function to play a song from search results
window.playSong = function(songId, audioUrl, title, artist) {
  const mainPlayer = document.getElementById('audio-player');
  const nowPlaying = document.getElementById('now-playing');
  
  if (mainPlayer) {
    mainPlayer.src = audioUrl;
    mainPlayer.play();
    
    if (nowPlaying) {
      nowPlaying.textContent = `Now Playing: ${title} by ${artist}`;
    }
    
    // If we have search results open, hide them after playing
    const searchResults = document.getElementById('search-results');
    if (searchResults && searchResults.classList.contains('active')) {
      // Keep visible for a moment so the user knows their selection worked
      setTimeout(() => {
        searchResults.classList.remove('active');
      }, 1500);
    }
  }
};

// Helper function for generating random colors for music items
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}