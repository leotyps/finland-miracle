async function initializePlayer() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const memberName = urlParams.get('member');
        const platform = urlParams.get('platform');
        const encodedStream = urlParams.get('s');

        if (!encodedStream || !memberName || !platform) {
            throw new Error('Required parameters are missing');
        }

        // Decode stream data dengan format 5 huruf
        const streamData = JSON.parse(atob(encodedStream + '='.repeat((4 - encodedStream.length % 4) % 4)));
        const streamUrl = streamData.mpath;

        // Initialize Video.js player
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

        // Enhanced keyboard controls
        document.addEventListener('keydown', function(e) {
            if (!player.isInPictureInPicture()) {
                switch(e.key.toLowerCase()) {
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

        // Double-click for fullscreen
        const videoElement = document.querySelector('.video-js');
        videoElement.addEventListener('dblclick', () => {
            player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
        });

        // Volume persistence
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

        // Fetch and update stream info
        updateStreamInfo(platform, memberName);

    } catch (error) {
        console.error('Error initializing player:', error);
        document.getElementById('streamInfo').innerHTML = '<div class="error">Failed to load stream</div>';
    }
}

async function updateStreamInfo(platform, memberName) {
    try {
        let streamData;
        if (platform === 'idn') {
            const response = await fetch('https://48intensapi.my.id/api/idnlive/jkt48');
            const data = await response.json();
            streamData = data.data.find(stream => 
                stream.user.username.replace('jkt48_', '').toLowerCase() === memberName.toLowerCase()
            );
            
            if (streamData) {
                updateIDNStreamInfo(streamData);
            }
        } else if (platform === 'showroom') {
            const response = await fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan');
            const data = await response.json();
            streamData = data.find(stream => 
                stream.room_url_key.replace('JKT48_', '').toLowerCase() === memberName.toLowerCase()
            );
            
            if (streamData) {
                updateShowroomStreamInfo(streamData);
            }
        }
    } catch (error) {
        console.error('Error updating stream info:', error);
    }
}

function updateIDNStreamInfo(data) {
    document.getElementById('memberName').textContent = data.user.name;
    document.getElementById('streamTitle').textContent = data.title;
    document.getElementById('viewCount').textContent = `${data.view_count} viewers`;
    document.getElementById('startTime').textContent = new Date(data.live_at).toLocaleTimeString();
    document.getElementById('streamQuality').textContent = 'HD';
    document.title = `${data.user.name} - Live Streaming | 48intens`;
}

function updateShowroomStreamInfo(data) {
    document.getElementById('memberName').textContent = data.main_name;
    document.getElementById('streamTitle').textContent = data.genre_name;
    document.getElementById('viewCount').textContent = `${data.view_num.toLocaleString()} viewers`;
    document.getElementById('startTime').textContent = new Date(data.started_at * 1000).toLocaleTimeString();
    document.getElementById('streamQuality').textContent = data.streaming_url_list[0].label;
    document.title = `${data.main_name} - Live Streaming | 48intens`;
}

document.addEventListener('DOMContentLoaded', initializePlayer);

