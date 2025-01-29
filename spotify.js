async function getSongs(folder) {
    currFolder = folder;
    try {
        let response = await fetch(`./${folder}/`);  // Changed to `./${folder}/`
        if (!response.ok) throw new Error('Network response was not ok');
        
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");

        songs = Array.from(as)
            .filter(element => element.href.endsWith(".mp3"))
            .map(element => element.href.split(`/${folder}/`)[1]);

        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = ""; 
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="Images/music.svg" alt="">
                    <div class="info">
                        <div>${decodeURIComponent(song.replace(/%20/g, " "))}</div>
                        <div>Manan</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="Images/play.svg" alt="">
                    </div>
                </li>`;
        }

        Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", () => {
                const trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
                playmusic(trackName);
            });
        });

    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playmusic = (track, pause = false) => {
    currentSong.src = `./${currFolder}/${track}`;  // Changed to `./${currFolder}/${track}`
    if (!pause) {
        currentSong.play().catch(error => console.error('Error playing song:', error));
        playbtn.src = "Images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        let a = await fetch(`./songs/`);  // Changed to `./songs/`
        if (!a.ok) throw new Error('Network response was not ok');

        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        Array.from(anchors).forEach(async (e) => {
            if (e.href.includes("songs")) {
                let folder = e.href.split("/").slice(-2)[0];
                let albumInfoResponse = await fetch(`./songs/${folder}/info.json`);  // Changed to `./songs/${folder}/info.json`
                if (!albumInfoResponse.ok) throw new Error('Network response was not ok');

                let albumInfo = await albumInfoResponse.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.75" fill="#1fdf64" stroke="#1fdf64" stroke-width="0.5" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 12L9.5 8V16L17.5 12Z" fill="black" />
                            </svg>
                        </div>
                        <img src="./songs/${folder}/cover.jpeg" alt="Cover Image">  <!-- Changed to `./songs/${folder}/cover.jpeg` -->
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description}</p>
                    </div>`;
            }
        });

        Array.from(document.getElementsByClassName("card")).forEach((card) => {
            card.addEventListener("click", async (e) => {
                const folder = e.currentTarget.dataset.folder;
                await getSongs(`songs/${folder}`);
                playmusic(songs[0]);
            });
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}
