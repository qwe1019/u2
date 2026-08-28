const groups = [
  {id: 'all', zh: '全部', en: 'All'},
  {id: 'north', zh: '华北', en: 'North China'},
  {id: 'northeast', zh: '东北', en: 'Northeast'},
  {id: 'east', zh: '华东', en: 'East China'},
  {id: 'central', zh: '华中', en: 'Central China'},
  {id: 'south', zh: '华南', en: 'South China'},
  {id: 'southwest', zh: '西南', en: 'Southwest'},
  {id: 'northwest', zh: '西北', en: 'Northwest'},
  {id: 'hmt', zh: '港澳台', en: 'HK/Macao/Taiwan'},
];

const tagText = {
  必吃: 'Must try',
  早餐: 'Breakfast',
  夜宵: 'Late-night',
  小吃: 'Snack',
  宴席: 'Banquet',
  火锅: 'Hot pot',
  烧烤: 'Grill',
  甜品: 'Dessert',
  伴手礼: 'Gift',
  面食: 'Staple',
  海鲜: 'Seafood',
  家常: 'Home-style',
  打卡: 'Check-in',
  清爽: 'Refreshing',
  辣: 'Spicy',
  聚餐: 'Group meal',
  饮品: 'Drink',
  下饭: 'Rice pairing',
};

const ui = {
  zh: {
    brand: '中华美食地图',
    brandSub: '市/区精准美食库',
    navRecommend: '美食推荐',
    navRanking: '地区榜单',
    navFavorites: '我的收藏',
    miniTitle: '小程序 Demo',
    miniText: '用户点击地区后，按市/区查看当地全部推荐美食。',
    eyebrow: 'CHINA FOOD GUIDE · CITY / DISTRICT PICKS',
    title: '点一个地方，看到市区级美食清单',
    intro: '基于你提供的《区县精准特色美食大全》整理，覆盖中国 34 个省级行政区，并精确到市或区。',
    search: '搜索地区、市区、美食',
    regions: '省级地区',
    places: '市/区点位',
    dishes: '道美食',
    visible: '当前可见',
    favorites: '已收藏',
    chooseRegion: '选择地区',
    chooseHint: '按大区筛选，或直接搜索地区、市区、美食名称。',
    recommendation: '美食推荐',
    hotList: '地区榜单',
    hotIntro: '按 Demo 热度值排序，突出短视频打卡强度、地方辨识度和用户决策价值。',
    totalRegions: '全量地区',
    allRanking: '全量排行',
    noMatch: '没有匹配的地区，换个关键词试试。',
    favoriteBar: '收藏夹',
    noFav: '还没有收藏，点菜品右上角的小心形试试。',
    allLocal: '按市/区列出全部美食',
    heat: '热度',
    localPlaces: '个市/区',
    localDishes: '道当地美食',
    representative: '代表美食',
    preciseAt: '精确到',
    topPick: '推荐',
  },
  en: {
    brand: 'China Food Map',
    brandSub: 'City/district food guide',
    navRecommend: 'Food Guide',
    navRanking: 'Region Ranking',
    navFavorites: 'Favorites',
    miniTitle: 'Mini App Demo',
    miniText: 'Tap a region and browse all local dishes by city or district.',
    eyebrow: 'CHINA FOOD GUIDE · CITY / DISTRICT PICKS',
    title: 'Tap a region for city-level local food',
    intro: 'Built from your district-level food document, covering 34 provincial-level regions in China.',
    search: 'Search regions, cities, districts, or dishes',
    regions: 'Regions',
    places: 'Cities/districts',
    dishes: 'Dishes',
    visible: 'Visible',
    favorites: 'Favorites',
    chooseRegion: 'Choose Region',
    chooseHint: 'Filter by area or search a region, city, district, or dish.',
    recommendation: 'Food Guide',
    hotList: 'Region Ranking',
    hotIntro: 'Ranked by demo heat score, combining short-video appeal, local identity, and travel usefulness.',
    totalRegions: 'All regions',
    allRanking: 'Full ranking',
    noMatch: 'No matching regions. Try another keyword.',
    favoriteBar: 'Favorites',
    noFav: 'No favorites yet. Tap the heart on a dish.',
    allLocal: 'All dishes by city/district',
    heat: 'Heat',
    localPlaces: 'cities/districts',
    localDishes: 'local dishes',
    representative: 'Representative dishes',
    preciseAt: 'Located in',
    topPick: 'Pick',
  },
};

