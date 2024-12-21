async function fetchHotNews() {
    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/news');
        const data = await response.json();

        const container = document.getElementById('hot-news-container');
        container.innerHTML = ''; 
        
        const topThreeNews = data.berita.slice(0, 3);

        let highlightedIndex = localStorage.getItem('highlightedIndex');
        if (highlightedIndex === null) {
            highlightedIndex = Math.floor(Math.random() * topThreeNews.length);
            localStorage.setItem('highlightedIndex', highlightedIndex);
        } else {
            highlightedIndex = parseInt(highlightedIndex, 10);
        }

        topThreeNews.forEach((news, index) => {
            const isHighlighted = index === highlightedIndex;
            const cardClass = isHighlighted ? 'bg-blue-300 text-white' : 'bg-white text-black';

            const newsCard = `
                <div class="${cardClass} rounded-lg shadow-md overflow-hidden p-4">
                    <div class="flex items-center mb-4">
                        <img src="https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}" alt="Badge" class="w-15 h-5 mr-3 rounded-lg">
                        <span class="text-sm ${isHighlighted ? 'text-gray-200' : 'text-gray-500'}">${news.waktu}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">${news.judul}</h3>
                    <div class="flex">
                        <a href="/news/${news.berita_id}" class="${isHighlighted ? 'text-white' : 'text-blue-500 hover:underline'} text-sm">Read More</a>
                    </div>
                </div>
            `;
            container.innerHTML += newsCard;
        });
    } catch (error) {
        console.error('Error fetching Hot News:', error);
    }
}

fetchHotNews();
