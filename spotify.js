let currentSong = new Audio();
let songs = [];
let currFolder = "";

function timeFormat(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00 : 00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`./CloneSpotify/${folder}/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = ""; 
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="./Images/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Manan</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="./Images/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            const trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playmusic(trackName);
        });
    });

    return  songs;
}

const playmusic = (track, pause = false) => {
    currentSong.src = `./CloneSpotify/CloneSpotify/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        playbtn.src = "./Images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`./CloneSpotify/CloneSpotify/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let albumInfo = await fetch(`./CloneSpotify/CloneSpotify/songs/${folder}/info.json`);
            let response = await albumInfo.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10.75" fill="#1fdf64" stroke="#1fdf64" stroke-width="0.5" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 12L9.5 8V16L17.5 12Z" fill="black" />
                        </svg>
                    </div>
                    <img src="./CloneSpotify/CloneSpotify/songs/${folder}/cover.jpeg" alt="Cover Image">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach((card) => {
        card.addEventListener("click", async (e) => {
            const folder = e.currentTarget.dataset.folder;
            await getSongs(`songs/${folder}`);
            playmusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/cs"); 
    playmusic(songs[0], true);

    displayAlbums();

    playbtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playbtn.src = "./Images/pause.svg";
        } else {
            currentSong.pause();
            playbtn.src = "./Images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${timeFormat(currentSong.currentTime)} / ${timeFormat(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0';
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-120%';
    });

    previousbtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    nextbtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume > img").addEventListener("click",e=>{
        if(e.target.src.includes("./Images/volume.svg")){
            e.target.src= e.target.src.replace("./Images/volume.svg","./Images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }else{
            e.target.src= e.target.src.replace("./Images/mute.svg","./Images/volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
}

main();

