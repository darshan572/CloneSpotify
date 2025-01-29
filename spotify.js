let currentSong = new Audio();
let songs = [];
let currFolder = "";

const progressBar = document.querySelector(".progress-bar");
const progressFill = document.querySelector(".progress-fill");
const playTime = document.querySelector(".songtime");
const playButton = document.querySelector("#playbtn");

// Format time in mm:ss
function timeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from a specific folder using GitHub API
async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`https://api.github.com/repos/darshan572/CloneSpotify/contents/${folder}`);
        if (!response.ok) throw new Error('Network response was not ok');

        let data = await response.json();
        songs = data.filter(item => item.name.endsWith(".mp3")).map(item => decodeURIComponent(item.name));

        console.log('Fetched songs:', songs);

        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="Images/music.svg" alt="">
                    <div class="info">
                        <div>${song.replace(/%20/g, " ")}</div>
                        <div>Unknown Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="Images/play.svg" alt="">
                    </div>
                </li>`;
        }

        Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                playmusic(songs[index]);
            });
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Play selected track
const playmusic = (track, pause = false) => {
    currentSong.src = `https://raw.githubusercontent.com/darshan572/CloneSpotify/main/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play().catch(error => console.error('Error playing song:', error));
        playButton.src = "Images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    playTime.innerHTML = "00:00 / 00:00";

    // Update duration when metadata loads
    currentSong.addEventListener("loadedmetadata", () => {
        playTime.innerHTML = `00:00 / ${timeFormat(currentSong.duration)}`;
    });

    // Update progress bar during playback
    currentSong.addEventListener("timeupdate", updateProgress);
};

// Update playbar progress
function updateProgress() {
    let progress = (currentSong.currentTime / currentSong.duration) * 100;
    progressFill.style.width = `${progress}%`;
    playTime.innerHTML = `${timeFormat(currentSong.currentTime)} / ${timeFormat(currentSong.duration)}`;
}

// Seek when user clicks on the playbar
progressBar.addEventListener("click", (e) => {
    let offsetX = e.offsetX;
    let totalWidth = progressBar.clientWidth;
    let seekTime = (offsetX / totalWidth) * currentSong.duration;
    currentSong.currentTime = seekTime;
});

// Display albums using GitHub API
async function displayAlbums() {
    try {
        let response = await fetch("https://api.github.com/repos/darshan572/CloneSpotify/contents/songs");
        if (!response.ok) throw new Error('Network response was not ok');

        let data = await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let e of data) {
            let folder = e.name;
            try {
                let albumInfoResponse = await fetch(`https://api.github.com/repos/darshan572/CloneSpotify/contents/songs/${folder}/info.json`);
                if (!albumInfoResponse.ok) continue;

                let albumInfoData = await albumInfoResponse.json();
                let albumInfo = JSON.parse(atob(albumInfoData.content)); // Decode base64 content

                cardContainer.innerHTML += `
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.75" fill="#1fdf64" stroke="#1fdf64" stroke-width="0.5" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 12L9.5 8V16L17.5 12Z" fill="black" />
                            </svg>
                        </div>
                        <img src="https://raw.githubusercontent.com/darshan572/CloneSpotify/main/songs/${folder}/cover.jpeg" alt="Cover Image">
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description}</p>
                    </div>`;
            } catch (error) {
                console.warn(`Error fetching album info for ${folder}:`, error);
            }
        }

        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.folder;
                await getSongs(folder);
                if (songs.length > 0) playmusic(songs[0]);
            });
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

// Main function to initialize the app
async function main() {
    await getSongs("songs/happy");
    displayAlbums();

    // Play / Pause
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "Images/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "Images/play.svg";
        }
    });

    // Next Song
    document.querySelector("#nextbtn").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) playmusic(songs[index + 1]);
    });

    // Previous Song
    document.querySelector("#previousbtn").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index > 0) playmusic(songs[index - 1]);
    });

    // Update progress bar on time update
    currentSong.addEventListener("timeupdate", updateProgress);
}

main();
