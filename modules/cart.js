import './standard'
import '../scss/cart.scss'
import { deleteData, getData, postData } from './reqs'
import { reloadCartProducts, reloadProductCards } from './ui'
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { reloadFavBtns } from './product-blocks';
// import ConfettiGenerator from "confetti-js";

const userName = localStorage.getItem('user-name')

getData('/goods').then(({ data }) => {
    let popularProductsSliderWrapper = document.querySelector('.popular-products-slider__wrapper')
    let totalRating = 0
    data.forEach(el => totalRating = totalRating + el.rating)
    let averageRating = Math.round(totalRating / data.length)
    let popularProducts = data.filter(el => el.rating >= averageRating)

    reloadProductCards(popularProducts, popularProductsSliderWrapper)

    let goToProductPageBtns = document.querySelectorAll('[data-product-id]')

    goToProductPageBtns.forEach(btn => btn.onclick = () => {
        localStorage.setItem('product-id', btn.dataset.productId)
    })

    new Swiper('.popular-products-slider', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        spaceBetween: 40,
        slidesPerView: 2,

        breakpoints: {
            1200: {
                slidesPerView: 5,
            },
            768: {
                slidesPerView: 4,
            },
            590: {
                slidesPerView: 3,
            }
        }
    })

    let addToCartBtns = document.querySelectorAll('[data-add-to-cart]'),
        name = localStorage.getItem('user-name')


    addToCartBtns.forEach(btn => {
        let productId = btn.dataset.addToCart

        getData(`/cart?userName=${name}`).then(({ data }) => data.forEach(el => {
            if (el.id == productId) {
                btn.classList.add('in-the-cart')
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
                                    btn.classList.add('in-the-cart')
                                    relaodCartJs()
                                }
                            })
                    })
            } else {
                alert('Что Совершить это действие войдите в аккаунт')
            }
        }
    })
})

function checkForAnyProduct() {
    getData(`/cart?userName=${userName}`).then(({ data }) => {
        if (data.length == 0) {
            document.querySelector('.main').classList.add('no-product_active')
        }
    })
}

relaodCartJs()

function relaodCartJs() {
    getData(`/cart?userName=${userName}`).then(({ data }) => {
        let neededProducts = data
        document.querySelector('.main').classList.remove('no-product_active')
        checkForAnyProduct()

        getData('/goods').then(({ data }) => {
            let cartProductsData = data.filter(el => {
                for (let item of neededProducts) {
                    if (el.id == item.id) {
                        el.count = item.quantity
                        return el
                    }
                }
            })

            let cartProductsContainer = document.querySelector('.cart-products__container')

            reloadCartProducts(cartProductsData, cartProductsContainer)

            let counterBlocks = document.querySelectorAll('.product-counter')

            counterBlocks.forEach(counterBlock => {
                let maximumNumber = 10,
                    counter = +counterBlock.querySelector('.product-counter__num').dataset.counterNum,
                    realPriceView = counterBlock.parentElement.nextElementSibling.lastElementChild.lastElementChild,
                    salePriceView = counterBlock.parentElement.nextElementSibling.lastElementChild.firstElementChild,
                    counterElement = counterBlock.querySelector(".product-counter__num"),
                    increaseButton = counterBlock.querySelector(".product-counter__plus"),
                    decreaseButton = counterBlock.querySelector(".product-counter__minus"),
                    maximumNumberView = counterBlock.querySelector('.product-counter__maximum'),
                    price = realPriceView.dataset.realPrice,
                    salePrice = salePriceView.dataset.salePrice,
                    priceForOneView = counterBlock.querySelector('.product-counter__price-for-one')

                if (price == salePrice) {
                    priceForOneView.innerHTML = price + ' &#8381;/ед.'
                } else {
                    priceForOneView.innerHTML = salePrice + ' &#8381;/ед.'
                }
                maximumNumberView.innerHTML = 'В наличии всего ' + maximumNumber + ' штук'
                checkAvailability(counter)

                increaseButton.onclick = () => {
                    if (counter < maximumNumber) {
                        counter = counter + 1;
                        calculatePrice(counter)
                        displayPrice(counter)
                    }
                    if (counter == maximumNumber) {
                        setTimeout(() => {
                            alert('В наличии только ' + maximumNumber + ' штук')
                        }, 100);
                    }
                };

                decreaseButton.onclick = () => {
                    if (counter > 1) {
                        counter = counter - 1;
                        calculatePrice(counter)
                        displayPrice(counter)
                    }
                };

                function calculatePrice(counter) {
                    return price * counter;
                }

                function calculateSalePrice(counter) {
                    return salePrice * counter;
                }

                function displayPrice(counter) {
                    let calculatedPrice = calculatePrice(counter);
                    let calculatedSalePrice = calculateSalePrice(counter);
                    if (counter === 1) {
                        if (price != salePrice) {
                            realPriceView.innerHTML = calculatedPrice + ' &#8381;'
                        }
                        salePriceView.innerHTML = calculatedSalePrice + ' &#8381'
                        priceForOneView.classList.remove('price-for-one-active')
                    } else {
                        if (price != salePrice) {
                            realPriceView.innerHTML = calculatedPrice + ' &#8381;'
                        }
                        salePriceView.innerHTML = calculatedSalePrice + ' &#8381'
                        priceForOneView.classList.add('price-for-one-active')
                    }
                    counterElement.innerHTML = counter
                    checkAvailability(counter)
                    checkRealod()
                }

                function checkAvailability(number) {
                    if (number == 1) {
                        counterBlock.classList.add('not-available-minus')
                    } else if (number == 10) {
                        counterBlock.classList.add('not-available-plus')
                    } else {
                        counterBlock.classList.remove('not-available-minus')
                        counterBlock.classList.remove('not-available-plus')
                    }
                }
            })

            let allSelect = document.querySelector('.cart-products__select-all input'),
                allCheckboxes = document.querySelectorAll('.cart-product__checkbox input')

            allCheckboxes.forEach(checkbox => {
                allSelect.checked ? checkbox.checked = true : ''

                checkbox.onchange = (e) => {
                    let isCheckboxChecked = e.target.checked,
                        count = 0

                    if (!isCheckboxChecked) {
                        allSelect.checked = false
                    } else {
                        allCheckboxes.forEach(checkbox => checkbox.checked ? count++ : '')
                        count == allCheckboxes.length ? allSelect.checked = true : ''
                    }
                    allSelect.parentElement.lastElementChild.innerHTML = allSelect.checked ? 'Снять всё' : 'Выбрать всё'
                    checkRealod()
                }
            })

            allSelect.onchange = (e) => {
                let isChecked = e.target.checked
                allSelect.parentElement.lastElementChild.innerHTML = isChecked ? 'Снять всё' : 'Выбрать всё'

                allCheckboxes.forEach(checkbox => {
                    if (isChecked) {
                        checkbox.checked = true
                    } else {
                        checkbox.checked = false
                    }
                })
                checkRealod()
            }

            let deliveryDateElems = document.querySelectorAll('[data-delivery-date]'),
                months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                deliveryDate = 'Доставка ' + (new Date().getDate() + 1) + ' ' + months[new Date().getMonth()]

            deliveryDateElems.forEach(el => {
                el.innerHTML = deliveryDate
            })


            let goToProductPageBtns = document.querySelectorAll('[data-product-id]')

            goToProductPageBtns.forEach(btn => btn.onclick = () => {
                localStorage.setItem('product-id', btn.dataset.productId)
            })


            let cartProductDeleteBtns = document.querySelectorAll('.cart-product__delete')

            cartProductDeleteBtns.forEach(btn => {
                btn.onclick = () => {
                    let key = btn.dataset.deleteId

                    deleteData('/cart/' + key).then(() => {
                        btn.parentElement.parentElement.remove()
                        checkRealod()
                        checkForAnyProduct()
                    })
                }
            })

            checkRealod()
            reloadFavBtns()


        })
    })
}

