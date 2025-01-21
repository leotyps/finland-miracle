let hls = null;
let player = null;
let video = null;

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

function showOfflineState() {
    const offlineContainer = document.createElement('div');
    offlineContainer.className = 'flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-lg';
    
    const offlineIcon = document.createElement('div');
    offlineIcon.className = 'text-gray-400 mb-4';
    offlineIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    `;

    const offlineText = document.createElement('h3');
    offlineText.className = 'text-lg font-medium text-gray-900 mb-2';
    offlineText.textContent = 'Room is Offline';

    const offlineDescription = document.createElement('p');
    offlineDescription.className = 'text-sm text-gray-500';
    offlineDescription.textContent = 'This room is currently not streaming. Please check back later.';

    offlineContainer.append(offlineIcon, offlineText, offlineDescription);
    
    const videoContainer = document.getElementById('liveStream').parentElement;
    videoContainer.innerHTML = '';
    videoContainer.appendChild(offlineContainer);
    
    // Update UI elements
    const elements = {
        'memberName': 'Room Offline',
        'streamTitle': 'No active stream',
        'viewCount': '-',
        'startTime': '-',
        'streamQuality': '-'
    };
    
    Object.entries(elements).forEach(([id, text]) => {
        document.getElementById(id).textContent = text;
    });
    
    document.getElementById('stageUsersList').classList.add('hidden');
}

function playM3u8(url) {
    return new Promise((resolve, reject) => {
        if (!video) {
            reject(new Error('Video element not initialized'));
            return;
        }

        if (Hls.isSupported()) {
            const savedVolume = localStorage.getItem('playerVolume') || 0.3;
            video.volume = parseFloat(savedVolume);
            
            if (hls) hls.destroy();

            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            const m3u8Url = decodeURIComponent(url);
            hls.loadSource(m3u8Url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().then(resolve).catch(reject);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('Fatal HLS error:', data);
                    hls.destroy();
                    reject(new Error('Fatal HLS error'));
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('canplay', () => {
                video.play().then(resolve).catch(reject);
            });
            video.volume = parseFloat(localStorage.getItem('playerVolume') || 0.3);
        } else {
            reject(new Error('HLS not supported'));
        }
    });
}

// Simplified player controls
const playerControls = {
    playPause: () => video?.paused ? video.play() : video.pause(),
    volumeUp: () => {
        if (video && video.volume <= 0.9) {
            video.volume += 0.1;
            localStorage.setItem('playerVolume', video.volume);
        }
    },
    volumeDown: () => {
        if (video && video.volume >= 0.1) {
            video.volume -= 0.1;
            localStorage.setItem('playerVolume', video.volume);
        }
    },
    fullscreen: () => {
        if (!video) return;
        const fullscreenFunc = video.requestFullscreen || 
                             video.mozRequestFullScreen || 
                             video.webkitRequestFullscreen;
        fullscreenFunc?.call(video);
    }
};

async function checkAndHandleStreamStatus(platform, memberName, streamId) {
    try {
        const apiEndpoint = platform === 'idn' 
            ? 'https://48intensapi.my.id/api/idnlive/jkt48'
            : 'https://48intensapi.my.id/api/showroom/jekatepatlapan';

        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${platform} data`);
        }

        const data = await response.json();
        const normalizedMemberName = memberName.toLowerCase();
        
        const streamData = platform === 'idn'
            ? data.data.find(stream => stream.user.username.replace('jkt48_', '').toLowerCase() === normalizedMemberName)
            : data.find(stream => stream.room_url_key.replace('JKT48_', '').toLowerCase() === normalizedMemberName);

        if (streamData) {
            if (platform === 'idn') {
                await updateIDNStreamInfo(streamData);
            } else {
                await updateShowroomStreamInfo(streamData);
            }
            
            const storedData = streamId ? decompressStreamData(streamId) : null;
            if (storedData?.mpath) {
                await playM3u8(storedData.mpath);
            }
        } else {
            const storedData = streamId ? decompressStreamData(streamId) : null;
            if (storedData?.mpath) {
                try {
                    await playM3u8(storedData.mpath);
                    await updateStreamInfo(platform, memberName);
                } catch (error) {
                    console.error('Failed to play stored stream:', error);
                    showOfflineState();
                }
            } else {
                showOfflineState();
            }
        }
    } catch (error) {
        console.error('Error checking stream status:', error);
        
        const storedData = streamId ? decompressStreamData(streamId) : null;
        if (storedData?.mpath) {
            try {
                await playM3u8(storedData.mpath);
                await updateStreamInfo(platform, memberName);
            } catch (playError) {
                console.error('Failed to play stored stream:', playError);
                showOfflineState();
            }
        } else {
            showOfflineState();
        }
    }
}

async function updateStreamInfo(platform, memberName) {
    try {
        const apiEndpoint = platform === 'idn' 
            ? 'https://48intensapi.my.id/api/idnlive/jkt48'
            : 'https://48intensapi.my.id/api/showroom/jekatepatlapan';
            
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`Failed to fetch ${platform} data`);

        const data = await response.json();
        const normalizedMemberName = memberName.toLowerCase();
        
        const streamData = platform === 'idn'
            ? data.data.find(stream => stream.user.username.replace('jkt48_', '').toLowerCase() === normalizedMemberName)
            : data.find(stream => stream.room_url_key.replace('JKT48_', '').toLowerCase() === normalizedMemberName);

        if (!streamData) throw new Error('Stream not found');
        
        platform === 'idn' ? updateIDNStreamInfo(streamData) : updateShowroomStreamInfo(streamData);
    } catch (error) {
        console.error('Error updating stream info:', error);
        showOfflineState();
        throw error;
    }
}

