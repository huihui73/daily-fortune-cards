// Test App - 测试应用主逻辑
// 模拟小程序的交互和状态管理

// 状态管理
const appState = {
  birthday: '',
  gender: 'unspecified',
  phoneMasked: '',
  isPhoneAuthorized: false,
  today: '',
  cards: [],
  fortune: null,
  isGenerating: false,
  lastGenerateDate: '',
  showLoginGuide: true
};

// 工具函数
function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function showToast(message, icon = 'none') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制', 'success');
    }).catch(() => {
      showToast('复制失败', 'none');
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('已复制', 'success');
    } catch (err) {
      showToast('复制失败', 'none');
    }
    document.body.removeChild(textarea);
  }
}

// 本地存储管理
const storage = {
  get(key) {
    try {
      return localStorage.getItem(`fortune_${key}`);
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`fortune_${key}`, value);
    } catch (e) {
      console.error('存储失败', e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(`fortune_${key}`);
    } catch (e) {
      console.error('删除失败', e);
    }
  }
};

// 加载缓存数据
function loadCachedData() {
  const birthday = storage.get('birthday');
  const gender = storage.get('gender') || 'unspecified';
  const lastGenerateDate = storage.get('lastGenerateDate');
  const phoneMasked = storage.get('phoneMasked');
  const isPhoneAuthorized = storage.get('isPhoneAuthorized') === 'true';

  if (birthday) {
    appState.birthday = birthday;
    document.getElementById('birthdayInput').value = birthday;
  }

  if (gender) {
    appState.gender = gender;
    const genderRadio = document.querySelector(`input[name="gender"][value="${gender}"]`);
    if (genderRadio) genderRadio.checked = true;
  }

  if (lastGenerateDate) {
    appState.lastGenerateDate = lastGenerateDate;
  }

  if (phoneMasked) {
    appState.phoneMasked = phoneMasked;
    appState.isPhoneAuthorized = isPhoneAuthorized;
    updateAuthState();
  }

  console.log('加载缓存数据', {
    hasBirthday: !!birthday,
    birthday,
    gender,
    lastGenerateDate,
    phoneMasked
  });
}

// 更新认证状态
function updateAuthState() {
  const { isPhoneAuthorized, phoneMasked } = appState;

  if (isPhoneAuthorized) {
    document.getElementById('authGuide').classList.add('hidden');
    document.getElementById('userSection').classList.remove('hidden');
    document.getElementById('phoneMasked').textContent = phoneMasked;
    appState.showLoginGuide = false;
  } else {
    const birthday = storage.get('birthday');
    if (!birthday) {
      document.getElementById('authGuide').classList.remove('hidden');
      document.getElementById('userSection').classList.add('hidden');
      appState.showLoginGuide = true;
    } else {
      document.getElementById('authGuide').classList.add('hidden');
      document.getElementById('userSection').classList.add('hidden');
      appState.showLoginGuide = false;
    }
  }
}

// 登录处理
function handleLogin() {
  const phone = '138' + Math.floor(Math.random() * 9000 + 1000) + '****';
  const phoneMasked = '138****5678';

  appState.phoneMasked = phoneMasked;
  appState.isPhoneAuthorized = true;

  storage.set('phoneMasked', phoneMasked);
  storage.set('isPhoneAuthorized', 'true');

  showToast('授权成功', 'success');
  updateAuthState();

  if (appState.birthday) {
    generateFortune();
  }
}

// 退出登录
function handleLogout() {
  storage.remove('phoneMasked');
  storage.remove('isPhoneAuthorized');

  appState.phoneMasked = '';
  appState.isPhoneAuthorized = false;

  showToast('已退出', 'success');
  updateAuthState();
}

// 生日变化处理
function handleBirthdayChange(e) {
  const birthday = e.target.value;
  appState.birthday = birthday;
  storage.set('birthday', birthday);
  clearCachedFortune();
}

// 性别变化处理
function handleGenderChange(e) {
  if (e.target.name === 'gender') {
    appState.gender = e.target.value;
    storage.set('gender', e.target.value);
  }
}

