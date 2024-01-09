import { getData, postData } from "./reqs"

function popup_toggle(htmlElem) {
    if (htmlElem.classList.contains('popup-open')) {
        htmlElem.classList.remove('popup-open')
        document.body.style.overflowY = 'auto'
        htmlElem.querySelectorAll('form').forEach(el => el.reset())
    } else {
        htmlElem.classList.add('popup-open')
        document.body.style.overflowY = 'hidden'
    }
}

function popup_change(array, change_type) {
    array.forEach(item => {
        let popup_body = item.parentElement.parentElement.parentElement
        if (item.getAttribute('name') == change_type) {
            popup_body.style.display = 'flex'
        } else {
            popup_body.style.display = 'none'
        }
    })
}

export function popupJs(place) {
    let popup_close_btns = document.querySelectorAll('[data-popup-close]'),
        popup_open_btns = document.querySelectorAll('[data-popup-open]'),
        forms = document.querySelectorAll('form'),
        user_name = localStorage.getItem('user-name'),
        popup_types = place.querySelectorAll('[data-popup-type]')


    if (user_name != null) {
        popup_change(forms, 'sign-in')
    } else {
        popup_change(forms, 'sign-up')
    }

    popup_close_btns.forEach(el => el.onclick = () => popup_toggle(place))
    popup_open_btns.forEach(el => {
        el.onclick = () => {
            user_name = localStorage.getItem('user-name')
            if (localStorage.getItem('user-name') != null) {
                if (confirm('Выйти из аккаунта?')) {
                    localStorage.removeItem('user-name')
                    document.querySelector('[data-reg]').innerHTML = 'Войти'
                    alert('Вы вышли из аккаунта!')
                    location.reload()
                }
            } else {
                popup_change(forms, 'sign-in')
                popup_toggle(place)
            }
        }
    })

    popup_types.forEach(el => {
        el.onclick = () => {
            let change_type = el.dataset.popupType
            popup_change(forms, change_type)
        }
    })

    forms.forEach(form => {
        form.onsubmit = (e) => {
            e.preventDefault()

            let fm = new FormData(form),
                obj = {},
                form_name = form.getAttribute('name')

            fm.forEach((value, key) => obj[key] = value.trim())

            for (let key in obj) {
                if (!obj[key]) {
                    return alert('Заполните все поля!')
                }
            }

            getData('/users?name=' + obj.name).then(({ data }) => {
                if (form_name == 'sign-up') {
                    if (data.length) {
                        return alert('Такого пользователя уже сушествует!')
                    } else {
                        location.reload()
                        setTimeout(() => {
                            alert('Вы успешно зарегистрировались!')
                        }, 500);
                    }
                } else {
                    if (data.length) {
                        if (data[0].password == obj.password) {
                            location.reload()
                            setTimeout(() => {
                                alert('Вы вошли в свой аккаунт!')
                            }, 500);
                        } else {
                            return alert('Неправильный пароль!')
                        }
                    } else {
                        return alert('Такого пользователя не существует!')
                    }
                }

                localStorage.setItem('user-name', obj.name)
                if (form_name == 'sign-up') {
                    postData('/users', obj)
                }

                popup_toggle(place)
                form.reset()

                if (form_name == 'sign-in') {
                    document.querySelector('[data-reg]').innerHTML = obj.name
                } else {
                    popup_change(forms, 'sign-in')
                }

                if (form_name == 'sign-up') {
                    setTimeout(() => {
                        if (confirm('Войти в аккаунт?')) {
                            popup_toggle(place)
                        }
                    }, 500);
                }
            })
        }
    })
}