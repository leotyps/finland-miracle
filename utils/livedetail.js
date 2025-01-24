let hls = null;
let player = null;
let video = null;
let wsConnection = null;

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


function setupIDNChat(username, slug) {
    const chatContainer = document.getElementById('stageUsersList');
    chatContainer.classList.remove('hidden');
    const messagesContainer = document.getElementById('stageUsersContainer');

    messagesContainer.innerHTML = `
        <div class="mb-4">
            <div class="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button onclick="showTab('chat')" id="chatTab" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm">Live Chat</button>
                <button onclick="showTab('gift')" id="giftTab" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700">Gift Log</button>
            </div>
        </div>
        <div id="chatContent" class="space-y-2">
            <div class="text-center text-gray-500 text-sm sticky top-0 bg-white z-10 py-2 border-b">🥺 Comment muncul dalam 15 detik jadi tunggu aja, Kamu juga tidak bisa chat untuk saat ini</div>
            <div class="overflow-y-auto max-h-[60vh] space-y-2" id="chatMessages"></div>
        </div>
        <div id="giftContent" class="space-y-2 hidden">
            <div class="overflow-y-auto max-h-[60vh] space-y-2" id="giftLogs"></div>
        </div>
    `;

    const chatMessages = document.getElementById('chatMessages');
    const giftLogs = document.getElementById('giftLogs');

    function addChatMessage(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors';

        const userImage = document.createElement('img');
        userImage.className = 'w-8 h-8 rounded-full object-cover flex-shrink-0';
        userImage.src = messageData.user?.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg';
        userImage.alt = messageData.user?.name || 'Anonymous';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow min-w-0';

        const userName = document.createElement('span');
        userName.className = 'text-sm font-medium text-gray-900';
        userName.textContent = messageData.user?.name || 'Anonymous';

        const messageText = document.createElement('p');
        messageText.className = 'text-sm text-gray-600 break-words';
        messageText.textContent = messageData.comment || '';

        contentDiv.appendChild(userName);
        contentDiv.appendChild(messageText);

        messageDiv.appendChild(userImage);
        messageDiv.appendChild(contentDiv);

        chatMessages.insertBefore(messageDiv, chatMessages.firstChild);

        while (chatMessages.children.length > 100) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
    }

    async function getChannelId() {
        try {
            const response = await fetch(`https://jkt48showroom-api.my.id/scrapper/channel-id?username=${username}&slug=${slug}`);
            const data = await response.json();
            return data.chatId;
        } catch (error) {
            console.error("Failed to get channel ID:", error);
            throw error;
        }
    }

    async function refreshGiftLogs() {
        try {
            const response = await fetch('https://48intensapi.my.id/api/idnlive/jkt48');
            const data = await response.json();

            if (data.data?.length) {
                const stream = data.data.find(s => s.user.username === username);

                if (stream?.gift_log?.length) {
                    giftLogs.innerHTML = stream.gift_log.map(gift => `
                        <div class="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                            <div class="flex-shrink-0">
                                <img class="w-8 h-8 rounded-full" 
                                    src="${gift.image_url}" 
                                    alt="${gift.name}">
                            </div>
                            <div class="flex-grow min-w-0">
                                <div class="flex items-baseline justify-between">
                                    <span class="text-sm font-medium text-gray-900">${gift.name}</span>
                                    <span class="text-xs text-gray-500">${gift.gold}</span>
                                </div>
                                <p class="text-xs text-gray-500">Rank #${gift.rank} · ${gift.total_point} Points</p>
                            </div>
                        </div>
                    `).join('');
                } else {
                    giftLogs.innerHTML = '<div class="text-center text-gray-500 text-sm">No gift logs available</div>';
                }
            }
        } catch (error) {
            console.error('Failed to fetch gift data:', error);
            giftLogs.innerHTML = '<div class="text-center text-gray-500 text-sm">Failed to load gift logs</div>';
        }
    }

    window.showTab = function (tabName) {
        const chatTab = document.getElementById('chatTab');
        const giftTab = document.getElementById('giftTab');
        const chatContent = document.getElementById('chatContent');
        const giftContent = document.getElementById('giftContent');
    
        [chatTab, giftTab].forEach(tab => {
            tab.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
            tab.classList.add('text-gray-500', 'hover:text-gray-700');
        });
        
        [chatContent, giftContent].forEach(content => {
            content.classList.add('hidden');
        });
    
        if (tabName === 'chat') {
            chatTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            chatTab.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            chatContent.classList.remove('hidden');
        } else {
            giftTab.classList.remove('text-gray-500', 'hover:text-gray-700');
            giftTab.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            giftContent.classList.remove('hidden');
            refreshGiftLogs();
        }
    };

    refreshGiftLogs();
    setInterval(refreshGiftLogs, 15000);

    async function connectWebSocket() {
        try {
            const channelId = await getChannelId();
            const ws = new WebSocket('wss://chat.idn.app');
            wsConnection = ws;

            const nickname = `user_${Math.random().toString(36).substring(2, 8)}`;
            let registered = false;
            let joined = false;

            ws.onopen = () => {
                console.log("WebSocket connected");
                ws.send(`NICK ${nickname}`);
                ws.send("USER websocket 0 * :WebSocket User");
            };

            ws.onmessage = (event) => {
                const rawMessage = event.data;

                if (rawMessage.startsWith("PING")) {
                    ws.send("PONG" + rawMessage.substring(4));
                    return;
                }

                if (rawMessage.includes("001") && !registered) {
                    registered = true;
                    ws.send(`JOIN #${channelId}`);
                    return;
                }

                if (rawMessage.includes("JOIN") && !joined) {
                    joined = true;
                    return;
                }

                if (rawMessage.includes("PRIVMSG")) {
                    const jsonMatch = rawMessage.match(/PRIVMSG #[^ ]+ :(.*)/);
                    if (jsonMatch) {
                        try {
                            const data = JSON.parse(jsonMatch[1]);
                            if (data?.chat) {
                                addChatMessage({
                                    user: data.user,
                                    comment: data.chat.message,
                                    timestamp: data.timestamp || Date.now()
                                });
                            }
                        } catch (error) {
                            console.error("Failed to parse message:", error);
                        }
                    }
                }
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected");
                wsConnection = null;
                setTimeout(() => connectWebSocket(), 5000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (error) {
            console.error("Failed to set up WebSocket:", error);
            setTimeout(() => connectWebSocket(), 5000);
        }
    }
    connectWebSocket();
    const refreshButton = chatContainer.querySelector('button');
    if (refreshButton) {
        refreshButton.onclick = () => {
            if (wsConnection) {
                wsConnection.close();
            }
            connectWebSocket();
        };
    }
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
                    reject(error);
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    showOfflineState();
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
                    reject(error);
                }
            });
            video.volume = parseFloat(localStorage.getItem('playerVolume') || 0.3);
        } else {
            reject(new Error('HLS not supported'));
        }
    });
}



