// web/js/forgot-password.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// 全局状态
let currentPhone = '';
let currentCode = '';

// DOM 元素
let codeSection, resetSection, successSection;
let phoneInput, codeInput, newPasswordInput, confirmPasswordInput;
let sendCodeBtn, sendCodeText, nextBtn, resetBtn, goToLoginBtn;
let backToLoginBtn, backToCodeBtn;
let loadingOverlay, loadingText;
let toggleNewPasswordBtn, toggleConfirmPasswordBtn;
let strengthFill, strengthText, phoneDisplay;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  initEventListeners();
  animateOnLoad();
});

// 页面加载动画
function animateOnLoad() {
  if (codeSection) {
    setTimeout(() => {
      codeSection.style.opacity = '1';
      codeSection.style.transform = 'translateY(0)';
    }, 100);
  }
}

// 初始化 DOM 元素
function initDomElements() {
  codeSection = document.getElementById('codeSection');
  resetSection = document.getElementById('resetSection');
  successSection = document.getElementById('successSection');
  phoneInput = document.getElementById('phone');
  codeInput = document.getElementById('code');
  newPasswordInput = document.getElementById('newPassword');
  confirmPasswordInput = document.getElementById('confirmPassword');
  sendCodeBtn = document.getElementById('sendCodeBtn');
  sendCodeText = document.getElementById('sendCodeText');
  nextBtn = document.getElementById('nextBtn');
  resetBtn = document.getElementById('resetBtn');
  goToLoginBtn = document.getElementById('goToLogin');
  backToLoginBtn = document.getElementById('backToLoginBtn');
  backToCodeBtn = document.getElementById('backToCodeBtn');
  loadingOverlay = document.getElementById('loadingOverlay');
  loadingText = document.getElementById('loadingText');
  toggleNewPasswordBtn = document.getElementById('toggleNewPassword');
  toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
  strengthFill = document.getElementById('strengthFill');
  strengthText = document.getElementById('strengthText');
  phoneDisplay = document.getElementById('phoneDisplay');
}

// 初始化事件监听
function initEventListeners() {
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
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

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', handleSendCode);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', handleNext);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetPassword);
  }

  if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', () => {
      animateTransition(() => {
        window.location.href = 'login.html';
      });
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
      animateTransition(() => {
        window.location.href = 'login.html';
      });
    });
  }

  if (backToCodeBtn) {
    backToCodeBtn.addEventListener('click', handleBackToCode);
  }

  // 添加键盘事件支持
  if (codeInput) {
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleNext();
      }
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleResetPassword();
      }
    });
  }
}

// 页面过渡动画
function animateTransition(callback) {
  const currentSection = getCurrentSection();
  if (currentSection) {
    currentSection.style.opacity = '0';
    currentSection.style.transform = 'scale(0.95)';
    setTimeout(callback, 200);
  } else {
    callback();
  }
}

// 获取当前显示的区域
function getCurrentSection() {
  if (codeSection && codeSection.style.display !== 'none') return codeSection;
  if (resetSection && resetSection.style.display !== 'none') return resetSection;
  if (successSection && successSection.style.display !== 'none') return successSection;
  return null;
}

// 切换区域（带动画）
function switchSection(fromSection, toSection) {
  if (fromSection) {
    fromSection.style.opacity = '0';
    fromSection.style.transform = 'scale(0.95)';
  }

  setTimeout(() => {
    if (fromSection) {
      fromSection.style.display = 'none';
    }

    if (toSection) {
      toSection.style.display = 'block';

      // 触发重排以启动动画
      toSection.offsetHeight;

      toSection.style.opacity = '1';
      toSection.style.transform = 'scale(1)';

      // 滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, 200);
}

// 格式化手机号
function formatPhoneNumber(e) {
  let value = e.target.value.replace(/\D/g, '').substr(0, 11);
  e.target.value = value;
}

// 切换密码显示/隐藏
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
  button.textContent = type === 'password' ? '👁️' : '🙈';

  // 添加点击动画
  button.style.transform = 'scale(0.9)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 100);
}

// 更新密码强度
function updatePasswordStrength() {
  const password = newPasswordInput.value;

  if (!password) {
    const strengthBar = document.querySelector('.password-strength');
    if (strengthBar) {
      strengthBar.style.opacity = '0';
      setTimeout(() => {
        strengthBar.style.display = 'none';
      }, 300);
    }
    return;
  }

  const strengthBar = document.querySelector('.password-strength');
  if (strengthBar) {
    strengthBar.style.display = 'block';
    strengthBar.offsetHeight; // 触发重排
    strengthBar.style.opacity = '1';
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
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    background: ${type === 'success' ? '#52c41a' : '#ff4d4f'};
    color: white;
    padding: 14px 24px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 90%;
    text-align: center;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  // 动画进入
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  // 自动消失
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// 显示错误信息
function showError(message) {
  showToast(message, 'error');
}

// 显示成功信息
function showSuccess(message) {
  showToast(message, 'success');
}

// 发送验证码
async function handleSendCode() {
  const phone = phoneInput.value.trim();

  if (!phone || phone.length !== 11) {
    showError('请输入正确的11位手机号');
    phoneInput.focus();
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
      sendCodeBtn.disabled = true;
      sendCodeText.textContent = `${result.data.demoCode}`;
      codeInput.value = result.data.demoCode || '';

      if (!result.data.isRegistered) {
        showError('该手机号未注册，请先注册账号');
        sendCodeBtn.disabled = false;
        sendCodeText.textContent = '发送验证码';
      } else {
        showSuccess('验证码已发送');
        codeInput.focus();
      }
    } else {
      showError(result.message || '发送失败');
    }
  } catch (error) {
    hideLoading();
    console.error('发送验证码错误:', error);
    showError('网络错误，请重试');
  }
}

// 下一步
function handleNext() {
  const phone = phoneInput.value.trim();
  const code = codeInput.value.trim();

  if (!phone || phone.length !== 11) {
    showError('请输入正确的11位手机号');
    phoneInput.focus();
    return;
  }

  if (!code) {
    showError('请输入验证码');
    codeInput.focus();
    return;
  }

  currentPhone = phone;
  currentCode = code;

  // 显示重置密码表单（带动画）
  switchSection(codeSection, resetSection);

  // 显示手机号
  if (phoneDisplay) {
    phoneDisplay.textContent = `${phone.substr(0, 3)}****${phone.substr(7)}`;
  }

  // 聚焦新密码输入框
  setTimeout(() => {
    if (newPasswordInput) {
      newPasswordInput.focus();
    }
  }, 300);
}

// 返回验证码步骤
function handleBackToCode() {
  switchSection(resetSection, codeSection);
}

// 重置密码
async function handleResetPassword() {
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!newPassword) {
    showError('请输入新密码');
    newPasswordInput.focus();
    return;
  }

  if (newPassword.length < 6 || newPassword.length > 20) {
    showError('密码长度为6-20位');
    newPasswordInput.focus();
    return;
  }

  if (newPassword !== confirmPassword) {
    showError('两次输入的密码不一致');
    confirmPasswordInput.focus();
    return;
  }

  try {
    showLoading('重置密码中...');

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: currentPhone,
        code: currentCode,
        newPassword
      })
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      // 显示成功页面（带动画）
      switchSection(resetSection, successSection);
    } else {
      showError(result.message || '重置密码失败');
    }
  } catch (error) {
    hideLoading();
    console.error('重置密码错误:', error);
    showError('网络错误，请重试');
  }
}
