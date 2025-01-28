function checkLoginStatus() {
    const loginButton = document.getElementById('loginButton');
    const loginButtonMobile = document.getElementById('loginButtonMobile');
    const username = localStorage.getItem('userName');

    if (username) {
        if (loginButton) {
            loginButton.innerHTML = `
                ${username}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButton.parentElement.href = "javascript:void(0)";
        }
        if (loginButtonMobile) {
            loginButtonMobile.innerHTML = `
                ${username}
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButtonMobile.parentElement.href = "javascript:void(0)";
        }
    } else {
        if (loginButton) {
            loginButton.innerHTML = `
                Login
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButton.parentElement.href = "/login";
        }

        if (loginButtonMobile) {
            loginButtonMobile.innerHTML = `
                Login
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-5-5 5-5"></path>
                </svg>
            `;
            loginButtonMobile.parentElement.href = "/login";
        }
    }
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
window.addEventListener('storage', checkLoginStatus);