// 生成推算
function generateFortune() {
  const { birthday, today } = appState;

  if (!birthday) {
    showToast('请选择生日');
    return;
  }

  appState.isGenerating = true;
  updateUI();

  setTimeout(() => {
    try {
      const fortune = window.fortune.generateFortune(birthday, today);
      let cards = window.fortune.buildCards(fortune);

      const cacheKey = window.fortune.getCacheKey(birthday, today);
      const cachedTasks = storage.get(`tasks_${cacheKey}`);

      if (cachedTasks) {
        const tasks = JSON.parse(cachedTasks);
        cards = cards.map(card => {
          if (card.id === 'c7' && tasks) {
            return { ...card, tasks };
          }
          return card;
        });
      }

      storage.set(cacheKey, JSON.stringify(cards));
      storage.set('lastGenerateDate', today);

      saveToHistory(birthday, fortune);

      appState.cards = cards;
      appState.fortune = fortune;
      appState.isGenerating = false;
      appState.lastGenerateDate = today;

      updateUI();

      showToast('生成成功', 'success');
    } catch (error) {
      console.error('生成推算失败', error);
      showToast('生成失败，请重试');
      appState.isGenerating = false;
      updateUI();
    }
  }, 500);
}

// 检查并重新生成
function checkAndRegenerate() {
  const { birthday, lastGenerateDate, today } = appState;

  if (birthday) {
    const cacheKey = window.fortune.getCacheKey(birthday, today);
    const cachedFortune = storage.get(cacheKey);

    if (cachedFortune) {
      try {
        appState.cards = JSON.parse(cachedFortune);
        updateUI();
      } catch (e) {
        console.error('解析缓存失败', e);
      }
    } else if (lastGenerateDate !== today) {
      generateFortune();
    } else {
      const lastCacheKey = window.fortune.getCacheKey(birthday, lastGenerateDate);
      const lastCachedFortune = storage.get(lastCacheKey);

      if (lastCachedFortune) {
        try {
          appState.cards = JSON.parse(lastCachedFortune);
          updateUI();
        } catch (e) {
          console.error('解析历史缓存失败', e);
        }
      }
    }
  }
}

// 保存历史记录
function saveToHistory(birthday, fortune) {
  try {
    let history = storage.get('fortuneHistory');
    if (history) {
      history = JSON.parse(history);
    } else {
      history = [];
    }

    const historyItem = {
      date: fortune.date,
      birthday,
      fortune
    };

    history.unshift(historyItem);

    if (history.length > 7) {
      history = history.slice(0, 7);
    }

    storage.set('fortuneHistory', JSON.stringify(history));
  } catch (error) {
    console.error('保存历史记录失败', error);
  }
}

// 清除缓存
function clearCachedFortune() {
  const { birthday, today } = appState;
  if (birthday) {
    const cacheKey = window.fortune.getCacheKey(birthday, today);
    storage.remove(cacheKey);
    appState.cards = [];
    appState.fortune = null;
    updateUI();
  }
}

// 任务状态管理
function toggleTask(taskId) {
  const card = appState.cards.find(c => c.id === 'c7');
  if (!card || !card.tasks) return;

  const task = card.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;

  const { birthday, today } = appState;
  const cacheKey = window.fortune.getCacheKey(birthday, today);
  storage.set(`tasks_${cacheKey}`, JSON.stringify(card.tasks));

  updateUI();

  const allCompleted = card.tasks.every(t => t.completed);
  if (allCompleted) {
    setTimeout(() => {
      showToast('🎉 全部完成！', 'success');
    }, 500);
  }
}

// 卡片切换
function toggleCard(cardId) {
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!cardElement) return;

  const contentWrapper = cardElement.querySelector('.card-content-wrapper');
  const toggleIcon = cardElement.querySelector('.toggle-icon');

  if (contentWrapper.style.display === 'none') {
    contentWrapper.style.display = 'block';
    toggleIcon.textContent = '−';
  } else {
    contentWrapper.style.display = 'none';
    toggleIcon.textContent = '+';
  }
}

// 渲染卡片
function renderCards() {
  const container = document.getElementById('cardsSection');
  container.innerHTML = '';

  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'section-title';
  sectionTitle.innerHTML = `
    <span>📊 今日推算</span>
    <span class="card-count">(${appState.cards.length})</span>
  `;
  sectionTitle.style.marginBottom = '16px';
  sectionTitle.style.fontSize = '16px';
  sectionTitle.style.fontWeight = '600';
  sectionTitle.style.color = '#333';
  container.appendChild(sectionTitle);

  appState.cards.forEach(card => {
    const cardElement = createCardElement(card);
    container.appendChild(cardElement);
  });

  container.classList.remove('hidden');
}

