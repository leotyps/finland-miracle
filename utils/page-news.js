// list news

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function showNotFoundMessage(container, message) {
  container.className = "min-h-[24rem] relative";
  container.innerHTML = `
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="flex flex-col items-center">
        <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1733508715/allactkiuu9tmtrqfumi.png" alt="Not Found" class="w-32 h-32 mb-4">
        <p class="text-white-500 text-lg font-bold">${message}</p>
      </div>
    </div>
  `;
}

async function fetchPageNews() {
  const container = document.getElementById("page-news-container");

  if (!container) {
    console.error("Not found");
    return;
  }

  const skeletonCount = 16;
  container.innerHTML = "";
  for (let i = 0; i < skeletonCount; i++) {
    const skeletonCard = ` 
    <div class="block bg-gray-300 rounded-3xl shadow-md animate-pulse overflow-hidden">
      <div class="p-4">
        <div class="w-20 h-5 bg-gray-400 rounded-3xl mb-3"></div>
        <div class="h-6 bg-gray-400 rounded mb-2"></div>
        <div class="h-4 bg-gray-400 rounded w-3/4"></div>
      </div>
    </div>
    `;
    container.innerHTML += skeletonCard;
  }

  try {
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/news"
    );

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    const News = data.berita.slice(0, 16);

    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-red-500/50"];

    container.innerHTML = "";

    if (News.length === 0) {
      showNotFoundMessage(container, "News Not Found 😭");
      return;
    }

    News.forEach((news, index) => {
      const beritaId = news.berita_id || "";
      const badgeUrl = news.badge_url
        ? `https://res.cloudinary.com/haymzm4wp/image/upload/assets/jkt48${news.badge_url}`
        : "https://jkt48.com/images/logo.svg";
      const waktu = news.waktu || "Waktu tidak tersedia";
      const judul = news.judul || "Judul tidak tersedia";

      const colorClass = colors[index % colors.length];
      const detailUrl = `/news/${beritaId}`;
      const newsCard = `
      <a href="${detailUrl}" class="block ${colorClass} text-white rounded-3xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300"
        onclick="localStorage.setItem('newsColor', '${colorClass}')">
        <div class="p-4">
          <img src="${badgeUrl}" alt="Badge" class="w-14 h-5 mb-3 rounded-3xl">
          <h3 class="text-lg text-white font-bold mb-2">${judul}</h3>
          <span class="text-sm text-white-200">${waktu}</span>
        </div>
      </a>
      `;
      container.innerHTML += newsCard;
    });
  } catch (error) {
    console.error("Error fetching Page News:", error);
    showNotFoundMessage(container, "News Not Found 😭");
  }
}


// detail news

async function fetchDetailNews() {
  try {
    const pathSegments = window.location.pathname.split('/');
    const beritaId = pathSegments[pathSegments.length - 1];
    const container = document.getElementById("news-detail-container");

    if (!beritaId) {
      console.error("Berita ID tidak ditemukan di URL.");
      showNotFoundMessage(container, "Detail News Not Found 😭");
      return;
    }

    const colorClass = localStorage.getItem('newsColor') || 'bg-blue-500';

    try {
      const response = await fetch(
        `https://intensprotectionexenew.vercel.app/api/news/detail/${beritaId}`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      const judul = data.judul || "Judul tidak tersedia";
      const tanggal = data.tanggal || "Tanggal tidak tersedia";
      const konten = (data.konten || "Konten tidak tersedia").replace(
        /\n/g,
        "<br>"
      );
      const gambarArray = data.gambar || [];

      const gambarHTML = `
        <div class="flex flex-wrap gap-4">
          ${gambarArray
            .map(
              (url) => `
              <img src="${url}" alt="${judul}" 
                   class="w-36 h-auto rounded-lg shadow-md">
            `
            )
            .join("")}
        </div>
      `;

      const detailTemplate = `
        <div class="max-w-10xl mx-auto p-8 ${colorClass} shadow-lg rounded-3xl">
          <h1 class="text-3xl font-bold mb-6 text-white">${judul}</h1>
          <p class="text-white text-base mb-6">${tanggal}</p>
          ${gambarHTML}
          <div class="text-white leading-relaxed text-sm font-semibold">${konten}</div>
        </div>
      `;

      container.innerHTML = detailTemplate;
    } catch (error) {
      console.error("Error parsing detail news:", error);
      showNotFoundMessage(container, "Detail News Not Found 😭");
    }
  } catch (error) {
    console.error("Error fetching Detail News:", error);
    const container = document.getElementById("news-detail-container");
    showNotFoundMessage(container, "Gagal memuat detail berita. Silakan coba lagi nanti.");
  }
}

fetchPageNews();
fetchDetailNews();
