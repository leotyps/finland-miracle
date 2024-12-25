function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function fetchDetailMember() {
  const container = document.getElementById("member-detail-container");

  try {
    const memberId = getQueryParam("id");
    if (!memberId) {
      container.innerHTML = `
        <div class="flex items-center justify-center h-96">
          <div class="text-center text-gray-500">
            <h2 class="text-2xl font-bold">Member tidak ditemukan</h2>
          </div>
        </div>`;
      return;
    }
    container.innerHTML = `
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div class="border-2 border-gray-200 bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div class="md:flex">
            <div class="md:w-1/3 p-6">
              <div class="bg-gray-300 w-full h-96 rounded-lg"></div>
            </div>
            <div class="md:w-2/3 p-6">
              <div class="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div class="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    const response = await fetch(`https://intensprotectionexenew.vercel.app/api/member/${memberId}`);
    if (!response.ok) {
      showNotFoundMessage(container, "Member tidak ditemukan");
      return;
    }
    const memberData = await response.json();
    const memberJsonResponse = await fetch("/data/member.json");
    const memberJsonData = await memberJsonResponse.json();
    const jikoMember = memberJsonData.find(member => member.name === memberData.name);

    container.innerHTML = `
<div class="max-w-md mx-auto p-2 sm:max-w-xl sm:p-4 lg:max-w-7xl lg:p-8">
  <div class="border-2 border-gray-200 bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="flex flex-col sm:flex-row">
      <div class="w-full sm:w-1/3 p-6">
        <img src="${memberData.profileImage}" alt="${memberData.name}" 
            class="w-full h-[400px] sm:h-auto rounded-lg shadow-md object-cover">
      </div>

      <div class="w-full sm:w-2/3 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">${memberData.name}</h1>
            <p class="font-semibold text-blue-300 mt-2 text-base">${jikoMember ? jikoMember.nicknames : 'Tidak tersedia'}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="space-y-4">
            <p class="text-gray-700 text-base"><span class="font-semibold">Tanggal Lahir:</span> ${memberData.birthdate || 'Tidak tersedia'}</p>
            <p class="text-gray-700 text-base"><span class="font-semibold">Golongan Darah:</span> ${memberData.bloodType || 'Tidak tersedia'}</p>
            <p class="text-gray-700 text-base"><span class="font-semibold">Zodiak:</span> ${memberData.zodiac || 'Tidak tersedia'}</p>
            <p class="text-gray-700 text-base"><span class="font-semibold">Tinggi:</span> ${memberData.height || 'Tidak tersedia'}</p>
          </div>
          <div class="bg-blue-200/30 p-4 rounded-lg">
            <p class="text-gray-700 italic text-base">${jikoMember ? jikoMember.jikosokai : 'Tidak tersedia'}</p>
          </div>
        </div>
      </div>
    </div>

          ${jikoMember?.video_perkenalan ? `
          <div class="mt-8 px-6 pb-6">
            <h2 class="text-2xl font-bold mb-4">Introduction Video</h2>
            <iframe class="w-full aspect-video rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/${jikoMember.video_perkenalan}" 
              title="Introduction Video" frameborder="0" allowfullscreen>
            </iframe>
          </div>` : ''}
        </div>
      </div>`;
  } catch (error) {
    console.error("Error fetching member details:", error);
    showNotFoundMessage(container, "Gagal memuat detail member");
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

document.addEventListener('DOMContentLoaded', fetchDetailMember);