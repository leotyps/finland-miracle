// Utility untuk status pertunjukan
function getShowStatus(showInfo) {
  try {
    const now = new Date()
    // Mulai hari ini jam 00:00
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    // Besok jam 00:00
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)

    // showInfo format: "Setlist, YYYY-MM-DD HH"
    const parts = showInfo.split(', ')
    if (parts.length < 2) {
      console.error('Invalid showInfo format:', showInfo)
      return null
    }
    const [datePart, hourPart] = parts[1].split(' ')
    const startDate = new Date(datePart.replace(/-/g, '/') + ' ' + hourPart + ':00')
    if (isNaN(startDate)) {
      console.error('Invalid show date/time:', parts[1])
      return null
    }
    // Durasi pertunjukan kira-kira 2 jam
    const endDate = new Date(startDate)
    endDate.setHours(endDate.getHours() + 2)

    // Bandingkan
    const showDayStart = new Date(startDate)
    showDayStart.setHours(0, 0, 0, 0)

    if (endDate < now) {
      // Sudah lewat
      return null
    }
    if (showDayStart.getTime() === todayStart.getTime()) {
      // Hari ini
      if (now >= startDate && now <= endDate) {
        return { text: 'Sedang Berlangsung' }
      }
      return { text: 'Hari ini' }
    }
    if (showDayStart.getTime() === tomorrowStart.getTime()) {
      return { text: 'Besok' }
    }
    return { text: 'Upcoming' }
  } catch (err) {
    console.error('Error in getShowStatus:', err)
    return null
  }
}

// Render loading skeleton dan fetch data
async function fetchTheaterData() {
  const container = document.getElementById('theater-container')
  container.innerHTML = ''

  // Skeleton placeholder sesuai jumlah data minimal
  try {
    const response = await fetch('https://48intensapi.my.id/api/theater')
    const theaterList = await response.json()
    const count = theaterList.length || 1
    container.innerHTML = Array(count).fill(`
      <div class="bg-black rounded-xl shadow-md overflow-hidden skeleton max-w-md mx-auto">
        <div class="relative">
          <div class="bg-gray-300 h-80 w-full animate-pulse"></div>
          <div class="absolute top-4 right-4">
            <div class="bg-gray-300 h-6 w-20 rounded-full animate-pulse"></div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6">
            <div class="bg-gray-300 h-7 w-3/4 mb-4 mt-6 rounded animate-pulse"></div>
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-gray-300 h-4 w-4 rounded animate-pulse"></div>
              <div class="bg-gray-300 h-4 w-1/2 rounded animate-pulse"></div>
            </div>
            <div class="flex items-center gap-2 mb-5">
              <div class="bg-gray-300 h-4 w-4 rounded animate-pulse"></div>
              <div class="bg-gray-300 h-4 w-1/3 rounded animate-pulse"></div>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <div class="bg-gray-300 h-5 w-5 rounded-full animate-pulse"></div>
              <div class="bg-gray-300 h-4 w-16 rounded animate-pulse"></div>
            </div>
            <div class="bg-gray-300 h-10 w-full rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    `).join('')

    // Fetch setlist images & member data
    const [setlistRes, memberRes] = await Promise.all([
      fetch('/data/theater.json'),
      fetch('https://48intensapi.my.id/api/member')
    ])
    const setlistData = await setlistRes.json()
    const memberApi = await memberRes.json()
    container.innerHTML = ''

    if (theaterList.length === 0) {
      showNotFoundMessage(container, 'Theater Not Found 😭')
      return
    }

    theaterList.forEach(show => {
      const setData = setlistData.find(s => s.setlist === show.setlist)
      const status = getShowStatus(show.showInfo)
      const hasBirthday = show.birthdayMembers.length > 0

      const cardHTML = `
        <div class="bg-black rounded-3xl shadow-md overflow-hidden max-w-md mx-auto">
          <div class="relative">
            <img src="${setData?.image || 'https://jkt48.com/images/logo.svg'}"
                 alt="${show.setlist}"
                 class="w-full h-80 object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/60 to-transparent"></div>
            ${hasBirthday ? `<span class="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-4 py-1.5 rounded-full">Birthday</span>` : ''}
            ${status ? `<span class="absolute top-4 right-4 bg-white/30 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-md">${status.text}</span>` : ''}
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="text-xl font-bold mb-4 mt-6">${show.setlist}</h3>
              <div class="flex items-center gap-3 text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>${show.showInfo.split(' ')[0]} ${show.showInfo.split(' ')[1]} | ${show.time} WIB</span>
              </div>
              <div class="flex items-center gap-3 text-sm mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span>${show.members.length > 0 ? show.members.length + ' Members yang tampil' : 'No Members 😭'}</span>
              </div>
              <div class="flex items-center gap-3 mb-4">
                <img src="https://jkt48.com/images/logo.svg" alt="JKT48" class="w-6 h-6 rounded-full object-cover">
                <span class="text-sm">JKT48</span>
              </div>
              <button class="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-full text-sm transition duration-300 backdrop-blur-sm"
                      onclick="showPopup(${JSON.stringify(show)}, ${JSON.stringify(setData)}, ${JSON.stringify(memberApi.members.member)})">
                Detail
              </button>
            </div>
          </div>
        </div>
      `
      container.innerHTML += cardHTML
    })
  } catch (err) {
    console.error('Error fetching theater data:', err)
    showNotFoundMessage(container, 'Theater Not Found 😭')
  }
}

