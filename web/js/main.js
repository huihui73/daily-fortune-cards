// web/js/main.js

// 配置
const API_BASE_URL = 'http://localhost:8890/api';
const ACTIONS_API_URL = 'http://localhost:8890/api/actions';

// DOM 元素
let cardsContainer, cardCountEl, fortuneDateEl;
let cardsSection, emptySection, loadingSection, profilePrompt;
let profileBtn, logoutBtn, goToProfileBtn;

// 用户数据
let userData = null;
let cardsData = [];

// 会话 ID（用于区分同一天的不同访问）
let sessionId = Date.now().toString();

// 用户行为追踪
let cardViewDurations = {};
let userActions = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  checkAuthStatus();
  initEventListeners();
  loadUserData();
  startDurationTracking();
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

// 开始时长追踪
function startDurationTracking() {
  // 每隔5秒保存一次查看时长
  setInterval(() => {
    saveDurations();
  }, 5000);

  // 页面卸载时保存所有时长
  window.addEventListener('beforeunload', () => {
    saveDurations();
  });

  // 页面隐藏时保存所有时长
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveDurations();
    }
  });
}

// 保存查看时长
function saveDurations() {
  const token = localStorage.getItem('token');
  if (!token || Object.keys(cardViewDurations).length === 0) return;

  Object.entries(cardViewDurations).forEach(([cardId, duration]) => {
    if (duration > 0) {
      trackAction('view', cardId, duration);
    }
  });

  // 重置时长
  cardViewDurations = {};
}

// 追踪用户行为
async function trackAction(actionType, cardId, duration = 0, metadata = {}) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const action = {
    actionType,
    cardType: getCardType(cardId),
    cardId,
    duration,
    sessionId,
    metadata,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(`${ACTIONS_API_URL}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(action)
    });

    if (!response.ok) {
      console.error('追踪行为失败:', await response.text());
    }
  } catch (error) {
    console.error('追踪行为网络错误:', error);
  }
}

// 获取卡片类型
function getCardType(cardId) {
  if (cardId.startsWith('c1') || cardId.startsWith('c2') || cardId.startsWith('c3')) {
    return 'hexagram';
  } else if (cardId.startsWith('c4')) {
    return 'lucky';
  } else if (cardId.startsWith('c5')) {
    return 'clothing';
  } else if (cardId.startsWith('c6')) {
    return 'diet';
  } else if (cardId.startsWith('c7')) {
    return 'task';
  } else if (cardId.startsWith('c8')) {
    return 'journal';
  } else if (cardId.startsWith('c9')) {
    return 'health';
  } else if (cardId.startsWith('c10')) {
    return 'privacy';
  } else {
    return 'unknown';
  }
}

// 处理登出
function handleLogout() {
  showLogoutModal();
}

function showLogoutModal() {
  let overlay = document.getElementById('logout-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';

    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style.background = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.width = '320px';
    modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    modal.style.textAlign = 'center';

    const msg = document.createElement('div');
    msg.textContent = '确认退出登录？';
    msg.style.marginBottom = '16px';

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.justifyContent = 'flex-end';
    btns.style.gap = '8px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.padding = '8px 14px';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.border = '1px solid #ccc';
    cancelBtn.style.background = '#fff';
    cancelBtn.addEventListener('click', () => { overlay.remove(); });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认退出';
    confirmBtn.style.padding = '8px 14px';
    confirmBtn.style.borderRadius = '6px';
    confirmBtn.style.border = '1px solid #e53935';
    confirmBtn.style.background = '#e53935';
    confirmBtn.style.color = '#fff';
    confirmBtn.addEventListener('click', () => {
      overlay.remove();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('phone');
      localStorage.removeItem('birthday');
      localStorage.removeItem('gender');
      window.location.href = 'login.html';
    });

    btns.appendChild(cancelBtn);
    btns.appendChild(confirmBtn);
    modal.appendChild(msg);
    modal.appendChild(btns);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
  }
}

function showLogoutModal() {
  let overlay = document.getElementById('logout-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'logout-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';

    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.style.background = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.width = '320px';
    modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    modal.style.textAlign = 'center';

    const msg = document.createElement('div');
    msg.textContent = '确认退出登录？';
    msg.style.marginBottom = '16px';

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.justifyContent = 'flex-end';
    btns.style.gap = '8px';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.padding = '8px 14px';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.border = '1px solid #ccc';
    cancelBtn.style.background = '#fff';
    cancelBtn.addEventListener('click', () => { overlay.remove(); });

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认退出';
    confirmBtn.style.padding = '8px 14px';
    confirmBtn.style.borderRadius = '6px';
    confirmBtn.style.border = '1px solid #e53935';
    confirmBtn.style.background = '#e53935';
    confirmBtn.style.color = '#fff';
    confirmBtn.addEventListener('click', () => {
      overlay.remove();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('phone');
      localStorage.removeItem('birthday');
      localStorage.removeItem('gender');
      window.location.href = 'login.html';
    });

    btns.appendChild(cancelBtn);
    btns.appendChild(confirmBtn);
    modal.appendChild(msg);
    modal.appendChild(btns);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = 'flex';
  }
}


// 加载用户数据
async function loadUserData() {
  const token = localStorage.getItem('token');

  try {
    showLoading();

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
        hideLoading();
        showProfilePrompt();
      } else {
        localStorage.setItem('birthday', userData.birthday);
        localStorage.setItem('gender', userData.gender);
        loadPersonalizedCards();
      }
    }
  } catch (error) {
    hideLoading();
    console.error('加载用户数据错误:', error);
    showError('加载失败，请刷新重试');
  }
}

// 加载个性化卡片
async function loadPersonalizedCards() {
  const token = localStorage.getItem('token');
  const birthday = localStorage.getItem('birthday');
  const gender = localStorage.getItem('gender');
  const date = new Date().toISOString().split('T')[0];

  try {
    showLoading();

    const response = await fetch(`${ACTIONS_API_URL}/personalized-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        birthday,
        gender,
        date
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      cardsData = result.data.cards || [];
      displayCards(cardsData);

      // 记录卡片展示行为
      cardsData.forEach(card => {
        trackAction('view', card.id, 0, { cardTitle: card.title });
      });
    } else {
      showError(result.message || '加载失败');
    }
  } catch (error) {
    hideLoading();
    console.error('加载卡片错误:', error);
    showError('网络错误，请重试');
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

      // 初始化查看时长追踪
      cardViewDurations[card.id] = 0;
      trackCardViewTime(card.id);
    });
  }
}

