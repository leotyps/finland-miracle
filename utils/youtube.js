async function fetchYoutubeVideos() {
    try {
        const container = document.getElementById('youtube-container');

        // Tampilkan skeleton card atau pesan loading (opsional)
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
                <div class="relative bg-gray-300 h-48 w-full rounded"></div>
                <div class="p-4">
                    <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                    <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                </div>
            </div>
        `.repeat(4); // Tambahkan skeleton untuk 4 item

        const response = await fetch('https://intensprotectionexenew.vercel.app/api/video');
        const data = await response.json();

        container.innerHTML = ''; // Bersihkan skeleton setelah data diambil
        if (!data || data.length === 0) {
            showNotFoundMessage(container, 'Videos Not Found 😭');
            return;
        }

        // Batasi hanya 4 data yang ditampilkan
        const limitedData = data.slice(0, 4);

        limitedData.forEach(video => {
            const videoCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
                    <div class="relative">
                        <iframe 
                            src="${video.url}" 
                            class="w-full h-48 object-cover" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-bold mb-2">${video.title}</h3>
                    </div>
                </div>
            `;
            container.innerHTML += videoCard;
        });
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        showNotFoundMessage(container, 'Videos Not Found 😭');
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

fetchYoutubeVideos();
