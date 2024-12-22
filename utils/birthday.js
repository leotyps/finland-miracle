async function fetchBirthdays() {
    const container = document.getElementById('birthday-container');

    try {
        const response = await fetch('https://intensprotectionexenew.vercel.app/api/birthdays');
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No upcoming birthdays found.</p>';
            return;
        }

        // Render setiap data birthday
        data.forEach(person => {
            const imgElement = document.createElement('div');
            imgElement.className = 'relative cursor-pointer';
            imgElement.innerHTML = `
                <img src="${person.imgSrc}" alt="${person.name}" 
                    class="w-24 h-24 rounded-full border-2 border-gray-300 hover:border-blue-400 transition">
            `;
            imgElement.addEventListener('click', () => showPopup(person));
            container.appendChild(imgElement);
        });
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        container.innerHTML = '<p class="text-red-500">Failed to load birthdays.</p>';
    }
}

function showPopup(person) {
    const popup = document.getElementById('popupbr');
    const img = document.getElementById('popup-img');
    const name = document.getElementById('popup-name');
    const birthday = document.getElementById('popup-birthday');

    img.src = person.imgSrc; // Set gambar
    name.textContent = person.name; // Set nama
    birthday.textContent = person.birthday; // Set tanggal ulang tahun

    popup.classList.remove('hidden'); // Tampilkan popup
    document.body.classList.add('overflow-hidden'); // Nonaktifkan scroll
}

document.getElementById('close-popup').addEventListener('click', () => {
    const popup = document.getElementById('popupbr');
    popup.classList.add('hidden'); // Sembunyikan popup
    document.body.classList.remove('overflow-hidden'); // Aktifkan kembali scroll
});

// Inisialisasi
fetchBirthdays();
