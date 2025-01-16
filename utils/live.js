async function fetchLiveData() {
    try {
        const [idnResponse, showroomResponse] = await Promise.all([
            fetch('https://48intensapi.my.id/api/idnlive/jkt48'),
            fetch('https://48intensapi.my.id/api/showroom/jekatepatlapan')
        ]);

        const idnData = await idnResponse.json();
        const showroomData = await showroomResponse.json();

        const container = document.getElementById('liveContainer');
        container.innerHTML = '';
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6';

        let hasLiveStreams = false;

        if (idnData.data && idnData.data.length > 0) {
            hasLiveStreams = true;
            idnData.data.forEach(stream => {
                const card = createIDNCard(stream);
                container.innerHTML += card;
            });
        }

        if (showroomData && showroomData.length > 0) {
            hasLiveStreams = true;
            showroomData.forEach(stream => {
                const card = createShowroomCard(stream);
                container.innerHTML += card;
            });
        }

        if (!hasLiveStreams) {
            showNotFoundMessage(container, 'No one is live right now 😭');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        const container = document.getElementById('liveContainer');
        showNotFoundMessage(container, 'Error loading live streams. Please try again later.');
    }
}

function showNotFoundMessage(container, message) {
    container.className = 'flex items-center justify-center min-h-[24rem]';
    
    container.innerHTML = `
        <div class="text-center">
            <img 
                src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1733508715/allactkiuu9tmtrqfumi.png" 
                alt="Not Found" 
                class="w-32 h-32 mx-auto mb-4"
            >
            <p class="text-gray-500 text-lg font-medium">${message}</p>
        </div>
    `;
}


function encodeStreamData(data) {
    try {
        const shortData = {
            u: data.mpath.replace(/^https?:\/\//, ''), // Remove protocol
            t: data.ptype[0]
        };
        
        return btoa(JSON.stringify(shortData))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')
            .substring(0, 20); 
    } catch (error) {
        console.error('Encoding error:', error);
        return '';
    }
}
function createIDNCard(stream) {
    const memberUsername = stream.user.username.replace('jkt48_', '');
    const proxyStreamUrl = `https://jkt48showroom-api.my.id/proxy?url=${encodeURIComponent(stream.stream_url)}`;
    
    const streamData = {
        mpath: proxyStreamUrl,
        ptype: "idnlv"
    };
    
    const encodedStream = encodeStreamData(streamData);
    const watchUrl = `/components/detail/live.html?member=${memberUsername}&platform=idn&s=${encodedStream}`;
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="relative">
                <img src="${stream.image}" alt="Live Stream Thumbnail" class="w-full h-48 object-cover">
                <div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                    <span class="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    LIVE
                </div>
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    ${stream.view_count} viewers
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center mb-3">
                    <img src="${stream.user.avatar}" alt="Avatar" class="w-10 h-10 rounded-full mr-3">
                    <div>
                        <h3 class="font-semibold text-gray-800">${stream.user.name}</h3>
                        <p class="text-gray-600 text-sm">@${stream.user.username}</p>
                    </div>
                </div>
                <h4 class="font-medium text-gray-800 mb-2">${stream.title}</h4>
                <div class="flex justify-between items-center">
                    <p class="text-gray-600 text-sm">IDN Live</p>
                    <a href="${watchUrl}" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                        <i class="fas fa-play mr-2"></i>
                        Watch Live
                    </a>
                </div>
            </div>
        </div>
    `;
}

function createShowroomCard(stream) {
    const memberUsername = stream.room_url_key.replace('JKT48_', '').toLowerCase();
    
    const streamData = {
        mpath: stream.streaming_url_list[0].url,
        ptype: "sroom"
    };
    
    const encodedStream = encodeStreamData(streamData);
    const watchUrl = `/components/detail/live.html?member=${memberUsername}&platform=showroom&s=${encodedStream}`;
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="relative">
                <img src="${stream.image}" alt="Live Stream Thumbnail" class="w-full h-48 object-cover">
                <div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                    <span class="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    LIVE
                </div>
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    ${stream.view_num.toLocaleString()} viewers
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center mb-3">
                    <img src="${stream.image_square}" alt="Avatar" class="w-10 h-10 rounded-full mr-3">
                    <div>
                        <h3 class="font-semibold text-gray-800">${stream.main_name}</h3>
                        <p class="text-gray-600 text-sm">SHOWROOM</p>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="text-sm text-gray-600">
                        <div>Followers: ${stream.follower_num.toLocaleString()}</div>
                        <div>${stream.genre_name}</div>
                    </div>
                    <a href="${watchUrl}" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                        <i class="fas fa-play mr-2"></i>
                        Watch Live
                    </a>
                </div>
            </div>
        </div>
    `;
}

fetchLiveData();
setInterval(fetchLiveData, 10000);