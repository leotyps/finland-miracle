function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function fetchDetailMember() {
  const container = document.getElementById("member-detail-container");

  try {
    const pathSegments = window.location.pathname.split('/');
    const memberId = pathSegments[pathSegments.length - 1];
    if (!memberId) {
      container.innerHTML = 
        `<div class="flex items-center justify-center h-96">
          <div class="text-center text-gray-500">
            <h2 class="text-2xl font-bold">Member tidak ditemukan</h2>
          </div>
        </div>`;
      return;
    }
    container.innerHTML = 
      `<div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div class="border-2 border-gray-200 bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div class="md:flex">
            <div class="md:w-1/3 p-6">
              <div class="bg-gray-300 w-full h-96 rounded-3xl"></div>
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

    const response = await fetch(`https://48intensapi.my.id/api/member/${memberId}`);
    if (!response.ok) {
      showNotFoundMessage(container, "Member tidak ditemukan");
      return;
    }
    const memberData = await response.json();
    const memberJsonResponse = await fetch("/data/member.json");
    const memberJsonData = await memberJsonResponse.json();
    const jikoMember = memberJsonData.find(member => member.name === memberData.name);

    const generateSocialMediaIcons = (socialMedia) => {
      if (!socialMedia) return '';
      
      const platforms = [
        { name: 'twitter', icon: 'M18.901 1.153h3.68l-8.04 9.194L22.33 22.846h-7.406l-5.8-7.598-6.638 7.598H1.405l9.298-10.623L0 1.154h7.594l5.25 6.953 6.056-6.953zm-1.978 15.774h2.042L6.78 3.257H4.47l12.453 13.67z', color: '#1DA1F2' },
        { name: 'instagram', icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.577-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.164-.42-.358-1.065-.421-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.063-1.17.258-1.815.421-2.235.21-.576.479-.96.9-1.381.419-.419.802-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.795.646-1.44 1.44-1.44.793-.001 1.44.645 1.44 1.44z', color: '#E4405F' },
        { name: 'tiktok', icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.01 0 1.16.12 2.32-.01 3.47-.13 1.11-.48 2.2-1.11 3.13-.79 1.08-1.94 1.89-3.18 2.37-.4.15-.82.23-1.23.33-.24.05-.49.1-.73.14.38 1.66 1.45 3.2 2.99 3.91.77.37 1.62.55 2.48.61.93.06 1.87-.01 2.78-.2.18-.04.36-.1.54-.14v4.56c-.96.18-1.94.29-2.92.33-1.39.06-2.79-.1-4.1-.52-2.36-.76-4.14-2.32-5.33-4.45C.79 13.39 0 11.14 0 8.78c0-1.44.32-2.85.93-4.14C2.13 2.13 3.71.99 5.57.33c.94-.33 1.92-.46 2.92-.43zm9.47 6.69c-.01.43-.02.86-.03 1.29-.06.42-.14.84-.25 1.25-.21.77-.6 1.5-1.15 2.1-.72.78-1.68 1.3-2.72 1.57-.58.15-1.17.22-1.77.23-.88.02-1.75-.1-2.6-.37-.61-.19-1.21-.46-1.76-.79-.16-.1-.33-.21-.49-.31h.02v-1.66h.07c.54.41 1.09.81 1.64 1.2.44.31.89.61 1.38.86.62.32 1.3.52 2 .6.46.06.92.04 1.38-.05.47-.1.92-.28 1.33-.52.63-.37 1.11-.93 1.38-1.6.17-.42.25-.87.26-1.32.01-.19 0-.38 0-.57-.04-.35-.08-.69-.17-1.03-.14-.54-.4-1.05-.77-1.48-.47-.54-1.08-.94-1.76-1.16-.24-.08-.49-.12-.74-.16-.49-.09-.98-.06-1.47.02-.66.11-1.28.37-1.81.78-.26.2-.52.41-.77.62V2.69c.17-.12.33-.25.5-.36.66-.44 1.37-.77 2.13-.97 1.07-.29 2.16-.33 3.25-.16 1.08.17 2.1.55 3.02 1.16.62.41 1.16.91 1.62 1.5.55.69.95 1.47 1.2 2.31.15.51.23 1.04.26 1.57.01.23.01.46.01.69v3.24z', color: '#000000' }
      ];

      return platforms
        .filter(platform => socialMedia[platform.name])
        .map(platform => `
          <a href="${socialMedia[platform.name]}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-[${platform.color}] transition-colors duration-300 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="${platform.icon}"/>
            </svg>
          </a>
        `).join('');
    };

    container.innerHTML = 
    `<div class="max-w-md mx-auto p-2 sm:max-w-xl sm:p-4 lg:max-w-7xl lg:p-8">
      <div class="border-2 border-gray-200 bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="flex flex-col sm:flex-row">
          <div class="w-full sm:w-1/3 p-6">
            <img src="${memberData.profileImage}" alt="${memberData.name}" 
                class="w-full h-[400px] sm:h-auto rounded-3xl shadow-md object-cover" loading="lazy">
          </div>

          <div class="w-full sm:w-2/3 p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">${memberData.name}</h1>
                <p class="font-semibold text-blue-300 mt-2 text-base">${jikoMember ? jikoMember.nicknames : 'Tidak tersedia'}</p>
              </div>
              ${memberData.socialMedia ? `
                <div class="flex items-center space-x-3">
                  ${generateSocialMediaIcons(memberData.socialMedia)}
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="space-y-4">
                <p class="text-gray-700 text-base"><span class="font-semibold">Tanggal Lahir:</span> ${memberData.birthdate || 'Tidak tersedia'}</p>
                <p class="text-gray-700 text-base"><span class="font-semibold">Golongan Darah:</span> ${memberData.bloodType || 'Tidak tersedia'}</p>
                <p class="text-gray-700 text-base"><span class="font-semibold">Zodiak:</span> ${memberData.zodiac || 'Tidak tersedia'}</p>
                <p class="text-gray-700 text-base"><span class="font-semibold">Tinggi:</span> ${memberData.height || 'Tidak tersedia'}</p>
              </div>
              <div class="bg-blue-200/30 p-4 rounded-3xl">
                <p class="text-gray-700 italic text-base">${jikoMember ? jikoMember.jikosokai : 'Tidak tersedia'}</p>
              </div>
            </div>
          </div>
        </div>

        ${jikoMember?.video_perkenalan ? 
        `<div class="mt-8 px-6 pb-6">
          <h2 class="text-2xl font-bold mb-4">Introduction Video</h2>
          <iframe class="w-full aspect-video rounded-3xl shadow-lg"
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
      <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png" alt="Not Found" class="w-64 h-64 mb-4 loading="lazy"">
      <p class="text-gray-500 text-lg font-bold">${message}</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', fetchDetailMember);