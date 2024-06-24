import Swiper from 'swiper/bundle';

export function initSliders() {
    let sliderNumber = 0;
    const swipers = document.querySelectorAll('.swiper');

    swipers.forEach(function (swiperElement) {
        const sliderClass = 'swiper-' + sliderNumber;
        const slider = '.' + sliderClass;

        swiperElement.classList.add(sliderClass);

        const swiper = new Swiper(slider, {
            loop: true,
            slidesPerView: 2,
            spaceBetween: 16,
            allowTouchMove: true,
            breakpoints: {
                460: {
                    slidesPerView: 3,
                },
                720: {
                    slidesPerView: 4,
                },
                1080: {
                    slidesPerView: 6,
                },
                1280: {
                    slidesPerView: 8,
                },
                1400: {
                    slidesPerView: 10,
                }
            },
            pagination: {
                el: '.swiper-pagination',
                // dynamicBullets: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        swiper;
        swiperElement.classList.add('visible');
        sliderNumber++;
    });
}