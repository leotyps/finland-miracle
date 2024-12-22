function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}



async function fetchDetailNews() {
  try {
    const beritaId = getQueryParam("id");
    if (!beritaId) {
      console.error("Berita ID tidak ditemukan di URL.");
      document.getElementById(
        "news-detail-container"
      ).innerHTML = `<div class="bg-white rounded-lg shadow-md overflow-hidden p-6 h-72 flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-2xl font-bold">Nothing to see here!</h2>
          </div>
        </div>`;
      return;
    }

    const container = document.getElementById("news-detail-container");
    container.innerHTML = `
        <div class="max-w-10xl mx-auto p-8 bg-blue-200 shadow-lg rounded-xl animate-pulse">
            <div class="h-10 bg-gray-300 rounded w-3/4 mb-6"></div>
            <div class="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div class="w-full h-72 bg-gray-300 rounded-lg mb-8"></div>
            <div class="space-y-6">
                <div class="h-6 bg-gray-300 rounded"></div>
                <div class="h-6 bg-gray-300 rounded w-5/6"></div>
                <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                <div class="h-6 bg-gray-300 rounded w-4/5"></div>
            </div>
        </div>
    `;

    setTimeout(async () => {
      const response = await fetch(
        `https://intensprotectionexenew.vercel.app/api/news/detail/${beritaId}`
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      console.log(data);

      const judul = data.judul || "Judul tidak tersedia";
      const tanggal = data.tanggal || "Tanggal tidak tersedia";
      const konten = (data.konten || "Konten tidak tersedia").replace(
        /\n/g,
        "<br>"
      );
      const gambar = data.gambar || null;

      const container = document.getElementById("news-detail-container");

      const detailTemplate = `
            <div class="max-w-10xl mx-auto p-8 bg-blue-200 shadow-lg rounded-xl">
                <h1 class="text-3xl font-bold mb-6">${judul}</h1>
                <p class="text-gray-600 text-base mb-6">${tanggal}</p>
                ${
                  gambar
                    ? `<img src="${gambar}" alt="${judul}" class="w-25 h-auto rounded-lg mb-8">`
                    : ""
                } 
                <div class="text-gray-900 leading-relaxed text-sm font-semibold">${konten}</div>
            </div>
        `;

      container.innerHTML = detailTemplate;
    }, 1000);
  } catch (error) {
    console.error("Error fetching Detail News:", error);
    const container = document.getElementById("news-detail-container");
    container.innerHTML =
      "<p class='text-red-500'>Gagal memuat detail berita. Silakan coba lagi nanti.</p>";
  }
}

fetchDetailNews();
