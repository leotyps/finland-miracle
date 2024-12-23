async function fetchMembers() {
  try {
    // Fetch data dari API
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/member"
    );
    const data = await response.json();

    // Ambil array member dari hasil API
    const members = data.members.member;

    // Urutkan berdasarkan nama_member
    members.sort((a, b) => a.nama_member.localeCompare(b.nama_member));

    // Ambil container
    const container = document.getElementById("page-member-container");
    container.innerHTML = "";

    // Set grid dengan 9 kolom di desktop
    container.className =
      "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-4 p-4";

    // Loop melalui setiap member
    members.forEach((member) => {
      const memberId = member.id_member; // Ambil ID member
      const detailUrl = `/components/detail/member.html?id=${memberId}`; // Buat detail URL

      const card = `
        <a href="${detailUrl}" class="bg-blue-200 shadow-md rounded-lg flex flex-col items-center p-4 cursor-pointer">
          <div class="w-24 h-24 rounded-full mb-4 overflow-hidden">
            <img src="https://jkt48.com${member.ava_member}" alt="${member.nama_member}" class="w-full h-full object-cover">
          </div>
          <div class="text-center text-lg font-semibold leading-tight break-words">${member.nama_member}</div>
        </a>
      `;

      container.innerHTML += card; // Tambahkan card ke container
    });
  } catch (error) {
    console.error("Error fetching members:", error);
  }
}

// Panggil fungsi untuk mengambil data
fetchMembers();
