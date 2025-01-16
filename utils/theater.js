function getShowStatus(showInfo) {
    try {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const showInfoParts = showInfo.split(", ");
        if (showInfoParts.length < 2) {
            console.error("Invalid showInfo format:", showInfo);
            return null;
        }
        
        const [datePart, timePart] = showInfoParts[1].split(" ");
        if (!datePart || !timePart) {
            console.error("Invalid showInfo format:", showInfo);
            return null;
        }

        const showDateTime = new Date(`${datePart.replace(/-/g, "/")} ${timePart}:00`);
        const showEndDateTime = new Date(showDateTime);
        showEndDateTime.setHours(showEndDateTime.getHours() + 2);
        
        if (isNaN(showDateTime.getTime())) {
            console.error("Invalid show date/time:", `${datePart} ${timePart}`);
            return null;
        }

        const showDateOnly = new Date(showDateTime);
        showDateOnly.setHours(0, 0, 0, 0);
        if (showEndDateTime < now) {
            return null;
        }
        if (showDateOnly.getTime() === today.getTime()) {
            if (now >= showDateTime && now <= showEndDateTime) {
                return { text: "Sedang Berlangsung" };
            }
            return { text: "Hari ini" };
        }

        // Tomorrow's shows
        if (showDateOnly.getTime() === tomorrow.getTime()) {
            return { text: "Besok" };
        }

        // Future shows
        return { text: "Upcoming" };

    } catch (error) {
        console.error("Error in getShowStatus:", error);
        return null;
    }
}


async function fetchTheaterData() {
    const container = document.getElementById('theater-container');
    container.innerHTML = '';

    try {
        const theaterResponse = await fetch('https://48intensapi.my.id/api/theater');
        const theaterData = await theaterResponse.json();

        const skeletonCount = theaterData.length || 1;
        container.innerHTML = Array(skeletonCount).fill(`
            <div class="bg-black rounded-xl shadow-md overflow-hidden skeleton max-w-md mx-auto">
                <div class="relative">
                    <div class="bg-gray-300 h-64 w-full animate-pulse"></div>
                    <div class="absolute top-4 right-4">
                        <div class="bg-gray-300 h-6 w-20 rounded-full animate-pulse"></div>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-5">
                        <div class="bg-gray-300 h-7 w-3/4 mb-3 mt-4 rounded animate-pulse"></div>
                        <div class="flex items-center gap-2 mb-3">
                            <div class="bg-gray-300 h-4 w-4 rounded animate-pulse"></div>
                            <div class="bg-gray-300 h-4 w-1/2 rounded animate-pulse"></div>
                        </div>
                        <div class="flex items-center gap-2 mb-4">
                            <div class="bg-gray-300 h-4 w-4 rounded animate-pulse"></div>
                            <div class="bg-gray-300 h-4 w-1/3 rounded animate-pulse"></div>
                        </div>
                        <div class="flex items-center gap-2 mb-3">
                            <div class="bg-gray-300 h-5 w-5 rounded-full animate-pulse"></div>
                            <div class="bg-gray-300 h-4 w-16 rounded animate-pulse"></div>
                        </div>
                        <div class="bg-gray-300 h-9 w-full rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        `).join('');
        const [bannerResponse, memberResponse] = await Promise.all([
            fetch('/data/theater.json'),
            fetch('https://48intensapi.my.id/api/member')
        ]);

        const [bannerData, memberData] = await Promise.all([
            bannerResponse.json(),
            memberResponse.json()
        ]);

        container.innerHTML = '';

        if (theaterData.length === 0) {
            showNotFoundMessage(container, 'Theater Not Found 😭');
            return;
        }

        theaterData.forEach(show => {
            const banner = bannerData.find(b => b.setlist === show.setlist);
            const status = getShowStatus(show.showInfo);
            const birthdayMembers = show.birthdayMembers.length > 0;

            const theaterCard = `
                <div class="bg-black rounded-3xl shadow-md overflow-hidden max-w-md mx-auto">
                <div class="relative">
                <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" 
                    alt="${show.setlist}" 
                    class="w-full h-64 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/60 to-transparent"></div>
                ${birthdayMembers
                    ? `<span class="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">Birthday</span>`
                    : ''}
                ${status
                    ? `<span class="absolute top-4 right-4 bg-white/30 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">${status.text}</span>`
                    : ''}
                <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <!-- Show title - increased top margin -->
                    <h3 class="text-lg font-bold mb-3 mt-4">${show.setlist}</h3>
                    <div class="flex items-center gap-2 text-sm mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]} | ${show.time} WIB</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>${show.members.length > 0 ? `${show.members.length} Members yang tampil` : 'No Members 😭'}</span>
                    </div>
                    <div class="flex items-center gap-2 mb-3">
                        <img src="https://jkt48.com/images/logo.svg" alt="JKT48" class="w-5 h-5 rounded-full object-cover">
                        <span class="text-sm">JKT48</span>
                    </div>
                    <button class="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition duration-300 backdrop-blur-sm"
                        onclick="showPopup(${JSON.stringify(show).replace(/"/g, '&quot;')}, ${JSON.stringify(banner).replace(/"/g, '&quot;')}, ${JSON.stringify(memberData.members.member).replace(/"/g, '&quot;')})">
                        Detail
                    </button>
                </div>
            </div>
        </div>
        `;
            container.innerHTML += theaterCard;

        });

    } catch (error) {
        console.error('Error fetching data:', error);
        showNotFoundMessage(container, 'Theater Not Found 😭');
    }
}
function showNotFoundMessage(container, message) {
    container.className = 'min-h-[24rem] relative';

    container.innerHTML = `
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center">
                <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1733508715/allactkiuu9tmtrqfumi.png" alt="Not Found" class="w-32 h-32 mb-4">
                <p class="text-gray-500 text-lg font-bold">${message}</p>
            </div>
        </div>
    `;
}


