async function fetchYoutubeVideos() {
    try {
        const container = document.getElementById('youtube-container');

        // Tampilkan skeleton loading
        container.innerHTML = `
            <div class="bg-white rounded-3xl shadow-md overflow-hidden skeleton w-full max-w-sm">
                <div class="p-4">
                    <div class="bg-gray-300 h-48 w-full rounded-2xl mb-4"></div>
                    <div class="flex items-center mb-2">
                        <div class="bg-gray-300 h-6 w-6 rounded-full mr-2"></div>
                        <div class="bg-gray-300 h-4 w-32 rounded"></div>
                    </div>
                    <div class="bg-gray-300 h-6 w-full rounded"></div>
                </div>
            </div>
        `.repeat(4);

        // Ambil data dari API
        const response = await fetch('https://48intensapi.my.id/api/video');
        const videos = await response.json();

        // Hapus skeleton
        container.innerHTML = '';

        // Cek apakah data kosong
        if (!videos || videos.length === 0) {
            showNotFoundMessage(container, 'Videos Not Found 😭');
            return;
        }

        const slicedVideos = videos.slice(0, 4);

        // Tampilkan video
        slicedVideos.forEach(video => {
            const videoId = video.url.split('/embed/')[1];
            const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
            const channelImg = 'https://cdnintens.48intensapi.my.id/JKT48.jpg';

            const card = `
                <div class="bg-white border-4 border-gray-50 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full max-w-sm">
                    <div class="p-4">
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="block">
                            <div class="mb-4">
                                <img 
                                    src="${thumbnail}" 
                                    alt="${video.title}"
                                    class="w-full h-48 object-cover rounded-2xl"
                                    onerror="this.onerror=null; this.src='https://jkt48.com/images/logo.svg'"
                                >
                            </div>
                            <div class="flex items-center mb-2">
                                <img 
                                    src="${channelImg}" 
                                    alt="JKT48"
                                    class="w-6 h-6 rounded-full mr-2"
                                >
                                <span class="text-sm text-gray-600">JKT48</span>
                            </div>
                            <h3 class="font-semibold text-gray-900 line-clamp-2">
                                ${video.title}
                            </h3>
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        showNotFoundMessage(document.getElementById('youtube-container'), 'Videos Not Found 😭');
    }
}

function showNotFoundMessage(container, message) {
    container.innerHTML = `
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center">
                <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" alt="Not Found" class="w-64 mb-4">
                <p class="text-gray-500 text-center text-lg font-bold">${message}</p>
            </div>
        </div>
    `;
    container.classList.add('relative', 'min-h-[24rem]');
}

// Jalankan fungsi saat halaman dimuat
fetchYoutubeVideos();
