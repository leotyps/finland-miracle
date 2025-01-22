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

const videoGrid = document.getElementById('videoGrid');
const addStreamBtn = document.getElementById('addStreamBtn');
const streamListModal = document.getElementById('streamListModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const streamList = document.getElementById('streamList');

let activeStreams = new Set();

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

async function fetchAndDisplayLiveStreams() {
    try {
        const [idnResponse, showroomResponse] = await Promise.all([
            fetch('https://48intensapi.my.id/api/idnlive/jkt48'),
            fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan')
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
        stream.streaming_url_list[0].url;

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
            addVideoPlayer(compressedId, platform);
            addButton.textContent = 'Added';
            addButton.disabled = true;
        }
    });

    streamList.appendChild(listItem);
}

function addVideoPlayer(streamId, platform) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'relative aspect-video rounded overflow-hidden';
    
    const video = document.createElement('video');
    video.className = 'w-full h-full';
    video.id = `video-${streamId}`;
    video.controls = true;
    video.playsInline = true;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 z-10';
    closeBtn.innerHTML = '<i class="fas fa-times text-xs"></i>';
    closeBtn.onclick = () => {
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
    playStream(streamId, video);
    rearrangeGrid();
}

function rearrangeGrid() {
    const streamCount = activeStreams.size;
    
    if (streamCount === 0) {
        videoGrid.innerHTML = `
            <div class="text-center">
                <i class="fas fa-plus-circle text-xl text-blue-600/50"></i>
                <p class="text-xl mt-1 text-blue-600/50">Click button icon + to add multi streams view</p>
            </div>`;
        return;
    }

    videoGrid.className = `grid gap-2 p-2 ${
        streamCount === 1 ? 'grid-cols-1' :
        streamCount === 2 ? 'grid-cols-2' :
        streamCount <= 4 ? 'grid-cols-2' :
        streamCount <= 6 ? 'grid-cols-3' :
        'grid-cols-4'
    }`;
}

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