async function showPopup(show, banner, members) {
    try {
        const memberNicknamesResponse = await fetch('/data/member.json');
        const memberNicknamesData = await memberNicknamesResponse.json();

        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');

        document.body.style.paddingRight = getScrollbarWidth() + 'px';
        document.body.classList.add('no-scroll');

        const showMembers = show.members.map(memberName => {
            const apiMember = members.find(m => m.nama_member === memberName);
            if (apiMember) {
                const nicknameData = memberNicknamesData.find(m => m.name === apiMember.nama_member);
                return {
                    ...apiMember,
                    displayName: nicknameData ? nicknameData.nicknames[0] : memberName,
                    memberId: apiMember.id_member,
                    originalName: memberName
                };
            }
            return null;
        });

        const description = banner ? banner.description : 'No description available';
        const memberCards = showMembers.length > 0
            ? showMembers.map(member => `
                <a href="/member/${member.memberId}" class="flex flex-col items-center bg-gray-50 p-2 rounded-3xl">
                    <img src="https://jkt48.com${member.ava_member}" alt="${member.displayName}" class="w-16 h-16 object-cover rounded-full mb-2">
                    <span class="text-xs font-semibold">${member.displayName}</span>
                </a>
            `).join('')
            : Array(6).fill(`
                <div class="flex flex-col items-center bg-gray-50 p-2 rounded-3xl">
                    <img src="https://jkt48.com/images/logo.svg" alt="Placeholder" class="w-16 h-16 object-cover rounded-full mb-2">
                    <span class="text-xs font-semibold">No Member</span>
                </div>
            `).join('');

        popupContent.innerHTML = `
            <div class="bg-white rounded-3xl shadow-lg p-4 max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-xl font-bold">${show.setlist}</h2>
                    <button class="bg-red-500 text-white px-3 py-1 rounded-3xl hover:bg-red-400 transition duration-300" 
                            onclick="closePopup()">
                        Close
                    </button>
                </div>
                <div>
                    <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" alt="${show.setlist}" class="w-full h-48 sm:h-40 object-cover rounded-3xl mb-4">
                </div>
                <div class="space-y-2 mb-4">
                    <div class="text-sm text-gray-500"><strong>Date:</strong> ${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]}</div>
                    <div class="text-sm text-gray-500"><strong>Time:</strong> ${show.time} WIB</div>
                    ${show.birthdayMembers.length > 0 ? `
                        <div class="text-sm text-gray-500">
                            <strong>Seintansai:</strong> ${show.birthdayMembers.join(', ')}
                        </div>
                    ` : ''}
                </div>
                <div class="text-sm text-gray-500 mb-4">
                    <strong>Description:</strong><br>
                    <p class="mt-1">${description}</p>
                </div>
                <h3 class="text-sm font-bold mb-3">Lineup Members:</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    ${memberCards}
                </div>
            </div>
        `;

        popup.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching member nicknames:', error);
    }
}


function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
    document.body.style.paddingRight = '0';
    document.body.classList.remove('no-scroll');
}

fetchTheaterData();
