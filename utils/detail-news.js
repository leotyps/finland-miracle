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
      ).innerHTML = `<div class="bg-white rounded-lg shadow-md overflow-hidden p-4 h-64 flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-xl font-bold">Nothing to see here!</h2>
          </div>
        </div>`;
      return;
    }

    const container = document.getElementById("news-detail-container");
    container.innerHTML = `
      <div class="flex-col gap-4 w-full flex items-center justify-center">
        <div class="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
          <div class="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
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
            <div class="max-w-3xl mx-auto p-6 bg-blue-200 shadow-md rounded-lg">
                <h1 class="text-3xl font-bold mb-4">${judul}</h1>
                <p class="text-gray-500 text-sm mb-4">${tanggal}</p>
                ${
                  gambar
                    ? `<img src="${gambar}" alt="${judul}" class="w-full h-auto rounded-lg mb-6">`
                    : ""
                } 
                <div class="text-gray-800 leading-relaxed">${konten}</div>
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
