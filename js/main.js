// Sample users and authentication
const users = JSON.parse(localStorage.getItem("users")) || {};
let isLoggedIn = false;
let currentUser = null;
let sessionToken = null;
let currentSongIndex = 0;
let isPlaying = false;
let queue = []; // Queue for songs
let queueIndex = 0; // Tracks position in the queue

// Sample songs
const allSongs = [
  {
    title: "Rebellion",
    artist: "Aylex",
    file: "https://dl.dropboxusercontent.com/scl/fi/tlnhpnr4w54rhas4vnn24/Rebellion.mp3?rlkey=4vzl25djg01k8wkbzko14ugp8&st=m80or4kx",
    albumArt: "https://dl.dropboxusercontent.com/scl/fi/b3l9j3cifg5ourkr11x4u/Rebellion.png?rlkey=nvjk4e722cf627qwcpse672sl&st=g6gzx7n2",
    liked: false,
  },
  {
    title: "Sunset",
    artist: "Lukrembo",
    file: "https://dl.dropboxusercontent.com/scl/fi/o6myi5c40pu7mkzx502yg/Sunset.mp3?rlkey=8ryl9g3a7doyfj4k3gjrd87te&st=6os5kify",
    albumArt: "https://dl.dropboxusercontent.com/scl/fi/8x5r2hmq3a6ozttk3vdgs/Sunset.png?rlkey=pi1curp5yaxuh8plo0ihwe1by&st=gh1bjrbz",
    liked: false,
  },
];

// Handles search functionality
function handleSearch(event) {
  if (event.key === "Enter") {
    const query = event.target.value.toLowerCase().trim();
    const results = allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
    displaySearchResults(query, results);
    event.target.value = "";
  }
}

// Display search results
function displaySearchResults(query, results) {
  const mainContent = document.getElementById("mainContent");

  if (results.length > 0) {
    mainContent.innerHTML = `
      <h2>Search Results for "${query}"</h2>
      <ul class="song-list">
        ${results
          .map((song, index) => `
            <li class="song-item">
              <img src="${song.albumArt}" alt="${song.title} Album Art" class="album-art">
              <div>
                <p>${song.title} - ${song.artist}</p>
                <div class="song-actions">
                  <button onclick="playSong(${allSongs.findIndex(s => s.title === song.title)})" class="play-btn"><i class="fas fa-play"></i></button>
                  <button 
                    class="like-btn ${song.liked ? "liked" : ""}" 
                    data-index="${allSongs.findIndex(s => s.title === song.title)}" 
                    onclick="toggleLike(${allSongs.findIndex(s => s.title === song.title)})">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </li>
          `).join("")}
      </ul>
    `;
  } else {
    mainContent.innerHTML = `<h2>No results found for "${query}"</h2>`;
  }
}

