// live.js
async function fetchLiveData() {
    try {
        const container = document.getElementById('liveContainer');
        const fragment = document.createDocumentFragment(); 

        container.innerHTML = ''; 

        const [idnResponse, showroomResponse] = await Promise.all([
            fetch('https://48intensapi.my.id/api/idnlive/jkt48'),
            fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan')
        ]);

        const idnData = await idnResponse.json();
        const showroomData = await showroomResponse.json();

        let hasContent = false;

        if (idnData.data && idnData.data.length > 0) {
            idnData.data.forEach(stream => {
                const card = createIDNCard(stream);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = card;
                fragment.appendChild(wrapper.firstElementChild); 
            });
            hasContent = true;
        }

        if (showroomData && showroomData.length > 0) {
            showroomData.forEach(stream => {
                const card = createShowroomCard(stream);
                const wrapper = document.createElement('div');
                wrapper.innerHTML = card;
                fragment.appendChild(wrapper.firstElementChild);
            });
            hasContent = true;
        }

        if (!hasContent) {
            showNotFoundMessage(container, 'No live streams available at the moment 😭');
        } else {
            container.appendChild(fragment);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        const container = document.getElementById('liveContainer');
        showNotFoundMessage(container, 'Error loading live streams. Please try again later 😭');
    }
}

function showNotFoundMessage(container, message) {
    container.innerHTML = '';
    container.className = 'min-h-[24rem] relative';

    const notFoundContent = `
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center">
                <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" 
                        alt="Not Found" 
                        class="w-64  mb-4">
                <p class="text-gray-500 text-lg font-bold">${message}</p>
            </div>
        </div>
    `;

    container.innerHTML = notFoundContent;
}

function compressStreamData(url, platform) {
    const streamId = generateShortId(url);
    const streamData = {
        mpath: url,
        ptype: platform === 'showroom' ? 'sroom' : 'idnlv',
        exp: Date.now() + (3 * 60 * 60 * 1000)
    };

    localStorage.setItem(`stream_${streamId}`, JSON.stringify(streamData));
    return streamId;
}

function generateShortId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36).slice(-6);
}


function createIDNCard(stream) {
    const memberUsername = stream.user.username.replace('jkt48_', '');
    const proxyStreamUrl = `https://jkt48showroom-api.my.id/proxy?url=${encodeURIComponent(stream.stream_url)}`;
    const streamId = compressStreamData(proxyStreamUrl, 'idn');
    const watchUrl = `/live/idn/${memberUsername}/${streamId}`;

    const freeStreamTitles = [
        'TEMEN NGOBROL',
        'TEMEN MAIN',
        'TEMEN MASAK',
        'TEMEN MAKAN',
        'TRIAL'
    ];
    
    // Use case-insensitive comparison and check for substrings
    const isFreeStream = freeStreamTitles.some(title => 
        stream.title && stream.title.toUpperCase().includes(title.toUpperCase())
    );
    
    const isMemberAccount = stream.user.username.startsWith('jkt48_');

    let buttonProps = {
        label: "Get Ticket",
        link: "https://www.idn.app/jkt48-official",
        icon: "fa-ticket-alt",
        gradient: "from-amber-400 to-yellow-500"
    };
    
    if (isFreeStream || isMemberAccount) {
        buttonProps = {
            label: "Watch Stream",
            link: watchUrl,
            icon: "fa-play",
            gradient: "from-amber-400 to-yellow-500"
        };
    }

    return `
        <div class="bg-yellow-100/80 rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-102 hover:shadow-xl">
            <div class="relative group">
                <img src="${stream.image}" alt="Live Stream Thumbnail" class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105">
                <div class="absolute inset-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute top-3 left-3 flex items-center space-x-2">
                    <div class="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
                        <span class="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span>LIVE</span>
                    </div>
                    <div class="bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        ${stream.view_count} watching
                    </div>
                </div>
                <div class="absolute top-3 right-3">
                    <div class="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        IDN Live
                    </div>
                </div>
            </div>
            <div class="p-5">
                <div class="flex items-center space-x-4 mb-4">
                    <div class="relative">
                        <img src="${stream.user.avatar}" alt="Avatar" class="w-12 h-12 rounded-full border-2 border-purple-100">
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-600">${stream.user.name}</h3>
                        <p class="text-gray-600 text-sm">@${stream.user.username}</p>
                    </div>
                </div>
                <h4 class="font-medium text-gray-600 mb-4 line-clamp-2">${stream.title}</h4>
                <a href="${buttonProps.link}" class="block w-full text-center px-6 py-3 bg-gradient-to-r ${buttonProps.gradient} text-white font-medium rounded-3xl hover:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg">
                    <i class="fas ${buttonProps.icon} mr-2"></i>
                    ${buttonProps.label}
                </a>
            </div>
        </div>
    `;
}


