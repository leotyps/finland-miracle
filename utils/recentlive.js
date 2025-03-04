// Recentlive.js
async function fetchRecentLives() {
    const container = document.getElementById("recent-live-container");
    try {
        const response = await fetch(
            "https://48intensapi.my.id/api/livejkt48/recent-live"
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const cardPromises = data.data.map(createLiveCard);
            const cards = await Promise.all(cardPromises);
            container.innerHTML = "";
            cards.forEach(card => container.appendChild(card));
        } else {
            console.error("Failed to fetch recent lives:", data.message);
            showNotFoundMessage(container, "No recent streams found.");
        }
    } catch (error) {
        console.error("Error fetching recent lives:", error);
        showNotFoundMessage(container, "Failed to load recent streams. Please try again later.");
    }
}

async function createLiveCard(live) {
    let liveDetailImage = live.member.image;

    try {
        const response = await fetch(
            `https://48intensapi.my.id/api/livejkt48/recent-live/${live.data_id}`
        );
        const detailData = await response.json();

        if (detailData.success) {
            if (live.type.toLowerCase() === 'showroom') {
                liveDetailImage = detailData.data.room_info.img;
            }
            else if (live.type.toLowerCase() === 'idn') {
                liveDetailImage = (detailData.data.idn && detailData.data.idn.image)
                    || (detailData.data.room_info.img_alt)
                    || live.member.image;
            }
        }
    } catch (error) {
        console.error(`Error fetching detail for live ${live.data_id}:`, error);
    }

    const liveDate = new Date(live.created_at);
    const formattedDate = `${liveDate.getDate()} ${getMonthName(
        liveDate.getMonth()
    )} ${liveDate.getFullYear()}`;
    const durationInSeconds = Math.floor(live.live_info.duration / 1000);
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    const formattedViewers = new Intl.NumberFormat().format(
        live.live_info.viewers
    );

    const platformColor =
        live.type.toLowerCase() === "showroom" ? "bg-gradient-to-r from-rose-400 to-rose-500" : "bg-gradient-to-r from-amber-400 to-yellow-500";
    const card = document.createElement("div");
    card.className =
        "rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-50 relative";
    card.innerHTML = `
        <div class="absolute top-2 right-2 ${platformColor} text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
                ${live.type.toUpperCase()}
            </div>
            <div class="relative h-40 overflow-hidden">
            <img src="${liveDetailImage}" class="w-full h-full object-cover" alt="${live.member.nickname}">
            
            <div class="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
            ${formattedDate}
            </div>
        </div>

        <div class="px-3 py-3">
            <h3 class="font-bold text-gray-800 mb-1 truncate" title="${live.member.name}">${live.member.name}</h3>
            
            <div class="flex items-center justify-between text-sm mt-2">
            <div class="flex items-center space-x-1 text-indigo-600" title="Viewers">
                <i class="fas fa-users"></i>
                <span>${formattedViewers}</span>
            </div>
            
            <div class="flex items-center space-x-1 text-gray-600" title="Duration">
                <i class="far fa-clock"></i>
                <span>${formattedDuration}</span>
            </div>
            
            <div class="flex items-center space-x-1 text-yellow-600" title="Points">
                <i class="fas fa-gift"></i>
                <span>${new Intl.NumberFormat().format(live.points)}</span>
            </div>
            </div>
        </div>
        `;

        card.addEventListener("click", () => {
            window.location.href = `/recentlive/${live.data_id}`;
        });
    card.style.cursor = "pointer";

    return card;
}

function getMonthName(monthIndex) {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthIndex];
}
function showNotFoundMessage(container, message) {
    container.className = 'flex items-center justify-center min-h-[24rem]';

    container.innerHTML = `
        <div class="flex flex-col items-center">
            <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" alt="Not Found" class="w-64 mb-4">
            <p class="text-gray-500 text-lg font-bold">${message}</p>
        </div>
    `;
}

