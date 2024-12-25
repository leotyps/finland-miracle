async function fetchMembers() {
  try {
    const response = await fetch(
      "https://intensprotectionexenew.vercel.app/api/member"
    );
    const data = await response.json();
    const members = data.members.member;
    members.sort((a, b) => a.nama_member.localeCompare(b.nama_member));

    const container = document.getElementById("page-member-container");
    container.innerHTML = "";

    container.className =
      "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4";

    const renderMembers = (filteredMembers) => {
      container.innerHTML = "";
      filteredMembers.forEach((member) => {
        const memberId = member.id_member;
        const detailUrl = `/components/detail/member.html?id=${memberId}`;
        const isMainMember = member.kategori === "Anggota JKT48";

        const cardBg = isMainMember ? "bg-rose-200 hover:bg-rose-100" : "bg-blue-100 hover:bg-blue-200";
        const badgeColor = isMainMember ? "bg-rose-400" : "bg-blue-500";

        const card = `
          <a href="${detailUrl}" class="${cardBg} shadow-md rounded-lg flex flex-col items-center p-4 cursor-pointer relative">
            <span class="${badgeColor} text-white text-xs px-2 py-1 rounded absolute top-2 right-2">
              ${member.kategori}
            </span>
            <div class="w-full h-40 mb-4 overflow-hidden rounded-lg">
              <img src="https://jkt48.com${member.ava_member}" alt="${member.nama_member}" 
                  class="w-full h-full object-cover">
            </div>
            <div class="text-center text-2x1 font-semibold leading-tight break-words">
              ${member.nama_member}
            </div>
          </a>
        `;

        container.innerHTML += card;
      });
    };

    renderMembers(members);
    const searchInput = document.getElementById("search-member");
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filteredMembers = members.filter(member => 
        member.nama_member.toLowerCase().includes(query) || 
        member.nickname?.toLowerCase().includes(query)
      );
      renderMembers(filteredMembers);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
  }
}

fetchMembers();