async function initializePlayer() {
    try {
        video = document.getElementById('liveStream');
        if (!video) throw new Error('Video element not found');

        const [, , platform, memberName, streamId] = window.location.pathname.split('/');

        if (platform === 'showroom' || platform === 'sr') {
            video = initializePlyr();
        }

        // Set up video controls
        Mousetrap.bind('space', playerControls.playPause);
        Mousetrap.bind('up', playerControls.volumeUp);
        Mousetrap.bind('down', playerControls.volumeDown);
        Mousetrap.bind('f', playerControls.fullscreen);
        
        video.addEventListener('click', playerControls.playPause);
        video.addEventListener('error', () => checkAndHandleStreamStatus(platform, memberName, streamId));

        await checkAndHandleStreamStatus(platform, memberName, streamId);
    } catch (error) {
        console.error('Error initializing player:', error);
        showOfflineState();
    }
}

// Optimized meta tag updates
function updateMetaTags({ title, description, image, imageWidth = '500', imageHeight = '500', url }) {
    document.title = title;

    const metaTags = {
        // Basic meta
        'description': { name: 'description', content: description },
        'keywords': { name: 'keywords', content: 'JKT48, live streaming, 48intens, idol, live' },
        
        // Open Graph
        'og:site_name': { property: 'og:site_name', content: '48intens' },
        'og:title': { property: 'og:title', content: title },
        'og:description': { property: 'og:description', content: description },
        'og:type': { property: 'og:type', content: 'website' },
        'og:url': { property: 'og:url', content: url },
        'og:image': { property: 'og:image', content: image },
        'og:image:secure_url': { property: 'og:image:secure_url', content: image },
        'og:image:width': { property: 'og:image:width', content: imageWidth },
        'og:image:height': { property: 'og:image:height', content: imageHeight },
        'og:image:alt': { property: 'og:image:alt', content: title },
        
        // Twitter Card
        'twitter:card': { name: 'twitter:card', content: 'summary_large_image' },
        'twitter:site': { name: 'twitter:site', content: '@48intens' },
        'twitter:creator': { name: 'twitter:creator', content: '@48intens' },
        'twitter:title': { name: 'twitter:title', content: title },
        'twitter:description': { name: 'twitter:description', content: description },
        'twitter:image': { name: 'twitter:image', content: image },
        'twitter:image:alt': { name: 'twitter:image:alt', content: title }
    };

    Object.values(metaTags).forEach(attrs => {
        let selector = attrs.property ? 
            `meta[property="${attrs.property}"]` : 
            `meta[name="${attrs.name}"]`;
            
        let tag = document.querySelector(selector);
        
        if (!tag) {
            tag = document.createElement('meta');
            document.head.appendChild(tag);
        }
        
        Object.entries(attrs).forEach(([key, value]) => {
            tag.setAttribute(key, value);
        });
    });

    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.href = '/assets/image/icon.png';
}

function updateIDNStreamInfo(data) {
    if (!data?.user) {
        showErrorState('Invalid stream data received');
        return;
    }

    try {
        const elements = {
            'memberName': data.user.name || 'Unknown Member',
            'streamTitle': data.title || 'No Title',
            'viewCount': `${data.view_count || 0} viewers`,
            'startTime': data.live_at ? new Date(data.live_at).toLocaleTimeString() : 'Unknown',
            'streamQuality': 'HD'
        };

        Object.entries(elements).forEach(([id, text]) => {
            document.getElementById(id).textContent = text;
        });

        const streamDescription = [
            `🎥 ${data.user.name} sedang live streaming di IDN Live! ${data.title || ''}`,
            `👥 ${data.view_count || 0} viewers`,
            `📺 Nonton sekarang di 48intens!`
        ].join('\n');

        const thumbnailUrl = data.user.avatar || data.image || data.user.profile_pic || 
            'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

        updateMetaTags({
            title: `${data.user.name} Live Streaming | 48intens`,
            description: streamDescription,
            image: thumbnailUrl,
            url: window.location.href
        });
    } catch (err) {
        console.error('Error updating IDN stream info:', err);
        showErrorState('Error displaying stream information');
    }
}

function updateShowroomStreamInfo(data) {
    if (!data) {
        showErrorState('Invalid stream data received');
        return;
    }

    const originalQuality = data.streaming_url_list?.find(stream => stream.label === 'original quality');
    if (!originalQuality) {
        throw new Error('Original quality stream not found');
    }

    const elements = {
        'memberName': data.main_name || 'Unknown Member',
        'streamTitle': data.genre_name || 'No Title',
        'viewCount': `${(data.view_num || 0).toLocaleString()} viewers`,
        'startTime': data.started_at ? new Date(data.started_at * 1000).toLocaleTimeString() : 'Unknown',
        'streamQuality': originalQuality.label || 'Unknown'
    };

    Object.entries(elements).forEach(([id, text]) => {
        document.getElementById(id).textContent = text;
    });

    const streamDescription = [
        `🎥 ${data.main_name} sedang live streaming di SHOWROOM!`,
        data.genre_name || '',
        `👥 ${data.view_num?.toLocaleString() || 0} viewers`,
        `📺 Nonton sekarang di 48intens!`
    ].join('\n');

    const thumbnailUrl = data.image_square || data.image || data.room_url_key || 
        'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

    updateMetaTags({
        title: `${data.main_name} Live Streaming | 48intens`,
        description: streamDescription,
        image: thumbnailUrl,
        imageWidth: '320',
        imageHeight: '320',
        url: window.location.href
    });

    if (data.stage_users) {
        updateStageUsersList(data.stage_users);
    }

    playM3u8(originalQuality.url);
}

document.addEventListener('DOMContentLoaded', initializePlayer);