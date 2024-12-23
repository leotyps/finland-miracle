async function fetchPageNews() {
  try {
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/news"
    );

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    const container = document.getElementById("page-news-container");

    if (!container) {
      console.error("Element #page-news-container tidak ditemukan.");
      return;
    }

    container.innerHTML = "";
    
    const News = data.berita.slice(0, 16);

    News.forEach((news) => {
      const beritaId = news.berita_id || ""; 
      const badgeUrl = news.badge_url
        ? `https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}`
        : "https://via.placeholder.com/150"; 
      const waktu = news.waktu || "Waktu tidak tersedia";
      const judul = news.judul || "Judul tidak tersedia";

      const detailUrl = `/components/detail/news.html?id=${beritaId}`;

      const newsCard = `
                <a href="${detailUrl}" class="block bg-blue-200 text-black hover:shadow-lg rounded-lg overflow-hidden p-4 transition-shadow duration-300">
                    <div class="flex items-center mb-4">
                        <img src="${badgeUrl}" alt="Badge" class="w-15 h-5 mr-3 rounded-lg">
                        <span class="text-sm text-gray-500">${waktu}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">${judul}</h3>
                </a>
            `;
      container.innerHTML += newsCard; 
    });
  } catch (error) {
    console.error("Error fetching Page News:", error);
    const container = document.getElementById("page-news-container");
    container.innerHTML =
      "<p class='text-red-500'>Gagal memuat berita. Silakan coba lagi nanti.</p>";
  }
}

fetchPageNews();
