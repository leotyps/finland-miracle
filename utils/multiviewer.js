//multiviewer.js


function compressStreamData(url, platform) {
    const streamId = generateShortId(url);
    const streamData = {
        mpath: url,
        ptype: platform === 'showroom' ? 'sroom' : 'idnlv',
        exp: Date.now() + (3 * 60 * 60 * 1000)
    };
    localStorage.setItem(`stream_${streamId}`, JSON.stringify(streamData));
    return streamId;
}

function generateShortId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(-6);
}

function decompressStreamData(streamId) {
    const data = localStorage.getItem(`stream_${streamId}`);
    if (!data) return null;

    const streamData = JSON.parse(data);
    if (streamData.exp < Date.now()) {
        localStorage.removeItem(`stream_${streamId}`);
        return null;
    }
    return streamData;
}


const videoGrid = document.getElementById('videoGrid');
const addStreamBtn = document.getElementById('addStreamBtn');
const streamListModal = document.getElementById('streamListModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const streamList = document.getElementById('streamList');

let activeStreams = new Set();
let activeHlsPlayers = new Map();
let currentRow = 2;
const minRow = 2;
const maxRow = 4;

addStreamBtn.addEventListener('click', () => {
    streamListModal.style.display = 'flex';
    fetchAndDisplayLiveStreams();
});

closeModalBtn.addEventListener('click', () => {
    streamListModal.style.display = 'none';
});

streamListModal.addEventListener('click', (e) => {
    if (e.target === streamListModal) {
        streamListModal.style.display = 'none';
    }
});


function createPlayButton(videoElement) {
    const playContainer = document.createElement('div');
    playContainer.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50';
    
    const playButton = document.createElement('button');
    playButton.className = 'p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors';
    playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    `;

    playContainer.appendChild(playButton);
    return playContainer;
}

function handleAutoplayError(error, videoElement) {
    if (error.name === 'NotAllowedError') {
        const playButton = createPlayButton(videoElement);
        const videoContainer = videoElement.parentElement;
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(playButton);

        playButton.addEventListener('click', async () => {
            try {
                await videoElement.play();
                playButton.remove();
            } catch (err) {
                console.error('Error playing video after click:', err);
            }
        });
        return true;
    }
    return false;
}

async function playM3u8(url, videoElement) {
    return new Promise((resolve, reject) => {
        if (!videoElement) {
            reject(new Error('Video element not initialized'));
            return;
        }

        const savedVolume = localStorage.getItem('playerVolume') || 0.3;
        videoElement.volume = parseFloat(savedVolume);

        if (Hls.isSupported()) {
            let hls = activeHlsPlayers.get(videoElement.id);
            if (hls) {
                hls.destroy();
                activeHlsPlayers.delete(videoElement.id);
            }

            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(decodeURIComponent(url));
            hls.attachMedia(videoElement);
            activeHlsPlayers.set(videoElement.id, hls);

            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                try {
                    await videoElement.play();
                    resolve();
                } catch (error) {
                    if (handleAutoplayError(error, videoElement)) {
                        resolve();
                    } else {
                        reject(error);
                    }
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('Fatal HLS error:', data);
                    hls.destroy();
                    activeHlsPlayers.delete(videoElement.id);
                    reject(new Error('Fatal HLS error'));
                }
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = url;
            videoElement.addEventListener('canplay', async () => {
                try {
                    await videoElement.play();
                    resolve();
                } catch (error) {
                    if (handleAutoplayError(error, videoElement)) {
                        resolve();
                    } else {
                        reject(error);
                    }
                }
            });
        } else {
            reject(new Error('HLS not supported'));
        }

        videoElement.addEventListener('volumechange', () => {
            localStorage.setItem('playerVolume', videoElement.volume);
        });
    });
}


async function fetchAndDisplayLiveStreams() {
    try {
        const [idnResponse, showroomResponse] = await Promise.all([
            fetch('https://48intensapi.my.id/api/idnlive/jkt48'),
            fetch('http://localhost:3000/api/showroom/jekatepatlapan')
        ]);

        const idnData = await idnResponse.json();
        const showroomData = await showroomResponse.json();

        streamList.innerHTML = '';

        if (idnData.data?.length > 0) {
            const idnSection = document.createElement('div');
            idnSection.innerHTML = '<h4 class="text-sm font-semibold px-2 py-1 bg-gray-100">IDN Live</h4>';
            streamList.appendChild(idnSection);
            idnData.data.forEach(stream => addStreamToList(stream, 'idn'));
        }

        if (showroomData?.length > 0) {
            const showroomSection = document.createElement('div');
            showroomSection.innerHTML = '<h4 class="text-sm font-semibold px-2 py-1 bg-gray-100 mt-2">SHOWROOM</h4>';
            streamList.appendChild(showroomSection);
            showroomData.forEach(stream => addStreamToList(stream, 'showroom'));
        }

        if (!idnData.data?.length && !showroomData?.length) {
            streamList.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-gray-500 text-sm">No live streams available</p>
                </div>`;
        }
    } catch (error) {
        console.error('Error fetching streams:', error);
        streamList.innerHTML = `
            <div class="text-center py-4">
                <p class="text-red-500 text-sm">Error loading streams</p>
            </div>`;
    }
}

