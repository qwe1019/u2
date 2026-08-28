const mealOrder = ['早餐', '午餐', '晚餐', '加餐'];
const tagOptions = ['高纤维', '蛋白质', '蔬菜', '水果', '低糖', '高碳水', '油炸', '甜食'];
const healthyWords = ['沙拉', '蔬菜', '鸡胸', '鸡腿', '鱼', '虾', '燕麦', '酸奶', '水果', '豆腐', '全麦', '坚果', '蛋'];
const lessHealthyWords = ['炸', '奶油', '薯片', '可乐', '奶茶', '甜甜圈', '蛋糕', '辣条', '烧烤'];

let meals = [
  {id: 1, type: '早餐', name: '燕麦酸奶碗', time: '08:10', tags: ['高纤维', '蛋白质'], score: 92, tone: 'green'},
  {id: 2, type: '午餐', name: '照烧鸡腿饭', time: '12:35', tags: ['蛋白质', '蔬菜'], score: 86, tone: 'blue'},
  {id: 3, type: '晚餐', name: '奶油意面', time: '19:20', tags: ['高碳水'], score: 62, tone: 'orange'},
];
let activeTab = 'today';
let activeMealType = '加餐';
let selectedTags = [];
let noticeTimer;

const icon = (name, size = 20) => {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    leaf: '<path d="M20 4c-7.3.3-12.7 3.1-14.8 7.4C3.6 14.7 5.4 19 9.2 19c4.8 0 7.9-5.3 6.1-9.3"/><path d="M4 20c3.2-4.3 6.8-6.9 11-8.3"/>',
    heart: '<path d="M20.8 8.9c0 5.6-8.8 10.3-8.8 10.3S3.2 14.5 3.2 8.9A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.3Z"/>',
    check: '<path d="m5 12 4.2 4.2L19 6.5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    bowl: '<path d="M4 10h16c0 5-3.6 8-8 8s-8-3-8-8Z"/><path d="M7 21h10M8 5.5c1-1.3 2.1-2 4-2s3 .7 4 2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/>',
    spark: '<path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/>',
  };
  return `<svg aria-hidden="true" class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
};

const scoreMeal = (name, tags) => {
  const healthyHits = healthyWords.filter((word) => name.includes(word)).length;
  const lessHealthyHits = lessHealthyWords.filter((word) => name.includes(word)).length;
  const tagBonus = tags.filter((tag) => ['高纤维', '蛋白质', '蔬菜', '水果', '低糖'].includes(tag)).length * 5;
  const tagPenalty = tags.filter((tag) => ['高碳水', '油炸', '甜食'].includes(tag)).length * 7;
  return Math.max(35, Math.min(98, 70 + healthyHits * 8 + tagBonus - lessHealthyHits * 12 - tagPenalty));
};

const toneFor = (score) => score >= 80 ? 'green' : score >= 65 ? 'blue' : 'orange';
const labelFor = (score) => score >= 85 ? '非常健康' : score >= 75 ? '基本均衡' : score >= 60 ? '需要调整' : '偏高油高糖';
const average = () => Math.round(meals.reduce((total, meal) => total + meal.score, 0) / Math.max(meals.length, 1));

const character = (mood, level) => `
  <div class="character-scene ${mood}">
    <div class="sun-glow"></div><div class="character-shadow"></div>
    <div class="character">
      <div class="ear ear-left"></div><div class="ear ear-right"></div>
      <div class="head"><span class="hair hair-one"></span><span class="hair hair-two"></span><span class="eye eye-left"></span><span class="eye eye-right"></span><span class="cheek cheek-left"></span><span class="cheek cheek-right"></span><span class="mouth"></span></div>
      <div class="body"><span class="overall"></span><span class="pocket"></span></div>
      <div class="arm arm-left"></div><div class="arm arm-right"></div><div class="leg leg-left"></div><div class="leg leg-right"></div>
    </div>
    <div class="character-speech">${icon('heart', 14)}<span>${level >= 4 ? '今天也很棒！' : '陪我一起吃好一点'}</span></div>
  </div>`;

const historyView = (score) => `
  <div class="history-panel">
    <div class="history-heading"><div><span class="eyebrow">AUGUST 2026</span><h2>饮食日历</h2></div><span class="month-score">${score}<small>本月平均</small></span></div>
    <div class="calendar-grid">${['一', '二', '三', '四', '五', '六', '日'].map((day) => `<span class="calendar-week">${day}</span>`).join('')}${Array.from({length: 31}, (_, index) => `<button class="calendar-day ${index === 26 ? 'today' : ''} ${index % 5 === 0 ? 'good' : ''}">${index + 1}</button>`).join('')}</div>
    <p class="history-note">${icon('spark', 16)} 每一次记录，都会让你和小人的默契更深一点。</p>
  </div>`;

function render() {
  const score = average();
  const bond = Math.max(12, Math.min(100, 38 + Math.round((score - 50) * 0.72)));
  const level = Math.max(1, Math.min(5, Math.floor(bond / 20) + 1));
  const mood = score >= 78 ? 'happy' : score >= 63 ? 'calm' : 'sad';
  const delta = score >= 75 ? 8 : -5;
  const mealRows = mealOrder.map((type) => {
    const meal = meals.find((item) => item.type === type);
    return `<article class="meal-row ${meal ? '' : 'empty'}">
      <div class="meal-type"><span class="meal-dot ${meal?.tone || 'muted'}"></span><strong>${type}</strong><small>${meal?.time || '还没有记录'}</small></div>
      ${meal ? `<div class="meal-detail"><div class="meal-icon">${icon(type === '加餐' ? 'spark' : 'bowl', 21)}</div><div class="meal-copy"><strong>${meal.name}</strong><div>${meal.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div></div><div class="score ${meal.tone}"><b>${meal.score}</b><span>${labelFor(meal.score)}</span></div><button class="remove-button" data-remove="${meal.id}" aria-label="移除${meal.name}">×</button></div>` : `<button class="empty-action" data-meal-type="${type}">${icon('plus', 15)}添加记录</button>`}
    </article>`;
  }).join('');

  document.querySelector('#root').innerHTML = `
    <div class="app-shell"><div class="app-frame">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">${icon('leaf', 21)}</div><div><strong>u2饮食日历</strong><span>吃出你的好状态</span></div></div>
        <nav class="side-nav" aria-label="主导航"><button class="nav-item active">${icon('calendar', 18)}今日记录</button><button class="nav-item" data-tab="history">${icon('clock', 18)}饮食日历</button><button class="nav-item">${icon('heart', 18)}我的小人</button></nav>
        <div class="sidebar-bottom"><div class="mini-tip">${icon('spark', 16)}<span>连续记录<br><b>3 天</b></span><em>+12%</em></div><div class="user-profile"><div class="avatar">林</div><div><strong>林小满</strong><span>保持好状态</span></div><span class="more">•••</span></div></div>
      </aside>
      <main class="main-content">
        <header class="topbar"><div><div class="eyebrow">WEDNESDAY, AUGUST 27</div><h1>今天吃得怎么样？<span>☀</span></h1></div><div class="date-picker">${icon('calendar', 17)}<span>2026年8月27日</span>${icon('chevron', 15)}</div></header>
        <div id="toast" class="toast hidden"></div>
        <div class="content-grid">
          <section class="left-column"><div class="tab-row"><button class="tab ${activeTab === 'today' ? 'active' : ''}" data-tab="today">今日饮食 <span>${meals.length}</span></button><button class="tab ${activeTab === 'history' ? 'active' : ''}" data-tab="history">历史记录</button></div>
            ${activeTab === 'today' ? `<div class="meal-list">${mealRows}</div><form class="add-card" id="meal-form"><div class="add-card-heading"><div class="add-icon">${icon('plus', 18)}</div><div><h2>记录一笔饮食</h2><p>告诉小人你刚刚吃了什么吧</p></div></div><div class="meal-type-picker">${mealOrder.map((type) => `<button type="button" class="${activeMealType === type ? 'selected' : ''}" data-meal-type="${type}">${type}</button>`).join('')}</div><div class="input-row"><div class="food-input">${icon('bowl', 18)}<input id="meal-name" placeholder="例如：番茄鸡蛋面、苹果..." /><span>⌘</span></div><button class="primary-button" type="submit">添加饮食 ${icon('plus', 15)}</button></div><div class="quick-tags"><span>快速添加标签</span>${tagOptions.map((tag) => `<button type="button" class="quick-tag ${selectedTags.includes(tag) ? 'selected' : ''}" data-tag="${tag}">${tag}</button>`).join('')}</div></form>` : historyView(score)}
          </section>
          <aside class="right-column">
            <section class="bond-card"><div class="card-label">${icon('heart', 16)}今日亲密度</div><div class="bond-score"><strong>${bond}</strong><span>/ 100</span><em class="${delta >= 0 ? 'positive' : 'negative'}">${delta >= 0 ? '↗' : '↘'} ${Math.abs(delta)} 今日</em></div><div class="bond-bar"><span style="width:${bond}%"></span></div><div class="bond-meta"><span>Lv.${level} 初识伙伴</span><span>Lv.${Math.min(level + 1, 5)} 饮食搭档</span></div>${character(mood, level)}<div class="bond-message">${icon('heart', 15)}<span>${mood === 'happy' ? '今天的选择让我感觉很安心！' : mood === 'calm' ? '我们再一起平衡一点点。' : '没关系，明天我们重新开始。'}</span></div></section>
            <section class="summary-card"><div class="summary-heading"><div><div class="card-label">${icon('leaf', 16)}今日小结</div><strong>${labelFor(score)}</strong></div><div class="score-ring ${score >= 75 ? 'good' : 'warn'}"><b>${score}</b><span>健康分</span></div></div><div class="summary-stats"><div><span>蔬菜水果</span><strong>${meals.filter((meal) => meal.tags.some((tag) => ['蔬菜', '水果'].includes(tag))).length || 1}<small> 份</small></strong></div><div><span>蛋白质</span><strong>${meals.filter((meal) => meal.tags.includes('蛋白质')).length}<small> 份</small></strong></div><div><span>记录完整度</span><strong>${Math.min(100, meals.length * 25)}<small>%</small></strong></div></div><div class="summary-advice"><span class="advice-dot"></span>${score >= 75 ? '营养搭配不错，继续保持今天的节奏。' : '可以试试补充一点蔬菜和优质蛋白。'}</div></section>
            <div class="quote"><span>“</span><p>u2饮食日历，<br><b>也好好照顾自己。</b></p><small>— 小人给你的话</small></div>
          </aside>
        </div>
      </main>
    </div></div>`;
  bindEvents();
}

function toast(message) {
  const target = document.querySelector('#toast');
  target.innerHTML = `${icon('check', 16)}${message}`;
  target.classList.remove('hidden');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => target.classList.add('hidden'), 2200);
}

function bindEvents() {
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    activeTab = button.dataset.tab;
    render();
  }));
  document.querySelectorAll('[data-meal-type]').forEach((button) => button.addEventListener('click', () => {
    activeMealType = button.dataset.mealType;
    render();
    document.querySelector('#meal-name')?.focus();
  }));
  document.querySelectorAll('[data-tag]').forEach((button) => button.addEventListener('click', () => {
    const tag = button.dataset.tag;
    selectedTags = selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag];
    render();
    document.querySelector('#meal-name')?.focus();
  }));
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
    meals = meals.filter((meal) => meal.id !== Number(button.dataset.remove));
    render();
    toast('已移除这条记录');
  }));
  document.querySelector('#meal-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#meal-name');
    const name = input.value.trim();
    if (!name) {
      toast('先写下这顿吃了什么吧');
      return;
    }
    const score = scoreMeal(name, selectedTags);
    meals.push({id: Date.now(), type: activeMealType, name, time: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}), tags: selectedTags.length ? selectedTags : [score >= 75 ? '均衡' : '待调整'], score, tone: toneFor(score)});
    selectedTags = [];
    render();
    toast(`${activeMealType}已记录，小人收到了！`);
  });
}

render();
