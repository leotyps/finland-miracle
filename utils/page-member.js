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
      "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-4 p-4";

    members.forEach((member) => {
      const memberId = member.id_member;
      const detailUrl = `/components/detail/member.html?id=${memberId}`;

      const card = `
        <a href="${detailUrl}" class="bg-blue-200 shadow-md rounded-lg flex flex-col items-center p-4 cursor-pointer">
          <div class="w-24 h-24 rounded-full mb-4 overflow-hidden">
            <img src="https://jkt48.com${member.ava_member}" alt="${member.nama_member}" class="w-full h-full object-cover">
          </div>
          <div class="text-center text-lg font-semibold leading-tight break-words">${member.nama_member}</div>
        </a>
      `;

      container.innerHTML += card;
    });
  } catch (error) {
    console.error("Error fetching members:", error);
  }
}


fetchMembers();
