async function fetchYoutubeVideos() {
    try {
        const container = document.getElementById('youtube-container');
        
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/video');
        const data = await response.json();
        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[24rem] relative';

        container.innerHTML = ''; 
        if (!data || data.length === 0) {
            showNotFoundMessage(container, 'Videos Not Found 😭');
            return;
        }

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