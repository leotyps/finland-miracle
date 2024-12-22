async function fetchHotNews() {
  try {
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/news"
    );
    const data = await response.json();

    const container = document.getElementById("page-news-container");
    container.innerHTML = "";

    const News = data.berita.slice(0, 12);

    News.forEach((news) => {
      const cardClass = "bg-blue-200 text-black hover:shadow-lg";

      const newsCard = `
                <div class="${cardClass} rounded-lg overflow-hidden p-4 transition-shadow duration-300">
                    <div class="flex items-center mb-4">
                        <img src="https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}" alt="Badge" class="w-15 h-5 mr-3 rounded-lg">
                        <span class="text-sm text-gray-500">${news.waktu}</span>
                    </div>
                    <h3 class="text-lg font-bold mb-2">${news.judul}</h3>
                    <div class="flex">
                        <button
                            class="cursor-pointer bg-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[#F5F5F5] hover:text-[#60A5FA] h-9 rounded-md px-3"
                            onclick="window.location.href='/news/${news.berita_id}'"
                        >
                            <svg
                                class="lucide lucide-newspaper text-blue-400 dark:text-blue-600"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                stroke-width="2"
                                stroke="#60A5FA"
                                fill="none"
                                viewBox="0 0 24 24"
                                height="22"
                                width="22"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
                                ></path>
                                <path d="M18 14h-8"></path>
                                <path d="M15 18h-5"></path>
                                <path d="M10 6h8v4h-8V6Z"></path>
                            </svg>
                            Read More
                        </button>
                    </div>
                </div>
            `;
      container.innerHTML += newsCard;
    });
  } catch (error) {
    console.error("Error fetching Hot News:", error);
  }
}

fetchHotNews();
