// Referencias globales al DOM
const currentAudio = document.getElementById("audio-player");
const playPauseButton = document.getElementById("play-pause-btn");
const playPauseIcon = document.getElementById("play-pause-icon");
const loopButton = document.getElementById("loop-btn");
const loopIcon = document.getElementById("loop-icon");
const shuffleButton = document.getElementById("shuffle-btn");
const shuffleIcon = shuffleButton.querySelector("img");
const progressBar = document.getElementById("progress-bar");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
let currentIndex = -1; // Índice de la canción actual
let songList = []; // Lista de canciones visibles en All Songs
let isShuffle = false; // Estado de Shuffle
let loopMode = 0; // 0: Sin loop, 1: Loop One, 2: Loop All

function adjustMainPadding() {
    const footer = document.getElementById('music-player');
    const main = document.querySelector('main');

    if (footer && main) {
        const footerHeight = footer.offsetHeight; // Altura dinámica del footer
        main.style.paddingBottom = `${footerHeight}px`; // Aplica la altura al padding inferior
    }
}

// Ajusta el padding al cargar la página y al redimensionar la ventana
window.addEventListener('load', adjustMainPadding);
window.addEventListener('resize', adjustMainPadding);


// Función para reproducir una canción
function playSong(audioUrl, title, artist, cover, index) {
    if (!audioUrl) {
        console.error("Invalid audio URL");
        return;
    }

    // Buscar la posición de la canción en songList si no se proporciona el índice
    if (index === undefined) {
        index = songList.findIndex(song => song.audioUrl === audioUrl);
        if (index === -1) {
            console.error("Song not found in songList");
            return;
        }
    }

    // Actualizar el índice global
    currentIndex = index;

    // Configurar la nueva canción
    currentAudio.src = audioUrl;
    playerTitle.textContent = title || "Unknown Title";
    playerArtist.textContent = artist || "Unknown Artist";
    playerCover.src = cover || "/static/music/default_cover.png";

    // Reproducir la canción
    currentAudio.play().catch(err => console.error("Error playing audio:", err));
    
}



// Botón Play/Pause
currentAudio.addEventListener("play", () => {
    playPauseIcon.src = "/static/music/icons/pause.png";
    playPauseButton.setAttribute("aria-label", "Pause");
});

currentAudio.addEventListener("pause", () => {
    playPauseIcon.src = "/static/music/icons/play.png";
    playPauseButton.setAttribute("aria-label", "Play");
});

playPauseButton.addEventListener("click", () => {
    if (currentAudio.paused) {
        currentAudio.play();
    } else {
        currentAudio.pause();
    }
});

// Asegurarte de que la imagen cambie cuando termine la canción
document.addEventListener("DOMContentLoaded", () => {
    playPauseIcon.src = "/static/music/icons/play.png"; // Ícono inicial
    playPauseButton.textContent = ""; // Elimina texto residual
    playPauseButton.appendChild(playPauseIcon); // Asegura que solo tenga el ícono
});


// Barra de progreso
currentAudio.addEventListener("timeupdate", () => {
    if (currentAudio.duration) {
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.value = progress;
        // Actualiza el relleno visual de la barra
        progressBar.style.background = `linear-gradient(to right, #007bff ${progress}%, #ddd ${progress}%)`;
    }
});


progressBar.addEventListener("input", () => {
    if (currentAudio.duration) {
        currentAudio.currentTime = (progressBar.value / 100) * currentAudio.duration;
    }
});


// Manejo del fin de una canción
currentAudio.addEventListener("ended", () => {
    if (loopMode === 1) {
        // Loop One: Repite la canción actual
        currentAudio.currentTime = 0;
        currentAudio.play();
    } else if (currentIndex < songList.length - 1) {
        // Avanza a la siguiente canción
        document.getElementById("next-btn").click();
    } else if (loopMode === 2) {
        // Loop All
        currentIndex = 0;
        const firstSong = songList[currentIndex];
        playSong(firstSong.audioUrl, firstSong.title, firstSong.artist, firstSong.cover, currentIndex);
    } else {
        // Sin loop: Detener reproducción
        playPauseIcon.src = "/static/music/icons/play.png"; // Cambia al ícono de Play
        playPauseButton.setAttribute("aria-label", "Play"); // Actualiza accesibilidad

        // Asegúrate de que no haya texto en el botón
        playPauseButton.textContent = ""; 
        playPauseButton.appendChild(playPauseIcon);

        // Restablece el progreso
        progressBar.value = 0;
    }
});


