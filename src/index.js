// импортирую библиотеки нотифай, симпллайтбокс, аксиос
import './sass/index.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
//import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';
//import { axiosPixabay } from './axiosPixabay';
import ImageApiService from './axiosPixabay';

// установила симпллайтбокс, нотифай и аксиос зарегестрировалась на  пиксабей
// нашла ссылки на элементы формы и кнопок
const refs = {
  form: document.querySelector('#search-form'),
  submitBtn: document.querySelector('#search-form button'),
  galleryEl: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  goUpBtn: document.querySelector('.go-up'),
  // photoCardEl: document.querySelector('.photo-card'),
};
// ===немного оформления элементов==============
refs.form.style =
  'background-color: #4056b4; display: flex; justify-content: center; padding: 8px; margin-bottom: 8px; position: fixed; top: 0; z-index: 99; width: 100%';
refs.submitBtn.style = 'margin-left: 32px';
refs.loadMoreBtn.style = ' display: none';
refs.goUpBtn.style = ' display: none';

// ====повесила слушатель события  на форму для ввода на событие сабмит============
refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreClick);
refs.goUpBtn.addEventListener('click', onButtonUp);
//================ создаем экземпляр класса==========
const imageApiService = new ImageApiService();
//========= функция, которая рисует галлерею==================
function createImageEl(hits) {
  console.log(hits);
  const markup = hits
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return `
          <a href="${largeImageURL}" class="photo-card">
           <img src="${webformatURL}" alt="${tags}" loading = "lazy"  class="photo-image" />
           <div class="info" style= "display: flex">
              <p class="info-item">
                 <b>Likes:</b>${likes}
              </p>
              <p class="info-item">
                <b>Views: </b>${views}
              </p>
              <p class="info-item">
                <b>Comments: </b>${comments}
              </p>
              <p class="info-item">
                <b>Downloads: </b>${downloads}
              </p>
            </div>
             </a> `;
    })
    .join('');
  refs.galleryEl.insertAdjacentHTML('beforeend', markup);
  // console.log(refs.galleryEl);
  // ==========вызываем библиотеку лайтбокс для красивой галлереи============
  simpleLightbox();
  scroll();
  // =========показываем кнопку "загрузить еще" и кнопку "наверх" ====
  refs.loadMoreBtn.style =
    ' display: flex;  margin-left: auto;  margin-right: auto; margin-bottom:32px; margin-top:32px; padding:16px; border: 1px solid green; border-radius:8px; background-color: yellow';
  refs.goUpBtn.style =
    'position: fixed; bottom: 32px;right: 32px; border-radius: 50%; width: 80px; height: 80px; background-color: lime; color: blue; border: 1px solid blue';
}
// =======асинхронная функция которая отправляет запрос при сабмите формы-----------
async function onSubmit(e) {
  // ===== запрет браузеру на перезагрузку страницы=======
  e.preventDefault();
  imageApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
  console.log(imageApiService.searchQuery);
  // =========очищаем страницу перед новым запросом============
  imageApiService.resetPage();
  try {
    if (imageApiService.searchQuery === '') {
      clearImagesContainer();
      Notify.warning('Enter your search query');
    } else {
      const response = await imageApiService.fetchFotos();
      const {
        data: { hits, total, totalHits },
      } = response;
      // console.log(hits);
      // console.log('работает зен');
      clearImagesContainer();
      if (hits.length === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      } else {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        createImageEl(hits);
      }
    }
  } catch (error) {
    // === цепляю метод для обработки ошибки(=======)
    Notify.failure("We're sorry, but you've reached the end of search results.");
    console.log(error.message);
  }
}
// ====ассинхронная функция , которая при клике по кнопке "загрузить еще " добавляет новые фото в галлерею
async function onLoadMoreClick(e) {
  // ===== запрет браузеру на перезагрузку страницы
  e.preventDefault();
  // console.log('работает');
  const response = await imageApiService.fetchFotos();
  const {
    data: { hits },
  } = response;
  if (hits.length === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    // refs.goUpBtn.style = ' display: none';
  } else createImageEl(hits);
}
// ==функция очищающая галлерею==========
function clearImagesContainer() {
  refs.galleryEl.innerHTML = '';
  refs.loadMoreBtn.style = 'display: none';
  refs.goUpBtn.style = ' display: none';
}
// ===функция, для плавного скрола, можно сразу проскролить до конца страницы,
// указав top: cardHeight 40,
function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    // top: cardHeight * 40,
    top: cardHeight * 1,
    behavior: 'smooth',
  });
}

// ====библиотека лайтбокс для красивой галлереи====
function simpleLightbox() {
  let lightbox = new SimpleLightbox('.gallery a', {
    /* options */
  });
  lightbox.refresh();
}
// ==========функция, которая при клике на кнопку "иди вверх" перебрасывает на начало страницы
function onButtonUp(e) {
  e.preventDefault();
  // console.log('видно кнопку');
  window.scrollTo(0, 0);
}