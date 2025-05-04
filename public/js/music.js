  // Search functionality
  document.getElementById('search-button').addEventListener('click', function() {
    var query = document.getElementById('search-input').value.trim();
    if (query) {
        searchSongs(query);
    }
});

document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        var query = this.value.trim();
        if (query) {
            searchSongs(query);
        }
    }
});

function searchSongs(query) {
    fetch('/api/songs/search?q=' + encodeURIComponent(query))
        .then(function(response) {
            return response.json();
        })
        .then(function(songs) {
            var resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = '';
            resultsContainer.classList.add('active');
            
            if (songs.length === 0) {
                resultsContainer.innerHTML = '<p>No songs found. Try a different search.</p>';
                return;
            }
            
            songs.forEach(function(song) {
                var songItem = document.createElement('div');
                songItem.className = 'song-result';
                songItem.innerHTML = 
                    '<div class="song-result-info">' +
                        '<div class="song-result-title">' + song.title + '</div>' +
                        '<div class="song-result-artist">' + song.artist + '</div>' +
                    '</div>' +
                    '<div class="song-result-controls">' +
                        '<button onclick="playSong(\'' + song.title + '\', \'' + song.audioUrl + '\')">' +
                            '<i class="fas fa-play"></i> Play' +
                        '</button>' +
                        '<% if (locals.user) { %>' +
                        '<button onclick="addToPlaylist(\'' + song._id + '\')">' +
                            '<i class="fas fa-plus"></i> Add' +
                        '</button>' +
                        '<% } %>' +
                    '</div>';
                resultsContainer.appendChild(songItem);
            });
        })
        .catch(function(error) {
            console.error('Error searching songs:', error);
            alert('Failed to search songs. Please try again.');
        });
}

// Genre functionality
function loadGenreSongs(genre) {
    fetch('/api/songs/genre/' + genre)
        .then(function(response) {
            return response.json();
        })
        .then(function(songs) {
            var genreSongsContainer = document.getElementById('genre-songs');
            var genreSongsList = document.getElementById('genre-songs-list');
            var genreTitle = document.getElementById('genre-title');
            
            genreSongsContainer.style.display = 'block';
            genreSongsList.innerHTML = '';
            genreTitle.textContent = genre.toUpperCase();
            
            if (songs.length === 0) {
                genreSongsList.innerHTML = '<p>No songs found in this genre.</p>';
                return;
            }
            
            songs.forEach(function(song, index) {
                var songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.innerHTML = 
                    '<div class="song-number">' + (index + 1) + '</div>' +
                    '<div class="song-icon"><i class="fas fa-music"></i></div>' +
                    '<div class="song-details">' +
                        '<div class="song-title">' + song.title + '</div>' +
                        '<div class="song-artist">' + song.artist + '</div>' +
                    '</div>' +
                    '<div class="song-controls">' +
                        '<button onclick="playSong(\'' + song.title + '\', \'' + song.audioUrl + '\')" title="Play">' +
                            '<i class="fas fa-play"></i>' +
                        '</button>' +
                        '<% if (locals.user) { %>' +
                        '<button onclick="addToPlaylist(\'' + song._id + '\')" title="Add to playlist">' +
                            '<i class="fas fa-plus"></i>' +
                        '</button>' +
                        '<% } %>' +
                    '</div>';
                genreSongsList.appendChild(songItem);
            });
            
            // Scroll to the genre songs section
            genreSongsContainer.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(function(error) {
            console.error('Error loading genre songs:', error);
            alert('Failed to load songs. Please try again.');
        });
}

// Add to playlist functionality
function addToPlaylist(songId) {
    <% if (!locals.user) { %>
        window.location.href = '/auth';
        return;
    <% } %>
    
    fetch('/api/playlists')
        .then(function(res) {
            return res.json();
        })
        .then(function(playlists) {
            if (playlists.length === 0) {
                alert('You don\'t have any playlists yet. Create one in your library first.');
                return;
            }
            
            // Create a simple modal for playlist selection
            var modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';
            
            var modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#121212';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.width = '300px';
            modalContent.style.maxWidth = '90%';
            
            var modalHTML = '<h3>Add to Playlist</h3><div style="margin: 15px 0;">';
            
            for (var i = 0; i < playlists.length; i++) {
                var pl = playlists[i];
                modalHTML += '<div style="padding: 10px; margin: 5px 0; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; cursor: pointer;" ' +
                             'onclick="addSongToPlaylist(\'' + songId + '\', \'' + pl._id + '\')">' +
                             pl.name +
                             '</div>';
            }
            
            modalHTML += '</div>' +
                         '<button style="width: 100%; padding: 10px; background-color: #333; color: white; border: none; border-radius: 4px; cursor: pointer;" ' +
                         'onclick="document.body.removeChild(this.parentNode.parentNode)">' +
                         'Cancel' +
                         '</button>';
            
            modalContent.innerHTML = modalHTML;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        })
        .catch(function(error) {
            console.error('Error fetching playlists:', error);
            alert('Failed to load your playlists. Please try again.');
        });
}

function addSongToPlaylist(songId, playlistId) {
    fetch('/api/playlists/' + playlistId + '/songs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songId: songId })
    })
    .then(function(response) {
        if (response.ok) {
            alert('Song added to playlist successfully!');
            // Remove the modal
            var modals = document.querySelectorAll('div[style*="position: fixed"]');
            for (var i = 0; i < modals.length; i++) {
                var modal = modals[i];
                if (modal.style.zIndex === '1000') {
                    document.body.removeChild(modal);
                }
            }
        } else {
            alert('Failed to add song to playlist. It might already be in the playlist.');
        }
    })
    .catch(function(error) {
        console.error('Error adding song to playlist:', error);
        alert('Failed to add song to playlist. Please try again.');
    });
}