// Toggles the dropdown menu
function toggleOptionsMenu(index) {
  const menu = document.getElementById(`optionsMenu-${index}`);
  document.querySelectorAll(".options-menu").forEach((m) => (m.style.display = "none"));
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Toggles like status for a song
function toggleLike(index) {
  if (!isLoggedIn) {
    alert("You must be logged in to like songs.");
    return;
  }

  const song = allSongs[index];
  const likedSongs = currentUser.likedSongs || [];
  const isLiked = likedSongs.includes(index);

  if (isLiked) {
    // Remove from liked songs
    currentUser.likedSongs = likedSongs.filter((songIndex) => songIndex !== index);
    alert(`${song.title} has been removed from your Liked Songs.`);
  } else {
    // Add to liked songs
    currentUser.likedSongs.push(index);
    alert(`${song.title} has been added to your Liked Songs.`);
  }

  // Save the updated user data
  users[currentUser.email] = currentUser;
  localStorage.setItem("users", JSON.stringify(users));

  // Update the like button appearance
  const likeButton = document.querySelector(`.like-btn[data-index="${index}"]`);
  if (likeButton) {
    likeButton.classList.toggle("liked", !isLiked);
  }

  // Update the Liked Songs library tab
  displayLikedSongsInLibrary();
}

// Updates the Liked Songs section in the library tab
function displayLikedSongsInLibrary() {
  if (!isLoggedIn) return;

  const likedSongsTab = document.getElementById("likedSongsTab");
  const likedSongsCount = currentUser.likedSongs.length;

  if (likedSongsTab) {
    likedSongsTab.innerHTML = `Liked Songs (${likedSongsCount})`;
  }
}

// Shows the Liked Songs page
function showLikedSongsPage() {
  if (!isLoggedIn) {
    alert("You need to log in to view your liked songs.");
    return;
  }

  const mainContent = document.getElementById("mainContent");
  const likedSongs = currentUser.likedSongs.map((index) => allSongs[index]);

  if (likedSongs.length > 0) {
    mainContent.innerHTML = `
      <h2>Your Liked Songs</h2>
      <ul class="song-list">
        ${likedSongs
          .map(
            (song, index) => `
          <li class="song-item">
            <img src="${song.albumArt}" alt="${song.title} Album Art" class="album-art">
            <div>
              <p>${song.title} - ${song.artist}</p>
              <button onclick="playSong(${allSongs.indexOf(song)})" class="play-btn"><i class="fas fa-play"></i></button>
              <button 
                onclick="toggleLike(${allSongs.indexOf(song)})" 
                class="like-btn ${song.liked ? "liked" : ""}">
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    mainContent.innerHTML = `<h2>No liked songs yet.</h2>`;
  }
}

// Updates the liked songs section on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedUsers = JSON.parse(localStorage.getItem("users")) || {};
  const sessionToken = sessionStorage.getItem("sessionToken");

  if (sessionToken) {
    const email = Object.keys(savedUsers).find(
      (key) => savedUsers[key].sessionToken === sessionToken
    );

    if (email) {
      isLoggedIn = true;
      currentUser = savedUsers[email];
      updateLikedSongs();
    }
  }
  displayLikedSongsInLibrary();
});

// Adds a song to the queue
function addToQueue(index) {
  if (!isLoggedIn) {
    alert("You must be logged in to queue songs.");
    return;
  }
  const songToAdd = allSongs[index];
  queue.push(songToAdd); // Add the song object to the queue
  alert(`${songToAdd.title} has been added to the queue.`);
  console.log("Queue Updated:", queue); // Debugging log
}


// Toggles play/pause
function togglePlayPause() {
  const audioPlayer = document.getElementById("audioPlayer");
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audioPlayer.play();
    isPlaying = true;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-pause"></i>';
  }
}

// Volume Control
function setVolume(value) {
  audioPlayer.volume = value;
  console.log(`Volume set to: ${value}`);
}

// Function to stop the current song
function stopSong() {
  const audioPlayer = document.getElementById("audioPlayer");
  const currentSongInfo = document.querySelector(".current-song-info");

  audioPlayer.pause();
  audioPlayer.currentTime = 0; // Reset playback to the beginning
  isPlaying = false;

  // Hide song info in the media player
  currentSongInfo.classList.remove("playing");
  document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
}

// Updating UI for the current song
function updatePlayerUI(index) {
  const currentSong = allSongs[index];
  const albumArt = document.getElementById("currentAlbumArt");
  const songTitle = document.getElementById("currentSongTitle");
  const songArtist = document.getElementById("currentSongArtist");

  if (currentSong) {
    albumArt.src = currentSong.albumArt;
    albumArt.style.display = "block"; // Show album art
    songTitle.textContent = currentSong.title;
    songArtist.textContent = currentSong.artist;
    songTitle.style.display = "block"; // Show title
    songArtist.style.display = "block"; // Show artist
  } else {
    albumArt.style.display = "none"; // Hide album art
    songTitle.style.display = "none"; // Hide title
    songArtist.style.display = "none"; // Hide artist
  }
}