// Botón Next
document.getElementById("next-btn").addEventListener("click", () => {
    if (songList.length === 0) return;

    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * songList.length);
    } else {
        currentIndex = (currentIndex + 1) % songList.length;
    }

    const nextSong = songList[currentIndex];
    playSong(nextSong.audioUrl, nextSong.title, nextSong.artist, nextSong.cover, currentIndex);
});

// Botón Prev
document.getElementById("prev-btn").addEventListener("click", () => {
    if (songList.length === 0) return;

    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * songList.length);
    } else {
        currentIndex = (currentIndex - 1 + songList.length) % songList.length;
    }

    const prevSong = songList[currentIndex];
    playSong(prevSong.audioUrl, prevSong.title, prevSong.artist, prevSong.cover, currentIndex);
});

// Shuffle
shuffleButton.addEventListener("click", () => {
    isShuffle = !isShuffle; // Cambia el estado entre activado y desactivado
    shuffleIcon.src = isShuffle
        ? "/static/music/icons/shuffle_on.png" // Ícono de Shuffle activado
        : "/static/music/icons/shuffle_off.png";

    if (isShuffle) {
        songList.sort(() => Math.random() - 0.5); // Mezclar canciones
    } else {
        songList.sort((a, b) => a.index - b.index); // Restaurar orden original
    }
});

// Loop
loopButton.addEventListener("click", () => {
    loopMode = (loopMode + 1) % 3; // Ciclar entre 0, 1 y 2
    if (loopMode === 0) {
        loopIcon.src = "/static/music/icons/loop_off.png"; // Loop Off
    } else if (loopMode === 1) {
        loopIcon.src = "/static/music/icons/loop_one.png"; // Loop One
    } else if (loopMode === 2) {
        loopIcon.src = "/static/music/icons/loop_all.png"; // Loop All
    }
});

// Inicializar canciones visibles en All Songs
document.addEventListener("DOMContentLoaded", () => {
    const songElements = document.querySelectorAll("li[data-index]");
    songList = Array.from(songElements).map((song, idx) => ({
        audioUrl: song.querySelector("button").getAttribute("onclick").match(/'(.*?)'/)[1],
        title: song.querySelector("h3").textContent,
        artist: song.querySelector("p").textContent,
        cover: song.querySelector("img")?.src || "/static/music/default_cover.png",
        index: idx
    }));
});

document.addEventListener("DOMContentLoaded", () => {
    const songElements = document.querySelectorAll("li[data-index]");
    songList = Array.from(songElements).map((song, idx) => ({
        audioUrl: song.querySelector("button").getAttribute("onclick").match(/'(.*?)'/)[1],
        title: song.querySelector("h3").textContent,
        artist: song.querySelector("p").textContent,
        cover: song.querySelector("img")?.src || "/static/music/default_cover.png",
        index: idx
    }));
});
// Navegación dinámica
document.addEventListener("DOMContentLoaded", () => {
    // Cargar la página principal (song_list) al iniciar la aplicación
    navigateTo(null, "/");
});

function navigateTo(event, url) {
    if (event) event.preventDefault(); // Evitar recargar la página si viene de un clic

    savePlayerState(); // Guarda el estado del reproductor antes de navegar

    fetch(url, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    })
        .then((response) => {
            if (response.ok) return response.text();
            throw new Error("Failed to load page.");
        })
        .then((html) => {
            document.getElementById("content").innerHTML = html;

            // Detectar si hay canciones en la vista actual
            const songElements = document.querySelectorAll("li[data-index]");
            if (songElements.length > 0) {
                // Si hay canciones, inicializar el nuevo contexto
                if (url.includes("/favorites/")) {
                    initializeSongs("#favorites-list li"); // Contexto exclusivo para favoritos
                } else if (url.includes("/playlists/")) {
                    initializeSongs("#playlist-songs li"); // Contexto para playlists
                } else if (url === "/") {
                    initializeSongs("ul li[data-index]"); // Contexto de song_list
                } else {
                    console.warn("No valid context detected for URL:", url);
                }
            } else {
                console.log("No songs found in the current view. Retaining the current context.");
                // No cambiar el contexto si no hay canciones
            }
        })
        .catch((error) => console.error("Error navigating:", error));
}



