async function loadReplayContent(tab) {
    const container = document.getElementById('replayContainer');
    container.innerHTML = `
        <div class="col-span-full flex justify-center items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-rose-300 border-t-transparent"></div>
        </div>
    `;

    try {
        let apiUrl = '';
        if (tab === 'theater') {
            apiUrl = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyACgpG3XScR1d5f_qZ-deCr0FSuViPOYdM&channelId=UCT7GobiObAxIScUIcgNxCqQ&q=FULL SHOW&part=snippet,id&order=date&maxResults=50';
        } else if (tab === 'livestream') {
            apiUrl = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyACgpG3XScR1d5f_qZ-deCr0FSuViPOYdM&channelId=UCFUXOzBCTnF-k00cBsmKDtA&q=LIVE&part=snippet,id&order=date&maxResults=20';
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items?.length > 0) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        ${data.items.map(item => `
                            <div class="bg-white rounded-3xl shadow-lg overflow-hidden">
                                <a href="https://www.youtube.com/watch?v=${item.id.videoId}" target="_blank" class="block">
                                    <div class="relative">
                                        <img src="${item.snippet.thumbnails.high.url}" 
                                            alt="${item.snippet.title}" 
                                            class="w-full h-48 object-cover">
                                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                            <p class="text-white text-sm font-medium line-clamp-2">${item.snippet.title}</p>
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <div class="flex items-center justify-between">
                                            <p class="text-gray-600 text-xs">
                                                ${new Date(item.snippet.publishTime).toLocaleDateString()}
                                            </p>
                                            <div class="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                                </svg>
                                                <span class="text-xs text-gray-500">Watch Replay</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="col-span-full text-center text-gray-500">
                    No replay content available
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading replay content:', error);
        container.innerHTML = `
            <div class="col-span-full text-center text-red-500">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

let currentTab = 'livestream';

function switchTab(tab) {
    const livestreamTab = document.getElementById('livestreamTab');
    const theaterTab = document.getElementById('theaterTab');

    [livestreamTab, theaterTab].forEach(button => {
        button.classList.remove('bg-rose-300', 'text-white');
        button.classList.add('text-gray-500', 'hover:text-gray-700');
    });

    const selectedButton = document.getElementById(`${tab}Tab`);
    selectedButton.classList.remove('text-gray-500', 'hover:text-gray-700');
    selectedButton.classList.add('bg-rose-300', 'text-white');

    loadReplayContent(tab);
}

document.addEventListener('DOMContentLoaded', () => {
    switchTab('livestream');
});