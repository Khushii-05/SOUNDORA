// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // === AUTH FORM: TAB TOGGLING ===
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding form
            const target = tab.getAttribute('data-target');
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === target) {
                    form.classList.add('active');
                }
            });
        });
    });

    // === PASSWORD VISIBILITY TOGGLE ===
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // Handle Sign Up
    const signupForm = document.getElementById('signup-form-el');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('signup-first-name').value;
            const lastName = document.getElementById('signup-last-name').value;
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, username, email, password })
                });

                if (res.redirected) {
                    window.location.href = res.url;
                    return;
                }

                const data = await res.json();
                
                if (res.ok) {
                    alert('Account created successfully!');
                    window.location.href = '/home';
                } else {
                    alert(data.error || 'Signup failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during signup');
            }
        });
    }

    // Handle Login
    const loginForm = document.getElementById('login-form-el');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (res.redirected) {
                    window.location.href = res.url;
                    return;
                }

                const data = await res.json();
                
                if (res.ok) {
                    alert('Login successful!');
                    window.location.href = '/home';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // Music Items - Create placeholder content
    const musicItems = document.querySelectorAll('.music-item');
    
    musicItems.forEach(item => {
        const color1 = getRandomColor();
        const color2 = getRandomColor();
        item.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        const musicContent = document.createElement('div');
        musicContent.classList.add('music-content');
        
        const musicIcon = document.createElement('div');
        musicIcon.classList.add('music-icon');
        musicIcon.innerHTML = '<i class="fas fa-music"></i>';
        
        const musicTitle = document.createElement('div');
        musicTitle.classList.add('music-title');
        musicTitle.textContent = getRandomSongTitle();
        
        const musicArtist = document.createElement('div');
        musicArtist.classList.add('music-artist');
        musicArtist.textContent = getRandomArtist();
        
        musicContent.appendChild(musicIcon);
        musicContent.appendChild(musicTitle);
        musicContent.appendChild(musicArtist);
        item.appendChild(musicContent);
        
        const playButton = document.createElement('div');
        playButton.classList.add('play-button');
        playButton.innerHTML = '<i class="fas fa-play-circle"></i>';
        item.appendChild(playButton);
        
        item.addEventListener('mouseenter', function() {
            playButton.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', function() {
            playButton.style.opacity = '0';
        });
    });
    
    // Playlist covers - Create placeholder content
    const playlistCovers = document.querySelectorAll('.playlist-cover');
    
    playlistCovers.forEach(cover => {
        const color1 = getRandomColor();
        const color2 = getRandomColor();
        cover.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-music');
        icon.style.fontSize = '40px';
        icon.style.color = 'rgba(255, 255, 255, 0.7)';
        icon.style.position = 'absolute';
        icon.style.top = '50%';
        icon.style.left = '50%';
        icon.style.transform = 'translate(-50%, -50%)';
        
        cover.appendChild(icon);
        cover.style.position = 'relative';
    });

    // ================= PROFILE PAGE FUNCTIONALITY =================
    if (document.querySelector('.profile')) {
        // Enhanced Tab Switching with History API
        const profileTabs = document.querySelectorAll('.profile-tab');
        const profileContents = document.querySelectorAll('.profile-tab-content');
        
        function activateTab(tab) {
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.getAttribute('data-target');
            profileContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });
            
            // Update URL without reloading
            history.pushState(null, null, `#${target}`);
        }
        
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => activateTab(tab));
        });
        
        // Check for hash on load
        if (window.location.hash) {
            const targetTab = document.querySelector(`.profile-tab[data-target="${window.location.hash.substring(1)}"]`);
            if (targetTab) activateTab(targetTab);
        }
        
        // Enhanced Profile Form with Validation
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const fullName = document.getElementById('fullName').value.trim();
                const email = document.getElementById('email').value.trim();
                
                if (!fullName || !email) {
                    showAlert('Please fill in all fields', 'error');
                    return;
                }
                
                if (!validateEmail(email)) {
                    showAlert('Please enter a valid email address', 'error');
                    return;
                }
                
                try {
                    const response = await fetch('/api/users/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include', // Send cookies
                        body: JSON.stringify({ fullName, email })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        showAlert('Profile updated successfully!', 'success');
                        // Update displayed name if changed
                        document.querySelector('.profile-info h1').textContent = fullName;
                    } else {
                        showAlert(data.message || 'Failed to update profile', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('An error occurred while updating your profile', 'error');
                }
            });
        }
        
        // Enhanced Password Change Form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                
                if (!currentPassword || !newPassword || !confirmNewPassword) {
                    showAlert('Please fill in all password fields', 'error');
                    return;
                }
                
                if (newPassword !== confirmNewPassword) {
                    showAlert('New passwords do not match', 'error');
                    return;
                }
                
                if (newPassword.length < 8) {
                    showAlert('Password must be at least 8 characters', 'error');
                    return;
                }
                
                try {
                    const response = await fetch('/api/users/password', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ currentPassword, newPassword })
                    });
                     
                    const data = await response.json();
                    
                    if (response.ok) {
                        showAlert('Password changed successfully!', 'success');
                        passwordForm.reset();
                    } else {
                        showAlert(data.message || 'Failed to change password', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('An error occurred while changing your password', 'error');
                }
            });
        }
        
        // Avatar Upload Functionality
        const changeAvatarBtn = document.querySelector('.change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                
                fileInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    // Check file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        showAlert('Image size should be less than 2MB', 'error');
                        return;
                    }
                    
                    const formData = new FormData();
                    formData.append('avatar', file);
                    
                    try {
                        const response = await fetch('/api/users/avatar', {
                            method: 'POST',
                            credentials: 'include',
                            body: formData
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            // Update avatar preview
                            const avatar = document.querySelector('.profile-avatar');
                            if (data.avatarUrl) {
                                avatar.style.backgroundImage = `url(${data.avatarUrl})`;
                                avatar.style.backgroundSize = 'cover';
                                avatar.innerHTML = '';
                            }
                            showAlert('Avatar updated successfully!', 'success');
                        } else {
                            showAlert(data.message || 'Failed to upload avatar', 'error');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        showAlert('An error occurred while uploading your avatar', 'error');
                    }
                };
                
                fileInput.click();
            });
        }
        
        // Enhanced Account Deletion with Confirmation
        const deleteBtn = document.getElementById('delete-account-btn');
        const deleteModal = document.getElementById('delete-account-modal');
        const closeModal = document.querySelector('.close-modal');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteModal.style.display = 'block';
            });
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                deleteModal.style.display = 'none';
            });
        }
        
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                deleteModal.style.display = 'none';
            });
        }
        
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => {
                const password = document.getElementById('confirm-password-delete').value;
                
                if (!password) {
                    showAlert('Please enter your password to confirm', 'error', deleteModal);
                    return;
                }
                
                try {
                    const response = await fetch('/api/users', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ password })
                    });
                     
                    const data = await response.json();
                    
                    if (response.ok) {
                        window.location.href = '/auth?message=AccountDeleted';
                    } else {
                        showAlert(data.message || 'Account deletion failed', 'error', deleteModal);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('An error occurred while deleting your account', 'error', deleteModal);
                }
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        });
        
        // Load user stats
        loadUserStats();
    }
    
    // Logout Functionality
    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                window.location.href = '/auth';
            } else {
                showAlert('Logout failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Logout error:', error);
            showAlert('An error occurred during logout.', 'error');
        }
    });

    // Helper Functions
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    function getRandomSongTitle() {
        const titles = [
            'Summer Vibes', 'Midnight Dreams', 'Electric Soul', 
            'Rainy Days', 'Sunset Boulevard', 'Urban Jungle', 
            'Ocean Waves', 'Mountain High', 'City Lights',
            'Dreamy Night', 'Rhythm & Blues', 'Jazz Fusion'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }
    
    function getRandomArtist() {
        const artists = [
            'The Soundoras', 'Electric Minds', 'Luna Soul', 
            'Urban Beatz', 'Melodic Dreams', 'Rhythm Collective', 
            'Sound Waves', 'Harmony', 'The Vibes',
            'Echo & Flow', 'Sonic Treat', 'Beat Masters'
        ];
        return artists[Math.floor(Math.random() * artists.length)];
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showAlert(message, type, parent = document.body) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Style the alert
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.padding = '15px 25px';
        alert.style.borderRadius = '5px';
        alert.style.color = 'white';
        alert.style.zIndex = '1000';
        alert.style.animation = 'fadeIn 0.3s';
        
        if (type === 'success') {
            alert.style.background = '#00b894';
        } else {
            alert.style.background = '#d63031';
        }
        
        parent.appendChild(alert);
        
        // Remove alert after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
    
    async function loadUserStats() {
        try {
            const response = await fetch('/api/users/profile', { 
                credentials: 'include' // Ensure cookies are sent
            });
            if (response.ok) {
                 
                const data = await response.json();
                // Update stats on the page
                document.querySelector('.stat-value:nth-child(1)').textContent = data.followers || 0;
                document.querySelector('.stat-value:nth-child(2)').textContent = data.following || 0;
                document.querySelector('.stat-value:nth-child(3)').textContent = data.playlists || 0;
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Make genre cards clickable
    const genreCards = document.querySelectorAll('.music-item.genre-card');
    
    if (genreCards.length > 0) {
        console.log('Found ' + genreCards.length + ' genre cards');
        
        genreCards.forEach(card => {
            card.addEventListener('click', function() {
                const genreName = this.querySelector('.music-title').textContent;
                const genreUrl = `/genres/${genreName.toLowerCase().replace(/\s+/g, '-')}`;
                console.log('Navigating to: ' + genreUrl);
                window.location.href = genreUrl;
            });
        });
    }
    
    // Fix for genre navigation in genre section
    const genreSections = document.querySelectorAll('.genre-section');
    if (genreSections.length > 0) {
        console.log('Found ' + genreSections.length + ' genre sections');
        
        // Add toggle functionality for genre sections
        const genreToggles = document.querySelectorAll('.genre-toggle');
        genreToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const genreSection = this.closest('.genre-section');
                genreSection.classList.toggle('collapsed');
                
                const icon = this.querySelector('i');
                if (genreSection.classList.contains('collapsed')) {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                } else {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                }
            });
        });
    }
    
    // Debug click events
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('.music-item.genre-card');
        if (target) {
            console.log('Genre card clicked:', target);
        }
    });
});