// Tampilkan pesan bila tidak ada data
function showNotFoundMessage(container, message) {
  container.className = 'min-h-[24rem] relative'
  container.innerHTML = `
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="flex flex-col items-center">
        <img src="https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737173118/z0erjecyq6twx7cmnaii.png"
             alt="Not Found" class="w-64 mb-4">
        <p class="text-gray-500 text-lg font-bold">${message}</p>
      </div>
    </div>
  `
}

// Popup detail lineup
async function showPopup(showData, setData, allMembers) {
  try {
    const res = await fetch('/data/member.json')
    const nicknames = await res.json()
    const popup = document.getElementById('popup')
    const content = document.getElementById('popup-content')

    document.body.style.paddingRight = `${getScrollbarWidth()}px`
    document.body.classList.add('no-scroll')

    // Gabungkan data lineup dengan nickname & displayName
    const lineup = showData.members.map(name => {
      const raw = allMembers.find(m => m.nama_member === name)
      if (!raw) return null
      const profile = nicknames.find(m => m.name === name)
      return {
        ...raw,
        displayName: profile?.nicknames[0] || name,
        memberId: raw.id_member,
        originalName: name
      }
    }).filter(x => x)

    const memberCards = lineup.length
      ? lineup.map(m => `
          <a href="/member/${m.memberId}" class="flex flex-col items-center bg-gray-50 p-2 rounded-3xl">
            <img src="https://jkt48.com${m.ava_member}" alt="${m.displayName}"
                 class="w-16 h-16 object-cover rounded-full mb-2">
            <span class="text-xs font-semibold">${m.displayName}</span>
          </a>
        `).join('')
      : Array(6).fill(`
          <div class="flex flex-col items-center bg-gray-50 p-2 rounded-3xl">
            <img src="https://jkt48.com/images/logo.svg" alt="Placeholder"
                 class="w-16 h-16 object-cover rounded-full mb-2">
            <span class="text-xs font-semibold">No Member</span>
          </div>
        `).join('')

    content.innerHTML = `
      <div class="bg-white rounded-3xl shadow-lg p-4 max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">${showData.setlist}</h2>
          <button class="bg-red-500 text-white px-3 py-1 rounded-3xl hover:bg-red-400 transition duration-300"
                  onclick="closePopup()">Close</button>
        </div>
        <img src="${setData?.image || 'https://jkt48.com/images/logo.svg'}"
             alt="${showData.setlist}"
             class="w-full h-48 sm:h-40 object-cover rounded-3xl mb-4">
        <div class="space-y-2 mb-4">
          <div class="text-sm text-gray-500"><strong>Date:</strong> ${showData.showInfo.split(' ')[0]}</div>
          <div class="text-sm text-gray-500"><strong>Time:</strong> ${showData.time} WIB</div>
          ${showData.birthdayMembers.length > 0
            ? `<div class="text-sm text-gray-500"><strong>Seintansai:</strong> ${showData.birthdayMembers.join(', ')}</div>`
            : ''}
        </div>
        <div class="text-sm text-gray-500 mb-4">
          <strong>Description:</strong><br>
          <p class="mt-1">${setData?.description || 'No description available'}</p>
        </div>
        <h3 class="text-sm font-bold mb-3">Lineup Members:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${memberCards}
        </div>
      </div>
    `
    popup.classList.remove('hidden')
  } catch (err) {
    console.error('Error fetching member nicknames:', err)
  }
}

// Helper scrollbar & close
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth
}
function closePopup() {
  const popup = document.getElementById('popup')
  popup.classList.add('hidden')
  document.body.style.paddingRight = '0'
  document.body.classList.remove('no-scroll')
}

// Jalankan
fetchTheaterData()
