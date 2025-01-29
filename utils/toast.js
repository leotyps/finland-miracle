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
            console.error(`Error fetching from ${url}:`, error);
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
            data.data.forEach(member => {
                if (!this.sentNotifications.has(member.user.username)) {
                    this.notifications.push({
                        id: member.user.username,
                        name: member.user.name,
                        image: member.user.avatar,
                        platform: 'IDN Live',
                        url: `https://idn.app/${member.user.username}`
                    });
                    this.sentNotifications.add(member.user.username);
                }
            });
        }
    }

    processShowroomData(data) {
        if (data && Array.isArray(data)) {
            data.forEach(member => {
                if (member.streaming_url_list?.length > 0 && !this.sentNotifications.has(member.room_url_key)) {
                    this.notifications.push({
                        id: member.room_url_key,
                        name: member.main_name,
                        image: member.image_square,
                        platform: 'Showroom',
                        url: `https://www.showroom-live.com/${member.room_url_key}`
                    });
                    this.sentNotifications.add(member.room_url_key);
                }
            });
        }
    }

    createNotificationElement(notification) {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'transform translate-x-full transition-all duration-300 ease-in-out w-full p-4 sm:p-6 text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-gray-300 mb-4';
        notificationDiv.role = 'alert';
        
        notificationDiv.innerHTML = `
            <div class="flex items-center mb-3">
                <span class="mb-1 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Live Streaming Now!</span>
                <button type="button" class="ms-auto bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700">
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1l12 12M13 1L1 13"/>
                    </svg>
                </button>
            </div>
            <a href="/livejkt48" target="_blank" class="flex items-center group">
                <img class="w-14 h-14 sm:w-16 sm:h-16 rounded-full" src="${notification.image}" alt="${notification.name}"/>
                <div class="ms-3 text-xs sm:text-sm font-normal">
                    <div class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-200">${notification.name}</div>
                    <div class="">is live on ${notification.platform}</div>
                    <span class="text-xs font-medium text-blue-600 dark:text-blue-500">Watch now!</span>
                </div>
            </a>
        `;

        notificationDiv.querySelector('button').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            notificationDiv.classList.replace('translate-x-0', 'translate-x-full');
            setTimeout(() => notificationDiv.remove(), 300);
        });

        return notificationDiv;
    }

    showNotifications() {
        if (this.notifications.length === 0) return;

        setTimeout(() => {
            this.container.classList.remove('-right-full');
            this.container.classList.add('right-2', 'sm:right-5');
        }, 100);

        this.notifications.forEach((notification, index) => {
            setTimeout(() => {
                const notificationElement = this.createNotificationElement(notification);
                this.container.appendChild(notificationElement);
                setTimeout(() => {
                    notificationElement.classList.replace('translate-x-full', 'translate-x-0');
                }, 50);
                setTimeout(() => {
                    notificationElement.classList.replace('translate-x-0', 'translate-x-full');
                    setTimeout(() => notificationElement.remove(), 300);
                }, 10000);
            }, index * 1000);
        });

        sessionStorage.setItem('sentNotifications', JSON.stringify([...this.sentNotifications]));
    }
}

new LiveNotification();