// 创建卡片元素
function createCardElement(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.style.setProperty('--card-color', card.color);
  cardDiv.dataset.cardId = card.id;

  let customContent = '';

  if (card.id === 'c3' && card.elements) {
    customContent = renderElementsBar(card.elements);
  }

  if (card.id === 'c4' && card.luckyColorCode) {
    customContent = renderLuckyColor(card.luckyColorCode, card.luckyColorName);
  }

  if (card.id === 'c7' && card.tasks) {
    customContent = renderTaskList(card.tasks);
  }

  cardDiv.innerHTML = `
    <div class="card-header">
      <div class="card-title">
        <span class="card-icon">${card.icon}</span>
        <span class="title-text">${card.title}</span>
      </div>
      <div class="card-toggle">
        <span class="toggle-icon">${card.id === 'c1' ? '−' : '+'}</span>
      </div>
    </div>
    <div class="card-content-wrapper" style="display: ${card.id === 'c1' ? 'block' : 'none'};">
      <div class="card-content">
        <span class="content-text">${card.content}</span>
      </div>
      ${customContent ? `<div class="card-content" style="margin-top: 12px;">${customContent}</div>` : ''}
      <div class="card-actions">
        <button class="action-btn" data-copy="${card.id}">📋 复制</button>
      </div>
    </div>
  `;

  // 绑定事件
  cardDiv.querySelector('.card-header').addEventListener('click', () => toggleCard(card.id));
  cardDiv.querySelector('.card-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCard(card.id);
  });

  const copyBtn = cardDiv.querySelector('.action-btn');
  copyBtn.addEventListener('click', () => copyToClipboard(card.content));

  return cardDiv;
}

// 渲染五行条形图
function renderElementsBar(elements) {
  const elementConfig = {
    wood: { name: '木', color: '#52c41a', advice: '多吃绿色蔬菜，接触自然，养肝护肝' },
    fire: { name: '火', color: '#ff4d4f', advice: '多吃红色食物，适当运动，养心安神' },
    earth: { name: '土', color: '#faad14', advice: '多吃黄色食物，保持规律作息，健脾养胃' },
    metal: { name: '金', color: '#bfbfbf', advice: '多吃白色食物，深呼吸锻炼，润肺养气' },
    water: { name: '水', color: '#1890ff', advice: '多吃黑色食物，充足饮水，补肾固精' }
  };

  const elementsList = Object.entries(elements).map(([key, value]) => {
    const config = elementConfig[key];
    let percent = ((value + 2) / 4) * 100;
    percent = Math.max(10, Math.min(100, percent));

    return {
      name: config.name,
      value: value,
      percent: percent,
      color: config.color,
      advice: value < 0 ? config.advice : null
    };
  });

  const barsHtml = elementsList.map(el => `
    <div class="element-item">
      <div class="element-label">
        <span class="element-name">${el.name}</span>
        <span class="element-value">${el.value}</span>
      </div>
      <div class="element-bar-container">
        <div class="element-bar" style="width: ${el.percent}%; background: ${el.color};"></div>
      </div>
      ${el.advice ? `<div class="element-advice">${el.advice}</div>` : ''}
    </div>
  `).join('');

  return `
    <div class="elements-container">
      <div class="elements-title">五行平衡</div>
      <div class="elements-bars">
        ${barsHtml}
      </div>
    </div>
  `;
}