// script.js
// Add this inside the DOMContentLoaded callback
// script.js - Update loadDailyMixes function
async function loadDailyMixes() {
    try {
      const res = await fetch('/api/songs/daily-mixes');
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Server error:', error);
        showAlert('Failed to load daily mixes. Please try again later.', 'error');
        return;
      }
  
      const data = await res.json();
      
      if (!data.success || !Array.isArray(data.mixes)) {
        console.error('Invalid response format:', data);
        return;
      }
  
      const container = document.getElementById('daily-mixes');
      container.innerHTML = '';
      
      data.mixes.forEach(mix => {
        if (!mix.songs || mix.songs.length === 0) return;
        
        const item = document.createElement('div');
        item.className = 'music-item daily-mix';
        item.innerHTML = `
          <div class="music-content">
            <div class="music-icon">
              <i class="fas fa-random"></i>
            </div>
            <div class="music-info">
              <div class="music-title">${mix.name}</div>
              <div class="music-subtitle">${mix.description}</div>
            </div>
          </div>
          <div class="play-button">
            <i class="fas fa-play"></i>
          </div>
        `;
  
        // Add click handler
        item.addEventListener('click', () => playDailyMix(mix));
        container.appendChild(item);
      });
  
      // Remove loading pulse effect
      container.classList.remove('loading');
  
    } catch (error) {
      console.error('Network error:', error);
      showAlert('Connection error. Please check your network.', 'error');
    }
  }
  
  async function playDailyMix(mix) {
    try {
      const player = document.getElementById('audio-player');
      const nowPlaying = document.getElementById('now-playing');
      
      // Shuffle songs
      const shuffled = [...mix.songs].sort(() => Math.random() - 0.5);
      
      // Store playlist
      window.currentPlaylist = {
        songs: shuffled,
        currentIndex: 0
      };
  
      // Play first song
      player.src = shuffled[0].audioUrl;
      nowPlaying.textContent = `${shuffled[0].title} - ${shuffled[0].artist}`;
      player.play();
  
      // Add visual feedback
      document.querySelectorAll('.daily-mix').forEach(item => {
        item.classList.remove('playing');
      });
      event.currentTarget.classList.add('playing');
  
    } catch (error) {
      console.error('Play error:', error);
      showAlert('Failed to start playback', 'error');
    }
  }
  // Call this at the end of your DOMContentLoaded callback
  loadDailyMixes();
// Add CSS for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
`;

document.head.appendChild(style);