// Plays selected song
function playSong(index) {
  const audioPlayer = document.getElementById("audioPlayer");
  const selectedSong = allSongs[index]; // Access song directly by its index
  const currentSongInfo = document.querySelector(".current-song-info");

  if (audioPlayer.src !== selectedSong.file) {
    audioPlayer.src = selectedSong.file; // Set the correct song file
    currentSongIndex = index; // Update the current song index
    updatePlayerUI(index); // Update the player UI
  }

  audioPlayer.play();
  isPlaying = true;
  document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-pause"></i>';
  currentSongInfo.classList.add("playing");
}

// Plays the next song or resets the current one
function playNext() {
  console.log("Queue before skipping:", queue);
  console.log("QueueIndex before skipping:", queueIndex);

  // Check if there's an active queue
  if (queue.length > 0 && queueIndex < queue.length) {
    // Get the next song from the queue
    const nextSong = queue[queueIndex];
    console.log("Playing from queue:", nextSong);

    // Play the queued song
    currentSongIndex = allSongs.indexOf(nextSong); // Update current song index
    playSong(currentSongIndex); // Play the song
    queueIndex++; // Increment queue index
  } else {
    console.log("Queue is empty or at the end. Using default logic.");

    // Default behavior (no queue or queue end)
    audioPlayer.currentTime = 0;
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  }

  console.log("Queue after skipping:", queue);
  console.log("QueueIndex after skipping:", queueIndex);
}

// Plays the previous song or resets the current one if no queue
function playPrevious() {
  console.log("Queue before skipping back:", queue);
  console.log("QueueIndex before skipping back:", queueIndex);

  // Check if we're in the queue and not at the beginning
  if (queueIndex > 0) {
    queueIndex--; // Decrement queue index
    const prevSong = queue[queueIndex];
    console.log("Playing previous from queue:", prevSong);

    currentSongIndex = allSongs.indexOf(prevSong); // Update current song index
    playSong(currentSongIndex); // Play the song
  } else {
    console.log("Queue is empty or at the start. Using default logic.");

    // Default behavior (no queue or start of queue)
    audioPlayer.currentTime = 0;
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  }

  console.log("Queue after skipping back:", queue);
  console.log("QueueIndex after skipping back:", queueIndex);
}

// Toggles play/pause
function togglePlayPause() {
  const audioPlayer = document.getElementById("audioPlayer");
  const currentSongInfo = document.querySelector(".current-song-info");

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  } else {
    audioPlayer.play();
    isPlaying = true;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-pause"></i>';

    // Ensure song info is displayed when resuming
    currentSongInfo.classList.add("playing");
  }
}

// Hides song info when no song is playing
function stopSong() {
  const audioPlayer = document.getElementById("audioPlayer");
  const currentSongInfo = document.querySelector(".current-song-info");

  audioPlayer.pause();
  isPlaying = false;
  currentSongInfo.classList.remove("playing"); // Hide song info
  document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
}

// Event listeners for progress bar and time updates
const audioPlayer = document.getElementById("audioPlayer");
const progressBar = document.getElementById("progressBar");
const currentTimeLabel = document.getElementById("currentTime");
const totalTimeLabel = document.getElementById("totalTime");

// Update progress bar and time labels
audioPlayer.addEventListener("timeupdate", () => {
  const currentTime = audioPlayer.currentTime;
  const duration = audioPlayer.duration;

  if (!isNaN(duration)) {
    // Update progress bar
    progressBar.value = (currentTime / duration) * 100;

    // Update time labels
    currentTimeLabel.textContent = formatTime(currentTime);
    totalTimeLabel.textContent = formatTime(duration);
  }
});

