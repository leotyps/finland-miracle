async function fetchHotNews() {
    try {
        const container = document.getElementById('hot-news-container');
        
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/news');
        const data = await response.json();

        container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        container.innerHTML = '';

        if (!data || !data.berita || data.berita.length === 0) {
            showNotFoundMessage(container, 'News Not Found 😭');
            return;
        }

        const topThreeNews = data.berita.slice(0, 3);
        const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-red-500/50"];

        topThreeNews.forEach((news, index) => {
            const colorClass = colors[index % colors.length];

            const newsCard = `
                <a href="/news/${news.berita_id}" class="block ${colorClass} text-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-all duration-300"
                    onclick="localStorage.setItem('newsColor', '${colorClass}')">
                    <div class="p-4">
                        <div class="flex items-center mb-4">
                            <img src="https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}" alt="Badge" class="w-14 h-5 mr-3 rounded-lg">
                            <span class="text-sm text-white-200">${news.waktu}</span>
                        </div>
                        <h3 class="text-lg font-bold mb-2">${news.judul}</h3>
                    </div>
                </a>
            `;
            container.innerHTML += newsCard;
        });
    } catch (error) {
        console.error('Error fetching Hot News:', error);
        const container = document.getElementById('hot-news-container');
        showNotFoundMessage(container, 'News Not Found 😭');
    }
}

function showNotFoundMessage(container, message) {
    container.className = 'flex items-center justify-center min-h-[24rem]';

    container.innerHTML = `
        <div class="flex flex-col items-center">
            <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1733508715/allactkiuu9tmtrqfumi.png" alt="Not Found" class="w-32 h-32 mb-4">
            <p class="text-gray-500 text-lg font-bold">${message}</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', fetchHotNews);
