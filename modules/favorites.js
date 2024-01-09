import './standard'
import '../scss/favorites.scss'
import { getData } from './reqs'
import { reloadProductCards } from './ui'
import { addToCartBtnsReload, reloadFavBtns } from './product-blocks'

let sortMainItem = document.querySelector('.sort__item_main'),
    sortElem = document.querySelector('.sort'),
    userName = localStorage.getItem('user-name'),
    listItems = document.querySelectorAll('.sort__item_list')

function choseOne(item) {
    listItems.forEach(item => item.classList.remove('sort__item_active'))
    item.classList.add('sort__item_active')
    sortElem.classList.toggle('sort_active')
}

favoritesJs()

export function favoritesJs() {
    getData(`/favorites?userName=${userName}`).then(({ data }) => {
        const neededProducts = data

        if (data.length != 0) {
            getData('/goods').then(({ data }) => {
                let productsContainer = document.querySelector('.products-type__grid-block'),
                    productsData = data.filter(el => {
                        for (let item of neededProducts) {
                            if (item.id == el.id) {
                                return el
                            }
                        }
                    })
                productsData = productsData.sort((a, b) => b.rating - a.rating)

                listItems.forEach(item => item.onclick = () => {
                    if (!item.classList.contains('sort__item_active')) {
                        choseOne(item)

                        let sortType = item.dataset.sortType
                        let keyToCompare = {
                            type: '',
                            number: 0
                        }

                        productsData.forEach(product => {
                            if (sortType == "popular") {
                                sortMainItem.firstElementChild.innerHTML = "Популярные"
                                keyToCompare.type = sortType
                                keyToCompare.number += product.rating
                            } else if (sortType == "cheap") {
                                sortMainItem.firstElementChild.innerHTML = "Подешевле"
                                keyToCompare.type = sortType
                                keyToCompare.number += product.price
                            } else {
                                sortMainItem.firstElementChild.innerHTML = "Подороже"
                                keyToCompare.type = sortType
                                keyToCompare.number += product.price
                            }
                        })

                        productsData = productsData.sort((a, b) => {
                            let salePriceA = a.price - (a.price / 100 * a.salePercentage)
                            let salePriceB = b.price - (b.price / 100 * b.salePercentage)
                            if (keyToCompare.type == 'popular') {
                                return b.rating - a.rating
                            } else if (keyToCompare.type == 'cheap') {

                                if (a.salePercentage != 0 && a.salePercentage != 0) {
                                    return salePriceA - salePriceB
                                } else if (b.salePercentage) {
                                    return a.price - salePriceB
                                } else if (a.salePercentage) {
                                    return salePriceA - b.price
                                } else {
                                    return a.price - b.price
                                }

                            } else {

                                if (a.salePercentage != 0 && a.salePercentage != 0) {
                                    return salePriceB - salePriceA
                                } else if (b.salePercentage) {
                                    return salePriceB - a.price
                                } else if (a.salePercentage) {
                                    return b.price - salePriceA
                                } else {
                                    return b.price - a.price
                                }

                            }
                        })

                        reloadProductCards(productsData, productsContainer)
                        reloadFavBtns()
                        addToCartBtnsReload()
                    }
                })

                sortMainItem.onclick = () => sortElem.classList.toggle('sort_active')


                reloadProductCards(productsData, productsContainer)
                reloadFavBtns()
                addToCartBtnsReload()
            })
        } else {
            document.querySelector('.main').classList.add('no-product_active')
        }
    }).catch(() => { })
}