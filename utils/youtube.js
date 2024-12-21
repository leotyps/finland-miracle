async function fetchYoutubeVideos() {
    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/youtube_jkt48');
        const { data } = await response.json();

        const container = document.getElementById('youtube-container');
        container.innerHTML = ''; // Hapus skeleton loader

        data.forEach(video => {
            let channelLogo = '';
            if (video.channelTitle.toLowerCase() === 'jkt48') {
                channelLogo = 'https://yt3.googleusercontent.com/wBipLZF1IVqYGuYsZc0xxj5ist11fQMHWkN6vtBDCojWd8QTTlJLB8tOCOtoh7IRdmGHDn6I=s160-c-k-c0x00ffffff-no-rj';
            } else if (video.channelTitle.toLowerCase() === 'jkt48 tv') {
                channelLogo = 'https://yt3.googleusercontent.com/eFmDTrRup0j5sSqoPSuscvE6MSeGefH5Extvc-xo_CtgEgyIrUphg9sfpaUMcmnln5maDeP6=s160-c-k-c0x00ffffff-no-rj';
            }

            const videoCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <a href="${video.url}" target="_blank" rel="noopener noreferrer">
                        <div class="relative">
                            <img src="${video.thumbnails.medium.url}" alt="${video.title}" class="w-full h-42 object-cover">
                        </div>
                        <div class="p-4">
                            <div class="flex items-center mb-2">
                                <img src="${channelLogo}" alt="${video.channelTitle}" class="w-8 h-8 rounded-full mr-2">
                                <h3 class="text-lg font-bold">${video.title}</h3>
                            </div>
                            <p class="text-sm font-semibold text-gray-500">${new Date(video.publishedAt).toLocaleDateString()}</p>
                            <p class="text-sm font-semibold text-gray-500">${video.channelTitle}</p>
                        </div>
                    </a>
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
