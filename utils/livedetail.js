
// livedetail.js
function decodeStreamData(encoded) {
    try {
        // Add padding if needed
        while (encoded.length % 4) {
            encoded += '=';
        }
        
        // Convert URL-safe characters back
        const base64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Decode base64
        const jsonString = atob(base64);
        const shortData = JSON.parse(jsonString);
        
        // Expand shortened data back to full format
        return {
            mpath: shortData.u.startsWith('http') ? shortData.u : 'https://' + shortData.u,
            ptype: shortData.t === 'i' ? 'idnlv' : 'sroom'
        };
    } catch (error) {
        console.error('Decoding error:', error);
        throw new Error('Invalid stream data');
    }
}

async function initializePlayer() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const memberName = urlParams.get('member');
        const platform = urlParams.get('platform');
        const encodedStream = urlParams.get('s');

        if (!encodedStream || !memberName || !platform) {
            throw new Error('Required parameters are missing');
        }

        // Log the encoded data for debugging
        console.log('Encoded stream data:', encodedStream);

        const streamData = decodeStreamData(encodedStream);
        const streamUrl = streamData.mpath;

        // Log the decoded URL for debugging
        console.log('Stream URL:', streamUrl);

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