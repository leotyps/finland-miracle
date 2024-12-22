async function fetchHotNews() {
  try {
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/news"
    );
    const data = await response.json();

    const container = document.getElementById("page-news-container");
    container.innerHTML = "";

    const News = data.berita.slice(0, 16);

    News.forEach((news) => {
      const cardClass = "bg-blue-200 text-black hover:shadow-lg";

      const newsCard = `
                <div class="${cardClass} rounded-lg overflow-hidden p-4 transition-shadow duration-300">
                    <div class="flex items-center mb-4">
                        <img src="https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}" alt="Badge" class="w-15 h-5 mr-3 rounded-lg">
                        <span class="text-sm text-gray-500">${news.waktu}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">${news.judul}</h3>
                </div>
            `;
      container.innerHTML += newsCard;
    });
  } catch (error) {
    console.error("Error fetching Page News:", error);
  }
}

fetchHotNews();
