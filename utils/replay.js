const style = document.createElement('style');
style.textContent = `
    html, body {
    overflow-x: hidden;
    margin-right: 0 !important;
    }
    body.no-scroll {
    overflow: hidden;
    padding-right: ${getScrollbarWidth()}px;
    }
    .popup-open {
    margin-right: ${getScrollbarWidth()}px;
    }
    #replayContainer {
    min-height: calc(100vh - 300px);
    }
    `;
document.head.appendChild(style);

const API_KEYS = [
    'AIzaSyBxkZI8EOw8B4HxuLThV2AFBTXOMfJHXMQ',
    'AIzaSyAXVRn9s20OIguK0ilKPr_G0ep7d0p6xHc',
    'AIzaSyB4HVD0GMr9K03hpJkPBLexYg3Zfjxhyw0',
    'AIzaSyDs4INzDhT8EeWBOPUwJacVqujdFzaqJoE',
    'AIzaSyC7MzbUHRPU5HTSvPtiosh9r0yYr_4ZZ7g',
];

let currentKeyIndex = 0;

const CACHE_DURATION = 3600000;
const CACHE_KEY_PREFIX = 'yt_cache_';

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

function getNextApiKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return API_KEYS[currentKeyIndex];
}

function getCacheKey(endpoint) {
    return CACHE_KEY_PREFIX + btoa(endpoint);
}

function getFromCache(endpoint) {
    const key = getCacheKey(endpoint);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
}

function setCache(endpoint, data) {
    const key = getCacheKey(endpoint);
    localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
}

async function fetchYouTubeData(endpoint) {
    const cachedData = getFromCache(endpoint);
    if (cachedData) return cachedData;

    let attempts = API_KEYS.length;
    while (attempts > 0) {
        try {
            const apiKey = getNextApiKey();
            const response = await fetch(`${endpoint}&key=${apiKey}`);

            if (response.status === 403) {
                attempts--;
                continue;
            }

            const data = await response.json();
            if (data.error) {
                attempts--;
                continue;
            }

            setCache(endpoint, data);
            return data;
        } catch (error) {
            attempts--;
            console.error('YouTube API Error:', error);
        }
    }
    throw new Error('All API keys exhausted');
}

async function loadReplayContent(tab) {
    const scrollPosition = window.scrollY;
    const container = document.getElementById('replayContainer');
    container.style.minHeight = `${container.offsetHeight}px`;

    container.innerHTML = `
        <div class="col-span-full flex justify-center items-center">
            <div class="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-rose-300 border-t-transparent"></div>
        </div>
    `;

    try {
        let endpoint = '';
        if (tab === 'theater') {
            endpoint = 'https://www.googleapis.com/youtube/v3/search?channelId=UCT7GobiObAxIScUIcgNxCqQ&q=FULL SHOW&part=snippet,id&order=date&maxResults=50';
        } else if (tab === 'livestream') {
            endpoint = 'https://www.googleapis.com/youtube/v3/search?channelId=UCFUXOzBCTnF-k00cBsmKDtA&q=LIVE&part=snippet,id&order=date&maxResults=20';
        }

        const data = await fetchYouTubeData(endpoint);

        if (data.items?.length > 0) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${data.items.map(item => `
                            <div class="bg-white rounded-3xl shadow-lg overflow-hidden">
                                <div class="cursor-pointer" onclick="showVideoPopup('${item.id.videoId}')">
                                    <div class="relative">
                                        <img src="${item.snippet.thumbnails.high.url}" 
                                            alt="${item.snippet.title}" 
                                            class="w-full h-48 object-cover">
                                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                            <p class="text-white text-sm font-medium line-clamp-2">${item.snippet.title}</p>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <div class="flex items-center justify-between">
                                            <p class="text-gray-600 text-xs font-semibold">
                                                ${new Date(item.snippet.publishTime).toLocaleDateString()}
                                            </p>
                                            <div class="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                                </svg>
                                                <span class="text-xs font-semibold text-gray-500 hover:text-rose-700">Watch Replay</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            if (!document.getElementById('videoPopup')) {
                const popupDiv = document.createElement('div');
                popupDiv.id = 'videoPopup';
                popupDiv.className = 'fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-4';
                popupDiv.innerHTML = `
                    <div class="relative bg-white rounded-3xl p-4 w-full md:w-4/5 lg:w-3/4 max-w-5xl">
                        <button onclick="closeVideoPopup()" class="absolute -top-4 -right-4 bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div class="relative pt-[56.25%]">
                            <iframe id="videoFrame" 
                                class="absolute top-0 left-0 w-full h-full rounded-lg" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                `;
                document.body.appendChild(popupDiv);
            }

            container.style.minHeight = '';
            window.scrollTo(0, scrollPosition);
        } else {
            container.innerHTML = `
                <div class="col-span-full text-center text-gray-500">
                    No replay content available
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-span-full text-center text-red-500">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

function showVideoPopup(videoId) {
    const popup = document.getElementById('videoPopup');
    const videoFrame = document.getElementById('videoFrame');
    document.body.classList.add('no-scroll');
    document.getElementById('replayContainer').classList.add('popup-open');
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
    popup.classList.remove('hidden');
    popup.classList.add('flex');
}

function closeVideoPopup() {
    const popup = document.getElementById('videoPopup');
    const videoFrame = document.getElementById('videoFrame');
    document.body.classList.remove('no-scroll');
    document.getElementById('replayContainer').classList.remove('popup-open');
    videoFrame.src = '';
    popup.classList.add('hidden');
    popup.classList.remove('flex');
}

function switchTab(tab) {
    const livestreamTab = document.getElementById('livestreamTab');
    const theaterTab = document.getElementById('theaterTab');

    [livestreamTab, theaterTab].forEach(button => {
        button.classList.remove('bg-rose-300', 'text-white');
        button.classList.add('text-gray-500', 'hover:text-gray-700');
    });

    const selectedButton = document.getElementById(`${tab}Tab`);
    selectedButton.classList.remove('text-gray-500', 'hover:text-gray-700');
    selectedButton.classList.add('bg-rose-300', 'text-white');

    loadReplayContent(tab);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVideoPopup();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    switchTab('livestream');
});