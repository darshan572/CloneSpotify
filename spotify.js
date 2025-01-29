let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Format time in mm:ss
function timeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from a specific folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        // Adjust the fetch path based on your folder structure
        let response = await fetch(`https://darshan572.github.io/CloneSpotify/songs/${folder}/`); // Ensure this path matches your structure
        if (!response.ok) throw new Error('Network response was not ok');

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");

        songs = Array.from(as)
            .filter(element => element.href.endsWith(".mp3"))
            .map(element => decodeURIComponent(element.href.split(`/${folder}/`).pop()));

        console.log('Fetched songs:', songs);

        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="./Images/music.svg" alt="">
                    <div class="info">
                        <div>${song.replace(/%20/g, " ")}</div>
                        <div>Unknown Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="./Images/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Set event listeners for each song item
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
    currentSong.src = `https://darshan572.github.io/CloneSpotify/songs/${currFolder}/${track}`; // Ensure this path is correct
    if (!pause) {
        currentSong.play().catch(error => console.error('Error playing song:', error));
        document.querySelector("#playbtn").src = "./Images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Display albums available
async function displayAlbums() {
    try {
        let response = await fetch("https://darshan572.github.io/CloneSpotify/songs/");
        if (!response.ok) throw new Error('Network response was not ok');

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        cardContainer.innerHTML = "";
        for (let e of anchors) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                let albumInfoResponse = await fetch(`https://darshan572.github.io/CloneSpotify/songs/${folder}/info.json`);
                if (!albumInfoResponse.ok) continue;

                let albumInfo = await albumInfoResponse.json();
                cardContainer.innerHTML += `
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.75" fill="#1fdf64" stroke="#1fdf64" stroke-width="0.5" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 12L9.5 8V16L17.5 12Z" fill="black" />
                            </svg>
                        </div>
                        <img src="https://darshan572.github.io/CloneSpotify/songs/${folder}/cover.jpeg" alt="Cover Image">
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description}</p>
                    </div>`;
            } catch (error) {
                console.warn(`Error fetching album info for ${folder}:`, error);
            }
        }

        // Set event listeners for album cards
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
    await getSongs("happy"); // Adjusted to just the folder name if it's directly under "songs"
    displayAlbums();

    // Play button functionality
    document.querySelector("#playbtn").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#playbtn").src = "./Images/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#playbtn").src = "./Images/play.svg";
        }
    });

    // Next button functionality
    document.querySelector("#nextbtn").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) playmusic(songs[index + 1]);
    });

    // Previous button functionality
    document.querySelector("#previousbtn").addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index > 0) playmusic(songs[index - 1]);
    });
}

// Initialize the application
main();
