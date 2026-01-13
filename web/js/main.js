// web/js/main.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 元素
let cardsContainer, cardCountEl, fortuneDateEl;
let cardsSection, emptySection, loadingSection, profilePrompt;
let profileBtn, logoutBtn, goToProfileBtn;

// 用户数据
let userData = null;
let cardsData = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  checkAuthStatus();
  initEventListeners();
  loadUserData();
});

// 初始化 DOM 元素
function initDomElements() {
  cardsContainer = document.getElementById('cardsContainer');
  cardCountEl = document.getElementById('cardCount');
  fortuneDateEl = document.getElementById('fortuneDate');
  cardsSection = document.getElementById('cardsSection');
  emptySection = document.getElementById('emptySection');
  loadingSection = document.getElementById('loadingSection');
  profilePrompt = document.getElementById('profilePrompt');
  profileBtn = document.getElementById('profileBtn');
  logoutBtn = document.getElementById('logoutBtn');
  goToProfileBtn = document.getElementById('goToProfileBtn');
}

// 检查登录状态
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const phone = localStorage.getItem('phone');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const phoneMaskedEl = document.getElementById('phoneMasked');
  if (phone && phoneMaskedEl) {
    phoneMaskedEl.textContent = phone.substr(0, 3) + '****' + phone.substr(7);
  }
}

// 初始化事件监听
function initEventListeners() {
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (goToProfileBtn) {
    goToProfileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }
}

// 处理登出
function handleLogout() {
  if (!confirm('确认退出登录？')) return;

  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('phone');
  localStorage.removeItem('birthday');
  localStorage.removeItem('gender');

  window.location.href = 'login.html';
}

// 加载用户数据
async function loadUserData() {
  const token = localStorage.getItem('token');
  const birthday = localStorage.getItem('birthday');
  const gender = localStorage.getItem('gender');

  // 检查是否填写了资料
  if (!birthday || !gender) {
    showProfilePrompt();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      userData = result.data;

      if (!userData.birthday || !userData.gender) {
        showProfilePrompt();
      } else {
        loadTodayCards();
      }
    }
  } catch (error) {
    console.error('加载用户数据错误:', error);
    showError('加载失败，请刷新重试');
  }
}

// 显示资料提示
function showProfilePrompt() {
  if (profilePrompt) {
    profilePrompt.style.display = 'block';
  }
  if (emptySection) {
    emptySection.style.display = 'none';
  }
}

// 加载今日卡片
async function loadTodayCards() {
  showLoading();

  const token = localStorage.getItem('token');
  const birthday = localStorage.getItem('birthday');
  const gender = localStorage.getItem('gender');

  try {
    const response = await fetch(`${API_BASE_URL}/cards/today`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        birthday,
        gender
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      cardsData = result.data.cards || [];
      displayCards(cardsData);
    } else {
      showError(result.message || '加载失败');
    }
  } catch (error) {
    hideLoading();
    console.error('加载卡片错误:', error);
    showError('网络错误，请重试');
  }
}

// 显示卡片
function displayCards(cards) {
  if (!cards || cards.length === 0) {
    if (emptySection) {
      emptySection.style.display = 'block';
    }
    if (cardsSection) {
      cardsSection.style.display = 'none';
    }
    return;
  }

  if (emptySection) {
    emptySection.style.display = 'none';
  }

  if (cardsSection) {
    cardsSection.style.display = 'block';
  }

  if (cardCountEl) {
    cardCountEl.textContent = cards.length;
  }

  if (fortuneDateEl) {
    const today = new Date();
    fortuneDateEl.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = '';

    cards.forEach((card, index) => {
      const cardEl = createCardElement(card, index);
      cardsContainer.appendChild(cardEl);
    });
  }
}

// 创建卡片元素
function createCardElement(card, index) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.style.animationDelay = `${index * 0.1}s`;
  cardEl.style.setProperty('--card-color', card.color);

  cardEl.innerHTML = `
    <div class="card-header">
      <div class="card-title">
        <span class="card-icon">${card.icon}</span>
        <span>${card.title}</span>
      </div>
    </div>
    <div class="card-content">
      <div class="card-content-text">${formatCardContent(card.content)}</div>
    </div>
  `;

  return cardEl;
}

// 格式化卡片内容
function formatCardContent(content) {
  if (!content) return '';
  return content.replace(/\n/g, '<br>');
}

// 显示加载状态
function showLoading() {
  if (loadingSection) {
    loadingSection.style.display = 'block';
  }
  if (emptySection) {
    emptySection.style.display = 'none';
  }
  if (cardsSection) {
    cardsSection.style.display = 'none';
  }
  if (profilePrompt) {
    profilePrompt.style.display = 'none';
  }
}

// 隐藏加载状态
function hideLoading() {
  if (loadingSection) {
    loadingSection.style.display = 'none';
  }
}

// 显示错误
function showError(message) {
  alert(message);
}