const regions = window.CHINA_FOOD_REGIONS || [];
const foodEnNames = window.CHINA_FOOD_EN_NAMES || {};
const totalFoodCount = regions.reduce((sum, region) => sum + allFoods(region).length, 0);
const totalPlaceCount = regions.reduce((sum, region) => sum + region.places.length, 0);
let searchIsComposing = false;

const appState = {
  view: 'recommendations',
  group: 'all',
  selected: regions.find((item) => item.id === 'sichuan') || regions[0],
  query: '',
  lang: localStorage.getItem('china-food-map:lang') || 'zh',
  favorites: JSON.parse(localStorage.getItem('china-food-map:favorites') || '[]'),
};

function t(key) {
  return ui[appState.lang][key];
}

function groupName(id) {
  const group = groups.find((item) => item.id === id);
  return group ? group[appState.lang] : id;
}

function displayRegion(region) {
  return appState.lang === 'zh' ? region.zh : region.en;
}

function displayCities(region) {
  return appState.lang === 'zh' ? region.citiesZh : region.citiesEn;
}

function displayMood(region) {
  return appState.lang === 'zh' ? region.moodZh : region.moodEn;
}

function displayPlace(place) {
  return appState.lang === 'zh' ? place.zh : place.en;
}

function displayFood(food) {
  return appState.lang === 'zh' ? food.zh : (foodEnNames[food.zh] || food.en || food.zh);
}

function displayTags(food) {
  return food.tags.map((tag) => appState.lang === 'zh' ? tag : tagText[tag] || tag);
}

function allFoods(region) {
  return region.places.flatMap((place) => place.foods.map((food) => ({...food, place})));
}

