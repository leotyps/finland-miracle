let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let events = [];

async function fetchEvents(year, month) {
    try {
        const url = `https://intensprotectionexenew.vercel.app/api/events_jkt48?year=${year}&month=${month + 1}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data) {
            events = data.data;
            renderCalendar(year, month);
        } else {
            events = [];
            renderCalendar(year, month);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        events = [];
        renderCalendar(year, month);
    }
}

function renderCalendar(year, month) {
    const calendar = document.getElementById('calendar');
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();

    calendar.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4';
    while (calendar.children.length > 7) {
        calendar.removeChild(calendar.lastChild);
    }
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'min-h-32 bg-gray-50 rounded-lg hidden lg:block';
        calendar.appendChild(emptyDay);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'min-h-32 bg-white border rounded-lg p-2 flex flex-col';
        const dateText = document.createElement('div');
        dateText.className = 'text-lg font-bold text-gray-800 mb-2';
        dateText.textContent = day;
        dayCell.appendChild(dateText);

        const dayEvents = events.filter(event => {
            const eventDate = event.tanggal_full.split('/');
            return parseInt(eventDate[0]) === day && event.event_name !== null && event.have_event === true;
        });

        if (dayEvents.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'space-y-2 flex-grow';

            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'p-2 bg-purple-100 text-purple-700 rounded-md text-sm';
                eventDiv.innerHTML = `
                    <div class="font-medium truncate">${event.event_name}</div>
                    ${event.event_time ? `<div class="text-xs text-purple-600 mt-1">${event.event_time}</div>` : ''}
                `;
                eventsContainer.appendChild(eventDiv);
            });

            dayCell.appendChild(eventsContainer);
        } else {
            const noEventText = document.createElement('div');
            noEventText.className = 'text-gray-400 text-sm italic';
            noEventText.textContent = 'No events';
            dayCell.appendChild(noEventText);
        }

        calendar.appendChild(dayCell);
    }
    updateCurrentDate();
}


function updateCurrentDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentDate').textContent = `${months[currentMonth]} ${currentYear}`;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        fetchEvents(currentYear, currentMonth);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        fetchEvents(currentYear, currentMonth);
    });

    fetchEvents(currentYear, currentMonth);
});
