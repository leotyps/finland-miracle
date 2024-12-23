async function fetchMembers() {
  try {
    const response = await fetch("/data/member.json");
    const members = await response.json();

    members.sort((a, b) => a.name.localeCompare(b.name));

    const container = document.getElementById("page-member-container");
    container.innerHTML = "";

    container.className =
      "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-4 p-4";

    members.forEach((member) => {
      const card = document.createElement("div");
      card.className =
        "bg-blue-200 shadow-md rounded-lg flex flex-col items-center p-4 cursor-pointer";

      card.innerHTML = `
        <div class="w-24 h-24 rounded-full mb-4 overflow-hidden">
          <img src="${member.img_alt}" alt="${member.name}" class="w-full h-full object-cover">
        </div>
        <div class="text-center text-lg font-semibold leading-tight break-words">${member.name}</div>
      `;

      card.addEventListener("click", () => showModal(member));
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
  }
}

function showModal(member) {
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");

  modalContent.innerHTML = `
    <div class="text-center p-4">
      <img src="${member.img_alt}" alt="${
    member.name
  }" class="w-48 h-48 object-cover rounded-lg mx-auto mb-4">
      <h2 class="text-2xl font-bold mb-2">${member.name}</h2>
      <p class="text-gray-600 mb-4">${member.jikosokai}</p>
      <p class="text-gray-600 mb-4">${member.description.replace(
        /\n/g,
        "<br>"
      )}</p>
    </div>
    <div class="p-4 border-t">
      <h3 class="text-lg font-semibold mb-2">Social Media</h3>
      <ul class="space-y-2">
        ${member.socials
          .map(
            (social) => `
          <li>
            <a href="${social.url}" target="_blank" class="text-blue-500 hover:underline">
              ${social.title}
            </a>
          </li>
        `
          )
          .join("")}
      </ul>
    </div>
  `;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("fade-in");
  }, 10);
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("fade-in");
  modal.classList.add("fade-out");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("fade-out");
  }, 300);
}

window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) {
    closeModal();
  }
});

fetchMembers();
