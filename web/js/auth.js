// web/js/auth.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 获取表单元素
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const passwordInputs = document.querySelectorAll('input[type="password"]');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPasswordToggle();
  initForms();
  initPasswordStrength();
});

// 初始化标签切换
function initTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // 切换标签样式
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切换表单显示
      if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
      } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
      }
    });
  });
}

// 初始化密码显示/隐藏
function initPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-password');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const passwordInput = btn.parentElement.querySelector('input');
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      btn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  });
}

// 初始化表单提交
function initForms() {
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
}

// 初始化密码强度检测
function initPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);

    updatePasswordStrength(strengthFill, strengthText, strength);
  });
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
function updatePasswordStrength(fillElement, textElement, strength) {
  const levels = ['弱', '中等', '强'];
  const classes = ['', 'medium', 'strong'];

  fillElement.className = 'strength-fill ' + classes[strength - 1];
  textElement.textContent = levels[strength - 1] || '';
}

// 处理登录
async function handleLogin(e) {
  e.preventDefault();

  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!identifier || !password) {
    showError('请填写所有必填项');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password })
    });

    const result = await response.json();

    if (result.success) {
      // 保存 token 到本地存储
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('username', result.data.username);

      // 跳转到主页面
      window.location.href = 'index.html';
    } else {
      showError(result.message || '登录失败');
    }
  } catch (error) {
    console.error('登录错误:', error);
    showError('网络错误，请重试');
  }
}

// 处理注册
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !phone || !password) {
    showError('请填写所有必填项');
    return;
  }

  if (password.length < 6) {
    showError('密码长度至少6个字符');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, phone, password })
    });

    const result = await response.json();

    if (result.success) {
      // 保存 token
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userId', result.data.userId);
      localStorage.setItem('username', username);

      // 显示成功提示
      alert('注册成功！');

      // 跳转到主页面
      window.location.href = 'index.html';
    } else {
      showError(result.message || '注册失败');
    }
  } catch (error) {
    console.error('注册错误:', error);
    showError('网络错误，请重试');
  }
}

// 显示错误信息
function showError(message) {
  alert(message);
}

// 检查登录状态
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (token && userId) {
    // 已登录，跳转到主页面
    window.location.href = 'index.html';
  }
}

// 页面加载时检查登录状态
checkAuthStatus();
