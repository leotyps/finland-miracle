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


function updateStageUsersList(stageUsers) {
    const stageUsersList = document.getElementById('stageUsersList');
    const container = document.getElementById('stageUsersContainer');
    if (!stageUsers || stageUsers.length === 0) {
        stageUsersList.classList.add('hidden');
        return;
    }
    stageUsersList.classList.remove('hidden');
    container.innerHTML = '';
    stageUsers.forEach(stageUser => {
        const userDiv = document.createElement('div');
        userDiv.className = 'flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'flex-shrink-0 relative';

        const userImage = document.createElement('img');
        userImage.className = 'w-12 h-12 rounded-full object-cover';
        userImage.src = stageUser.user.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg';
        userImage.alt = stageUser.user.name;

        const rankBadge = document.createElement('span');
        rankBadge.className = 'absolute -top-1 -right-1 bg-rose-300 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center';
        rankBadge.textContent = stageUser.rank;

        imageContainer.appendChild(userImage);
        imageContainer.appendChild(rankBadge);

        const userInfo = document.createElement('div');
        userInfo.className = 'flex-grow min-w-0';

        const userName = document.createElement('p');
        userName.className = 'text-sm font-medium text-gray-900 truncate';
        userName.textContent = stageUser.user.name;

        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'flex items-center space-x-1';

        const avatarImage = document.createElement('img');
        avatarImage.className = 'w-4 h-4';
        avatarImage.src = stageUser.user.avatar_url || '';
        avatarImage.alt = 'Avatar';

        avatarContainer.appendChild(avatarImage);
        userInfo.appendChild(userName);
        userInfo.appendChild(avatarContainer);
        userDiv.appendChild(imageContainer);
        userDiv.appendChild(userInfo);

        container.appendChild(userDiv);
    });
}


async function refreshPodiumData() {
    try {
        const pathSegments = window.location.pathname.split('/');
        const platform = pathSegments[2];
        const memberName = pathSegments[3];
        // Only proceed if it's a Showroom stream
        if (platform === 'showroom' || platform === 'sr') {
            const response = await fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan');
            if (!response.ok) throw new Error('Failed to fetch Showroom data');

            const data = await response.json();
            const streamData = data.find(stream =>
                stream.room_url_key.replace('JKT48_', '').toLowerCase() === memberName.toLowerCase()
            );

            if (streamData && streamData.stage_users) {
                updateStageUsersList(streamData.stage_users);
                
                // Add a subtle animation to show the refresh was successful
                const container = document.getElementById('stageUsersContainer');
                container.style.opacity = '0';
                setTimeout(() => {
                    container.style.opacity = '1';
                }, 150);
            }
        }
    } catch (error) {
        console.error('Error refreshing podium data:', error);
    }
}


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


function initializePlyr() {
    const plyrOptions = {
        controls: [
            'play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['quality', 'speed'],
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        quality: {
            default: 720,
            options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        }
    };

    player = new Plyr('#liveStream', plyrOptions);
    player.on('volumechange', () => {
        localStorage.setItem('playerVolume', player.volume);
    });
    player.on('error', (error) => {
        console.error('Plyr error:', error);
        showErrorState('Error playing video stream');
    });

    return player.elements.container.querySelector('video');
}

async function checkAndHandleStreamStatus(platform, memberName, streamId) {
    try {
        if (!platform || !memberName) {
            throw new Error('Platform and member name are required');
        }

        const apiEndpoint = platform === 'idn' 
            ? 'https://48intensapi.my.id/api/idnlive/jkt48'
            : 'https://48intensapi.my.id/api/showroom/jekatepatlapan';

        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${platform} data: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data) {
            throw new Error('No data received from API');
        }

        const normalizedMemberName = memberName.toLowerCase();
        
        let streamData;
        if (platform === 'idn') {
            if (!Array.isArray(data.data)) {
                throw new Error('Invalid IDN data structure');
            }
            streamData = data.data.find(stream => 
                stream?.user?.username?.replace('jkt48_', '').toLowerCase() === normalizedMemberName
            );
        } else {
            if (!Array.isArray(data)) {
                throw new Error('Invalid Showroom data structure');
            }
            streamData = data.find(stream => 
                stream?.room_url_key?.replace('JKT48_', '').toLowerCase() === normalizedMemberName
            );
        }

        if (streamData) {
            if (platform === 'idn') {
                if (!streamData.user) {
                    throw new Error('Invalid IDN stream data: missing user information');
                }
                await updateIDNStreamInfo(streamData);
            } else {
                await updateShowroomStreamInfo(streamData);
            }
            
            const metaData = {
                title: streamData.user?.name 
                    ? `${streamData.user.name} Live Streaming | 48intens`
                    : 'Live Streaming | 48intens',
                description: `🎥 ${streamData.user?.name || 'Member'} sedang live streaming! ${streamData.title || ''} Nonton sekarang di 48intens!`,
                image: streamData.user?.avatar || streamData.image || 'https://jkt48.com/images/logo.svg',
                url: window.location.href
            };
            
            updateMetaTags(metaData);

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

async function initializePlayer() {
    try {
        video = document.getElementById('liveStream');
        if (!video) {
            throw new Error('Video element not found');
        }

        const pathSegments = window.location.pathname.split('/');
        const platform = pathSegments[2];
        const memberName = pathSegments[3];
        const streamId = pathSegments[4];

        if (platform === 'showroom' || platform === 'sr') {
            video = initializePlyr();
        } else if (platform === 'idn') {
            video = document.getElementById('liveStream');
        }

        const streamData = decompressStreamData(streamId);
        if (!streamData) {
            throw new Error('Stream has been finished');
        }
        Mousetrap.bind('space', playPause);
        Mousetrap.bind('up', volumeUp);
        Mousetrap.bind('down', volumeDown);
        Mousetrap.bind('f', vidFullscreen);
        video.addEventListener('click', playPause);
        video.addEventListener('error', function (e) {
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

    const thumbnailUrl = data.image_square || data.image || data.room_url_key || 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

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


function showErrorState(message) {
    document.getElementById('memberName').textContent = 'Error';
    document.getElementById('streamTitle').textContent = message || 'Failed to load stream data';
    document.getElementById('viewCount').textContent = '-';
    document.getElementById('startTime').textContent = '-';
    document.getElementById('streamQuality').textContent = '-';

    document.getElementById('stageUsersList').classList.add('hidden');

    updateMetaTags({
        title: '48intens - Stream Error',
        description: message || 'Failed to load stream data',
        image: '/assets/image/icon.png',
        url: window.location.href
    });
}



document.addEventListener('DOMContentLoaded', initializePlayer);