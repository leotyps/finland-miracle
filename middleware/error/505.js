        // Prevent all link clicks while on error page
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
            }
        });

        // Disable all navigation
        window.onload = function() {
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = function() {
                window.history.pushState(null, '', window.location.href);
            };
        };

        const utilsScripts = [
            '/utils/news.js',
            '/utils/youtube.js',
            '/utils/birthday.js',
            '/utils/banner.js',
            '/utils/theater.js'
        ];

        let checkingInProgress = false;
        let autoCheckInterval;

        async function checkScript(src) {
            try {
                const response = await fetch(src, {
                    method: 'HEAD',
                    cache: 'no-store'
                });
                if (!response.ok) {
                    throw new Error(`Failed to load ${src}`);
                }
                // Try to actually load and execute the script
                const scriptContent = await fetch(src).then(r => r.text());
                try {
                    new Function(scriptContent);
                    return true;
                } catch (e) {
                    throw new Error(`Script ${src} contains errors`);
                }
            } catch (error) {
                return false;
            }
        }

        async function checkScripts() {
            if (checkingInProgress) return;
            checkingInProgress = true;

            const errorDetails = document.getElementById('error-details');
            const loading = document.getElementById('loading');
            const retryButton = document.querySelector('button');
            
            loading.classList.remove('hidden');
            retryButton.disabled = true;
            errorDetails.innerHTML = '';
            
            let hasError = false;
            let errorMessages = [];

            try {
                for (const script of utilsScripts) {
                    const isValid = await checkScript(script);
                    if (!isValid) {
                        hasError = true;
                        errorMessages.push(`Failed to load: ${script}`);
                    }
                }

                if (hasError) {
                    errorDetails.innerHTML = errorMessages.join('<br>');
                } else {
                    // All scripts are working - redirect to home
                    window.location.href = '/home';
                    return;
                }
            } catch (error) {
                errorDetails.innerHTML = 'An error occurred while checking scripts';
            } finally {
                loading.classList.add('hidden');
                retryButton.disabled = false;
                checkingInProgress = false;
            }
        }

        // Initial check
        checkScripts();

        // Set up automatic checking every 30 seconds
        autoCheckInterval = setInterval(checkScripts, 30000);

        // Cleanup interval when leaving page
        window.addEventListener('beforeunload', function() {
            if (autoCheckInterval) {
                clearInterval(autoCheckInterval);
            }
        });