document.addEventListener('submit', function (event) {
    const form = event.target;
    if (form.id === 'create-playlist-form') {
        event.preventDefault();
        const formData = new FormData(form);
        fetch('/playlists/create/', {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    navigateTo(event, '/playlists/');
                }
            })
            .catch(error => console.error("Error creating playlist:", error));
    }
});

// Guardar el estado del reproductor
function savePlayerState() {
    const playerState = {
        currentIndex,
        currentTime: currentAudio.currentTime,
        songList,
    };
    localStorage.setItem("playerState", JSON.stringify(playerState));
}

// Restaurar el estado del reproductor
function restorePlayerState() {
    const playerState = JSON.parse(localStorage.getItem("playerState"));
    if (playerState) {
        currentIndex = playerState.currentIndex;
        currentAudio.currentTime = playerState.currentTime || 0;
        songList = playerState.songList || [];
        if (songList[currentIndex]) {
            const song = songList[currentIndex];
            playSong(song.audioUrl, song.title, song.artist, song.cover, currentIndex);
        }
    }
}

// Inicializar canciones en la vista actual
function initializeSongs() {
    const songElements = document.querySelectorAll("li[data-index], #favorites-list li, #playlist-songs li");

    if (songElements.length > 0) {
        songList = Array.from(songElements).map((song, idx) => ({
            audioUrl: song.querySelector("button[onclick^='playSong']").getAttribute("onclick").match(/'(.*?)'/)[1],
            title: song.querySelector("h3").textContent,
            artist: song.querySelector("p").textContent,
            cover: song.querySelector("img")?.src || "/static/music/default_cover.png",
            index: idx,
        }));
    } else {
        console.warn("No songs found in the current view.");
        songList = []; // Vaciar la lista si no hay canciones visibles
    }
}



// Restaurar el estado del reproductor al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    restorePlayerState();
    initializeSongs();
});


let selectedSongId = null;

// Función para abrir el modal de playlists
function openPlaylistModal(songId) {
    selectedSongId = songId;

    // Mostrar el modal
    const modal = document.getElementById("playlist-modal");
    modal.style.display = "flex";

    // Obtener la lista de playlists
    fetch("/playlists/json/", {
        headers: {
            "X-Requested-With": "XMLHttpRequest" // Solicitud AJAX
        }
    })
        .then(response => response.json())
        .then(data => {
            const playlistList = document.getElementById("playlist-list");
            playlistList.innerHTML = ""; // Limpiar la lista

            // Agregar cada playlist como opción
            data.playlists.forEach(playlist => {
                const li = document.createElement("li");
                li.textContent = playlist.name;
                li.onclick = () => addToPlaylist(playlist.id);
                playlistList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching playlists:", error));
}

// Abrir el modal de edición de playlist
function openEditPlaylistModal(playlistId) {
    const modal = document.getElementById("edit-playlist-modal");
    modal.style.display = "flex";

    // Obtener canciones de la playlist específica
    fetch(`/playlists/${playlistId}/songs/`, {
        headers: {
            "X-Requested-With": "XMLHttpRequest" // Solicitud AJAX
        }
    })
        .then(response => response.json())
        .then(data => {
            const editPlaylistSongs = document.getElementById("edit-playlist-songs");
            editPlaylistSongs.innerHTML = ""; // Limpiar la lista

            // Listar canciones con opciones para eliminarlas
            data.songs.forEach(song => {
                const li = document.createElement("li");
                li.textContent = `${song.title}`;
                const removeButton = document.createElement("button");
                removeButton.textContent = "Remove";
                removeButton.onclick = () => removeFromPlaylist(playlistId, song.id, li);
                li.appendChild(removeButton);
                editPlaylistSongs.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching playlist songs:", error));
}

// Cerrar el modal de edición
function closeEditPlaylistModal() {
    const modal = document.getElementById("edit-playlist-modal");
    modal.style.display = "none";
}

// Eliminar una canción de una playlist
function removeFromPlaylist(playlistId, songId, listItem) {
    fetch(`/playlists/${playlistId}/remove-song/${songId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                listItem.remove(); // Eliminar la canción de la lista visualmente
            } else {
                console.error("Failed to remove song:", data.error);
            }
        })
        .catch(error => console.error("Error removing song:", error));
}
function deletePlaylist(playlistId) {
    if (confirm("Are you sure you want to delete this playlist?")) {
        fetch(`/playlists/${playlistId}/delete/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const playlistElement = document.querySelector(`button.delete-playlist-btn[onclick="deletePlaylist(${playlistId})"]`).closest("li");
                    if (playlistElement) playlistElement.remove();
                } else {
                    console.error("Failed to delete playlist:", data.error);
                }
            })
            .catch((error) => console.error("Error deleting playlist:", error));
    }
}

// Cerrar el modal de añadir a playlist
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("playlist-modal").style.display = "none";
});
function closeEditPlaylistModal() {
    const modal = document.getElementById("edit-playlist-modal");
    modal.style.display = "none";
}

// Cerrar el modal
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("playlist-modal").style.display = "none";
});


// Agrega la canción seleccionada a la playlist
function addToPlaylist(playlistId) {
    if (!selectedSongId) {
        console.error("No song selected to add to playlist.");
        return;
    }

    fetch("/playlists/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(), // Asegúrate de obtener el token CSRF
        },
        body: JSON.stringify({
            playlist_id: playlistId,
            song_id: selectedSongId
        })
    })
        .then(response => response.json())
        .then(data => {
            
            // Cerrar el modal
            document.getElementById("playlist-modal").style.display = "none";
        })
        .catch(error => console.error("Error adding song to playlist:", error));
}

