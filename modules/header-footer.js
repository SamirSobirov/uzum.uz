import { getData } from "./reqs"
import { searchListReload } from "./ui"

export function headerFooterJs() {
    let langs = document.querySelectorAll('[data-lang]'),
        langs_area = document.querySelectorAll('.header__langs-area'),
        langs_list = document.querySelectorAll('.header__langs-list')

    langs.forEach(el => el.onclick = () => {
        langs_list.forEach(item => {
            item.classList.toggle('langs-list-active')
            langs_area.forEach(itemTwo => {
                item.classList.contains('langs-list-active') ? itemTwo.style.display = 'block' : itemTwo.style.display = 'none'
            })
        })
    })

    let menu_drop_downs = document.querySelectorAll('.header__menu-item_drop-down[data-list-num]'),
        menu_drop_down_lists = document.querySelectorAll('.header__menu-list'),
        menu = document.querySelector('.header__menu'),
        menu_btn = document.querySelector('.header__menu-icon'),
        menu_close = document.querySelector('#menu-close')

    menu_close.onclick = () => menu.classList.contains('menu-visible') ? menu.classList.remove('menu-visible') : menu.classList.add('menu-visible')
    menu_btn.onclick = () => menu.classList.contains('menu-visible') ? menu.classList.remove('menu-visible') : menu.classList.add('menu-visible')

    menu_drop_downs.forEach(el => {
        el.onclick = () => {
            menu_drop_down_lists.forEach(item => {
                if (el.dataset.listNum == item.dataset.listNum) {
                    if (item.classList.contains('menu-list-visible')) {
                        item.classList.remove('menu-list-visible')
                        el.querySelector('svg').style.rotate = '0deg'
                    } else {
                        item.classList.add('menu-list-visible')
                        el.querySelector('svg').style.rotate = '-180deg'
                    }
                }
            })
        }
    })

    let catal_btns = document.querySelectorAll('#catal-btn'),
        catalog_icons = document.querySelectorAll('.header__catalog-icon'),
        catal_lists = document.querySelectorAll('.catalog-list'),
        catalog_list__area = document.querySelector('.catalog-list__area')


    catal_btns.forEach((el, idx) => {
        el.onclick = () => {
            if (idx != 1) {
                catalog_list__area.style.visibility = 'visible'
                catalog_list__area.style.opacity = '1'
            }
            if (idx == 0 || 1) {
                catalog_icons.forEach(el => {
                    el.classList.contains('catal-visible') ? el.classList.remove('catal-visible') : el.classList.add('catal-visible')
                })
            }
            catal_lists.forEach(item => {
                if (item.classList.contains('catalog-list-visible')) {
                    item.classList.remove('catalog-list-visible')
                    idx == 1 ? el.lastElementChild.style.rotate = '0deg' : null
                } else {
                    item.classList.add('catalog-list-visible')
                    idx == 1 ? el.lastElementChild.style.rotate = '-180deg' : null
                }
            })
        }
    })


    let types = []
    let header__floor_fb = document.querySelector('.header__floor-flex-box')

    getData('/goods')
        .then(({ data }) => {
            data.forEach(el => types.push(el.type))
            header__floor_fb.innerHTML = ''

            let uniqTypes = [...new Set(types)]

            catal_lists.forEach((el, idx) => {
                el.innerHTML = ''
                for (let item of uniqTypes) {
                    let count = 0
                    types.forEach(type => type == item ? count++ : null)
                    if (el.classList.contains('header__center-catalog-list')) {
                        el.innerHTML += `
                            <div class="catalog-list__item">
                                <div class="catalog-list__left">
                                    <img class="catalog-list__icon" src="/public/icons/header/catalog-icon.svg"
                                        alt="icon">
                                    <p class="catalog-list__txt">${item}</p>
                                </div>
                                <div class="catalog-list__item-count">${count}</div>
                            </div>
                        `
                    } else {
                        el.innerHTML += `
                        <div class="catalog-list__item">
                            <div class="catalog-list__left">
                                <img class="catalog-list__icon" src="/public/icons/header/catalog-icon.svg"
                                    alt="icon">
                                <p class="catalog-list__txt">${item}</p>
                            </div>
                            <img class="catalog-list__arrow" style="rotate: -90deg;" src="/icons/arrow.svg" alt="icon">
                        </div>
                    `
                    }
                    if (idx == catal_lists.length - 1) {
                        header__floor_fb.innerHTML += `
                            <div class="header__floor-item">${item}</div>
                        `
                    }
                }
            })


            let searchInp = document.querySelector('.header__search-inp'),
                searchList = document.querySelector('.search-list'),
                searchBtns = document.querySelectorAll('.header__search-btn'),
                searchListCont = document.querySelector('.search-list__container')

            searchInp.oninput = () => {
                let value = searchInp.value.toLowerCase(),
                    listData = data.filter(el => el.title.toLowerCase().includes(value))

                searchListReload(listData, searchListCont)
                value != '' ? searchList.classList.add('search-list_active') : searchList.classList.remove('search-list_active')
            }
        })

    catalog_list__area.onclick = () => {
        catalog_list__area.style.visibility = 'hidden'
        catalog_list__area.style.opacity = '0'
        catal_btns.forEach((el, idx) => {
            if (idx == 0 || 1) {
                catalog_icons.forEach(el => {
                    el.classList.contains('catal-visible') ? el.classList.remove('catal-visible') : el.classList.add('catal-visible')
                })
            }
            catal_lists.forEach(item => {
                item.classList.remove('catalog-list-visible')
                idx == 1 ? el.lastElementChild.style.rotate = '0deg' : null
            })
        })
    }

    let footer_acc_items = document.querySelectorAll('.footer__info-item')

    if (window.innerWidth <= 960) {
        footer_acc_items.forEach((el, idx) => {
            el.firstElementChild.onclick = () => {
                let key = idx
                el.classList.contains('acc-active') ? el.classList.remove('acc-active') : el.classList.add('acc-active')
                footer_acc_items.forEach((item, idx) => {
                    if (idx != key) {
                        item.classList.remove('acc-active')
                    }
                })
            }
        })
    }

    let scrollUp = document.querySelector('.scroll-up')

    window.onscroll = () => {
        if (window.scrollY >= window.innerHeight) {
            scrollUp.classList.add('scroll-up_active')
        } else {
            scrollUp.classList.remove('scroll-up_active')
        }
    }

    scrollUp.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}