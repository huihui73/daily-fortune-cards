// web/js/profile.js

// 配置
const API_BASE_URL = 'http://localhost:3000/api';

// DOM 元素（在 DOMContentLoaded 后初始化）
let birthdayInput, genderInput, saveBtn, skipBtn, logoutBtn, backBtn, changePasswordBtn;
let phoneMaskedEl, loadingOverlay, loadingText;

// 日历选择器相关
let datePicker, calendarPopup, calendarTitle, calendarDays;
let prevYearBtn, prevMonthBtn, nextMonthBtn, nextYearBtn, todayBtn, confirmBtn;
let currentYear, currentMonth, selectedDate;

// 用户信息
let userProfile = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDomElements();
  initCalendar();
  checkAuthStatus();
  loadUserProfile();
  loadSavedData();
  initEventListeners();
});

// 初始化 DOM 元素
function initDomElements() {
  birthdayInput = document.getElementById('birthday');
  genderInput = document.getElementById('gender');
  saveBtn = document.getElementById('saveBtn');
  skipBtn = document.getElementById('skipBtn');
  logoutBtn = document.getElementById('logoutBtn');
  backBtn = document.getElementById('backBtn');
  changePasswordBtn = document.getElementById('changePasswordBtn');
  phoneMaskedEl = document.getElementById('phoneMasked');
  loadingOverlay = document.getElementById('loadingOverlay');
  loadingText = document.getElementById('loadingText');

  // 日历选择器元素
  datePicker = document.getElementById('datePicker');
  calendarPopup = document.getElementById('calendarPopup');
  calendarTitle = document.getElementById('calendarTitle');
  calendarDays = document.getElementById('calendarDays');
  prevYearBtn = document.getElementById('prevYear');
  prevMonthBtn = document.getElementById('prevMonth');
  nextMonthBtn = document.getElementById('nextMonth');
  nextYearBtn = document.getElementById('nextYear');
  todayBtn = document.getElementById('todayBtn');
  confirmBtn = document.getElementById('confirmBtn');
}

// 初始化日历
function initCalendar() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth() + 1; // 1-12
  selectedDate = null;

  renderCalendar(currentYear, currentMonth);
}

// 渲染日历
function renderCalendar(year, month) {
  // 更新标题
  calendarTitle.textContent = `${year}年${month}月`;

  // 获取月份的第一天和最后一天
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay(); // 0-6 (周日到周六）
  const daysInMonth = lastDay.getDate();

  // 清空日历
  calendarDays.innerHTML = '';

  // 添加空白日期（填充前几天的空位）
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarDays.appendChild(emptyDay);
  }

  // 添加日期
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;

    // 检查是否是今天
    if (year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate()) {
      dayEl.classList.add('today');
    }

    // 检查是否被选中
    if (selectedDate &&
        selectedDate.year === year &&
        selectedDate.month === month &&
        selectedDate.day === day) {
      dayEl.classList.add('selected');
    }

    // 检查是否禁用（未来日期）
    if (year > today.getFullYear() ||
        (year === today.getFullYear() && month > today.getMonth() + 1) ||
        (year === today.getFullYear() && month === today.getMonth() + 1 && day > today.getDate())) {
      dayEl.classList.add('disabled');
    } else {
      dayEl.addEventListener('click', () => selectDate(year, month, day));
    }

    calendarDays.appendChild(dayEl);
  }
}

// 选择日期
function selectDate(year, month, day) {
  selectedDate = { year, month, day };

  // 更新输入框
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  birthdayInput.value = `${year}-${monthStr}-${dayStr}`;

  // 重新渲染日历以更新选中状态
  renderCalendar(currentYear, currentMonth);
}

// 上一年
function prevYear() {
  currentYear--;
  renderCalendar(currentYear, currentMonth);
}

// 下一年
function nextYear() {
  currentYear++;
  renderCalendar(currentYear, currentMonth);
}

// 上一月
function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
}

// 下一月
function nextMonth() {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
}

// 跳转到今天
function goToToday() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth() + 1;
  selectDate(currentYear, currentMonth, today.getDate());
}

// 确认选择
function confirmSelection() {
  toggleCalendar();
}

// 切换日历显示/隐藏
function toggleCalendar(event) {
  if (event) {
    event.stopPropagation();
  }
  calendarPopup.classList.toggle('active');
}

