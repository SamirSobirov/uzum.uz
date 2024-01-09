import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { getData } from './reqs';
import { sliderReload } from './ui';

export async function swiperJs() {
    await getData('/goods').then(({ data }) => {
        const swiper_products = data.filter(el => el.type == 'kitchen' || el.type == 'furniture')
        const swiper_wrapper = document.querySelector('.product-slider__wrapper')

        sliderReload(swiper_products, swiper_wrapper)
    })
    
    new Swiper('.swiper', {
        loop: true,
        spaceBetween: 10,
        centeredSlides: true,
        slidesPerView: 1.1,

        breakpoints: {
            960: {
                slidesPerView: 1,
                spaceBetween: 0
            }
        },
        pagination: {
            el: '.swiper-pagination',
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 4000,
        },
    });
}