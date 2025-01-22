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

function createPlayButton() {
    const playContainer = document.createElement('div');
    playContainer.className = 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50';
    
    const playButton = document.createElement('button');
    playButton.className = 'p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors';
    playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    `;

    playContainer.appendChild(playButton);
    return playContainer;
}

function handleAutoplayError(error, videoElement) {
    if (error.name === 'NotAllowedError') {
        const playButton = createPlayButton();
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

async function playM3u8(url) {
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

            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                try {
                    await video.play();
                    resolve();
                } catch (error) {
                    if (handleAutoplayError(error, video)) {
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
                    reject(new Error('Fatal HLS error'));
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('canplay', async () => {
                try {
                    await video.play();
                    resolve();
                } catch (error) {
                    if (handleAutoplayError(error, video)) {
                        resolve(); 
                    } else {
                        reject(error);
                    }
                }
            });
            video.volume = parseFloat(localStorage.getItem('playerVolume') || 0.3);
        } else {
            reject(new Error('HLS not supported'));
        }
    });
}


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
        const fullscreenFunc = video.requestFullscreen || video.mozRequestFullScreen || video.webkitRequestFullscreen;
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
            
            updateMetaTags({
                title: `${streamData.user.name} Live Streaming | 48intens`,
                description: `🎥 ${streamData.user.name} sedang live streaming! ${streamData.title || ''} Nonton sekarang di 48intens!`,
                image: streamData.user.avatar || streamData.image || 'https://jkt48.com/images/logo.svg',
                url: window.location.href
            });

            const storedData = streamId ? decompressStreamData(streamId) : null;
            if (storedData?.mpath) {
                await playM3u8(storedData.mpath);
            }
        } else {
            showOfflineState();
        }
    } catch (error) {
        console.error('Error checking stream status:', error);
        showOfflineState();
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

function updateMetaTags({ 
    title = 'Live Streaming | 48intens',
    description = 'Watch JKT48 members live streaming on 48intens',
    image = 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp',
    imageWidth = '1200',
    imageHeight = '630',
    url = window.location.href
}) {
    // Ensure we have default values
    const baseUrl = 'https://finland-miracle.vercel.app';
    const currentUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const safeDescription = description || 'Watch JKT48 members live streaming on 48intens';
    const timestamp = Math.floor(Date.now() / 1000);

    // Create meta tags configuration
    const metaTags = [
        // Basic meta tags
        { name: 'description', content: safeDescription },
        { name: 'keywords', content: 'JKT48, IDN Live, Showroom, Live Streaming, 48intens, idol, JKT48 Live' },
        { name: 'author', content: '48intens' },
        { name: 'robots', content: 'index, follow' },
        
        // Open Graph tags
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '48intens' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: safeDescription },
        { property: 'og:url', content: currentUrl },
        { property: 'og:image', content: image },
        { property: 'og:image:secure_url', content: image },
        { property: 'og:image:width', content: imageWidth },
        { property: 'og:image:height', content: imageHeight },
        { property: 'og:image:alt', content: title },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:updated_time', content: timestamp.toString() },
        
        // Twitter Card tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@48intens' },
        { name: 'twitter:creator', content: '@48intens' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: safeDescription },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: title },
        
        // Additional tags for SEO and sharing
        { name: 'application-name', content: '48intens' },
        { name: 'theme-color', content: '#ffffff' }
    ];

    document.title = title;

    function updateMetaTag(tagData) {
        const { name, property, content } = tagData;
        const selector = property ? 
            `meta[property="${property}"]` : 
            `meta[name="${name}"]`;
        
        let tag = document.querySelector(selector);
        
        if (!tag) {
            tag = document.createElement('meta');
            if (property) {
                tag.setAttribute('property', property);
            } else {
                tag.setAttribute('name', name);
            }
            document.head.appendChild(tag);
        }
        
        tag.setAttribute('content', content);
    }

    metaTags.forEach(updateMetaTag);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;
    const icons = [
        { rel: 'icon', href: '/assets/image/icon.png' },
        { rel: 'apple-touch-icon', href: '/assets/image/icon.png' }
    ];

    icons.forEach(({ rel, href }) => {
        let link = document.querySelector(`link[rel="${rel}"]`);
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            document.head.appendChild(link);
        }
        link.href = href;
    });
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
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });

        const streamDescription = [
            `🎥 ${data.user.name} sedang live streaming di IDN Live!`,
            data.title || '',
            `👥 ${data.view_count || 0} viewers sedang menonton`,
            '📺 Nonton sekarang di 48intens!'
        ].filter(Boolean).join('\n');

        const thumbnailUrl = data.user.avatar || data.image || data.user.profile_pic || 
            'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

        updateMetaTags({
            title: `${data.user.name} Live Streaming | 48intens`,
            description: streamDescription,
            image: thumbnailUrl,
            imageWidth: '1200',
            imageHeight: '630',
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

    try {
        const elements = {
            'memberName': data.main_name || 'Unknown Member',
            'streamTitle': data.genre_name || 'No Title',
            'viewCount': `${(data.view_num || 0).toLocaleString()} viewers`,
            'startTime': data.started_at ? new Date(data.started_at * 1000).toLocaleTimeString() : 'Unknown',
            'streamQuality': originalQuality.label || 'Unknown'
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });

        const streamDescription = [
            `🎥 ${data.main_name} sedang live streaming di SHOWROOM!`,
            data.genre_name || '',
            `👥 ${data.view_num?.toLocaleString() || 0} viewers sedang menonton`,
            '📺 Nonton sekarang di 48intens!'
        ].filter(Boolean).join('\n');
        const thumbnailUrl = data.image_square || data.image || 
            'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

        const pageTitle = `${data.main_name} Live Streaming | 48intens`;

        updateMetaTags({
            title: pageTitle,
            description: streamDescription,
            image: thumbnailUrl,
            imageWidth: '1200',
            imageHeight: '630',
            url: window.location.href
        });

        if (data.stage_users?.length > 0) {
            updateStageUsersList(data.stage_users);
        }

        playM3u8(originalQuality.url);
    } catch (err) {
        console.error('Error updating Showroom stream info:', err);
        showErrorState('Error displaying stream information');
    }
}
document.addEventListener('DOMContentLoaded', initializePlayer);