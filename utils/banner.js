fetch('https://intensprotectionexenew.vercel.app/api/banners')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data) {
            const bannerSlider = document.querySelector('.banner-slider');
            data.data.forEach(banner => {
                const link = document.createElement('a');
                link.href = banner.value;
                link.className = 'block w-full h-full';

                const img = document.createElement('img');
                img.src = banner.img_url;
                img.alt = 'Banner';
                img.className = 'w-full h-full object-cover';
                img.onload = function() {
                    link.appendChild(img);
                    bannerSlider.appendChild(link);
                };

                img.onerror = function() {
                    window.location.href = '/notfound';
                };
                bannerSlider.appendChild(link);
            });

            tns({
                container: '.banner-slider',
                items: 1,
                slideBy: 'page',
                autoplay: true,
                autoplayTimeout: 4000,
                autoplayButtonOutput: false,
                controls: false,
                nav: true,
                navPosition: 'bottom',
                mouseDrag: true,
                touch: true,
                speed: 400,
                loop: true,
            });
        }
    })
    .catch(error => console.error('Error fetching banners:', error));
