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

                link.appendChild(img);
                bannerSlider.appendChild(link);
            });


            const customBanners = [
                { url: 'https://48intens.com/discord', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1736313014/cjzknqpzc7eokiwyrufh.webp' },
                { url: 'https://48intens.com/discord', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1736313244/znakglqjkjxzrddah4od.webp' },
                { url: 'https://48intens.com/discord', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1736313480/ilfgvvkbwdlx9kjshfn1.webp' }
            ];

            customBanners.forEach(customBanner => {
                if (customBanner.url && customBanner.img) {
                    const link = document.createElement('a');
                    link.href = customBanner.url;
                    link.className = 'block w-full h-full';

                    const img = document.createElement('img');
                    img.src = customBanner.img;
                    img.alt = 'Custom Banner';
                    img.className = 'w-full h-full object-cover';

                    link.appendChild(img);
                    bannerSlider.appendChild(link);
                }
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