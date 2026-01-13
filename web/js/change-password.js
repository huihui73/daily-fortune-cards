// web/js/change-password.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 元素
let oldPasswordInput, newPasswordInput, confirmPasswordInput;
let saveBtn, cancelBtn, backBtn;
let toggleOldPasswordBtn, toggleNewPasswordBtn, toggleConfirmPasswordBtn;
let strengthFill, strengthText, loadingOverlay, loadingText;
let phoneMaskedEl, userIdEl;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  checkAuthStatus();
  loadUserInfo();
  initEventListeners();
});

// 初始化 DOM 元素
function initDomElements() {
  oldPasswordInput = document.getElementById('oldPassword');
  newPasswordInput = document.getElementById('newPassword');
  confirmPasswordInput = document.getElementById('confirmPassword');
  saveBtn = document.getElementById('saveBtn');
  cancelBtn = document.getElementById('cancelBtn');
  backBtn = document.getElementById('backBtn');
  toggleOldPasswordBtn = document.getElementById('toggleOldPassword');
  toggleNewPasswordBtn = document.getElementById('toggleNewPassword');
  toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
  strengthFill = document.getElementById('strengthFill');
  strengthText = document.getElementById('strengthText');
  loadingOverlay = document.getElementById('loadingOverlay');
  loadingText = document.getElementById('loadingText');
  phoneMaskedEl = document.getElementById('phoneMasked');
  userIdEl = document.getElementById('userId');
}

// 检查登录状态
function checkAuthStatus() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }
}

// 加载用户信息
function loadUserInfo() {
  const phone = localStorage.getItem('phone');
  const userId = localStorage.getItem('userId');

  if (phone) {
    phoneMaskedEl.textContent = phone.substr(0, 3) + '****' + phone.substr(7);
  }

  if (userId) {
    userIdEl.textContent = userId;
  }
}

// 初始化事件监听
function initEventListeners() {
  if (toggleOldPasswordBtn) {
    toggleOldPasswordBtn.addEventListener('click', () => togglePassword('oldPassword', toggleOldPasswordBtn));
  }

  if (toggleNewPasswordBtn) {
    toggleNewPasswordBtn.addEventListener('click', () => togglePassword('newPassword', toggleNewPasswordBtn));
  }

  if (toggleConfirmPasswordBtn) {
    toggleConfirmPasswordBtn.addEventListener('click', () => togglePassword('confirmPassword', toggleConfirmPasswordBtn));
  }

  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', updatePasswordStrength);
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleChangePassword);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// 切换密码显示/隐藏
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
  button.textContent = type === 'password' ? '👁️' : '🙈';
}

// 更新密码强度
function updatePasswordStrength() {
  const password = newPasswordInput.value;

  if (!password) {
    const strengthBar = document.querySelector('.password-strength');
    if (strengthBar) {
      strengthBar.style.display = 'none';
    }
    return;
  }

  const strengthBar = document.querySelector('.password-strength');
  if (strengthBar) {
    strengthBar.style.display = 'block';
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

  strengthFill.className = 'strength-fill ' + classes[strength - 1];
  strengthText.textContent = levels[strength - 1] || '';
}

// 显示加载状态
function showLoading(text = '处理中...') {
  if (loadingOverlay && loadingText) {
    loadingOverlay.style.display = 'flex';
    loadingText.textContent = text;
  }
}

// 隐藏加载状态
function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// 显示错误信息
function showError(message) {
  if (typeof alert === 'function') {
    alert(message);
  } else {
    console.error('Error:', message);
  }
}

// 修改密码
async function handleChangePassword() {
  const oldPassword = oldPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!oldPassword) {
    showError('请输入当前密码');
    return;
  }

  if (!newPassword) {
    showError('请输入新密码');
    return;
  }

  if (newPassword.length < 6 || newPassword.length > 20) {
    showError('新密码长度为6-20位');
    return;
  }

  if (newPassword === oldPassword) {
    showError('新密码不能与当前密码相同');
    return;
  }

  if (newPassword !== confirmPassword) {
    showError('两次输入的新密码不一致');
    return;
  }

  try {
    showLoading('修改密码中...');

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      alert('密码修改成功，请重新登录');

      // 清空表单
      oldPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';

      // 隐藏密码强度指示器
      const strengthBar = document.querySelector('.password-strength');
      if (strengthBar) {
        strengthBar.style.display = 'none';
      }

      // 重新登录
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    } else {
      showError(result.message || '修改密码失败');
    }
  } catch (error) {
    hideLoading();
    console.error('修改密码错误:', error);
    showError('网络错误，请重试');
  }
}
