// Core app logic using Flickr API
const authOptions = {
  key: 'd5f1b8c9f2a04e89b2e7e8cd5ab12345',
  userID: '24662369@N07'
};

let pageNo = 1;
let totalPages = 0;
let sort = 'date-posted-desc';

const searchInput = document.getElementById('searchInput');
const imageOutput = document.getElementById('imageOutput');
const pageSelector = document.getElementById('pageSelector');

const flickrApiURL = (auth, perPage, pageNo, searchQuery, sort) => {
  return 'https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key='
    + auth.key + '&tags=' + searchQuery + '&tag_mode=all&sort='
    + sort + '&safe_search=1&per_page=' + perPage + '&page='
    + pageNo + '&format=json&nojsoncallback=1';
};

const buildPhotoURL = (options) => {
  return 'https://live.staticflickr.com/' + options.server + '/' + options.id
    + '_' + options.secret + '_' + options.size + '.jpg';
};

const buildPhoto = (data) => {
  const options = {
    id: data.id,
    secret: data.secret,
    server: data.server,
    size: 'm'
  };
  const photoURL = buildPhotoURL(options);
  const imgNode = document.createElement('img');
  imgNode.setAttribute('src', photoURL);
  return imgNode;
};

const queryMetadata = (data) => {
  const page = data.page;
  const totalPages = data.pages;
  const metaNode = document.createElement('div');
  metaNode.setAttribute('id', 'photos-metadata');
  metaNode.textContent = `Page: ${page} of ${totalPages}`;
  return metaNode;
};

const searchFlickr = (pageNo, sort) => {
  const searchQuery = searchInput.value;
  const url = flickrApiURL(authOptions, 20, pageNo, searchQuery, sort);
  console.log("Requesting:", url);

  return fetch(url)
    .then(response => response.json())
    .then(jsonData => {
      const metadata = queryMetadata(jsonData.photos);
      totalPages = jsonData.photos.pages;

      const photos = jsonData.photos.photo.reduce((acc, val) => {
        const photo = buildPhoto(val);
        const photoCard = document.createElement('div');
        photoCard.classList.add('card-view');
        photoCard.appendChild(photo);

        const metaText = document.createElement('p');
        metaText.classList.add('img-metadata');
        metaText.textContent = val.title || "Untitled";
        photoCard.appendChild(metaText);

        acc.appendChild(photoCard);
        return acc;
      }, document.createElement('div'));

      photos.setAttribute('id', 'photo-gallery');
      imageOutput.innerHTML = '';
      imageOutput.appendChild(metadata);
      imageOutput.appendChild(photos);
      return totalPages;
    });
};

document.getElementById('searchImagesBtn').addEventListener('click', () => {
  pageNo = 1;
  searchFlickr(pageNo, sort).then(pages => totalPages = pages);
  searchInput.value = "";
});

document.getElementById('firstPageBtn').addEventListener('click', () => {
  pageNo = 1;
  sort = 'date-posted-desc';
  searchFlickr(pageNo, sort);
});

document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (pageNo > 1) {
    pageNo--;
    searchFlickr(pageNo, sort);
  }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
  if (pageNo < totalPages) {
    pageNo++;
    searchFlickr(pageNo, sort);
  }
});

document.getElementById('lastPageBtn').addEventListener('click', () => {
  pageNo = 1;
  sort = 'date-posted-asc';
  searchFlickr(pageNo, sort);
});

pageSelector.addEventListener('keypress', (e) => {
  if (e.keyCode === 13) {
    const value = parseInt(pageSelector.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      pageNo = value;
      pageSelector.value = '';
      searchFlickr(pageNo, sort);
    } else {
      console.error("Invalid page number.");
      pageSelector.value = '';
    }
  }
});