// Seek to a different part of the song
progressBar.addEventListener("input", (event) => {
  const seekTime = (event.target.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
});

// Format time in minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

// Event listener for when the current song ends
audioPlayer.addEventListener("ended", () => {
  console.log("Current song ended.");
  if (queue.length > 0 && queueIndex < queue.length) {
    // Play the next song in the queue
    const nextSong = queue[queueIndex];
    playSong(allSongs.indexOf(nextSong)); // Ensure the correct index is passed
    queueIndex++; // Move to the next song in the queue
    console.log("Now playing from queue:", nextSong.title);
  } else {
    // No queued songs: Reset the player
    console.log("No songs in queue. Stopping playback.");
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  }
});

// Handles Home Navigation
function showHome() {
  const mainContent = document.getElementById("mainContent");
  if (mainContent) {
    mainContent.innerHTML = `
      <h2>Welcome to MySpotify</h2>
      <p>Discover your favorite music and explore new tunes</p>
    `;
    console.log("Navigated to Home page.");
  } else {
    console.error("Error: Home button - mainContent not found.");
  }
}

// DOMContentLoaded Listener
document.addEventListener("DOMContentLoaded", () => {
  const homeButton = document.getElementById("homeButton");
  if (homeButton) {
    homeButton.addEventListener("click", showHome);
    console.log("Home button listener added.");
  } else {
    console.error("Error: Home button element not found.");
  }
});

// Secure hashing function (basic simulation for demonstration)
function hashPassword(password) {
  return btoa(password); // Replace with a real hashing library in production
}

// Generates a session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Sign-up function
function showSignup() {
  const email = prompt("Enter your email address:");
  if (!email) return;
  if (users[email]) {
    alert("An account with this email already exists.");
    return;
  }
  const password = prompt("Create a password:");
  const name = prompt("Enter your name:");
  const dob = prompt("Enter your date of birth:");
  const hashedPassword = hashPassword(password);

  users[email] = { email, password: hashedPassword, name, dob, likedSongs: [] };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created successfully. Please log in.");
}

// Login function
function showLogin() {
  const email = prompt("Enter your email:");
  const password = prompt("Enter your password:");
  const hashedPassword = hashPassword(password);

  if (users[email] && users[email].password === hashedPassword) {
    isLoggedIn = true;
    currentUser = users[email];
    sessionToken = generateSessionToken();
    sessionStorage.setItem("sessionToken", sessionToken);

    // Ensure likedSongs is initialized for this user
    currentUser.likedSongs = currentUser.likedSongs || [];
    
    alert(`Welcome back, ${currentUser.name}!`);
    updateAccountUI();
  } else {
    alert("Invalid email or password.");
  }
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Update account UI
function updateAccountUI() {
  if (isLoggedIn) {
    document.getElementById("accountOptions").innerHTML = `
      <a href="#" onclick="showAccount()" class="nav-link">Account</a>`;
  } else {
    document.getElementById("accountOptions").innerHTML = `
      <a href="#" onclick="showSignup()" class="nav-link">Sign Up</a>
      <a href="#" onclick="showLogin()" class="nav-link">Log In</a>`;
  }
}

// Show account details
function showAccount() {
  if (!isLoggedIn) {
    alert("You need to log in to view account details.");
    return;
  }
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
    <h2>Account Details</h2>
    <p>Name: ${currentUser.name}</p>
    <p>Email: ${currentUser.email}</p>
    <p>Date of Birth: ${currentUser.dob}</p>
    <button onclick="logout()">Log Out</button>
  `;
}

// Logout function
function logout() {
  isLoggedIn = false;
  currentUser = null;
  sessionToken = null;
  sessionStorage.removeItem("sessionToken");
  updateAccountUI();
  alert("You have been logged out.");
}

// Log error without exposing sensitive information
function logError(message) {
  console.error(`[Error] ${message}`);
}

// Initialize Navbar
document.addEventListener("DOMContentLoaded", () => {
  sessionToken = sessionStorage.getItem("sessionToken");
  if (sessionToken) {
    isLoggedIn = true; // Simulate session restoration
    updateAccountUI();
  } else {
    updateAccountUI();
  }
});