// Recentlivedetail.js
async function fetchLiveDetail() {
    const container = document.getElementById("recentlive-detail-container");
    const pathSegments = window.location.pathname.split('/');
    const dataId = pathSegments[pathSegments.length - 1];

    // Show skeleton loading state
    container.innerHTML = `
        <div class="animate-pulse">
            <div class="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
                <div class="h-64 bg-gray-300"></div>
                
                <div class="p-6 space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="w-20 h-20 bg-gray-300 rounded-full"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        ${[...Array(5)].map(() => `
                            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <div class="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                                <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    if (!dataId) {
        showNotFoundMessage(container, "Invalid Live ID");
        return;
    }

    try {
        const response = await fetch(
            `https://48intensapi.my.id/api/livejkt48/recent-live/${dataId}`
        );
        const data = await response.json();

        if (data.success) {
            displayLiveDetail(data.data);
        } else {
            showNotFoundMessage(container, "Failed to Load Live Details");
        }
    } catch (error) {
        console.error("Error fetching live detail:", error);
        showNotFoundMessage(container, "Network Error. Please Try Again");
    }
}

function showNotFoundMessage(container, message) {
    container.className = 'flex items-center justify-center min-h-[24rem]';

    container.innerHTML = `
        <div class="flex flex-col items-center p-6 text-center">
            <img 
                src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" 
                alt="Not Found" 
                class="w-64 mb-4 max-w-full"
            >
            <h2 class="text-xl font-bold text-gray-700 mb-2">Oops!</h2>
            <p class="text-gray-500 text-base">${message}</p>
        </div>
    `;
}

