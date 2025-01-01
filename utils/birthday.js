function displayBirthdays() {
    const container = document.getElementById('birthdayContainer');
    const countElement = document.getElementById('birthdayCount');

    fetch('https://intensprotectionexenew.vercel.app/api/birthdays')
        .then(response => response.json())
        .then(data => {
            countElement.textContent = `${data.length} Members`;

            container.innerHTML = data.map(member => {
                const shortenedLink = member.profileLink.match(/\/(\d+)(?=\?|$)/)[0];

                return `
                    <div class="bg-white rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <a href="/member${shortenedLink}" class="flex items-center space-x-4">
                            <div class="relative flex-shrink-0">
                                <img src="${member.imgSrc}" alt="${member.name}" class="w-16 h-16 rounded-3xl object-cover">
                                <div class="absolute -bottom-1 -right-1">
                                    <div class="bg-gray-100 rounded-full p-1">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-gray-900 truncate">${member.name}</h3>
                                <p class="text-xs text-gray-500">${member.birthday}</p>
                            </div>
                            <div class="text-xs text-gray-400">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                </svg>
                            </div>
                        </a>
                    </div>
                `;
            }).join('');
        })
        .catch(error => {
            container.innerHTML = '<div class="text-center py-3 text-sm text-gray-500">Failed to load birthday data</div>';
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', displayBirthdays, { once: true });