function addStreamToList(stream, platform) {
    const streamId = platform === 'idn' ? 
        stream.user.username.replace('jkt48_', '') :
        stream.room_url_key.replace('JKT48_', '').toLowerCase();
    
    const streamUrl = platform === 'idn' ?
        `https://jkt48showroom-api.my.id/proxy?url=${encodeURIComponent(stream.stream_url)}` :
        stream.streaming_url_list.find(s => s.label === 'original quality')?.url;

    if (!streamUrl) {
        console.error('Stream URL not found');
        return;
    }

    const compressedId = compressStreamData(streamUrl, platform);
    
    const listItem = document.createElement('div');
    listItem.className = 'flex items-center justify-between p-2 hover:bg-gray-50';
    listItem.innerHTML = `
        <div class="flex items-center gap-2">
            <img src="${platform === 'idn' ? stream.user.avatar : stream.image_square}" 
                class="w-8 h-8 rounded-full object-cover">
            <div>
                <div class="text-sm font-medium">${platform === 'idn' ? stream.user.name : stream.main_name}</div>
                <div class="text-xs text-gray-500">
                    ${platform === 'idn' ? (stream.view_count || 0) : (stream.view_num || 0)} viewers
                </div>
            </div>
        </div>
        <button class="add-stream-btn px-3 py-1 ${
            platform === 'idn' ? 'bg-yellow-500' : 'bg-rose-500'
        } text-white rounded-full hover:opacity-80 text-xs"
                ${activeStreams.has(compressedId) ? 'disabled' : ''}>
            ${activeStreams.has(compressedId) ? 'Added' : 'Add'}
        </button>
    `;


    const addButton = listItem.querySelector('.add-stream-btn');
    addButton.addEventListener('click', () => {
        if (!activeStreams.has(compressedId)) {
            addVideoPlayer(compressedId, platform, stream);
            addButton.innerHTML = '<i class="fas fa-check"></i>';
            addButton.disabled = true;
            streamListModal.style.display = 'none';
        }
    });

    streamList.appendChild(listItem);
}


function addVideoPlayer(streamId, platform, streamData) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'relative aspect-video rounded-lg sm:rounded-xl overflow-hidden';
    
    const video = document.createElement('video');
    video.className = 'w-full h-full';
    video.id = `video-${streamId}`;
    video.controls = true;
    video.playsInline = true;

    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume) video.volume = parseFloat(savedVolume);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute top-1 right-1 bg-red-500 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center hover:bg-red-600 z-10';
    closeBtn.innerHTML = '<i class="fas fa-times text-[10px] sm:text-xs"></i>';
    closeBtn.onclick = () => {
        const hls = activeHlsPlayers.get(video.id);
        if (hls) {
            hls.destroy();
            activeHlsPlayers.delete(video.id);
        }
        videoContainer.remove();
        activeStreams.delete(streamId);
        rearrangeGrid();
    };

    videoContainer.appendChild(video);
    videoContainer.appendChild(closeBtn);

    if (videoGrid.querySelector('.text-center')) {
        videoGrid.innerHTML = '';
    }
    videoGrid.appendChild(videoContainer);

    activeStreams.add(streamId);
    
    const streamUrl = platform === 'showroom' 
        ? streamData.streaming_url_list.find(s => s.label === 'original quality')?.url
        : `https://jkt48showroom-api.my.id/proxy?url=${encodeURIComponent(streamData.stream_url)}`;

    if (streamUrl) {
        playM3u8(streamUrl, video).catch(error => {
            console.error('Error playing stream:', error);
            showStreamError(video);
        });
    } else {
        showStreamError(video);
    }

    rearrangeGrid();
}

function rearrangeGrid() {
    const streamCount = activeStreams.size;
    
    if (streamCount === 0) {
        videoGrid.innerHTML = `
            <div class="text-center px-4">
                <i class="fas fa-plus-circle text-lg sm:text-xl text-blue-600/50"></i>
                <p class="text-sm sm:text-lg mt-1 text-blue-600/50">Click button icon + to add<br>multi streams view</p>
            </div>`;
        return;
    }

    const isMobile = window.innerWidth < 640;
    const columns = isMobile ? 1 : Math.ceil(streamCount / currentRow);
    
    videoGrid.className = `grid gap-1.5 sm:gap-2 p-1.5 sm:p-2 ${
        isMobile ? 'grid-cols-1' :
        columns === 1 ? 'grid-cols-1' :
        columns === 2 ? 'grid-cols-2' :
        columns === 3 ? 'grid-cols-3' :
        'grid-cols-4'
    }`;

    const gridItems = videoGrid.querySelectorAll('.aspect-video');
    gridItems.forEach(item => {
        const heightPercentage = isMobile ? 30 : (100 / currentRow) - (2 * currentRow);
        item.style.height = `calc(${heightPercentage}vh - ${isMobile ? 10 : 20/currentRow}px)`;
    });
}

document.getElementById('increaseRow').addEventListener('click', () => {
    if (currentRow < maxRow) {
        currentRow++;
        document.getElementById('rowCount').textContent = currentRow;
        rearrangeGrid();
    }
});

document.getElementById('decreaseRow').addEventListener('click', () => {
    if (currentRow > minRow) {
        currentRow--;
        document.getElementById('rowCount').textContent = currentRow;
        rearrangeGrid();
    }
});

function playStream(streamId, videoElement) {
    const streamData = JSON.parse(localStorage.getItem(`stream_${streamId}`));
    if (!streamData || streamData.exp < Date.now()) {
        return showStreamError(videoElement);
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(streamData.mpath);
        hls.attachMedia(videoElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) showStreamError(videoElement);
        });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = streamData.mpath;
        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(() => showStreamError(videoElement));
        });
    } else {
        showStreamError(videoElement);
    }
}

function showStreamError(videoElement) {
    const container = videoElement.parentElement;
    container.innerHTML = `
        <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-red-500 text-sm">Error loading stream</p>
        </div>`;
}

rearrangeGrid();