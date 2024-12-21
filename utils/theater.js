async function fetchTheaterData() {
    try {
        const theaterResponse = await fetch('https://intensprotectionexenew.vercel.app/api/theater');
        const theaterData = await theaterResponse.json();
        const bannerResponse = await fetch('/data/theater.json');
        const bannerData = await bannerResponse.json();
        const memberResponse = await fetch('https://intensprotectionexenew.vercel.app/api/member'); // Endpoint anggota
        const memberData = await memberResponse.json();

        const container = document.getElementById('theater-container');
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        const closePopup = document.getElementById('close-popup');

        container.innerHTML = ''; // Clear skeleton

        theaterData.forEach(show => {
            const banner = bannerData.find(b => b.setlist === show.setlist);

            const theaterCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="relative">
                        <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" alt="${show.setlist}" class="w-full h-40 object-cover rounded-lg">
                        ${show.birthdayMembers.length > 0
                        ? `<span class="absolute top-2 left-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 text-white text-xs px-2 py-0.5 rounded-full">Birthday</span>`
                        : ''}
                    </div>
                    <div class="p-3">
                        <h3 class="text-base font-bold mb-1">${show.setlist}</h3>
                        <div class="text-sm text-gray-500 mb-1">
                            <strong>Date:</strong> ${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]}
                        </div>
                        <div class="text-sm text-gray-500 mb-1">
                            <strong>Time:</strong> ${show.time} WIB
                        </div>
                        <div class="text-sm text-gray-500 mb-2">
                            <strong>Jumlah Member:</strong> ${show.members.length > 0 ? show.members.length : 'No Members 😭'}
                        </div>
                        <button class="bg-blue-300 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-200" onclick="showPopup(${JSON.stringify(show).replace(/"/g, '&quot;')}, ${JSON.stringify(banner).replace(/"/g, '&quot;')}, ${JSON.stringify(memberData.members.member).replace(/"/g, '&quot;')})">Detail</button>
                    </div>
                </div>
            `;
            container.innerHTML += theaterCard;
        });

        closePopup.addEventListener('click', () => {
            popup.classList.add('hidden');
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function showPopup(show, banner, members) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    // Filter anggota yang tampil dalam setlist ini berdasarkan nama
    const showMembers = show.members.map(memberName =>
        members.find(member => member.nama_member === memberName)
    );

    // Ambil deskripsi berdasarkan setlist
    const description = banner ? banner.description : 'No description available';

    popupContent.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
            <div>
                <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" alt="${show.setlist}" class="w-full h-40 object-cover rounded-lg mb-4">
            </div>
            <h2 class="text-xl font-bold mb-4">${show.setlist}</h2>
            <div class="text-sm text-gray-500 mb-2"><strong>Date:</strong> ${show.showInfo.split(' ')[0]}</div>
            <div class="text-sm text-gray-500 mb-2"><strong>Time:</strong> ${show.time} WIB</div>
            <div class="text-sm text-gray-500 mb-2">
                <strong>Birthday:</strong> ${show.birthdayMembers.length > 0 ? show.birthdayMembers.join(', ') : 'None'}
            </div>
            <p class="text-sm text-gray-500 mb-4"><strong>Description:</strong> ${description}</p>
            <h3 class="text-sm font-bold mb-2">Lineup Members:</h3>
            <div class="grid grid-cols-3 gap-2">
                ${showMembers.map(member => member ? `
                    <div class="flex flex-col items-center">
                        <img src="https://jkt48.com${member.ava_member}" alt="${member.nama_member}" class="w-16 h-16 rounded-full object-cover mb-1">
                        <div class="text-center text-sm bg-gray-100 rounded p-1">${member.nama_member}</div>
                    </div>
                ` : `
                    <div class="flex flex-col items-center">
                        <img src="https://via.placeholder.com/150" alt="Unknown" class="w-16 h-16 rounded-full object-cover mb-1">
                        <div class="text-center text-sm bg-gray-100 rounded p-1">Unknown</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    popup.classList.remove('hidden');
    document.body.classList.add('no-scroll'); // Tambahkan kelas untuk mencegah scroll
}

document.getElementById('close-popup').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
    document.body.classList.remove('no-scroll'); // Hapus kelas untuk mengembalikan scroll
});


fetchTheaterData();
