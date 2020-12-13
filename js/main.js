const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const API_KEY = "f70f9151c5f88395e0f33e211c030d93";
const SERVER = "https://api.themoviedb.org/3";

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const movieShowsList = document.querySelector('.tv-shows__list');
const movieShowsHead = document.querySelector('.tv-shows__head');
const modal = document.querySelector('.modal');
const movieShows = document.querySelector('.tv-shows');
const movieCardImg = document.querySelector ('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const posterWrapper = document.querySelector('.poster__wrapper');
const dropdown = document.querySelectorAll('.dropdown');
const modalContent = document.querySelector ('.modal__content');
const pagination = document.querySelector('.pagination'); 



const loading = document.createElement('div');
loading.className = 'loading';




const DBService = class {

  getData = async url => {
    const res = await fetch (url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error (`Не удалось получить данные по адресу ${url}`)
    }
  }
  
  getSearchResult = query => {
    this.temp = `${SERVER}/search/movie?api_key=${API_KEY}&query=${query}&language=ru-Ru`;
    return this.getData (this.temp);
  }

  getNextPage = page => {
    return this.getData (this.temp + '&page=' + page);
  }

  getMovieShows = id => {
    return this.getData (`${SERVER}/movie/${id}?api_key=${API_KEY}&language=ru-Ru`)
  }

  getTopRated = () => this.getData(`${SERVER}/movie/top_rated?api_key=${API_KEY}&language=ru-RU`)
  
  getPopular = () => this.getData(`${SERVER}/movie/popular?api_key=${API_KEY}&language=ru-RU`)
  
  getUpcoming = () => this.getData(`${SERVER}/movie/upcoming?api_key=${API_KEY}&language=ru-RU`)
  
  getNowPlaying = () => this.getData(`${SERVER}/movie/now_playing?api_key=${API_KEY}&language=ru-RU`)

}

dbService = new DBService ();


const renderCard = (responce, target) => {

  movieShowsList.textContent='';

  if (responce.results.length) {
    movieShowsHead.textContent = target ? target.textContent : 'Результат поиска';
    responce.results.forEach(item => {
      const {
        backdrop_path: backdrop, 
        title: title,
        poster_path: poster, 
        vote_average: vote,
        id
      } = item;
      const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
      const backdropIMG = backdrop ? IMG_URL + backdrop : '';
      const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>`: '';
      
      const card = document.createElement ('li');
      card.classList.add('tv-shows__item');
      card.innerHTML = `
        <a href="#" data-id=${id} class="tv-card">
          ${voteElem}
          <img class="tv-card__img"
              src="${posterIMG}"
              data-backdrop="${backdropIMG}"
              alt="${title}">
          <h4 class="tv-card__head">${title}</h4>
        </a>
      `;
      loading.remove();
      movieShowsList.append(card);
    });
    pagination.textContent = '';
    if (!target && responce.total_pages > 1) {
      for (let i = 1; i <= responce.total_pages; i++) {
        pagination.innerHTML += `<li><a href="#" class="pages">${i}</li>` 
      };
    }
  } else {
    loading.remove();
    movieShowsHead.textContent = 'По вашему запросу фильмов не найдено.'
  }
};

//поиск и вывод результатов поиска

searchForm.addEventListener ('submit', event => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    movieShows.append(loading);
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
})





//меню

const closeDropdown = () => {
  dropdown.forEach (item => {
    item.classList.remove('active');
  })
};

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.body.addEventListener('click', event => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
    }
});

leftMenu.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active')
    leftMenu.classList.add('openMenu')
    hamburger.classList.add('open');
    
  }
  if (target.closest('#top-rated')) {
    movieShows.append(loading);
    dbService.getTopRated ().then(responce => renderCard(responce, target));
    
  }
  if (target.closest('#popular')) {
    movieShows.append(loading);
    dbService.getPopular ().then(responce => renderCard(responce, target));
    
  }
  if (target.closest('#today')) {
    movieShows.append(loading);
    dbService.getUpcoming ().then(responce => renderCard(responce, target));
    
  }
  if (target.closest('#week')) {
    movieShows.append(loading);
    dbService.getNowPlaying ().then(responce => renderCard(responce, target));
    
  }
  if (target.closest('#search')) {
    movieShowsList.textContent= '';
    movieShowsHead.textContent = '';
  }
});

//смена карточки

const swapAttrs = elem => {
  const card = event.target.closest('.tv-shows__item');
  if (card) {
    const img = card.querySelector('.tv-card__img');
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
    }
  }
};

movieShowsList.addEventListener('mouseover', swapAttrs);
movieShowsList.addEventListener('mouseout', swapAttrs);

//включение модального окна

movieShowsList.addEventListener('click', event => {
  event.preventDefault()
  const target = event.target
  const card = target.closest('.tv-card')
  if (card) {
    movieShows.append(loading);

    dbService.getMovieShows(card.dataset.id)
      .then(responce => {
        
        if (responce.poster_path) {
          movieCardImg.src = IMG_URL + responce.poster_path;
          movieCardImg.alt = responce.name;
          posterWrapper.classList.remove('hide'); 
          modalContent.style.paddingLeft = '';
        } else {
          posterWrapper.classList.add('hide'); 
          modalContent.style.paddingLeft = '25px';
        }
        modalTitle.textContent = responce.name;
        genresList.innerHTML = '';
        for (const item of responce.genres) {
          genresList.innerHTML += `<li>${item.name}</li>`
        };
        rating.textContent = responce.vote_average;
        description.textContent= responce.overview;
        modalLink.href = responce.homepage;

      })
      .then(() => {
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)'
        document.body.style.overfow='hidden'
        modal.classList.remove('hide')
      })
      .finally(() => {
        loading.remove();
      })

  }
})

// выключение модального окна

modal.addEventListener('click', event => {
  if (event.target.closest('.cross') || 
      event.target.classList.contains('modal')) {
    document.body.style.overflow=''
    modal.classList.add('hide')
  }
})

//пагинация

pagination.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  if (target.classList.contains('pages')) {
    movieShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
})