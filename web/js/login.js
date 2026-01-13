// web/js/login.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 全局状态
let currentPhone = '';
let currentCode = '';
let loginMethod = 'password'; // 当前登录方式：password 或 code
let countdownTimer = null; // 验证码倒计时定时器

// DOM 元素
let phoneInput, passwordInput, codePhoneInput, codeInput;
let togglePasswordBtn, sendCodeBtn, sendCodeText;
let passwordLoginBtn, codeLoginBtn;
let loginTabs, tabButtons;
let passwordStrength, strengthFill, strengthText;
let firstLoginHint, loadingOverlay, loadingText;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  initEventListeners();
  checkAuthStatus();
});

// 初始化 DOM 元素
function initDomElements() {
  phoneInput = document.getElementById('phone');
  passwordInput = document.getElementById('password');
  codePhoneInput = document.getElementById('codePhone');
  codeInput = document.getElementById('code');
  togglePasswordBtn = document.getElementById('togglePassword');
  sendCodeBtn = document.getElementById('sendCodeBtn');
  sendCodeText = document.getElementById('sendCodeText');
  passwordLoginBtn = document.getElementById('passwordLoginBtn');
  codeLoginBtn = document.getElementById('codeLoginBtn');
  loginTabs = document.getElementById('loginTabs');
  firstLoginHint = document.getElementById('firstLoginHint');
  passwordStrength = document.getElementById('passwordStrength');
  strengthFill = document.getElementById('strengthFill');
  strengthText = document.getElementById('strengthText');
  loadingOverlay = document.getElementById('loadingOverlay');
  loadingText = document.getElementById('loadingText');

  tabButtons = document.querySelectorAll('.tab-btn');
}

// 初始化事件监听
function initEventListeners() {
  // 页签切换
  if (tabButtons) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabType = e.target.dataset.tab;
        switchLoginTab(tabType);
      });
    });
  }

  // 密码登录
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
    phoneInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        passwordInput.focus();
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePasswordLogin();
      }
    });
  }

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePassword);
  }

  if (passwordLoginBtn) {
    passwordLoginBtn.addEventListener('click', handlePasswordLogin);
  }

  // 验证码登录
  if (codePhoneInput) {
    codePhoneInput.addEventListener('input', (e) => {
      formatPhoneNumber(e);
      // 同步手机号到密码登录
      if (phoneInput) {
        phoneInput.value = e.target.value;
      }
    });
    codePhoneInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        codeInput.focus();
      }
    });
  }

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', handleSendCode);
  }

  if (codeInput) {
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCodeLogin();
      }
    });
  }

  if (codeLoginBtn) {
    codeLoginBtn.addEventListener('click', handleCodeLogin);
  }
}

// 检查登录状态
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const phone = localStorage.getItem('phone');

  if (token && userId && phone) {
    // 已登录，跳转到主页面
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }
}

