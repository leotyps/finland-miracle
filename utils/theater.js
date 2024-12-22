async function fetchTheaterData() {
    const container = document.getElementById('theater-container');
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
            <div class="relative bg-gray-300 h-48 w-full rounded"></div>
            <div class="p-4">
                <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/3 mb-2 rounded"></div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
            <div class="relative bg-gray-300 h-48 w-full rounded"></div>
            <div class="p-4">
                <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/3 mb-2 rounded"></div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
            <div class="relative bg-gray-300 h-48 w-full rounded"></div>
            <div class="p-4">
                <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/3 mb-2 rounded"></div>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
            <div class="relative bg-gray-300 h-48 w-full rounded"></div>
            <div class="p-4">
                <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                <div class="bg-gray-200 h-4 w-1/3 mb-2 rounded"></div>
            </div>
        </div>
    `;

    try {
        const [theaterResponse, bannerResponse, memberResponse] = await Promise.all([
            fetch('https://intensprotectionexenew.vercel.app/api/theater'),
            fetch('/data/theater.json'),
            fetch('https://intensprotectionexenew.vercel.app/api/member')
        ]);

        const [theaterData, bannerData, memberData] = await Promise.all([
            theaterResponse.json(),
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
            const theaterCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto"> 
                    <div class="relative">
                    <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" 
                        alt="${show.setlist}" 
                        class="w-full h-50 object-cover rounded-t-lg">

                    <!-- Overlay Filter -->
                    <div class="absolute inset-0 bg-black bg-opacity-30 rounded-t-lg"></div>

                    <!-- Status Badge -->
                    ${show.birthdayMembers.length > 0
                    ? `<span class="absolute top-2 left-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 text-white text-xs px-3 py-1 rounded-full">Birthday</span>`
                    : ''}
                    ${status
                    ? `<span class="absolute top-2 right-2 ${status.color} text-white text-xs px-3 py-1 rounded-full">${status.text}</span>`
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
                            <strong>Jumlah Member:</strong> ${show.members.length > 0 ? show.members.length : 'No Members 😭'}
                        </div>
                        <button class="w-full bg-blue-300 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-400 transition duration-300" 
                            onclick="showPopup(${JSON.stringify(show).replace(/"/g, '&quot;')}, ${JSON.stringify(banner).replace(/"/g, '&quot;')}, ${JSON.stringify(memberData.members.member).replace(/"/g, '&quot;')})">
                            Detail
                        </button>
                    </div>
                </div>
            `;
            container.innerHTML += theaterCard;
        });

        document.getElementById('close-popup').addEventListener('click', () => {
            const popup = document.getElementById('popup');
            popup.classList.add('hidden');
            document.body.classList.remove('no-scroll');
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

function getShowStatus(showInfo) {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [_, datePart, timePart] = showInfo.split(" ");
    const showDateTime = new Date(`${datePart}T${timePart}:00`);

    const showDateOnly = new Date(showDateTime);
    showDateOnly.setHours(0, 0, 0, 0);

    if (showDateOnly.getTime() === today.getTime()) {
        if (showDateTime <= now) {
            return {
                text: "Sedang Berlangsung",
                color: "bg-green-500",
            };
        }
        return {
            text: "Hari ini",
            color: "bg-blue-500",
        };
    }

    if (showDateOnly.getTime() === tomorrow.getTime()) {
        return {
            text: "Besok",
            color: "bg-yellow-500",
        };
    }

    if (showDateTime > now) {
        return {
            text: "Upcoming",
            color: "bg-red-500",
        };
    }
    return {
        text: "Sudah Lewat",
        color: "bg-gray-500",
    };
}

async function showPopup(show, banner, members) {
    try {
        const memberNicknamesResponse = await fetch('/data/member.json');
        const memberNicknamesData = await memberNicknamesResponse.json();

        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');

        const showMembers = show.members.map(memberName => {
            const apiMember = members.find(m => m.nama_member === memberName);
            if (apiMember) {
                const nicknameData = memberNicknamesData.find(m => m.name === apiMember.nama_member);
                return {
                    ...apiMember,
                    displayName: nicknameData ? nicknameData.nicknames[0] : memberName
                };
            }
            return null;
        });

        const description = banner ? banner.description : 'No description available';

        popupContent.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-4 max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <div>
                    <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" alt="${show.setlist}" class="w-full h-48 sm:h-40 object-cover rounded-lg mb-4">
                </div>
                <h2 class="text-xl font-bold mb-3">${show.setlist}</h2>
                <div class="space-y-2 mb-4">
                    <div class="text-sm text-gray-500"><strong>Date:</strong> ${show.showInfo.split(' ')[0]}</div>
                    <div class="text-sm text-gray-500"><strong>Time:</strong> ${show.time} WIB</div>
                    <div class="text-sm text-gray-500">
                        <strong>Birthday:</strong> ${show.birthdayMembers.length > 0 ? show.birthdayMembers.join(', ') : 'None'}
                    </div>
                </div>
                <div class="text-sm text-gray-500 mb-4">
                    <strong>Description:</strong><br>
                    <p class="mt-1">${description}</p>
                </div>
                <h3 class="text-sm font-bold mb-3">Lineup Members:</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    ${showMembers.length > 0 ? showMembers.map(member => member ? `
                        <div class="flex flex-col items-center bg-gray-50 p-2 rounded-lg">
                            <img src ="https://jkt48.com${member.ava_member}" alt="${member.displayName}" 
                                class="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mb-2">
                            <div class="text-center text-sm bg-gray-100 rounded p-1 w-full truncate">${member.displayName}</div>
                        </div>
                    ` : `
                        <div class="flex flex-col items-center bg-gray-50 p-2 rounded-lg">
                            <img src="https://jkt48.com/images/logo.svg" alt="Unknown" 
                                class="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mb-2">
                            <div class="text-center text-sm bg-gray-100 rounded p-1 w-full truncate">Unknown</div>
                        </div>
                    `).join('') : Array(6).fill().map(() => `
                        <div class="flex flex-col items-center bg-gray-50 p-2 rounded-lg">
                            <img src="https://jkt48.com/images/logo.svg" alt="Default" 
                                class="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mb-2">
                            <div class="text-center text-sm bg-gray-100 rounded p-1 w-full truncate">JKT48</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        popup.classList.remove('hidden');
        document.body.classList.add('no-scroll');
    } catch (error) {
        console.error('Error in showPopup:', error);
    }
}


fetchTheaterData();
