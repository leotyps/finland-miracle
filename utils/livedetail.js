
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

        const streamDescription = `${data.user.name} is live streaming on IDN Live - ${data.title || 'Live Stream'}`;
        
        updateMetaTags({
            title: `${data.user.name} Live Streaming | 48intens`,
            description: streamDescription,
            image: data.image || data.user.avatar || '/assets/image/intens.webp',
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

        const streamDescription = `${data.main_name} is live streaming on Showroom - ${data.genre_name || 'Live Stream'}`;

        updateMetaTags({
            title: `${data.main_name} Live Streaming | 48intens`,
            description: streamDescription,
            image: data.image_square || data.image || '/assets/image/intens.webp',
            url: window.location.href
        });

        playM3u8(originalQuality.url);
    } catch (err) {
        console.error('Error updating Showroom stream info:', err);
        showErrorState('Error displaying stream information');
    }
}

function updateMetaTags({ title, description, image, url }) {
    // Update page title
    document.title = title;

    // Basic meta tags
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'JKT48, live streaming, 48intens');

    // Open Graph meta tags
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
    document.querySelector('meta[property="og:image:width"]')?.setAttribute('content', '1200');
    document.querySelector('meta[property="og:image:height"]')?.setAttribute('content', '630');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website');

    // Twitter Card meta tags
    document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
    document.querySelector('meta[name="twitter:creator"]')?.setAttribute('content', '@48intens');

    // Create missing meta tags if they don't exist
    const metaTags = [
        { name: 'description', content: description },
        { name: 'keywords', content: 'JKT48, live streaming, 48intens' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:creator', content: '@48intens' }
    ];

    metaTags.forEach(tag => {
        const selector = tag.name ? 
            `meta[name="${tag.name}"]` : 
            `meta[property="${tag.property}"]`;
        
        let element = document.querySelector(selector);
        
        if (!element) {
            element = document.createElement('meta');
            if (tag.name) {
                element.setAttribute('name', tag.name);
            } else {
                element.setAttribute('property', tag.property);
            }
            document.head.appendChild(element);
        }
        
        element.setAttribute('content', tag.content);
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