function icon(name) {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"></path><path d="M9 3v15"></path><path d="M15 6v15"></path>',
    flame: '<path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-3-3.5-4.5-2.7-8.5-3.8 2.1-6.3 5-4.3 8.5Z"></path>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9L12 3Z"></path>',
    heart: '<path d="M20.8 8.9c0 5.6-8.8 10.3-8.8 10.3S3.2 14.5 3.2 8.9A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.3Z"></path>',
    pin: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
    spark: '<path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z"></path><path d="M19 16v5"></path><path d="M16.5 18.5h5"></path>',
    globe: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a13.5 13.5 0 0 1 0 18"></path><path d="M12 3a13.5 13.5 0 0 0 0 18"></path>',
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

function normalize(value) {
  return String(value || '').toLocaleLowerCase().replace(/\s+/g, '');
}

function searchableText(region) {
  return [
    region.zh,
    region.en,
    region.short,
    groupName(region.group),
    region.citiesZh,
    region.citiesEn,
    region.moodZh,
    region.moodEn,
    ...region.places.flatMap((place) => [
      place.zh,
      place.en,
      ...place.foods.flatMap((food) => [food.zh, food.en, foodEnNames[food.zh], ...food.tags, ...displayTags(food)]),
    ]),
  ].join(' ');
}

function matches(region, query) {
  if (!query) return true;
  return normalize(searchableText(region)).includes(normalize(query));
}

function filteredRegions() {
  return regions.filter((region) => (appState.group === 'all' || region.group === appState.group) && matches(region, appState.query));
}

function saveFavorites() {
  localStorage.setItem('china-food-map:favorites', JSON.stringify(appState.favorites));
}

function favoriteKey(regionId, placeZh, foodZh) {
  return `${regionId}::${placeZh}::${foodZh}`;
}

function isFavorite(regionId, placeZh, foodZh) {
  return appState.favorites.includes(favoriteKey(regionId, placeZh, foodZh));
}

function toggleFavorite(regionId, placeZh, foodZh) {
  const key = favoriteKey(regionId, placeZh, foodZh);
  appState.favorites = appState.favorites.includes(key)
    ? appState.favorites.filter((item) => item !== key)
    : [...appState.favorites, key];
  saveFavorites();
  render();
}

function selectRegion(id) {
  const region = regions.find((item) => item.id === id);
  if (!region) return;
  appState.selected = region;
  appState.view = 'recommendations';
  render();
  document.querySelector('#recommendations')?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

function heatLabel(heat) {
  if (appState.lang === 'en') {
    if (heat >= 97) return 'Top-tier destination';
    if (heat >= 92) return 'High-heat pick';
    if (heat >= 87) return 'Steady favorite';
    return 'Hidden gem';
  }
  if (heat >= 97) return '顶流目的地';
  if (heat >= 92) return '高热打卡';
  if (heat >= 87) return '稳定上榜';
  return '小众宝藏';
}

function renderGroupButtons() {
  return groups.map((group) => `
    <button class="chip ${appState.group === group.id ? 'active' : ''}" type="button" data-group="${group.id}">
      ${group[appState.lang]}
    </button>
  `).join('');
}

function renderRegionGrid() {
  const items = filteredRegions();
  if (!items.length) return `<div class="empty-state">${t('noMatch')}</div>`;
  return items.map((region) => `
    <button class="province ${appState.selected.id === region.id ? 'selected' : ''}" type="button" data-region="${region.id}" aria-label="${displayRegion(region)} ${t('recommendation')}">
      <span class="province-mark">${region.short}</span>
      <span class="province-main">
        <strong>${displayRegion(region)}</strong>
        <small>${region.places.length} ${t('localPlaces')} · ${allFoods(region).length} ${t('localDishes')}</small>
      </span>
      <span class="province-heat">${region.heat}</span>
    </button>
  `).join('');
}

function renderFoodCard(region, place, food, index) {
  return `
    <article class="dish">
      <div class="dish-rank">${String(index + 1).padStart(2, '0')}</div>
      <div class="dish-body">
        <div class="dish-title">
          <div>
            <h3>${displayFood(food)}</h3>
            <p>${icon('pin')}${t('preciseAt')} ${displayPlace(place)}</p>
          </div>
          <button class="fav ${isFavorite(region.id, place.zh, food.zh) ? 'active' : ''}" type="button" data-place="${place.zh}" data-food="${food.zh}" aria-label="${displayFood(food)}">
            ${icon('heart')}
          </button>
        </div>
        <div class="tags">${displayTags(food).map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
    </article>
  `;
}

function renderRecommendation(region) {
  let index = 0;
  return `
    <section class="hero-card" aria-label="${displayRegion(region)} ${t('recommendation')}">
      <div class="hero-copy">
        <span class="eyebrow">${groupName(region.group)} · ${displayCities(region)}</span>
        <h2>${displayRegion(region)}${t('recommendation')}</h2>
        <p>${displayMood(region)}</p>
      </div>
      <div class="heat-card">
        ${icon('flame')}
        <strong>${region.heat}</strong>
        <span>${heatLabel(region.heat)}</span>
      </div>
    </section>
    <div class="list-head">
      <strong>${t('allLocal')}</strong>
      <span>${region.places.length} ${t('localPlaces')} · ${allFoods(region).length} ${t('localDishes')}</span>
    </div>
    <section class="dish-list" id="recommendations" aria-live="polite">
      ${region.places.map((place) => `
        <section class="place-group">
          <div class="place-head">
            <strong>${displayPlace(place)}</strong>
            <span>${place.foods.length} ${t('localDishes')}</span>
          </div>
          ${place.foods.map((food) => renderFoodCard(region, place, food, index++)).join('')}
        </section>
      `).join('')}
    </section>
  `;
}

function favoriteLabel(item) {
  const [regionId, placeZh, foodZh] = item.split('::');
  const region = regions.find((itemRegion) => itemRegion.id === regionId);
  const place = region?.places.find((itemPlace) => itemPlace.zh === placeZh);
  const food = place?.foods.find((itemFood) => itemFood.zh === foodZh);
  if (!region || !place || !food) return item;
  return `${displayRegion(region)} · ${displayPlace(place)} · ${displayFood(food)}`;
}

function renderFavoriteBar() {
  if (!appState.favorites.length) return `<span>${t('noFav')}</span>`;
  return appState.favorites.slice(0, 10).map((item) => {
    const [regionId] = item.split('::');
    return `<button type="button" data-fav-region="${regionId}">${favoriteLabel(item)}</button>`;
  }).join('');
}

function rankedRegions() {
  return [...regions].sort((a, b) => b.heat - a.heat || a.zh.localeCompare(b.zh, 'zh-CN'));
}

function renderRanking() {
  const ranked = rankedRegions();
  const top = ranked.slice(0, 3);
  return `
    <section class="ranking-page" aria-live="polite">
      <div class="ranking-hero">
        <div>
          <span class="eyebrow">REGION HOT LIST</span>
          <h2>${t('hotList')}</h2>
          <p>${t('hotIntro')}</p>
        </div>
        <div class="ranking-total">
          ${icon('star')}
          <strong>${ranked.length}</strong>
          <span>${t('totalRegions')}</span>
        </div>
      </div>
      <div class="podium">
        ${top.map((region, index) => `
          <button class="podium-card rank-${index + 1}" type="button" data-region="${region.id}">
            <span class="podium-rank">TOP ${index + 1}</span>
            <strong>${displayRegion(region)}</strong>
            <small>${displayCities(region)}</small>
            <em>${region.heat}</em>
          </button>
        `).join('')}
      </div>
      <div class="ranking-list" aria-label="${t('allRanking')}">
        ${ranked.map((region, index) => {
          const names = allFoods(region).slice(0, 4).map((food) => displayFood(food)).join(' / ');
          return `
            <button class="rank-row ${appState.selected.id === region.id ? 'selected' : ''}" type="button" data-region="${region.id}">
              <span class="rank-num">${String(index + 1).padStart(2, '0')}</span>
              <span class="rank-name">
                <strong>${displayRegion(region)}</strong>
                <small>${groupName(region.group)} · ${region.places.length} ${t('localPlaces')} · ${allFoods(region).length} ${t('localDishes')}</small>
              </span>
              <span class="rank-foods">${names}</span>
              <span class="rank-meter" aria-label="${t('heat')} ${region.heat}">
                <i style="width:${region.heat}%"></i>
              </span>
              <span class="rank-heat">${region.heat}</span>
            </button>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function render() {
  const count = filteredRegions().length;
  document.querySelector('#root').innerHTML = `
    <div class="app-shell">
      <aside class="side">
        <div class="brand">
          <div class="brand-logo">${icon('map')}</div>
          <div>
            <strong>${t('brand')}</strong>
            <span>${t('brandSub')}</span>
          </div>
        </div>
        <div class="lang-toggle" aria-label="Language">
          ${icon('globe')}
          <button class="${appState.lang === 'zh' ? 'active' : ''}" type="button" data-lang="zh">中文</button>
          <button class="${appState.lang === 'en' ? 'active' : ''}" type="button" data-lang="en">EN</button>
        </div>
        <nav class="nav" aria-label="页面导航">
          <button class="nav-item ${appState.view === 'recommendations' ? 'active' : ''}" type="button" data-view="recommendations">${icon('flame')}<span>${t('navRecommend')}</span></button>
          <button class="nav-item ${appState.view === 'ranking' ? 'active' : ''}" type="button" data-view="ranking">${icon('star')}<span>${t('navRanking')}</span></button>
          <button class="nav-item" type="button" data-scroll-favorites>${icon('heart')}<span>${t('navFavorites')}</span></button>
        </nav>
        <section class="mini-program">
          <span class="phone-dot"></span>
          <strong>${t('miniTitle')}</strong>
          <p>${t('miniText')}</p>
        </section>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <span class="eyebrow">${t('eyebrow')}</span>
            <h1>${t('title')}</h1>
            <p>${t('intro')}</p>
          </div>
          <label class="search">
            ${icon('search')}
            <input id="search" type="search" value="${appState.query}" placeholder="${t('search')}" autocomplete="off" />
          </label>
        </header>
        <section class="stats-row" aria-label="数据概览">
          <div><strong>${regions.length}</strong><span>${t('regions')}</span></div>
          <div><strong>${totalPlaceCount}</strong><span>${t('places')}</span></div>
          <div><strong>${totalFoodCount}</strong><span>${t('dishes')}</span></div>
          <div><strong>${count}</strong><span>${t('visible')}</span></div>
          <div><strong>${appState.favorites.length}</strong><span>${t('favorites')}</span></div>
        </section>
        ${appState.view === 'ranking' ? renderRanking() : `
          <div class="content">
            <section class="map-panel">
              <div class="panel-head">
                <div>
                  <h2>${t('chooseRegion')}</h2>
                  <p>${t('chooseHint')}</p>
                </div>
                <span>${displayRegion(appState.selected)}</span>
              </div>
              <div class="chips">${renderGroupButtons()}</div>
              <div class="province-grid">${renderRegionGrid()}</div>
            </section>
            <section class="recommend-panel">
              ${renderRecommendation(appState.selected)}
            </section>
          </div>
        `}
        <section class="favorites">
          <div>
            ${icon('heart')}
            <strong>${t('favoriteBar')}</strong>
          </div>
          <div class="favorite-list">${renderFavoriteBar()}</div>
        </section>
      </main>
    </div>
  `;
  bindEvents();
}

function applySearchValue(value) {
  appState.query = value.trim();
  const visible = filteredRegions();
  const first = visible[0];
  if (first && !visible.some((region) => region.id === appState.selected.id)) appState.selected = first;
  render();
  const input = document.querySelector('#search');
  input?.focus();
  input?.setSelectionRange(input.value.length, input.value.length);
}

function bindEvents() {
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.lang = button.dataset.lang;
      localStorage.setItem('china-food-map:lang', appState.lang);
      render();
    });
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.view = button.dataset.view;
      render();
    });
  });
  document.querySelector('[data-scroll-favorites]')?.addEventListener('click', () => {
    document.querySelector('.favorites')?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });
  const search = document.querySelector('#search');
  search.addEventListener('compositionstart', () => {
    searchIsComposing = true;
  });
  search.addEventListener('compositionend', (event) => {
    searchIsComposing = false;
    applySearchValue(event.target.value);
  });
  search.addEventListener('input', (event) => {
    if (searchIsComposing) return;
    applySearchValue(event.target.value);
  });
  document.querySelectorAll('[data-group]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.group = button.dataset.group;
      const first = filteredRegions()[0];
      if (first) appState.selected = first;
      render();
    });
  });
  document.querySelectorAll('[data-region]').forEach((button) => {
    button.addEventListener('click', () => selectRegion(button.dataset.region));
  });
  document.querySelectorAll('[data-food]').forEach((button) => {
    button.addEventListener('click', () => toggleFavorite(appState.selected.id, button.dataset.place, button.dataset.food));
  });
  document.querySelectorAll('[data-fav-region]').forEach((button) => {
    button.addEventListener('click', () => selectRegion(button.dataset.favRegion));
  });
}

render();