// 渲染幸运色
function renderLuckyColor(colorCode, colorName) {
  const colorMeanings = {
    '#FF6B6B': {
      meaning: '热情红象征活力与激情，今日适合开展新项目、表达情感、展现领导力。',
      tips: ['适合穿红色系服装', '适合进行体能锻炼', '适合与热情的人交流']
    },
    '#4ECDC4': {
      meaning: '平静青代表平衡与和谐，今日适合处理复杂事务、调解纠纷、寻求内心平静。',
      tips: ['适合绿色系装饰', '适合阅读思考', '适合与家人交流']
    },
    '#45B7D1': {
      meaning: '智慧蓝寓意信任与理性，今日适合做决策、签订合同、学习新知识。',
      tips: ['适合蓝色系穿搭', '适合深度思考', '适合处理重要事务']
    },
    '#FFA07A': {
      meaning: '温暖橙代表温暖与创意，今日适合艺术创作、社交活动、展现个性。',
      tips: ['适合橙色系配饰', '适合参加聚会', '适合尝试新事物']
    },
    '#98D8C8': {
      meaning: '生机绿象征成长与和谐，今日适合健康管理、自然活动、规划未来。',
      tips: ['适合绿色系服装', '适合户外活动', '适合制定计划']
    },
    '#F7DC6F': {
      meaning: '快乐黄寓意喜悦与乐观，今日适合社交娱乐、展现才华、传递正能量。',
      tips: ['适合黄色系配饰', '适合与朋友相聚', '适合表达快乐情绪']
    },
    '#BB8FCE': {
      meaning: '神秘紫代表灵性与直觉，今日适合冥想反思、艺术欣赏、探索未知。',
      tips: ['适合紫色系装饰', '适合独自思考', '适合欣赏艺术作品']
    },
    '#85C1E9': {
      meaning: '自由天蓝象征自由与清晰，今日适合旅行规划、释放压力、追求理想。',
      tips: ['适合天蓝系穿搭', '适合户外运动', '适合规划未来']
    },
    '#F8C471': {
      meaning: '活力金橙代表热情与冒险，今日适合挑战自我、探索新领域、展现勇气。',
      tips: ['适合金色系配饰', '适合尝试新挑战', '适合展现领导力']
    }
  };

  const colorInfo = colorMeanings[colorCode] || {
    meaning: `${colorName}为您今日的幸运色彩，适合展现个性、追求梦想、创造美好。`,
    tips: ['适合穿此色系服装', '适合作为装饰元素', '适合展现个性']
  };

  const tipsHtml = colorInfo.tips.map(tip => `<span class="tip-item">• ${tip}</span>`).join('');

  return `
    <div class="lucky-color-container">
      <div class="color-display">
        <div class="color-circle" style="background: ${colorCode}; box-shadow: 0 4px 20px ${colorCode}66;"></div>
        <div class="color-info">
          <span class="color-name">${colorName}</span>
          <span class="color-hex">${colorCode}</span>
        </div>
      </div>
      <div class="color-meaning">
        <span class="meaning-title">色彩寓意</span>
        <span class="meaning-text">${colorInfo.meaning}</span>
      </div>
      <div class="color-tips">
        <span class="tips-title">今日色彩建议</span>
        <div class="tips-list">
          ${tipsHtml}
        </div>
      </div>
    </div>
  `;
}

// 渲染任务列表
function renderTaskList(tasks) {
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const allCompleted = completedCount === tasks.length && tasks.length > 0;

  const tasksHtml = tasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
      <div class="task-checkbox">
        <span class="checkbox-icon">${task.completed ? '✓' : ''}</span>
      </div>
      <span class="task-text">${task.text}</span>
    </div>
  `).join('');

  return `
    <div class="task-container">
      <div class="task-header">
        <span class="task-title">今日微任务</span>
        <div class="task-progress">
          <span class="progress-text">${completedCount}/${tasks.length}</span>
          <progress class="progress-bar" value="${progressPercent}" max="100"></progress>
        </div>
      </div>
      <div class="task-list">
        ${tasksHtml}
      </div>
      ${allCompleted ? `
        <div class="task-congrats">
          <span class="congrats-icon">🎉</span>
          <span class="congrats-text">恭喜！今日任务全部完成！</span>
        </div>
      ` : ''}
    </div>
  `;
}

// 更新UI
function updateUI() {
  const { cards, fortune, isGenerating, today, showLoginGuide } = appState;

  // 更新日期
  document.getElementById('dateText').textContent = `📅 推算日期：${today}`;

  // 加载状态
  if (isGenerating) {
    document.getElementById('loadingSection').classList.remove('hidden');
    document.getElementById('cardsSection').classList.add('hidden');
    document.getElementById('emptySection').classList.add('hidden');
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('generateBtn').textContent = '生成中...';
  } else {
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('generateBtn').disabled = !appState.birthday || showLoginGuide;
    document.getElementById('generateBtn').textContent = '生成今日卡片';
  }

  // 卡片显示
  if (cards.length > 0 && !isGenerating && !showLoginGuide) {
    renderCards();
    document.getElementById('emptySection').classList.add('hidden');
  } else if (!isGenerating && !showLoginGuide) {
    document.getElementById('cardsSection').classList.add('hidden');
    document.getElementById('emptySection').classList.remove('hidden');
  }
}

// 初始化
function init() {
  appState.today = getTodayDate();
  document.getElementById('dateText').textContent = `📅 推算日期：${appState.today}`;

  loadCachedData();
  updateAuthState();
  checkAndRegenerate();

  // 绑定事件
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('birthdayInput').addEventListener('change', handleBirthdayChange);
  document.getElementById('generateBtn').addEventListener('click', generateFortune);

  const genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(radio => {
    radio.addEventListener('change', handleGenderChange);
  });

  // 任务点击事件委托
  document.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (taskItem) {
      const taskId = taskItem.dataset.taskId;
      if (taskId) {
        toggleTask(taskId);
      }
    }
  });

  updateUI();
  console.log('应用初始化完成', appState);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}