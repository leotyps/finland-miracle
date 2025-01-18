
let hls = null;
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

function playM3u8(url) {
    if (!video) {
        console.error('Video element not initialized');
        return;
    }

    if (Hls.isSupported()) {
        const savedVolume = localStorage.getItem('playerVolume');
        video.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
        if (hls) {
            hls.destroy();
        }

        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        const m3u8Url = decodeURIComponent(url);
        hls.loadSource(m3u8Url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(e => console.error('Error autoplaying:', e));
        });

        // Error handling
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error('Network error, trying to recover...');
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error('Media error, trying to recover...');
                        hls.recoverMediaError();
                        break;
                    default:
                        console.error('Fatal error, streaming cannot continue:', data);
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('canplay', function() {
            video.play().catch(e => console.error('Error autoplaying:', e));
        });
        const savedVolume = localStorage.getItem('playerVolume');
        video.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
    }
}

// Player controls
function playPause() {
    if (!video) return;
    video.paused ? video.play() : video.pause();
}

function volumeUp() {
    if (!video) return;
    if (video.volume <= 0.9) {
        video.volume += 0.1;
        localStorage.setItem('playerVolume', video.volume);
    }
}

function volumeDown() {
    if (!video) return;
    if (video.volume >= 0.1) {
        video.volume -= 0.1;
        localStorage.setItem('playerVolume', video.volume);
    }
}

function vidFullscreen() {
    if (!video) return;
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    }
}

async function updateStreamInfo(platform, memberName) {
    try {
        let streamData;
        const normalizedMemberName = memberName.toLowerCase();

        if (platform === 'idn') {
            const response = await fetch('https://48intensapi.my.id/api/idnlive/jkt48');
            if (!response.ok) throw new Error('Failed to fetch IDN data');

            const data = await response.json();
            streamData = data.data.find(stream =>
                stream.user.username.replace('jkt48_', '').toLowerCase() === normalizedMemberName
            );

            if (streamData) {
                updateIDNStreamInfo(streamData);
            } else {
                throw new Error('Stream not found');
            }
        } else if (platform === 'showroom' || platform === 'sr') {
            const response = await fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan');
            if (!response.ok) throw new Error('Failed to fetch Showroom data');

            const data = await response.json();
            streamData = data.find(stream =>
                stream.room_url_key.replace('JKT48_', '').toLowerCase() === normalizedMemberName
            );

            if (streamData) {
                updateShowroomStreamInfo(streamData);
            } else {
                throw new Error('Stream not found');
            }
        }
    } catch (error) {
        console.error('Error updating stream info:', error);
        showErrorState(`Failed to load stream data: ${error.message}`);
    }
}

