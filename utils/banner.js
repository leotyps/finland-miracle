fetch('https://48intensapi.my.id/api/banners')
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
                { url: 'https://jkt48.com', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737093681/mb5qsuezkp9gbfvicvig.webp' },
                { url: 'https://cdn.discordapp.com/attachments/1309037991888683018/1316772733211902033/1211_38.mp4?ex=67827f2c&is=67812dac&hm=df80e31b65e9b07288db0d856ddc983c979e15271c9ab30fef221e1514af6f80&', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1736313244/znakglqjkjxzrddah4od.webp' },
                { url: 'https://48intens.com/discord', img: 'https://res.cloudinary.com/dlx2zm7ha/image/upload/v1737093680/iy2y9pvizufbusgplyjn.webp' }
            ];

            customBanners.forEach(customBanner => {
                if (customBanner.url && customBanner.img) {
                    const link = document.createElement('a');
                    link.href = customBanner.url;
                    link.className = 'block w-full h-full';

                    const img = document.createElement('img');
                    img.src = customBanner.img;
                    img.alt = 'Custom Banner';
                    img.className = 'w-full h-full object-cover loading="lazy"';

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