function checkRealod() {
    let totalChosenProductsView = document.querySelector('.check__products-top'),
        totalPriceView = document.querySelector('.check__total-view'),
        totalSavedView = document.querySelector('.check__total-saved'),
        allCheckboxes = document.querySelectorAll('.cart-product__checkbox input'),
        checkElem = document.querySelector('.check'),
        checkBtnPopupToggleBtns = document.querySelectorAll('[data-check-popup-toggle]'),
        checkPopup = document.querySelector('.checkout-popup'),
        totalPrice = 0,
        savedMoney = 0,
        checkedProductCount = 0


    allCheckboxes.forEach(checkbox => {
        let isChecked = checkbox.checked,
            price = +checkbox.parentElement.parentElement.parentElement.parentElement.querySelector('.cart-product__real-price').innerHTML.split(' ').at(),
            salePrice = +checkbox.parentElement.parentElement.parentElement.parentElement.querySelector('.cart-product__sale-price').innerHTML.split(' ').at()

        if (isChecked) {
            checkedProductCount++
            totalPrice += salePrice
            savedMoney += price == 0 ? 0 : price - salePrice
        }
    })

    if (checkedProductCount == 0) {
        checkElem.classList.remove('check-active')
    } else {
        checkElem.classList.add('check-active')
    }

    totalChosenProductsView.innerHTML = `
        <span class="check__text">Товары (${checkedProductCount}):</span>
        <span class="check__text">${totalPrice} &#8381;</span>
    `
    totalPriceView.innerHTML = totalPrice + ' &#8381;'
    totalSavedView.innerHTML = `Вы экономили: ${savedMoney} &#8381;`

    checkBtnPopupToggleBtns.forEach(el => el.onclick = () => {
        if (checkedProductCount != 0) {
            checkPopup.classList.toggle('checkout-popup_active')
            checkPopup.classList.remove('checkout-done')
        }
        if (checkPopup.classList.contains('checkout-popup_active')) {
            document.body.style.overflowY = 'hidden'
        } else {
            document.body.style.overflowY = 'auto'
        }
    })

    var confettiSettings = {
        target: 'my-canvas',
        max: 300,
        rotate: true
    };
    var confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    let totalChosenProductsViewTwo = document.querySelector('.checkout-popup .check__products-top'),
        totalPriceViewTwo = document.querySelector('.checkout-popup .check__total-view'),
        totalSavedViewTwo = document.querySelector('.checkout-popup .check__total-saved')

    totalChosenProductsViewTwo.innerHTML = `
        <span class="check__text">Товары (${checkedProductCount}):</span>
        <span class="check__text">${totalPrice} &#8381;</span>
    `

    totalPriceViewTwo.innerHTML = totalPrice + ' &#8381;'
    totalSavedViewTwo.innerHTML = `Вы экономили: ${savedMoney} &#8381;`

    let popupCheckoutBtn = document.querySelector('.checkout-popup .check__total-button')

    popupCheckoutBtn.onclick = () => {
        checkPopup.classList.add('checkout-done')
    }
}