// Sample users and authentication
const users = JSON.parse(localStorage.getItem("users")) || {};
let isLoggedIn = false;
let currentUser = null;
let currentSongIndex = 0;
let isPlaying = false;

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

// Display Songs
function displaySearchResults(query, results) {
  const mainContent = document.getElementById("mainContent");

  if (results.length > 0) {
    mainContent.innerHTML = `
      <h2>Search Results for "${query}"</h2>
      <ul class="song-list">
        ${results
          .map(
            (song, index) => `
          <li class="song-item">
            <img src="${song.albumArt}" alt="${song.title} Album Art" class="album-art">
            <div>
              <p>${song.title} - ${song.artist}</p>
              <button onclick="playSong(${allSongs.indexOf(song)})" class="play-btn"><i class="fas fa-play"></i></button>
              ${
                isLoggedIn
                  ? `<button onclick="toggleLike(${allSongs.indexOf(
                      song
                    )})" class="like-btn">${
                      song.liked ? "Unlike" : "Like"
                    }</button>`
                  : ""
              }
            </div>
          </li>`
          )
          .join("")}
      </ul>
    `;
  } else {
    mainContent.innerHTML = `<h2>No results found for "${query}"</h2>`;
  }
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

// Skips to the next song
function playNext() {
  currentSongIndex = (currentSongIndex + 1) % allSongs.length;
  playSong(currentSongIndex);
}

// Plays the previous song
function playPrevious() {
  currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
  playSong(currentSongIndex);
}

// Plays selected song
function playSong(index) {
  const audioPlayer = document.getElementById("audioPlayer");
  const selectedSong = allSongs[index];
  if (audioPlayer.src !== selectedSong.file) {
    audioPlayer.src = selectedSong.file;
    currentSongIndex = index;
  }
  if (audioPlayer.paused) {
    audioPlayer.play();
    isPlaying = true;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById("playPauseBtn").innerHTML = '<i class="fas fa-play"></i>';
  }
}

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
  users[email] = { email, password, name, dob };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created successfully. Please log in.");
}

// Login function
function showLogin() {
  const email = prompt("Enter your email:");
  const password = prompt("Enter your password:");
  if (users[email] && users[email].password === password) {
    isLoggedIn = true;
    currentUser = users[email];
    alert(`Welcome back, ${currentUser.name}!`);
    document.getElementById("accountOptions").innerHTML = `
      <a href="#" onclick="showAccount()" class="nav-link">Account</a>`;
  } else {
    alert("Invalid email or password.");
  }
}

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

function logout() {
  isLoggedIn = false;
  currentUser = null;
  document.getElementById("accountOptions").innerHTML = `
    <a href="#" onclick="showSignup()" class="nav-link">Sign Up</a>
    <a href="#" onclick="showLogin()" class="nav-link">Log In</a>`;
  showHome();
}

// Initialize Navbar
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn) {
    document.getElementById("accountOptions").innerHTML = `
      <a href="#" onclick="showAccount()" class="nav-link">Account</a>`;
  } else {
    document.getElementById("accountOptions").innerHTML = `
      <a href="#" onclick="showSignup()" class="nav-link">Sign Up</a>
      <a href="#" onclick="showLogin()" class="nav-link">Log In</a>`;
  }
});