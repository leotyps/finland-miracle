let currentYear = new Date().getFullYear()
let currentMonth = new Date().getMonth()
let events = []

async function fetchEvents(year, month) {
  try {
    const url = `https://48intensapi.my.id/api/events_jkt48?year=${year}&month=${month + 1}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.success && data.data) {
      events = data.data
    } else {
      events = []
    }
    renderCalendar(year, month)
  } catch (err) {
    console.error('Error fetching events:', err)
    events = []
    renderCalendar(year, month)
  }
}

function renderCalendar(year, month) {
  const calendar = document.getElementById('calendar')
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay()

  calendar.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'
  while (calendar.children.length > 7) {
    calendar.removeChild(calendar.lastChild)
  }

  // kosongin hari sebelum tanggal 1
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement('div')
    emptyCell.className = 'min-h-32 bg-gray-50 rounded-3xl hidden lg:block'
    calendar.appendChild(emptyCell)
  }

  // isi tanggal
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const cell = document.createElement('div')
    cell.className = 'min-h-32 bg-white border rounded-3xl p-2 flex flex-col'

    const dayLabel = document.createElement('div')
    dayLabel.className = 'text-lg font-bold text-gray-800 mb-2'
    dayLabel.textContent = day
    cell.appendChild(dayLabel)

    // cari event di tanggal ini
    const dayEvents = events.filter(evt => {
      const [d, m, y] = evt.tanggal_full.split('/')
      return parseInt(d) === day && evt.have_event
    })

    if (dayEvents.length > 0) {
      const list = document.createElement('div')
      list.className = 'space-y-2 flex-grow'
      dayEvents.forEach(evt => {
        const item = document.createElement('div')
        item.className = 'p-2 bg-purple-100 text-purple-700 rounded-md text-sm'
        item.innerHTML = `
          <div class="font-medium truncate">${evt.event_name}</div>
          ${evt.event_time ? `<div class="text-xs text-purple-600 mt-1">${evt.event_time}</div>` : ''}
        `
        list.appendChild(item)
      })
      cell.appendChild(list)
    } else {
      const noEvt = document.createElement('div')
      noEvt.className = 'text-gray-400 text-sm italic'
      noEvt.textContent = 'No events'
      cell.appendChild(noEvt)
    }

    calendar.appendChild(cell)
  }

  updateCurrentDate()
}

function updateCurrentDate() {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  document.getElementById('currentDate').textContent = `${months[currentMonth]} ${currentYear}`
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--
    if (currentMonth < 0) {
      currentMonth = 11
      currentYear--
    }
    fetchEvents(currentYear, currentMonth)
  })

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
    fetchEvents(currentYear, currentMonth)
  })

  fetchEvents(currentYear, currentMonth)
})
