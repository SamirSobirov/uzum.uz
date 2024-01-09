import '../scss/normalize.scss';
import '../scss/style.scss';
import '../scss/footer.scss';
import '../scss/header.scss';
import '../scss/popup.scss';
import '../scss/swiper.scss';
import '../scss/product-blocks.scss';
import { footerCreate, headerCreate, popupCreate } from "./ui"
import { headerFooterJs } from "./header-footer"
import { popupJs } from "./popup"

headerCreate(document.querySelector('.header'))
footerCreate(document.querySelector('.footer'))
headerFooterJs()
popupCreate(document.querySelector('.popup'))
popupJs(document.querySelector('.popup'))