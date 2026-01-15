// web/js/main.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const ACTIONS_API_URL = 'http://localhost:3000/api/actions';

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

        // 监听点击卡片已移除点赞行为\n        // cardElement.addEventListener('click', () => {\n        //   trackAction('like', cardId, 0);\n        // });

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
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
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
      <div class=\"card-actions\"></div>
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

// 处理点赞（已移除）已移除（已禁用）\n// async function handleLike(cardId) {\n//   await trackAction('like', cardId, 0);\n//   showReactionToast(cardId, 'like');\n// }

// 处理不喜欢 (已移除)\n// async function handleDislike(cardId) {\n//   await trackAction('dislike', cardId, 0);\n//   showReactionToast(cardId, 'dislike');\n// }

// 显示反馈 Toast
function showReactionToast(cardId, type) {
  const toast = document.createElement('div');
  toast.className = `reaction-toast reaction-${type}`;
  toast.textContent = type === 'like' ? '👍 已记录喜欢' : '👎 已记录不喜欢';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'like' ? '#4caf50' : '#f44336'};
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
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
// window.handleLike = handleLike; // 已移除对外暴露
window.handleDislike = handleDislike;