// 追踪卡片查看时长
function trackCardViewTime(cardId) {
  const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
  if (!cardElement) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 开始计时
        const startTime = Date.now();

        const stopTimer = () => {
          const duration = Date.now() - startTime;
          cardViewDurations[cardId] = (cardViewDurations[cardId] || 0) + duration;
        };

        // 监听卡片折叠/展开
        const toggleBtn = cardElement.querySelector('.toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            const contentElement = cardElement.querySelector('.card-content');
            if (contentElement.style.display === 'none') {
              stopTimer();
              trackAction('expand', cardId, 0);
            } else {
              trackCardViewTime(cardId); // 重新开始计时
              trackAction('collapse', cardId, 0);
            }
          });
        }

        // 监听点击卡片

        // 监听长按（收藏）
        let longPressTimer;
        const startLongPress = () => {
          longPressTimer = setTimeout(() => {
            trackAction('favorite', cardId, 0);
            showFavoriteToast(cardId);
          }, 500);
        };

        cardElement.addEventListener('mousedown', startLongPress);
        cardElement.addEventListener('mouseup', () => clearTimeout(longPressTimer));
        cardElement.addEventListener('touchstart', startLongPress);
        cardElement.addEventListener('touchend', () => clearTimeout(longPressTimer));
      } else {
        stopTimer();
      }
    });
  });

  observer.observe(cardElement, { threshold: 0.5 });
}

// 显示收藏 Toast
function showFavoriteToast(cardId) {
  const toast = document.createElement('div');
  toast.className = 'favorite-toast';
  toast.textContent = '❤️ 已收藏';
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #667eea;
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// 创建卡片元素
function createCardElement(card, index) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.style.animationDelay = `${index * 0.1}s`;
  cardEl.style.setProperty('--card-color', card.color);
  cardEl.setAttribute('data-card-id', card.id);
  cardEl.setAttribute('data-card-type', card.type);

  // 卡片内容
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
    <div class="card-footer">
      <button class="toggle-btn">展开 ↓</button>
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

// 全局函数供 HTML 调用