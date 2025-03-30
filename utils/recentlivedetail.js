const liveDetailContainer = document.getElementById("live-detail-container");
const loadingSkeleton = document.getElementById("loading-skeleton");
const errorContainer = document.getElementById("error-container");

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: 'Asia/Jakarta'
    })}`;
}

function formatDuration(duration) {
    return duration.replace(' minutes', 'm').replace(' hour', 'h');
}

function getPlatformBadge(platform) {
    switch (platform.toLowerCase()) {
        case 'showroom':
            return `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm">
                    Showroom
                </span>`;
        case 'idn':
            return `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-sm">
                    IDN Live
                </span>`;
        default:
            return `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm">
                    Live
                </span>`;
    }
}

function createShowroomGiftLog(gifts) {
    if (!gifts || gifts.length === 0) {
        return `
            <div class="flex items-center justify-center py-8">
                <div class="flex flex-col items-center">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V4m0 13a9 9 0 01-9 9m9-9a9 9 0 019 9m-9-2a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0m6 0a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium mt-2">No gift data available</p>
                </div>
            </div>`;
    }

    return `
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gift</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${gifts.map(gift => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                    <img class="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" src="${gift.avatar_url}" alt="${gift.name}" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
                                </div>
                                <div class="ml-2 sm:ml-4">
                                    <div class="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">${gift.name}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <img src="${gift.image}" alt="${gift.name}" class="h-6 w-6 sm:h-8 sm:w-8 mr-1 sm:mr-2 object-contain" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
                                <span class="text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">${gift.name}</span>
                            </div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${gift.num.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}

function createIdnGiftLog(gifts) {
    if (!gifts || gifts.length === 0) {
        return `
            <div class="flex items-center justify-center py-8">
                <div class="flex flex-col items-center">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V4m0 13a9 9 0 01-9 9m9-9a9 9 0 019 9m-9-2a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0m6 0a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium mt-2">No gift data available</p>
                </div>
            </div>`;
    }

    return `
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Points</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gold</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${gifts.map(gift => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${gift.rank}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                    <img class="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" src="${gift.image_url}" alt="${gift.name}" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
                                </div>
                                <div class="ml-2 sm:ml-4">
                                    <div class="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">${gift.name}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${gift.total_point.toLocaleString()}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${gift.gold.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}

function createShowroomStageUsers(users) {
    if (!users || users.length === 0) {
        return `
            <div class="flex items-center justify-center py-8">
                <div class="flex flex-col items-center">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V4m0 13a9 9 0 01-9 9m9-9a9 9 0 019 9m-9-2a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0m6 0a2 2 0 012-2V4a2 2 0 114 0v15a2 2 0 11-4 0"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium mt-2">No stage user data available</p>
                </div>
            </div>`;
    }

    return `
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th scope="col" class="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${users.map(user => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${user.rank}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                    <img class="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" src="${user.user.avatar_url}" alt="${user.user.name}" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
                                </div>
                                <div class="ml-2 sm:ml-4">
                                    <div class="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">${user.user.name}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}

function updateDocumentMeta(data) {
    const { type, member, platform_data } = data;
    const isShowroom = type.toLowerCase() === 'showroom';
    // 1. Update document title
    document.title = `${member.name} - Recent Live | JKT48 Showroom & IDN`;

    // 2. Prepare thumbnail URL with cache busting
    const thumbnailUrl = isShowroom 
        ? member.image.thumbnail 
        : platform_data.thumbnail;
    const timestampedUrl = `${thumbnailUrl}?t=${new Date().getTime()}`;

    // 3. Remove all existing OG and Twitter tags more effectively
    const metaTagsToRemove = [
        'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
        'og:image:width', 'og:image:height', 'og:image:alt',
        'twitter:card', 'twitter:title', 'twitter:description', 
        'twitter:image', 'twitter:creator'
    ];
    
    metaTagsToRemove.forEach(prop => {
        // Remove property-based tags
        document.querySelectorAll(`meta[property="${prop}"]`).forEach(el => el.remove());
        // Remove name-based tags (for Twitter)
        document.querySelectorAll(`meta[name="${prop}"]`).forEach(el => el.remove());
    });

    // 4. Create new meta tags with proper attributes
    const metaTagsData = [
        // Open Graph Tags
        { property: 'og:title', content: `${member.name}'s Live Stream` },
        { property: 'og:description', content: `Watch ${member.name}'s recent live stream on ${isShowRoom ? 'Showroom' : 'IDN Live'}` },
        { property: 'og:image', content: timestampedUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${member.name} Live Stream Thumbnail` },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'website' },
        
        // Twitter Cards Tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: `${member.name}'s Live Stream` },
        { name: 'twitter:description', content: `Watch ${member.name}'s recent live stream` },
        { name: 'twitter:image', content: timestampedUrl },
        { name: 'twitter:image:alt', content: `${member.name} Live Stream Thumbnail` },
        { name: 'twitter:creator', content: '@48intens' }
    ];

    // 5. Add new meta tags to head
    metaTagsData.forEach(tag => {
        const meta = document.createElement('meta');
        for (const [key, value] of Object.entries(tag)) {
            meta.setAttribute(key, value);
        }
        document.head.appendChild(meta);
    });

    // 6. Force social media crawlers to refresh (debugging)
    console.log('Meta tags updated at:', new Date().toISOString());
    console.log('Thumbnail URL:', timestampedUrl);
    
    // 7. Additional fallback for Facebook (using their debugger API)
    if (window.location.href.includes('facebook.com')) {
        fetch(`https://graph.facebook.com/?id=${encodeURIComponent(window.location.href)}&scrape=true&method=post`);
    }
}

function addStructuredData(data) {
    const { member, live_info } = data;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": `${member.name}'s Live Stream`,
        "description": `Watch ${member.name}'s recent live stream`,
        "thumbnailUrl": member.image.thumbnail,
        "uploadDate": live_info.date.start,
        "duration": live_info.date.duration,
        "contentUrl": window.location.href
    });
    document.head.appendChild(script);
}


function renderLiveDetail(data) {

    const { type, member, live_info, gift_metrics, details, platform_data } = data;
    const isShowroom = type.toLowerCase() === 'showroom';
    const content = `
    <div class="bg-white rounded-3xl sm:rounded-xl shadow-md sm:shadow-xl overflow-hidden border border-gray-200 mx-2 sm:mx-0">
        <div class="w-full h-48 sm:h-64 bg-gray-200 overflow-hidden">
            <img class="w-full h-full object-cover" src="${member.image.thumbnail}" alt="${member.name} banner" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
        </div>
        <div class="bg-gradient-to-r from-pink-100 to-blue-100 p-4 sm:p-6 border-b border-gray-200 relative">
            <div class="flex flex-col md:flex-row items-start md:items-center">
                <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6 relative -mt-16">
                    <div class="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 sm:border-4 border-white shadow-lg bg-white p-1">
                        <img class="h-full w-full rounded-full object-cover" src="${member.image.thumbnail}" alt="${member.name}" onerror="this.src='https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png'">
                    </div>
                </div>
                <div class="flex-1 w-full">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div class="mb-2 sm:mb-0">
                            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">${member.name}</h1>
                            <p class="text-base sm:text-lg text-gray-600">${member.nickname} JKT48</p>
                        </div>
                        <div class="mt-2 sm:mt-0">
                            ${getPlatformBadge(type)}
                        </div>
                    </div>
                    
                    <div class="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                        <div class="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100">
                            <p class="text-xs text-gray-500 uppercase font-semibold">Viewers</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${live_info.viewers.toLocaleString()}</p>
                        </div>
                        <div class="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100">
                            <p class="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${formatDuration(live_info.date.duration)}</p>
                        </div>
                        <div class="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100">
                            <p class="text-xs text-gray-500 uppercase font-semibold">Total Points</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${gift_metrics.total_points.toLocaleString()}</p>
                        </div>
                        <div class="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100">
                            <p class="text-xs text-gray-500 uppercase font-semibold">Points/Viewer</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${gift_metrics.points_per_viewer.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-4 sm:p-6">
            <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <div>
                    <h2 class="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Live Information</h2>
                    <div class="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div class="grid grid-cols-1 gap-3 sm:gap-4">
                            <div>
                                <p class="text-xs text-gray-500 uppercase font-semibold">Started</p>
                                <p class="font-medium text-gray-900">${formatDate(live_info.date.start)}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500 uppercase font-semibold">Ended</p>
                                <p class="font-medium text-gray-900">${formatDate(live_info.date.end)}</p>
                            </div>
                            ${isShowroom ? `
                            <div>
                                <p class="text-xs text-gray-500 uppercase font-semibold">Room ID</p>
                                <p class="font-medium text-gray-900">${platform_data.room_id}</p>
                            </div>
                            ` : `
                            <div>
                                <p class="text-xs text-gray-500 uppercase font-semibold">Stream Title</p>
                                <p class="font-medium text-gray-900">${platform_data.title || 'N/A'}</p>
                            </div>
                            `}
                        </div>
                    </div>
                </div>

            <div class="mt-4 sm:mt-0">
                <h2 class="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Gift Metrics</h2>
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <p class="text-xs text-gray-500 font-semibold mb-2">
                        ⚠️ Noted: Data pada card gift metric mungkin ada kesalahan pengambilan dari bot. 
                        Jika ada ketidaksesuaian, mohon dicek kembali dengan sumber resmi.
                    </p>
                    ${isShowroom ? `
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold">Total Points</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${gift_metrics.total_points.toLocaleString()}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold">Points/Viewer</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${gift_metrics.points_per_viewer.toFixed(2)}</p>
                        </div>
                    </div>
                    ` : `
                    <div class="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold">Total Gold</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${Math.floor(gift_metrics.total_points / 4)} Gold</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold">Gold/Viewer</p>
                            <p class="text-lg sm:text-xl font-bold text-gray-800">${(gift_metrics.points_per_viewer / 4).toFixed(2)}</p>
                        </div>
                    </div>
                    `}
                </div>
            </div>

            <div class="mt-6 sm:mt-8">
                <h2 class="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Gift Log</h2>
                ${isShowroom ? createShowroomGiftLog(details.gift_log) : createIdnGiftLog(details.gift_log)}
            </div>

            ${isShowroom && details.stage_users ? `
            <div class="mt-6 sm:mt-8">
                <h2 class="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Top Supporters</h2>
                ${createShowroomStageUsers(details.stage_users)}
            </div>
            ` : ''}
        </div>
    </div>
    `;

    liveDetailContainer.innerHTML = content;
}

function showNotFoundMessage(message) {
    loadingSkeleton.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    errorContainer.innerHTML = `
    <div class="min-h-[24rem] relative">
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center text-center">
                <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" 
                        alt="Not Found" 
                        class="w-48 sm:w-64 mb-4">
                <h3 class="text-lg font-medium text-gray-900 mb-1">Content Not Found</h3>
                <p class="text-gray-500 mb-4 px-4">${message}</p>
                <button onclick="fetchLiveDetail()" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md">
                    Retry
                </button>
            </div>
        </div>
    </div>
    `;
}

function getLiveIdFromUrl() {
    const pathSegments = window.location.pathname.split('/');
    const possibleId = pathSegments[pathSegments.length - 1];
    if (/^[a-zA-Z0-9-_]+$/.test(possibleId)) {
        return possibleId;
    }
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchLiveDetail() {
    try {
        const liveId = getLiveIdFromUrl();

        if (!liveId) {
            throw new Error('Live stream ID not found');
        }

        loadingSkeleton.classList.remove('hidden');
        errorContainer.classList.add('hidden');
        liveDetailContainer.innerHTML = '';

        const response = await fetch(`https://48intensapi.my.id/api/jkt48/historylive/${liveId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
            renderLiveDetail(data.data);
        } else {
            throw new Error(data.message || 'Failed to load live details');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotFoundMessage(error.message || 'Failed to load live stream details');
    } finally {
        loadingSkeleton.classList.add('hidden');
    }
}


document.addEventListener('DOMContentLoaded',updateDocumentMeta(data),
addStructuredData(data),fetchLiveDetail);
window.fetchLiveDetail = fetchLiveDetail;