function updateStageUsersList(stageUsers, giftLogs, commentLogs) {
    const stageUsersList = document.getElementById('stageUsersList');
    const container = document.getElementById('stageUsersContainer');

    if ((!stageUsers || stageUsers.length === 0) && (!giftLogs || giftLogs.length === 0) && (!commentLogs || commentLogs.length === 0)) {
        stageUsersList.classList.add('hidden');
        return;
    }

    stageUsersList.classList.remove('hidden');
    container.innerHTML = `
        <div class="mb-4">
            <div class="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button onclick="showTab('comment')" id="commentTab" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors">Comments</button>
                <button onclick="showTab('rank')" id="rankTab" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors">Podium</button>
                <button onclick="showTab('gift')" id="giftTab" class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors">Gift</button>
            </div>
        </div>
        <div id="rankContent" class="space-y-4"></div>
        <div id="giftContent" class="space-y-4 hidden"></div>
        <div id="commentContent" class="space-y-4 hidden">
            <div class="text-center text-gray-500 text-sm mb-2">🥺 Kamu tidak bisa comment untuk saat ini</div>
        </div>
    `;

    const rankContent = document.getElementById('rankContent');
    const giftContent = document.getElementById('giftContent');
    const commentContent = document.getElementById('commentContent');

    rankContent.innerHTML = '';
    giftContent.innerHTML = '';

    if (stageUsers?.length > 0) {
        stageUsers.forEach(stageUser => {
            const userDiv = document.createElement('div');
            userDiv.className = 'flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors';
            userDiv.innerHTML = `
                <div class="flex-shrink-0 relative">
                    <img class="w-12 h-12 rounded-full object-cover" 
                        src="${stageUser.user.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg'}" 
                        alt="${stageUser.user.name}">
                    <span class="absolute -top-1 -right-1 bg-rose-300 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        ${stageUser.rank}
                    </span>
                </div>
                <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">${stageUser.user.name}</p>
                    <div class="flex items-center space-x-1">
                        <img class="w-4 h-4" src="${stageUser.user.avatar_url || ''}" alt="Avatar">
                    </div>
                </div>
            `;
            rankContent.appendChild(userDiv);
        });
    }

    if (giftLogs?.length > 0) {
        giftLogs.forEach(gift => {
            const giftDiv = document.createElement('div');
            giftDiv.className = 'flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors';
            giftDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <img class="w-12 h-12 rounded-full object-cover" 
                        src="${gift.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg'}" 
                        alt="${gift.name}">
                </div>
                <div class="flex-grow min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">${gift.name}</p>
                    <div class="flex items-center space-x-2">
                        <img class="w-5 h-5" src="${gift.image}" alt="Gift">
                        <span class="text-xs text-gray-500">×${gift.num}</span>
                    </div>
                </div>
                <div class="text-xs text-gray-500">
                    ${new Date(gift.created_at * 1000).toLocaleTimeString()}
                </div>
            `;
            giftContent.appendChild(giftDiv);
        });
    }

    if (commentLogs?.length > 0) {
        commentContent.innerHTML = '<div class="text-center text-gray-500 text-sm mb-2">🥺 Comment muncul dalam 15 detik jadi tunggu aja, Kamu juga tidak bisa comment untuk saat ini</div>';
        const commentsDiv = document.createElement('div');
        commentsDiv.className = 'space-y-2 overflow-y-auto max-h-96';

        commentLogs.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg';
            commentDiv.innerHTML = `
                <div class="flex-shrink-0">
                    <img class="w-8 h-8 rounded-full" 
                        src="${comment.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg'}" 
                        alt="${comment.name}">
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex items-baseline space-x-2">
                        <span class="text-sm font-medium text-gray-900">${comment.name}</span>
                        <span class="text-xs text-gray-500">${new Date(comment.created_at * 1000).toLocaleTimeString()}</span>
                    </div>
                    <p class="text-sm text-gray-700 break-words">${comment.comment}</p>
                </div>
            `;
            commentsDiv.appendChild(commentDiv);
        });

        commentContent.appendChild(commentsDiv);
        commentsDiv.scrollTop = commentsDiv.scrollHeight;
    }

    window.showTab = function (tabName) {
        const rankTab = document.getElementById('rankTab');
        const giftTab = document.getElementById('giftTab');
        const commentTab = document.getElementById('commentTab');
        const rankContent = document.getElementById('rankContent');
        const giftContent = document.getElementById('giftContent');
        const commentContent = document.getElementById('commentContent');

        [rankTab, giftTab, commentTab].forEach(tab =>
            tab.classList.remove('bg-white', 'text-gray-900', 'shadow-sm'));
        [rankContent, giftContent, commentContent].forEach(content =>
            content.classList.add('hidden'));

        if (tabName === 'rank') {
            rankTab.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            rankContent.classList.remove('hidden');
        } else if (tabName === 'gift') {
            giftTab.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            giftContent.classList.remove('hidden');
        } else {
            commentTab.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
            commentContent.classList.remove('hidden');
        }
    };

    window.showTab('comment');
}

async function refreshPodiumData() {
    try {
        const pathSegments = window.location.pathname.split('/');
        const platform = pathSegments[2];
        const memberName = pathSegments[3];
        if (platform === 'showroom' || platform === 'sr') {
            const response = await fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan');
            if (!response.ok) throw new Error('Failed to fetch Showroom data');

            const data = await response.json();
            const streamData = data.find(stream =>
                stream.room_url_key.replace('JKT48_', '').toLowerCase() === memberName.toLowerCase()
            );

            if (streamData) {
                updateStageUsersList(streamData.stage_users, streamData.gift_log, streamData.comment_log);
                const container = document.getElementById('stageUsersContainer');
                container.style.opacity = '0';
                setTimeout(() => {
                    container.style.opacity = '1';
                }, 150);
            }
        }
    } catch (error) {
        showOfflineState();
    }
}

async function refreshComments() {
    try {
        const pathSegments = window.location.pathname.split('/');
        const platform = pathSegments[2];
        const memberName = pathSegments[3];
        if (platform === 'showroom' || platform === 'sr') {
            const response = await fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan');
            if (!response.ok) throw new Error('Failed to fetch Showroom data');

            const data = await response.json();
            const streamData = data.find(stream =>
                stream.room_url_key.replace('JKT48_', '').toLowerCase() === memberName.toLowerCase()
            );

            if (streamData) {
                const commentContent = document.getElementById('commentContent');
                if (commentContent && commentContent.classList.contains('hidden')) {
                    return;
                }

                commentContent.innerHTML = '<div class="text-center text-gray-500 text-sm mb-2">🥺 Comment muncul dalam 15 detik jadi tunggu aja, Kamu juga tidak bisa comment untuk saat ini</div>';

                if (streamData.comment_log?.length > 0) {
                    const commentsDiv = document.createElement('div');
                    commentsDiv.className = 'space-y-2 overflow-y-auto max-h-96';

                    streamData.comment_log.forEach(comment => {
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg';
                        commentDiv.innerHTML = `
                            <div class="flex-shrink-0">
                                <img class="w-8 h-8 rounded-full" 
                                    src="${comment.avatar_url || 'https://static.showroom-live.com/assets/img/no_profile.jpg'}" 
                                    alt="${comment.name}">
                            </div>
                            <div class="flex-grow min-w-0">
                                <div class="flex items-baseline space-x-2">
                                    <span class="text-sm font-medium text-gray-900">${comment.name}</span>
                                    <span class="text-xs text-gray-500">${new Date(comment.created_at * 1000).toLocaleTimeString()}</span>
                                </div>
                                <p class="text-sm text-gray-700 break-words">${comment.comment}</p>
                            </div>
                        `;
                        commentsDiv.appendChild(commentDiv);
                    });

                    commentContent.appendChild(commentsDiv);
                    commentsDiv.scrollTop = commentsDiv.scrollHeight;
                }
            }
        }
    } catch (error) {
        console.error('Error refreshing comments:', error);
    }
}

setInterval(refreshComments, 15000);

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
        showOfflineState();
    });

    return player.elements.container.querySelector('video');
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

                const streamDescription =
                    `🎥 ${streamData.user.name} sedang live streaming di IDN Live! ${streamData.title || ''}\n` +
                    `👥 ${streamData.view_count || 0} viewers\n` +
                    `📺 Nonton sekarang di 48intens!`;
                const thumbnailUrl = streamData.user.avatar || streamData.image || streamData.user.profile_pic || 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

                updateMetaTags({
                    title: `${streamData.user.name} Live Streaming | 48intens`,
                    description: streamDescription,
                    image: thumbnailUrl,
                    imageWidth: '500',
                    imageHeight: '500',
                    url: window.location.href
                });
                setupIDNChat(streamData.user.username, streamData.slug);

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
                const streamDescription =
                    `🎥 ${streamData.main_name} sedang live streaming di SHOWROOM!\n` +
                    `${streamData.genre_name || ''}\n` +
                    `👥 ${streamData.view_num?.toLocaleString() || 0} viewers\n` +
                    `📺 Nonton sekarang di 48intens!`;
                const thumbnailUrl = streamData.image_square || streamData.image || 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

                updateMetaTags({
                    title: `${streamData.main_name} Live Streaming | 48intens`,
                    description: streamDescription,
                    image: thumbnailUrl,
                    imageWidth: '320',
                    imageHeight: '320',
                    url: window.location.href
                });

                updateShowroomStreamInfo(streamData);
            } else {
                throw new Error('Stream not found');
            }
        }
    } catch (error) {
        showOfflineState();
    }
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
            showOfflineState();
        });
        playM3u8(streamData.mpath);

        await updateStreamInfo(platform, memberName);
    } catch (error) {
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
        showOfflineState();
    }
}

function updateShowroomStreamInfo(data) {
    if (!data) {
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

    const thumbnailUrl = data.image_square || data.image || 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737299881/intens_iwwo2a.webp';

    updateMetaTags({
        title: `${data.main_name} Live Streaming | 48intens`,
        description: streamDescription,
        image: thumbnailUrl,
        imageWidth: '320',
        imageHeight: '320',
        url: window.location.href
    });


    updateStageUsersList(data.stage_users, data.gift_log);

    playM3u8(originalQuality.url);
}


document.addEventListener('DOMContentLoaded', initializePlayer);