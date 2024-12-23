function parseDate(indonesianDate) {
    const months = {
        Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
        Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12"
    };

    const [day, month, year] = indonesianDate.split(" ");
    const monthNumber = months[month];

    if (!monthNumber) {
        console.error("Invalid month in date:", indonesianDate);
        return null;
    }

    return new Date(`${year}-${monthNumber}-${day.padStart(2, "0")}`);
}

async function fetchBirthdays() {
    const container = document.getElementById('birthday-container');

    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/birthdays');
        const data = await response.json();

        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-4 text-lg">
                    No upcoming birthdays
                </div>
            `;
            return;
        }

        const today = new Date();
        const todayDay = today.getDate();
        const todayMonth = today.getMonth();

        data.forEach((member, index) => {
            const parsedDate = parseDate(member.birthday);

            if (!parsedDate) {
                return; 
            }

            const birthDay = parsedDate.getDate();
            const birthMonth = parsedDate.getMonth();

            let status = '';
            if (birthDay === todayDay && birthMonth === todayMonth) {
                status = 'Today';
            } else if (
                birthDay === todayDay + 1 &&
                birthMonth === todayMonth
            ) {
                status = 'Tomorrow';
            }
            const memberCard = `
                <div class="flex items-center space-x-4 p-4 bg-violet-100/60 rounded-lg shadow-sm max-w-md">
                    <img src="${member.imgSrc}" alt="${member.name}" class="w-16 h-16 rounded-full object-cover">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-800">${member.name}</h4>
                        <p class="text-sm text-gray-600">${member.birthday}</p>
                    </div>
                    ${
                        status
                            ? `<span class="text-sm text-gray-500 font-medium">${status}</span>`
                            : ''
                    }
                </div>
                ${
                    index < data.length - 1
                        ? `<div class="border-t border-dashed border-gray-300 mx-4"></div>`
                        : ''
                }
            `;
            container.innerHTML += memberCard;
        });
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4 text-lg">
                Failed to load birthday data
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', fetchBirthdays);