// 切换登录页签
function switchLoginTab(tabType) {
  loginMethod = tabType;

  // 更新页签按钮状态
  if (tabButtons) {
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 更新表单显示
  const passwordForm = document.getElementById('passwordLogin');
  const codeForm = document.getElementById('codeLogin');

  if (tabType === 'password') {
    if (passwordForm) passwordForm.classList.add('active');
    if (codeForm) codeForm.classList.remove('active');

    // 隐藏首次登录提示
    if (firstLoginHint) {
      firstLoginHint.style.display = 'none';
    }

    // 聚焦密码输入框
    setTimeout(() => {
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 100);
  } else {
    if (passwordForm) passwordForm.classList.remove('active');
    if (codeForm) codeForm.classList.add('active');

    // 聚焦验证码手机号输入框
    setTimeout(() => {
      if (codePhoneInput) {
        codePhoneInput.focus();
      }
    }, 100);
  }

  console.log('切换登录方式:', tabType);
}

// 格式化手机号
function formatPhoneNumber(e) {
  let value = e.target.value.replace(/\D/g, '').substr(0, 11);
  e.target.value = value;

  // 同步到另一个输入框
  if (e.target === phoneInput && codePhoneInput) {
    codePhoneInput.value = value;
  } else if (e.target === codePhoneInput && phoneInput) {
    phoneInput.value = value;
  }

  currentPhone = value;
}

// 切换密码显示/隐藏
function togglePassword() {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';

  // 添加点击动画
  togglePasswordBtn.style.transform = 'translateY(-50%) scale(0.9)';
  setTimeout(() => {
    togglePasswordBtn.style.transform = 'translateY(-50%) scale(1)';
  }, 100);
}

// 更新密码强度
function updatePasswordStrength() {
  const password = passwordInput.value;

  if (!password) {
    if (passwordStrength) {
      passwordStrength.classList.remove('show');
    }
    return;
  }

  if (passwordStrength) {
    passwordStrength.classList.add('show');
  }

  const strength = calculatePasswordStrength(password);
  updateStrengthDisplay(strength);
}

// 计算密码强度
function calculatePasswordStrength(password) {
  let strength = 0;

  if (password.length >= 6) strength += 1;
  if (password.length >= 10) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  return Math.min(strength, 3);
}

// 更新密码强度显示
function updateStrengthDisplay(strength) {
  const levels = ['弱', '中等', '强'];
  const classes = ['', 'medium', 'strong'];

  if (strength === 0) {
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = '0%';
    strengthText.textContent = '';
  } else {
    strengthFill.className = 'strength-fill ' + classes[strength - 1];
    strengthFill.style.width = (strength / 3) * 100 + '%';
    strengthText.textContent = levels[strength - 1];
  }
}

// 显示加载状态
function showLoading(text = '处理中...') {
  if (loadingOverlay && loadingText) {
    loadingOverlay.style.display = 'flex';
    loadingOverlay.offsetHeight; // 触发重排
    loadingOverlay.style.opacity = '1';
    loadingText.textContent = text;
  }
}

// 隐藏加载状态
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

// 显示 Toast 提示
function showToast(message, type = 'error') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;

  document.body.appendChild(toast);

  // 动画进入
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // 自动消失
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// 处理密码登录
async function handlePasswordLogin() {
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();

  if (!phone || phone.length !== 11) {
    showToast('请输入正确的11位手机号');
    phoneInput.focus();
    return;
  }

  if (!password) {
    showToast('请输入密码');
    passwordInput.focus();
    return;
  }

  if (password.length < 6) {
    showToast('密码至少6位');
    passwordInput.focus();
    return;
  }

  try {
    showLoading('登录中...');

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        password
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      // 登录成功
      const token = result.data.token;
      const userId = result.data.userId;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('phone', phone);

      showToast('登录成功', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    } else {
      const message = result.message || '登录失败';

      // 检查是否是新用户
      if (message.includes('新用户') || message.includes('设置密码')) {
        showToast(message);
        // 显示首次登录提示
        if (firstLoginHint) {
          firstLoginHint.style.display = 'block';
        }
        // 确保焦点在密码输入框
        setTimeout(() => {
          if (passwordInput) {
            passwordInput.focus();
          }
        }, 100);
      } else {
        showToast(message);
      }
    }
  } catch (error) {
    hideLoading();
    console.error('登录错误:', error);
    showToast('网络错误，请重试');
  }
}

// 发送验证码
async function handleSendCode() {
  const phone = codePhoneInput.value.trim();

  if (!phone || phone.length !== 11) {
    showToast('请输入正确的11位手机号');
    codePhoneInput.focus();
    return;
  }

  try {
    showLoading('发送验证码中...');

    const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      currentPhone = phone;
      currentCode = result.data.demoCode || '';

      // 演示模式自动填充验证码
      if (result.data.demoCode && codeInput) {
        codeInput.value = result.data.demoCode;
      }

      // 显示首次登录提示
      if (!result.data.isRegistered && firstLoginHint) {
        firstLoginHint.style.display = 'block';
      }

      // 开始倒计时
      startCountdown();
      showToast('验证码已发送', 'success');

      // 聚焦验证码输入框
      setTimeout(() => {
        if (codeInput) {
          codeInput.focus();
        }
      }, 100);
    } else {
      showToast(result.message || '发送失败');
    }
  } catch (error) {
    hideLoading();
    console.error('发送验证码错误:', error);
    showToast('网络错误，请重试');
  }
}

// 开始倒计时
function startCountdown() {
  let seconds = 60;
  sendCodeBtn.disabled = true;
  sendCodeText.textContent = `${seconds}秒后重发`;

  countdownTimer = setInterval(() => {
    seconds--;
    sendCodeText.textContent = `${seconds}秒后重发`;

    if (seconds <= 0) {
      clearInterval(countdownTimer);
      sendCodeBtn.disabled = false;
      sendCodeText.textContent = '发送验证码';
    }
  }, 1000);
}

// 处理验证码登录
async function handleCodeLogin() {
  const phone = codePhoneInput.value.trim();
  const code = codeInput.value.trim();

  if (!phone || phone.length !== 11) {
    showToast('请输入正确的11位手机号');
    codePhoneInput.focus();
    return;
  }

  if (!code) {
    showToast('请输入验证码');
    codeInput.focus();
    return;
  }

  try {
    showLoading('登录中...');

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone,
        code
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      // 登录成功
      const token = result.data.token;
      const userId = result.data.userId;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('phone', phone);

      showToast('登录成功', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    } else {
      const message = result.message || '登录失败';

      // 检查是否是新用户需要设置密码
      if (message.includes('新用户') || message.includes('设置密码')) {
        showToast(message);

        // 切换到密码登录页签
        setTimeout(() => {
          switchLoginTab('password');

          // 显示首次登录提示
          if (firstLoginHint) {
            firstLoginHint.style.display = 'block';
          }

          // 聚焦密码输入框
          setTimeout(() => {
            if (passwordInput) {
              passwordInput.focus();
            }
          }, 100);
        }, 1500);
      } else {
        showToast(message);
      }
    }
  } catch (error) {
    hideLoading();
    console.error('登录错误:', error);
    showToast('网络错误，请重试');
  }
}