// 点击外部关闭日历
function handleClickOutside(event) {
  // 确保日历弹窗已经显示
  if (!calendarPopup.classList.contains('active')) {
    return;
  }

  // 检查点击是否在日期选择器内部
  if (!datePicker.contains(event.target)) {
    calendarPopup.classList.remove('active');
  }
}

// 检查登录状态
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const phone = localStorage.getItem('phone');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  if (phone) {
    phoneMaskedEl.textContent = phone.substr(0, 3) + '****' + phone.substr(7);
  }
}

// 加载用户资料
async function loadUserProfile() {
  const token = localStorage.getItem('token');

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
      userProfile = result.data;

      // 填充表单
      if (result.data.birthday) {
        birthdayInput.value = result.data.birthday;
        // 解析日期并设置选中状态
        const dateParts = result.data.birthday.split('-');
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          const day = parseInt(dateParts[2]);
          selectedDate = { year, month, day };
          currentYear = year;
          currentMonth = month;
          renderCalendar(currentYear, currentMonth);
        }
      }

      if (result.data.gender) {
        genderInput.value = result.data.gender;
      }

      console.log('用户资料加载成功', userProfile);
    } else {
      console.error('加载用户资料失败:', result.message);
    }
  } catch (error) {
    console.error('加载用户资料错误:', error);
  }
}

// 加载保存的数据
function loadSavedData() {
  const birthday = localStorage.getItem('birthday');
  const gender = localStorage.getItem('gender');

  if (birthday && !birthdayInput.value) {
    birthdayInput.value = birthday;
    // 解析日期并设置选中状态
    const dateParts = birthday.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      selectedDate = { year, month, day };
      currentYear = year;
      currentMonth = month;
      renderCalendar(currentYear, currentMonth);
    }
  }

  if (gender && !genderInput.value) {
    genderInput.value = gender;
  }
}

// 初始化事件监听
function initEventListeners() {
  console.log('初始化事件监听...');

  // 日历选择器事件（只使用 click 事件，避免和 focus 冲突）
  if (birthdayInput) {
    birthdayInput.addEventListener('click', toggleCalendar);
  }

  if (prevYearBtn) {
    prevYearBtn.addEventListener('click', prevYear);
  }

  if (nextYearBtn) {
    nextYearBtn.addEventListener('click', nextYear);
  }

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', prevMonth);
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', nextMonth);
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', goToToday);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmSelection);
  }

  // 点击外部关闭日历
  document.addEventListener('click', handleClickOutside);

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveProfile);
    console.log('✓ saveBtn 事件监听已添加');
  } else {
    console.error('✗ saveBtn 元素不存在');
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', handleSkip);
    console.log('✓ skipBtn 事件监听已添加');
  } else {
    console.error('✗ skipBtn 元素不存在');
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      window.location.href = 'change-password.html';
    });
    console.log('✓ changePasswordBtn 事件监听已添加');
  } else {
    console.error('✗ changePasswordBtn 元素不存在');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
    console.log('✓ logoutBtn 事件监听已添加');
  } else {
    console.error('✗ logoutBtn 元素不存在');
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('点击了返回主页按钮');
      window.location.href = 'index.html';
    });
    console.log('✓ backBtn 事件监听已添加');
  } else {
    console.error('✗ backBtn 元素不存在');
  }
}

// 保存个人资料
async function handleSaveProfile() {
  const birthday = birthdayInput.value.trim();
  const gender = genderInput.value.trim();

  if (!birthday) {
    alert('请选择生日');
    return;
  }

  if (!gender) {
    alert('请选择性别');
    return;
  }

  try {
    showLoading('保存中...');

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
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
      // 保存到本地存储
      localStorage.setItem('birthday', birthday);
      localStorage.setItem('gender', gender);

      window.location.href = 'index.html';
    } else {
      alert('保存失败：' + (result.message || '未知错误'));
    }
  } catch (error) {
    hideLoading();
    console.error('保存个人资料错误:', error);
    alert('网络错误，请重试');
  }
}

// 跳过填写
function handleSkip() {
  if (confirm('确定跳过填写个人资料吗？您可以在主页面的个人资料中设置。')) {
    window.location.href = 'index.html';
  }
}

// 登出
function handleLogout() {
  if (!confirm('确认退出登录？')) return;

  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('phone');

  window.location.href = 'login.html';
}

// 显示加载状态
function showLoading(text = '保存中...') {
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
