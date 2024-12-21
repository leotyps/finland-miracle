async function fetchYoutubeVideos() {
    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/video');
        const data = await response.json();

        const container = document.getElementById('youtube-container');
        container.innerHTML = ''; // Hapus skeleton loader

        data.forEach(video => {
            const videoCard = `
                <div class="video-card bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="relative">
                        <iframe 
                            src="${video.url}" 
                            class="w-full h-52" 
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
        const container = document.getElementById('youtube-container');
        container.innerHTML = '<p class="text-center text-red-500">Failed to load videos. Please try again later.</p>';
    }
}

fetchYoutubeVideos();