// Función para obtener el token CSRF
function getCsrfToken() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("csrftoken=")) {
            return cookie.split("=")[1];
        }
    }
    return "";
}

function toggleFavorite(songId) {
    fetch(`/songs/${songId}/toggle-favorite/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const icon = document.querySelector(`button[onclick="toggleFavorite(${songId})"] .favorite-icon`);
                
                if (window.location.pathname === "/favorites/") {
                    if (!data.is_favorite) {
                        // Eliminar la canción del DOM en la vista de favoritos
                        const songElement = icon.closest("li");
                        if (songElement) songElement.remove();
                    }
                } else {
                    // Cambiar la clase del ícono en otras vistas
                    if (icon) {
                        icon.classList.toggle("add", !data.is_favorite);
                        icon.classList.toggle("remove", data.is_favorite);
                    }
                }
            } else {
                console.error("Failed to toggle favorite:", data.error);
            }
        })
        .catch((error) => console.error("Error toggling favorite:", error));
}



// Helper para obtener el token CSRF
function getCookie(name) {
    const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1];
    return cookieValue;
}


// Obtener el elemento del slider de volumen
const volumeSlider = document.getElementById("volume-slider");

// Establecer el volumen inicial
currentAudio.volume = volumeSlider.value;

// Actualizar el volumen del reproductor cuando el usuario mueva el slider
volumeSlider.addEventListener("input", () => {
    currentAudio.volume = volumeSlider.value;
});

// Al cargar la página, restaurar el volumen guardado
document.addEventListener("DOMContentLoaded", () => {
    const savedVolume = localStorage.getItem("playerVolume");
    if (savedVolume) {
        currentAudio.volume = savedVolume;
        volumeSlider.value = savedVolume;
        const volume = savedVolume * 100;
        volumeSlider.style.background = `linear-gradient(to right, #007bff ${volume}%, #ddd ${volume}%)`;
    }
});
// Guardar el volumen actual en LocalStorage
volumeSlider.addEventListener("input", () => {
    currentAudio.volume = volumeSlider.value;
    const volume = volumeSlider.value * 100;
    // Actualiza el relleno visual de la barra
    volumeSlider.style.background = `linear-gradient(to right, #007bff ${volume}%, #ddd ${volume}%)`;
    // Guardar el volumen actual en LocalStorage
    localStorage.setItem("playerVolume", volumeSlider.value);
});
