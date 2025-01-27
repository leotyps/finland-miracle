function checkLoginStatus() {
    const loginButton = document.getElementById('loginButton');
    const loginButtonMobile = document.getElementById('loginButtonMobile');
    const username = localStorage.getItem('userName');

    if (username && loginButton && loginButtonMobile) {
        try {
            loginButton.innerHTML = `
                ${username}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButton.parentElement.href = "javascript:void(0)";
            loginButton.onclick = handleLogout;
            loginButtonMobile.innerHTML = `
                ${username}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButtonMobile.parentElement.href = "javascript:void(0)";
            loginButtonMobile.onclick = handleLogout;
        } catch (error) {
        }
    } else {
    }
}



document.addEventListener('DOMContentLoaded', checkLoginStatus);
window.addEventListener('storage', checkLoginStatus);