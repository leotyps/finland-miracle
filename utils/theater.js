async function fetchTheaterData() {
    try {
        const theaterResponse = await fetch('https://intensprotectionexenew.vercel.app/api/theater');
        const theaterData = await theaterResponse.json();
        const bannerResponse = await fetch('/data/theater.json');
        const bannerData = await bannerResponse.json();

        const container = document.getElementById('theater-container');
        container.innerHTML = ''; // Clear skeleton

        theaterData.forEach(show => {
            const banner = bannerData.find(b => b.setlist === show.setlist);
            const theaterCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="relative">
                        <img src="${banner ? banner.image : 'https://jkt48.com/images/logo.svg'}" alt="${show.setlist}" class="w-30 h-50 object-cover rounded-lg">
                        ${show.birthdayMembers.length > 0
                        ? `<span class="absolute top-2 left-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 text-white text-base px-2 py-0.5 rounded-full">Birthday</span>`
                        : ''}
                    </div>
                    <div class="p-3">
                        <h3 class="text-base font-bold mb-1">${show.setlist}</h3>
                        <div class="text-base text-gray-500 flex items-center mb-1">
                            <strong>Date: </strong>${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]}
                        </div>
                        <div class="text-base text-gray-500 mb-1">
                            <strong>Time:</strong> ${show.time} WIB
                        </div>
                        <div class="text-base text-gray-500 mb-2">
                            <strong>Jumlah Member:</strong> ${show.members.length > 0 ? show.members.length : 'No Members 😭'}
                        </div>
                        <div class="flex gap-2">
                            <button class="bg-blue-300 text-white px-3 py-1 rounded-md text-base hover:bg-blue-200">Detail</button>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML += theaterCard;
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchTheaterData();