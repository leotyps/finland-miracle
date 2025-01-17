// live.js
async function fetchLiveData() {
    try {
        const container = document.getElementById('liveContainer');
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
                container.innerHTML += card;
            });
            hasContent = true;
        }

        if (showroomData && showroomData.length > 0) {
            showroomData.forEach(stream => {
                const card = createShowroomCard(stream);
                container.innerHTML += card;
            });
            hasContent = true;
        }

        if (!hasContent) {
            showNotFoundMessage(container, 'No live streams available at the moment 😭');
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
                <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1733508715/allactkiuu9tmtrqfumi.png" 
                        alt="Not Found" 
                        class="w-32 h-32 mb-4">
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
    const isOfficialAccount = stream.user.username === "jkt48-official";
    const buttonLabel = isOfficialAccount ? "Get Ticket" : "Watch Stream";
    const buttonLink = isOfficialAccount ? "https://www.idn.app/jkt48-official" : watchUrl;

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
                        <p class=" text-gray-600 text-sm">@${stream.user.username}</p>
                    </div>
                </div>
                <h4 class="font-medium text-gray-600 mb-4 line-clamp-2">${stream.title}</h4>
                <a href="${buttonLink}" class="block w-full text-center px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-medium rounded-3xl hover:opacity-80 transition-all duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-ticket-alt mr-2"></i>
                    ${buttonLabel}
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


fetchLiveData();
setInterval(fetchLiveData, 30000);