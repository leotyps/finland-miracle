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

async function initializePlayer() {
    try {
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

        const streamUrl = streamData.mpath;
        const player = videojs('liveStream', {
            controls: true,
            autoplay: true,
            fluid: true,
            liveui: true,
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'liveDisplay',
                    'customControlSpacer',
                    'playbackRateMenuButton',
                    'pictureInPictureToggle',
                    'qualitySelector',
                    'fullscreenToggle'
                ],
                volumePanel: {
                    inline: false,
                    volumeControl: {
                        vertical: true
                    }
                }
            },
            html5: {
                vhs: {
                    overrideNative: true,
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true
                }
            }
        });

        player.src({
            src: streamUrl,
            type: 'application/x-mpegURL'
        });

        document.addEventListener('keydown', function (e) {
            if (!player.isInPictureInPicture()) {
                switch (e.key.toLowerCase()) {
                    case 'f':
                        player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
                        break;
                    case 'm':
                        player.muted(!player.muted());
                        break;
                    case ' ':
                    case 'k':
                        if (e.target === document.body) {
                            e.preventDefault();
                            player.paused() ? player.play() : player.pause();
                        }
                        break;
                    case 'arrowup':
                        if (e.target === document.body) {
                            e.preventDefault();
                            player.volume(Math.min(1, player.volume() + 0.1));
                        }
                        break;
                    case 'arrowdown':
                        if (e.target === document.body) {
                            e.preventDefault();
                            player.volume(Math.max(0, player.volume() - 0.1));
                        }
                        break;
                }
            }
        });

        const videoElement = document.querySelector('.video-js');
        videoElement.addEventListener('dblclick', () => {
            player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
        });

        const savedVolume = localStorage.getItem('playerVolume');
        const savedMuted = localStorage.getItem('playerMuted');

        if (savedVolume !== null) {
            player.volume(parseFloat(savedVolume));
        }
        if (savedMuted === 'true') {
            player.muted(true);
        }

        player.on('volumechange', () => {
            localStorage.setItem('playerVolume', player.volume());
            localStorage.setItem('playerMuted', player.muted());
        });

        updateStreamInfo(platform, memberName);
    } catch (error) {
        console.error('Error initializing player:', error);
        document.getElementById('streamInfo').innerHTML = '<div class="error">Failed to load stream</div>';
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
        document.title = `${data.user.name} - Live Streaming | 48intens`;
        updateMetaTags({
            title: `${data.user.name} - Live Streaming | 48intens`,
            description: data.title || 'IDN Live Stream',
            image: data.image || data.user.avatar
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
        document.getElementById('memberName').textContent = data.main_name || 'Unknown Member';
        document.getElementById('streamTitle').textContent = data.genre_name || 'No Title';
        document.getElementById('viewCount').textContent = `${(data.view_num || 0).toLocaleString()} viewers`;
        document.getElementById('startTime').textContent = data.started_at
            ? new Date(data.started_at * 1000).toLocaleTimeString()
            : 'Unknown';
        document.getElementById('streamQuality').textContent =
            data.streaming_url_list?.[0]?.label || 'Unknown';
        document.title = `${data.main_name} - Live Streaming | 48intens`;
        updateMetaTags({
            title: `${data.main_name} - Live Streaming | 48intens`,
            description: data.genre_name || 'Showroom Live Stream',
            image: data.image_square || data.image
        });
    } catch (err) {
        console.error('Error updating Showroom stream info:', err);
        showErrorState('Error displaying stream information');
    }
}

function updateMetaTags({ title, description, image }) {
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);

    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
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
        image: './assets/image/icon.png'
    });
}

document.addEventListener('DOMContentLoaded', initializePlayer);