function displayLiveDetail(live) {
    const container = document.getElementById("recentlive-detail-container");

    const isShowroom = live.type === "showroom";
    const isIDN = live.type === "idn";

    const totalGifts = live.total_gifts || 0;
    const giftRate = live.gift_rate || 2500;
    const totalPoints = totalGifts * giftRate;
    const formattedTotalValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(totalPoints);
    const formattedRate = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(giftRate);

    let formattedViewers = "0";
    let formattedComments = "0";

    if (live.live_info) {
        if (live.live_info.viewers) {
            const viewers = typeof live.live_info.viewers === 'object'
                ? live.live_info.viewers.num
                : live.live_info.viewers;
            formattedViewers = new Intl.NumberFormat().format(viewers);
        }

        if (live.live_info.comments) {
            const comments = typeof live.live_info.comments === 'object'
                ? live.live_info.comments.num
                : live.live_info.comments;
            formattedComments = new Intl.NumberFormat().format(comments);
        }
    }

    let roomInfo = {
        name: "48Intens",
        nickname: "48Intens",
        fullname: "48Intens",
        img: "/assets/images/icon.png",
        img_alt: "/assets/images/icon.png",
    };

    if (isShowroom && live.room_info) {
        roomInfo = live.room_info;
    } else if (isIDN && live.idn_room) {
        roomInfo = {
            name: live.idn_room.name || "48Intens",
            nickname: live.idn_room.nickname || "48Intens",
            fullname: live.idn_room.fullname || "48Intens",
            img: live.idn_room.img || "/assets/images/icon.png",
            img_alt: live.idn_room.img_alt || "/assets/images/icon.png",
        };
    } else if (isIDN && live.idn) {
        roomInfo = {
            name: live.idn.title || "48Intens",
            nickname: live.idn.username || "48Intens",
            fullname: "48Intens",
            img: live.idn.image || "/assets/images/icon.png",
            img_alt: "/assets/images/icon.png",
        };
    }
    const giftSummary = {};
    if (live.live_info && live.live_info.gift && live.live_info.gift.log) {
        live.live_info.gift.log.forEach(log => {
            if (log.gifts && Array.isArray(log.gifts)) {
                log.gifts.forEach(gift => {
                    if (!giftSummary[gift.id]) {
                        giftSummary[gift.id] = {
                            totalValue: 0,
                            users: new Set(),
                            totalGifts: 0,
                            name: gift.name,
                            image_url: gift.image_url
                        };
                    }
                    giftSummary[gift.id].totalValue += giftRate * (gift.num || 1);
                    giftSummary[gift.id].users.add(log.user_id);
                    giftSummary[gift.id].totalGifts += (gift.num || 1);
                });
            }
        });
    }

    const giftListHTML = Object.entries(giftSummary)
        .sort((a, b) => b[1].totalValue - a[1].totalValue)
        .map(([giftId, summary]) => {
            const formattedGiftValue = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(summary.totalValue);

            const giftImageUrl = isShowroom
                ? summary.image_url
                : summary.image_url;
            const maxLength = 20;
            const giftName = summary.name.length > maxLength
                ? summary.name.substring(0, maxLength) + '...'
                : summary.name;

            return `
                <div class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
                    <div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div class="flex items-center space-x-3">
                            <div class="bg-yellow-100 p-2 rounded-full">
                                <img src="${giftImageUrl}" alt="${summary.name}" class="w-8 h-8 sm:w-10 sm:h-10">
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-gray-800 truncate text-sm sm:text-base" title="${summary.name}">${giftName}</p>
                                <p class="text-xs sm:text-sm text-gray-500">${summary.users.size} users Ã— ${summary.totalGifts} gifts</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    const fansList = live.fans || [];
    const usersList = live.users || [];

    container.innerHTML = `
        <div class="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
            <div class="relative">
                <div class="h-64 overflow-hidden">
                    <img src="${live.room_info.img}" alt="${live.room_info.name}" class="w-full h-full rounded-3xl object-cover">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-25"></div>
                </div>
                
                <div class="absolute bottom-0 left-0 w-full p-6 flex items-end space-x-4">
                    <div class="relative aspect-square">
                        <img src="${live.room_info.img_alt || live.room_info.img}" alt="${live.room_info.nickname}" 
                            class="w-20 h-25 md:w-15 md:h-15 rounded-full border-4 border-white shadow-lg object-cover aspect-square">
                    </div>
                    
                <div class="text-white">
                    <h1 class="text-xl md:text-2xl font-bold truncate max-w-full">${live.room_info.name}</h1>
                    <p class="text-sm md:text-base text-gray-200 truncate max-w-full">${live.room_info.fullname || ''}</p>
                </div>
                </div>
            </div>
            ${isIDN && live.idn ? `
            <div class="p-4 bg-white border-b">
                <div class="flex items-center">
                    <img src="${live.idn.image}" alt="${live.idn.title}" class="w-20 h-20 object-cover rounded-lg mr-4">
                    <div>
                        <h3 class="font-bold text-gray-800">${live.idn.title}</h3>
                        <p class="text-gray-500 text-sm">@${live.idn.username}</p>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="px-6 pt-4">
                <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full ${isShowroom ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                    ${isShowroom ? 'SHOWROOM LIVE' : 'IDN LIVE'}
                </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-gray-500 text-sm">Viewers</h3>
                        <i class="fas fa-users text-indigo-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-indigo-600">${(() => {
            if (live.live_info && live.live_info.viewers) {
                return new Intl.NumberFormat().format(
                    typeof live.live_info.viewers === 'object'
                        ? live.live_info.viewers.num
                        : live.live_info.viewers
                );
            }
            if (live.date && live.viewers) {
                return new Intl.NumberFormat().format(live.viewers);
            }
            return '0';
        })()}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-gray-500 text-sm">Comments</h3>
                        <i class="fas fa-comment text-purple-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-purple-600">${(() => {
            if (live.live_info && live.live_info.comments) {
                return new Intl.NumberFormat().format(
                    typeof live.live_info.comments === 'object'
                        ? live.live_info.comments.num
                        : live.live_info.comments
                );
            }
            if (live.date && live.comments) {
                return new Intl.NumberFormat().format(live.comments);
            }
            return '0';
        })()}</p>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-gray-500 text-sm font-medium">Total Gifts</h3>
                        <i class="fas fa-gift text-yellow-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-yellow-600">Â± (${formattedTotalValue})</p>
                    <p class="text-xs text-gray-500 mt-1">Rate: ${formattedRate}/gift</p>
                </div>
                
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-gray-500 text-sm">Start Live</h3>
                        <i class="fas fa-play-circle text-green-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-green-600">
                        ${(() => {
            let startDate;
            if (live.live_info && live.live_info.start_date) {
                startDate = new Date(live.live_info.start_date);
            } else if (live.live_info && live.live_info.date && live.live_info.date.start) {
                startDate = new Date(live.live_info.date.start);
            } else if (live.date && live.date.start) {
                startDate = new Date(live.date.start);
            }

            return startDate
                ? new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                }).format(startDate)
                : 'N/A';
        })()}
                    </p>
                </div>
                
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-gray-500 text-sm">End Live</h3>
                        <i class="fas fa-stop-circle text-red-500"></i>
                    </div>
                    <p class="text-2xl font-bold text-red-600">
                        ${(() => {
            let endDate;
            if (live.live_info && live.live_info.end_date) {
                endDate = new Date(live.live_info.end_date);
            } else if (live.live_info && live.live_info.date && live.live_info.date.end) {
                endDate = new Date(live.live_info.date.end);
            } else if (live.date && live.date.end) {
                endDate = new Date(live.date.end);
            }

            return endDate
                ? new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                }).format(endDate)
                : 'N/A';
        })()}
                    </p>
                </div>
            </div>
            <div class="px-6 pb-6">
                <!-- Gift List -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Gift List</h3>
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Total: ${new Intl.NumberFormat().format(totalGifts)} gifts</span>
                    </div>
                    <div class="flex flex-wrap -mx-2">
                        ${giftListHTML || `<p class="text-gray-500 text-center py-4 w-full">No gift data available</p>`}
                    </div>
                </div>

                ${isShowroom ? `
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Fans</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                            ${fansList.length > 0
                ? fansList.slice(0, 14).map((fan, index) => {
                    const avatarUrl = `https://static.showroom-live.com/image/avatar/${fan.avatar_id}.png`;
                    return `
                                        <div class="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-xs hover:bg-gray-100 transition-colors">
                                            <div class="flex flex-col items-center space-y-2">
                                                <img src="${avatarUrl}" alt="${fan.name}" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-2">
                                                <p class="font-semibold text-gray-800 text-center truncate w-full text-sm sm:text-base">${fan.name}</p>
                                                <div class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                                    Score: ${fan.fans_point}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                }).join("")
                : `<p class="text-gray-500 text-center py-4 w-full col-span-7">No fan data available</p>`
            }
                        </div>
                    </div>
                    ` : ''}

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Users</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                        ${usersList.length > 0
            ? usersList
                .slice(0, 14)
                .map(user => {
                    const avatarUrl = isShowroom
                        ? `https://static.showroom-live.com/image/avatar/${user.avatar_id}.png`
                        : (user.avatar_url || 'https://via.placeholder.com/40');

                    return `
                                        <div class="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-xs hover:bg-gray-100 transition-colors">
                                            <div class="flex flex-col items-center space-y-2">
                                                <img src="${avatarUrl}" alt="${user.name}" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-2">
                                                <p class="font-semibold text-gray-800 text-center truncate w-full text-sm sm:text-base">${user.name}</p>
                                                <div class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                    ${user.comments || 0} comments
                                                </div>
                                            </div>
                                        </div>
                                    `;
                }).join("")
            : `<p class="text-gray-500 text-center py-4 w-full col-span-7">No user data available</p>`
        }
                    </div>
                </div>
            </div>
        </div>`;
}

function getMonthName(monthIndex) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthIndex];
}

document.addEventListener("DOMContentLoaded", fetchLiveDetail,);
document.addEventListener("DOMContentLoaded", fetchRecentLives,);