function createShowroomCard(stream) {
    const memberUsername = stream.room_url_key.replace('JKT48_', '').toLowerCase();
    const streamId = compressStreamData(stream.streaming_url_list[0].url, 'showroom');
    const watchUrl = `/live/sr/${memberUsername}/${streamId}`;

    return `
        <div class="bg-rose-300/80 rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-102 hover:shadow-xl">
            <div class="relative group">
                <img src="${stream.image}" alt="Live Stream Thumbnail" class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105">
                <div class="absolute inset-0  group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute top-3 left-3 flex items-center space-x-2">
                    <div class="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
                        <span class="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span>LIVE</span>
                    </div>
                    <div class="bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        ${stream.view_num.toLocaleString()} watching
                    </div>
                </div>
                <div class="absolute top-3 right-3">
                    <div class="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        SHOWROOM
                    </div>
                </div>
            </div>
            <div class="p-5">
                <div class="flex items-center space-x-4 mb-4">
                    <div class="relative">
                        <img src="${stream.image_square}" alt="Avatar" class="w-12 h-12 rounded-full border-2 border-purple-100">
                        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 class="font-bold text-white">${stream.main_name}</h3>
                        <p class="text-white font-medium text-sm">${stream.genre_name}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2 text-gray-500">
                        <i class="text-white fas fa-users"></i>
                        <span class="text-sm text-white">${stream.follower_num.toLocaleString()} followers</span>
                    </div>
                </div>
                <a href="${watchUrl}" class="block w-full text-center px-6 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-3xl hover:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-play mr-2"></i>
                    Watch Stream
                </a>
            </div>
        </div>
    `;
}


async function fetchTopStreamers() {
    const topStreamersContainer = document.getElementById('topStreamersContainer');
    
    const skeletonCards = Array(5).fill().map(() => `
        <div class="bg-gray-50 rounded-lg p-4 mb-3 skeleton animate-pulse">
            <div class="flex items-center space-x-4">
                <div class="relative">
                    <div class="absolute -top-2 -left-2 w-6 h-6 bg-gray-300 rounded-full"></div>
                    <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div class="flex-1">
                    <div class="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    `).join('');

    topStreamersContainer.innerHTML = `
        <div class="bg-white border-2 border-gray-200 rounded-3xl shadow-lg p-6">
            <h2 class="text-xl font-bold mb-6 text-gray-700">Top Streamers of the Week</h2>
            ${skeletonCards}
        </div>
    `;

    try {
        const response = await fetch('https://48intensapi.my.id/api/livejkt48/topstreamer');
        const data = await response.json();
        
        if (data.success && data.data) {
            const streamers = data.data;
            const getRankStyle = (rank) => {
                switch(rank) {
                    case 1:
                        return {
                            badge: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
                            text: 'text-yellow-500',
                            border: 'border-yellow-200',
                            icon: '👑'
                        };
                    case 2:
                        return {
                            badge: 'bg-gradient-to-r from-gray-400 to-gray-600',
                            text: 'text-gray-600',
                            border: 'border-gray-200',
                            icon: '⭐'
                        };
                    case 3:
                        return {
                            badge: 'bg-gradient-to-r from-amber-500 to-orange-600',
                            text: 'text-orange-500',
                            border: 'border-orange-200',
                            icon: '🔥'
                        };
                    default:
                        return {
                            badge: 'bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300',
                            text: 'text-gray-700',
                            border: 'border-purple-100',
                            icon: ''
                        };
                }
            };
            
            const streamersList = streamers.map(streamer => {
                const style = getRankStyle(streamer.rank);
                return `
                    <div class="flex items-center bg-gray-50 space-x-4 p-4 rounded-lg mb-3">
                        <div class="relative">
                            <div class="absolute -top-2 -left-2 ${style.badge} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                ${streamer.rank}
                            </div>
                            <img src="${streamer.image_url}" alt="${streamer.name}" 
                                class="w-12 h-12 rounded-full border-2 ${style.border}">
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h3 class="font-bold ${style.text} line-clamp-1">${streamer.name}</h3>
                                ${style.icon ? `<span>${style.icon}</span>` : ''}
                            </div>
                            <p class="text-sm text-gray-500">${streamer.total_live_stream}</p>
                        </div>
                    </div>
                `;
            }).join('');
            
            topStreamersContainer.innerHTML = `
                <div class="bg-white border-2 border-gray-200 rounded-3xl shadow-lg p-6">
                    <h2 class="text-xl font-bold mb-6 text-gray-700">Top Streamers of the Week</h2>
                    ${streamersList}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching top streamers:', error);
        topStreamersContainer.innerHTML = `
            <div class="bg-white rounded-3xl shadow-lg p-6">
                <h2 class="text-xl font-bold mb-6 text-gray-700">Top Streamers of the Week</h2>
                <p class="text-gray-500 text-center">Failed to load top streamers data</p>
            </div>
        `;
    }
}
fetchTopStreamers();
fetchLiveData();
setInterval(fetchLiveData, 30000);