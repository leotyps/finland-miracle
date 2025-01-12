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
        if (isNaN(showDateTime.getTime())) {
            console.error("Invalid show date/time:", `${datePart} ${timePart}`);
            return null;
        }

        const showDateOnly = new Date(showDateTime);
        showDateOnly.setHours(0, 0, 0, 0);

        if (showDateTime < now) {
            return;
        }
        if (showDateOnly.getTime() === today.getTime()) {
            if (showDateTime <= now) {
                return { text: "Sedang Berlangsung" };
            }
            return { text: "Hari ini" };
        }
        if (showDateOnly.getTime() === tomorrow.getTime()) {
            return { text: "Besok" };
        }

        if (showDateTime > now) {
            return { text: "Upcoming" };
        }

        return null;
    } catch (error) {
        console.error("Error in getShowStatus:", error);
        return null;
    }
}



async function fetchTheaterData() {
    const container = document.getElementById('theater-container');
    container.innerHTML = ''; 

    try {
        const theaterResponse = await fetch('https://intensprotectionexenew.vercel.app/api/theater');
        const theaterData = await theaterResponse.json();
        
        const skeletonCount = theaterData.length || 1;  
        container.innerHTML = Array(skeletonCount).fill(`
            <div class="bg-white rounded-3xl shadow-md overflow-hidden skeleton">
                <div class="relative bg-gray-300 h-48 w-full rounded"></div>
                <div class="p-4">
                    <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                    <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                    <div class="bg-gray-200 h-4 w-1/3 mb-2 rounded"></div>
                </div>
            </div>
        `).join(''); 

        const [bannerResponse, memberResponse] = await Promise.all([
            fetch('/data/theater.json'),
            fetch('https://intensprotectionexenew.vercel.app/api/member')
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
            <div class="bg-white rounded-3xl shadow-md overflow-hidden max-w-md mx-auto">
                <div class="relative">
                    <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" 
                        alt="${show.setlist}" 
                        class="w-full h-auto max-h-64 object-cover rounded-t-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg"></div>
                    ${birthdayMembers 
                        ? `<span class="absolute top-2 left-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 text-white text-xs px-3 py-1 rounded-full">Birthday</span>` 
                        : ''}
                        ${status 
                            ? `<span class="absolute top-2 right-2 bg-white/30 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">${status.text}</span>`
                            : ''}                                         
                </div>

                <div class="p-4">
                    <h3 class="text-base font-bold mb-2">${show.setlist}</h3>
                    <div class="text-sm text-gray-500 mb-2">
                        <strong>Date:</strong> ${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]}
                    </div>
                    <div class="text-sm text-gray-500 mb-2">
                        <strong>Time:</strong> ${show.time} WIB
                    </div>
                    <div class="text-sm text-gray-500 mb-3">
                        <strong>Jumlah Member:</strong> ${show.members.length > 0 ? show.members.length : 'No Members 😭'} member
                    </div>
                    <button class="w-full bg-blue-300 text-white px-4 py-2 rounded-3xl text-sm hover:bg-blue-400 transition duration-300" 
                        onclick="showPopup(${JSON.stringify(show).replace(/"/g, '&quot;')}, ${JSON.stringify(banner).replace(/"/g, '&quot;')}, ${JSON.stringify(memberData.members.member).replace(/"/g, '&quot;')})">
                        Detail
                    </button>
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
            : Array(3).fill(`
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
