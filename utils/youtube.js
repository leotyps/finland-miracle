async function fetchYoutubeVideos() {
    try {
        const container = document.getElementById('youtube-container');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden skeleton">
                <div class="relative bg-gray-300 h-48 w-full rounded"></div>
                <div class="p-4">
                    <div class="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
                    <div class="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
                </div>
            </div>
        `.repeat(4);

        const response = await fetch('https://intensprotectionexenew.vercel.app/api/video');
        const data = await response.json();

        container.innerHTML = '';
        if (!data || data.length === 0) {
            showNotFoundMessage(container, 'Videos Not Found 😭');
            return;
        }

        const limitedData = data.slice(0, 4);

        limitedData.forEach(video => {
            const videoId = video.url.split('/embed/')[1];
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            const channelThumbnail = "https://yt3.googleusercontent.com/wBipLZF1IVqYGuYsZc0xxj5ist11fQMHWkN6vtBDCojWd8QTTlJLB8tOCOtoh7IRdmGHDn6I=s160-c-k-c0x00ffffff-no-rj";

            const videoCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-md mx-auto">
                    <div class="relative bg-white px-2">
                        <img 
                            src="${thumbnailUrl}" 
                            alt="${video.title} thumbnail" 
                            class="w-full h-auto max-h-64 object-cover rounded-lg">
                    </div>
                    <div class="p-4">
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="text-lg font-bold mb-2 block">
                            ${video.title}
                        </a>
                        <div class="flex items-center">
                            <img src="${channelThumbnail}" alt="JKT48" class="w-8 h-8 rounded-full mr-2">
                            <span class="text-sm text-gray-500">JKT48</span>
                        </div>
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