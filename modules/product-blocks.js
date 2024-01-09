import { favoritesJs } from "./favorites";
import { deleteData, getData, postData } from "./reqs";
import { realoadProductTypeBlocks, reloadProductCards } from "./ui";

function productSetByWindowWidth(products, productsBlock) {
    if (window.innerWidth <= 640) {
        reloadProductCards(products.slice(0, 4), productsBlock)
    }
    if (window.innerWidth >= 640) {
        reloadProductCards(products.slice(0, 6), productsBlock)
    }
    if (window.innerWidth >= 960) {
        reloadProductCards(products.slice(0, 4), productsBlock)
    }
    if (window.innerWidth >= 1280) {
        reloadProductCards(products.slice(0, 5), productsBlock)
    }
}

export function productBlocksJs() {
    getData('/goods').then(({ data }) => {
        let types = []
        data.forEach(el => types.push(el.type))

        let uniqTypes = [...new Set(types)],
            productsWrapper = document.querySelector('.products-wrapper')

        realoadProductTypeBlocks(uniqTypes, productsWrapper)

        let productTypeBlocks = document.querySelectorAll('[data-product-type]')

        productTypeBlocks.forEach(el => {
            let blockType = el.dataset.productType
            let сertainProducts = data.filter(product => product.type == blockType)

            productSetByWindowWidth(сertainProducts, el)
        })

        window.onresize = () => {
            productTypeBlocks.forEach(el => {
                let blockType = el.dataset.productType
                let сertainProducts = data.filter(product => product.type == blockType)

                productSetByWindowWidth(сertainProducts, el)
            })
        }

        let showMoreBtns = document.querySelectorAll('.products-type__show-more')

        showMoreBtns.forEach(btn => {
            let productsBlock = btn.previousElementSibling
            let blockType = productsBlock.dataset.productType
            let сertainProducts = data.filter(product => product.type == blockType)

            btn.onclick = () => {
                if (btn.dataset.isShown == "false") {
                    reloadProductCards(сertainProducts, productsBlock)
                    btn.innerHTML = 'Скрыть'
                    btn.dataset.isShown = "true"
                } else {
                    productSetByWindowWidth(сertainProducts, productsBlock)
                    btn.innerHTML = 'Показать ещё'
                    btn.dataset.isShown = "false"
                }
                addToCartBtnsReload()
                reloadFavBtns()
            }
        })

        let goToProductPageBtns = document.querySelectorAll('[data-product-id]')

        goToProductPageBtns.forEach(btn => btn.onclick = () => {
            localStorage.setItem('product-id', btn.dataset.productId)
        })

        addToCartBtnsReload()
        reloadFavBtns()
    })
}

export function addToCartBtnsReload() {
    let addToCartBtns = document.querySelectorAll('[data-add-to-cart]'),
        name = localStorage.getItem('user-name')


    addToCartBtns.forEach(btn => {
        let productId = btn.dataset.addToCart

        getData(`/cart?userName=${name}`).then(({ data }) => data.forEach(el => {
            if (el.id == productId) {
                btn.classList.add('in-the-cart-icon')
            }
        }))

        btn.onclick = () => {
            if (name != null) {
                getData(`/cart/${productId}`)
                    .then(() => {
                        alert('Это товар есть в корзине')
                    }).catch(() => {
                        postData('/cart', { id: productId, userName: name, quantity: 1 })
                            .then(res => {
                                if (res.statusText == "Created") {
                                    btn.classList.add('in-the-cart-icon')
                                }
                            })
                    })
            } else{
                alert('Что Совершить это действие войдите в аккаунт')
            }
        }
    })
}

export function reloadFavBtns() {
    let favBtns = document.querySelectorAll('[data-fav-btn]'),
        userName = localStorage.getItem('user-name')

    getData(`/favorites?userName=${userName}`).then(({ data }) => {
        favBtns.forEach(btn => {
            let productId = btn.dataset.favBtn

            for (let item of data) {
                if (productId == item.id) {
                    btn.classList.add('favorite-btn_active')
                    if (btn.classList.contains('product-info__button_fav')) {
                        btn.innerHTML = 'Удалить из избранного'
                    }
                }
            }
        })
    }).catch(error => console.log(error))

    favBtns.forEach(btn => {
        btn.onclick = () => {
            if (userName != null) {
                let productId = btn.dataset.favBtn

                getData(`/favorites/${productId}`).then(() => {

                    deleteData(`/favorites/${productId}favoritesJs/pages/favorites.html`).then(() => {

                        btn.classList.remove('favorite-btn_active')
                        if (btn.classList.contains('product-info__button_fav')) {
                            btn.innerHTML = 'Добавить в избранное'
                        }
                        if (location.pathname == '/pages/favorites.html') {
                            btn.parentElement.parentElement.remove()
                            getData('/favorites').then(({ data }) => {
                                if (data.length == 0) {
                                    document.querySelector('.main').classList.add('no-product_active')
                                }
                                favoritesJs()
                            })
                        }

                    }).catch(() => alert('Что то пошло не так'))

                }).catch(() => {
                    let obj = { id: productId, userName }

                    postData('/favorites', obj).then(() => {

                        btn.classList.add('favorite-btn_active')
                        if (btn.classList.contains('product-info__button_fav')) {
                            btn.innerHTML = 'Удалить из избранного'
                        }

                    }).catch(() => alert('Что то пошло не так'))

                })
            } else {
                alert('Что Совершить это действие войдите в аккаунт')
            }
        }
    })
}