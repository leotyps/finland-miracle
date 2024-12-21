async function fetchHotNews() {
    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/news');
        const data = await response.json();

        const container = document.getElementById('hot-news-container');
        container.innerHTML = ''; // Hapus skeleton loader
        
        const topThreeNews = data.berita.slice(0, 3);

        topThreeNews.forEach(news => {
            const newsCard = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden p-4">
                    <div class="flex items-center mb-4">
                        <img src="https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}" alt="Badge" class="w-15 h-5 mr-3 rounded-lg">
                        <span class="text-sm text-gray-500">${news.waktu}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">${news.judul}</h3>
                    <div class="flex">
                        <a href="/news/${news.berita_id}" class="text-blue-500 hover:underline text-sm">Read More</a>
                    </div>
                </div>
            `;
            container.innerHTML += newsCard;
        });
    } catch (error) {
        console.error('Error fetching Hot News:', error);
    }
}

// Panggil fungsi untuk memuat berita
fetchHotNews();
