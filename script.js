
const audioFile = document.getElementById('audioFile');
const audioPlayer = document.getElementById('audioPlayer');
const fileName = document.getElementById('fileName');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const timeDisplay = document.getElementById('timeDisplay');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const playlistItems = document.getElementById('playlistItems');
const titleInput = document.getElementById('titleInput');
const addTitleBtn = document.getElementById('addTitleBtn');

// Playlist data
let playlist = [];
let currentTitleIndex = -1;
let isPlaying = false;

// Load audio file
audioFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audioPlayer.src = url;
        fileName.textContent = `File: ${file.name}`;
        
        // Enable controls
        playPauseBtn.disabled = false;
        rewindBtn.disabled = false;
        forwardBtn.disabled = false;
        titleInput.disabled = false;
        addTitleBtn.disabled = false;
        
        // Reset playlist
        playlist = [];
        updatePlaylist();
        currentTitleIndex = -1;
    }
});

// Play/Pause functionality
playPauseBtn.addEventListener('click', function() {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶️ Play';
        isPlaying = false;
    } else {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸️ Pause';
        isPlaying = true;
    }
});

// Rewind 5 seconds
rewindBtn.addEventListener('click', function() {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
});

// Forward 5 seconds
forwardBtn.addEventListener('click', function() {
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
});

// Update time display and progress bar
audioPlayer.addEventListener('timeupdate', function() {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    // Update time display
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = Math.floor(currentTime % 60);
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    
    timeDisplay.textContent = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes.toString().padStart(2, '0')}:${durationSeconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const progress = (currentTime / duration) * 100;
    progressFill.style.width = progress + '%';
});

// Click on progress bar to seek
progressBar.addEventListener('click', function(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const clickProgress = clickX / progressWidth;
    audioPlayer.currentTime = clickProgress * audioPlayer.duration;
});

// Add new title
addTitleBtn.addEventListener('click', function() {
    const titleName = titleInput.value.trim();
    if (titleName && audioPlayer.currentTime >= 0) {
        const newTitle = {
            name: titleName,
            time: audioPlayer.currentTime
        };
        
        // Insert title in time order
        let insertIndex = 0;
        for (let i = 0; i < playlist.length; i++) {
            if (playlist[i].time > newTitle.time) {
                insertIndex = i;
                break;
            }
            insertIndex = i + 1;
        }
        
        playlist.splice(insertIndex, 0, newTitle);
        updatePlaylist();
        titleInput.value = '';
        
        // Limit to 50 titles
        if (playlist.length > 50) {
            playlist = playlist.slice(0, 50);
            updatePlaylist();
            alert('Maximum 50 titles allowed!');
        }
    }
});

// Update playlist display
function updatePlaylist() {
    playlistItems.innerHTML = '';
    document.querySelector('.playlist-title').textContent = `Playlist (${playlist.length} titles)`;
    
    playlist.forEach((title, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTitleIndex) {
            item.classList.add('active');
        }
        
        const titleInfo = document.createElement('span');
        const minutes = Math.floor(title.time / 60);
        const seconds = Math.floor(title.time % 60);
        titleInfo.textContent = `${title.name} (${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')})`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            playlist.splice(index, 1);
            if (currentTitleIndex === index) {
                currentTitleIndex = -1;
            } else if (currentTitleIndex > index) {
                currentTitleIndex--;
            }
            updatePlaylist();
        });
        
        item.appendChild(titleInfo);
        item.appendChild(removeBtn);
        
        // Click to play from this title
        item.addEventListener('click', function() {
            audioPlayer.currentTime = title.time;
            currentTitleIndex = index;
            updatePlaylist();
            if (!isPlaying) {
                playPauseBtn.click();
            }
        });
        
        playlistItems.appendChild(item);
    });
}

// Format time helper function
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Enter key to add title
titleInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTitleBtn.click();
    }
});

// Reset play button when audio ends
audioPlayer.addEventListener('ended', function() {
    playPauseBtn.textContent = '▶️ Play';
    isPlaying = false;
});
