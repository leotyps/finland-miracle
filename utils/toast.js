class LiveNotification {
    constructor() {
        this.initContainer();
        this.notifications = [];
        this.sentNotifications = new Set(JSON.parse(sessionStorage.getItem('sentNotifications')) || []);
        this.startChecking();
    }
    initContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-20 right-2 sm:right-5 transform transition-all duration-500 ease-in-out z-50 space-y-4 w-[95%] sm:w-auto max-w-full sm:max-w-md mx-auto';
            document.body.appendChild(container);
        }
        this.container = container;
    }
    async startChecking() {
        await this.checkLiveStreams();
        setInterval(() => this.checkLiveStreams(), 50000);
    }
    async fetchData(url) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching from ' + url + ':', error);
            return null;
        }
    }
    async checkLiveStreams() {
        try {
            const [idnData, showroomData] = await Promise.all([
                this.fetchData('https://48intensapi.my.id/api/idnlive/jkt48'),
                this.fetchData('https://48intensapi.my.id/api/showroom/jekatepatlapan')
            ]);
            this.notifications = [];
            this.processIDNData(idnData);
            this.processShowroomData(showroomData);
            this.showNotifications();
        } catch (error) {
            console.error('Error fetching live data:', error);
        }
    }
    processIDNData(data) {
        if (data?.status === 'success' && data.data.length > 0) {
            data.data.forEach(user => {
                if (!this.sentNotifications.has(user.user.username)) {
                    this.notifications.push({
                        id: user.user.username,
                        name: user.user.name,
                        image: user.user.avatar,
                        platform: 'IDN Live',
                        url: 'https://idn.app/' + user.user.username
                    });
                    this.sentNotifications.add(user.user.username);
                }
            });
        }
    }
    processShowroomData(data) {
        if (Array.isArray(data)) {
            data.forEach(room => {
                if (room.streaming_url_list?.length > 0 && !this.sentNotifications.has(room.room_url_key)) {
                    this.notifications.push({
                        id: room.room_url_key,
                        name: room.main_name,
                        image: room.image_square,
                        platform: 'Showroom',
                        url: 'https://www.showroom-live.com/' + room.room_url_key
                    });
                    this.sentNotifications.add(room.room_url_key);
                }
            });
        }
    }
    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = 'transform translate-x-full opacity-0 transition-all duration-500 ease-out w-full max-w-[95vw] sm:max-w-md p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 dark:shadow-2xl mb-3 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300';
        div.role = 'alert';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                    <span class="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Live Now 🔴</span>
                    <h3 class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">${notification.name}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${notification.platform}</p>
                </div>
                <button type="button" class="ml-4 -mt-2 -mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <span class="sr-only">Close</span>
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <a href="/livejkt48" target="_blank" class="group block">
                <div class="flex items-center gap-4 pt-2">
                    <div class="relative">
                        <img class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300" src="${notification.image}" alt="${notification.name}"/>
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div class="flex-1">
                        <div class="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            Watch Live Stream
                            <span class="inline-block ml-2 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300">→</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to view ${notification.name}'s stream</p>
                    </div>
                </div>
            </a>
        `;
        div.querySelector('button').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            div.style.opacity = '0';
            div.style.transform = 'translateX(120%)';
            setTimeout(() => div.remove(), 500);
        });
        return div;
    }
    showNotifications() {
        if (this.notifications.length === 0) {
            return;
        }
        this.container.classList.add('right-2', 'sm:right-4', 'top-4', 'sm:top-6');
        this.container.classList.remove('space-y-4');
        this.container.classList.add('space-y-3');
        this.notifications.forEach((notif, index) => {
            setTimeout(() => {
                const notifEl = this.createNotificationElement(notif);
                this.container.appendChild(notifEl);
                setTimeout(() => {
                    notifEl.classList.replace('translate-x-full', 'translate-x-0');
                    notifEl.style.opacity = '1';
                }, 50);
                setTimeout(() => {
                    notifEl.style.opacity = '0';
                    notifEl.style.transform = 'translateX(120%)';
                    setTimeout(() => notifEl.remove(), 500);
                }, 12000);
            }, index * 300);
        });
        sessionStorage.setItem('sentNotifications', JSON.stringify([...this.sentNotifications]));
    }
}

new LiveNotification();