function updateIDNStreamInfo(data) {
    if (!data || !data.user) {
        showErrorState('Invalid stream data received');
        return;
    }

    try {
        document.getElementById('memberName').textContent = data.user.name || 'Unknown Member';
        document.getElementById('streamTitle').textContent = data.title || 'No Title';
        document.getElementById('viewCount').textContent = `${data.view_count || 0} viewers`;
        document.getElementById('startTime').textContent = data.live_at
            ? new Date(data.live_at).toLocaleTimeString()
            : 'Unknown';
        document.getElementById('streamQuality').textContent = 'HD';

        const streamDescription = 
            `🎥 ${data.user.name} sedang live streaming di IDN Live! ${data.title || ''}\n` +
            `👥 ${data.view_count || 0} viewers\n` +
            `📺 Nonton sekarang di 48intens!`;
        const thumbnailUrl = data.user.avatar || data.image || data.user.profile_pic || '/assets/image/intens.webp';
        
        updateMetaTags({
            title: `${data.user.name} Live Streaming | 48intens`,
            description: streamDescription,
            image: thumbnailUrl,
            imageWidth: '500',
            imageHeight: '500',
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

    try {
        const originalQuality = data.streaming_url_list?.find(
            (stream) => stream.label === 'original quality'
        );

        if (!originalQuality) {
            throw new Error('Original quality stream not found');
        }

        document.getElementById('memberName').textContent = data.main_name || 'Unknown Member';
        document.getElementById('streamTitle').textContent = data.genre_name || 'No Title';
        document.getElementById('viewCount').textContent = `${(data.view_num || 0).toLocaleString()} viewers`;
        document.getElementById('startTime').textContent = data.started_at
            ? new Date(data.started_at * 1000).toLocaleTimeString()
            : 'Unknown';
        document.getElementById('streamQuality').textContent = originalQuality.label || 'Unknown';

        const streamDescription = 
            `🎥 ${data.main_name} sedang live streaming di SHOWROOM!\n` +
            `${data.genre_name || ''}\n` +
            `👥 ${data.view_num?.toLocaleString() || 0} viewers\n` +
            `📺 Nonton sekarang di 48intens!`;

        const thumbnailUrl = data.image_square || data.image || data.room_url_key || '/assets/image/intens.webp';
        
        updateMetaTags({
            title: `${data.main_name} Live Streaming | 48intens`,
            description: streamDescription,
            image: thumbnailUrl,
            imageWidth: '320',
            imageHeight: '320',
            url: window.location.href
        });

        playM3u8(originalQuality.url);
    } catch (err) {
        console.error('Error updating Showroom stream info:', err);
        showErrorState('Error displaying stream information');
    }
}

function updateMetaTags({ title, description, image, imageWidth, imageHeight, url }) {
    const baseUrl = 'https://48intens.com';
    const absoluteImageUrl = image.startsWith('http') ? 
        image : 
        `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
    const absoluteUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    const metaTags = [
        // Basic Meta
        { tag: 'title', content: title },
        { tag: 'meta', attrs: { name: 'description', content: description }},
        { tag: 'meta', attrs: { name: 'keywords', content: 'JKT48, live streaming, 48intens, idol, live' }},
        
        // Open Graph
        { tag: 'meta', attrs: { property: 'og:site_name', content: '48intens' }},
        { tag: 'meta', attrs: { property: 'og:title', content: title }},
        { tag: 'meta', attrs: { property: 'og:description', content: description }},
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' }},
        { tag: 'meta', attrs: { property: 'og:url', content: absoluteUrl }},
        { tag: 'meta', attrs: { property: 'og:image', content: absoluteImageUrl }},
        { tag: 'meta', attrs: { property: 'og:image:secure_url', content: absoluteImageUrl }},
        { tag: 'meta', attrs: { property: 'og:image:width', content: imageWidth }},
        { tag: 'meta', attrs: { property: 'og:image:height', content: imageHeight }},
        { tag: 'meta', attrs: { property: 'og:image:type', content: 'image/jpeg' }},
        { tag: 'meta', attrs: { property: 'og:image:alt', content: title }},
        
        // Twitter Card
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }},
        { tag: 'meta', attrs: { name: 'twitter:site', content: '@48intens' }},
        { tag: 'meta', attrs: { name: 'twitter:creator', content: '@48intens' }},
        { tag: 'meta', attrs: { name: 'twitter:title', content: title }},
        { tag: 'meta', attrs: { name: 'twitter:description', content: description }},
        { tag: 'meta', attrs: { name: 'twitter:image', content: absoluteImageUrl }},
        { tag: 'meta', attrs: { name: 'twitter:image:alt', content: title }}
    ];

    metaTags.forEach(tagInfo => {
        if (tagInfo.tag === 'title') {
            document.title = tagInfo.content;
            return;
        }

        let selector = Object.entries(tagInfo.attrs)
            .filter(([key]) => key === 'name' || key === 'property')
            .map(([key, value]) => `[${key}="${value}"]`)
            .join('');

        let element = document.querySelector(`${tagInfo.tag}${selector}`);

        if (!element) {
            element = document.createElement(tagInfo.tag);
            Object.entries(tagInfo.attrs).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            document.head.appendChild(element);
        }

        if (tagInfo.attrs.content) {
            element.setAttribute('content', tagInfo.attrs.content);
        }
    });
}

function showErrorState(message) {
    document.getElementById('memberName').textContent = 'Error';
    document.getElementById('streamTitle').textContent = message || 'Failed to load stream data';
    document.getElementById('viewCount').textContent = '-';
    document.getElementById('startTime').textContent = '-';
    document.getElementById('streamQuality').textContent = '-';

    updateMetaTags({
        title: '48intens - Stream Error',
        description: message || 'Failed to load stream data',
        image: '/assets/image/icon.png',
        url: window.location.href
    });
}

async function initializePlayer() {
    try {
        video = document.getElementById('liveStream');
        if (!video) {
            throw new Error('Video element not found');
        }

        const pathSegments = window.location.pathname.split('/');
        const platform = pathSegments[2]; // Platform: 'idn' atau 'sr'
        const memberName = pathSegments[3]; // Nama member
        const streamId = pathSegments[4]; // Stream ID

        if (!streamId || !memberName || !platform) {
            throw new Error('Required parameters are missing');
        }

        const streamData = decompressStreamData(streamId);
        if (!streamData) {
            throw new Error('Stream data not found or expired');
        }
        Mousetrap.bind('space', playPause);
        Mousetrap.bind('up', volumeUp);
        Mousetrap.bind('down', volumeDown);
        Mousetrap.bind('f', vidFullscreen);
        video.addEventListener('click', playPause);
        video.addEventListener('error', function(e) {
            console.error('Video error:', e);
            showErrorState('Error playing video stream');
        });
        playM3u8(streamData.mpath);

        await updateStreamInfo(platform, memberName);
    } catch (error) {
        console.error('Error initializing player:', error);
        showErrorState(error.message);
    }
}

document.addEventListener('DOMContentLoaded', initializePlayer);