(function() {
  // ----- DOM 元素 -----
  const countDisplay = document.getElementById('countDisplay');
  const myFishElement = document.querySelector('.myFish');
  const autoClickElement = document.getElementById('autoClick');
  const intervalInput = document.getElementById('intervalInput');
  const knockValueSpan = document.getElementById('knockValue');
  const decrementBtn = document.getElementById('decrementKnock');
  const incrementBtn = document.getElementById('incrementKnock');
  const resetBtn = document.getElementById('resetKnock');
  const countInput = document.getElementById('countInput');
  const setCountBtn = document.getElementById('setCountBtn');

  // ----- 状态变量 -----
  let currentCount = 0;            // 当前功德总值
  let knockDelta = -1;             // 每次敲击变化量（-1, -2, +3 等，不为0）
  let autoActive = false;          // 自动敲是否开启
  let autoIntervalId = null;       // setInterval id
  let animationTimer = null;       // 复原动画定时器
  let isPressing = false;          // 空格/鼠标按下标记（防止连发）
  
  // ----- 本地存储加载 -----
  const savedCount = localStorage.getItem('meritCount');
  if(savedCount !== null && !isNaN(parseFloat(savedCount))) {
    currentCount = Number(savedCount);
    countDisplay.innerText = currentCount;
    countInput.value = currentCount;
  }
  
  const savedDelta = localStorage.getItem('knockDelta');
  if(savedDelta !== null && !isNaN(parseFloat(savedDelta)) && Number(savedDelta) <= -1) {
    knockDelta = Number(savedDelta);
    knockValueSpan.value = `${knockDelta}`;
  } else {
    knockDelta = -1;
    knockValueSpan.value = "-1";
    persistDelta();
  }

  // ----- 辅助函数：保存功德与变化值 -----
  function persistCount() {
    localStorage.setItem('meritCount', currentCount);
  }
  
  function persistDelta() {
    localStorage.setItem('knockDelta', knockDelta);
  }

  // 更新页面功德数字
  function updateCountUI() {
    countDisplay.innerText = currentCount;
    countInput.value = currentCount;
    persistCount();
  }

  // 更新每次敲击数值显示
  function updateDeltaUI() {
    knockValueSpan.value = knockDelta > 0 ? `+${knockDelta}` : `${knockDelta}`;
    persistDelta();
  }

  // 飘字动画 (支持自定义模板，{n} 代表变化量)
  function showFloatingText(delta) {
    const rect = myFishElement.getBoundingClientRect();
    const div = document.createElement('div');
    div.classList.add('subtitleCountTip');
    const template = localStorage.getItem('lensir_floatText') || '梁sir功德 {n}';
    const nStr = delta > 0 ? `+${delta}` : `${delta}`;
    div.innerText = template.replace(/\{n\}/g, nStr);
    document.body.appendChild(div);
    
    // 定位在木鱼周围
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    div.style.left = centerX + 'px';
    div.style.top = centerY + 'px';
    div.style.transform = 'translateX(-50%)';
    
    setTimeout(() => {
      if(div && div.remove) div.remove();
    }, 700);
  }

  // 敲击动画（木鱼缩放、功德数字弹动）
  function playHitAnimation() {
    // 功德数字弹动
    countDisplay.style.transform = 'scale(1.2)';
    myFishElement.style.transform = 'scale(0.92)';
    
    if(animationTimer) clearTimeout(animationTimer);
    animationTimer = setTimeout(() => {
      countDisplay.style.transform = 'scale(1)';
      myFishElement.style.transform = 'scale(1)';
    }, 130);
  }

  // ----- 核心敲击逻辑 -----
  function performKnock() {
    if(knockDelta === 0) return;  // 不允许0变化量
    currentCount += knockDelta;
    updateCountUI();
    playHitAnimation();
    showFloatingText(knockDelta);
  }

  // ----- 修改每次敲击的变化量（强制 ≤ -1）-----
  function changeKnockDelta(step) {
    let newVal = knockDelta + step;
    if(newVal >= 0) return;      // 禁止 0 和正数，最大只允许 -1
    knockDelta = newVal;
    updateDeltaUI();
    // 添加一个小的视觉反馈
    knockValueSpan.style.transform = 'scale(1.1)';
    setTimeout(() => {
      knockValueSpan.style.transform = 'scale(1)';
    }, 100);
  }
  
  function resetKnockDelta() {
    knockDelta = -1;
    updateDeltaUI();
    // 添加视觉反馈
    knockValueSpan.style.transform = 'scale(1.1)';
    setTimeout(() => {
      knockValueSpan.style.transform = 'scale(1)';
    }, 100);
  }

  // ----- 手动设置功德数（新功能）-----
  function setCountManually() {
    let newCount = parseInt(countInput.value, 10);
    if(isNaN(newCount)) {
      newCount = currentCount;
      countInput.value = currentCount;
      return;
    }
    currentCount = newCount;
    updateCountUI();
    // 添加视觉反馈
    countDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
      countDisplay.style.transform = 'scale(1)';
    }, 200);
    // 显示提示飘字
    showFloatingText(currentCount - (currentCount - newCount));
  }

  // ----- 自动敲 (最小20ms, 动态调整)-----
  function restartAutoClick() {
    if(!autoActive) return;
    if(autoIntervalId) clearInterval(autoIntervalId);
    
    let intervalMs = parseInt(intervalInput.value, 10);
    if(isNaN(intervalMs) || intervalMs < 20) {
      intervalMs = 20;
      intervalInput.value = 20;
    }
    // 向上取整保证至少20ms
    intervalMs = Math.max(20, Math.floor(intervalMs));
    intervalInput.value = intervalMs;
    
    autoIntervalId = setInterval(() => {
      performKnock();
    }, intervalMs);
  }
  
  function startAuto() {
    if(autoIntervalId) clearInterval(autoIntervalId);
    autoActive = true;
    autoClickElement.classList.add('confirm');
    autoClickElement.innerText = '⏸ 停止';
    restartAutoClick();
  }
  
  function stopAuto() {
    if(autoIntervalId) {
      clearInterval(autoIntervalId);
      autoIntervalId = null;
    }
    autoActive = false;
    autoClickElement.classList.remove('confirm');
    autoClickElement.innerText = '▶ 自動敲';
  }
  
  function toggleAuto() {
    if(autoActive) {
      stopAuto();
    } else {
      startAuto();
    }
  }

  // 当手动修改间隔输入框时，如果自动模式开启则立即更新频率
  function applyIntervalChange() {
    let rawVal = parseInt(intervalInput.value, 10);
    if(isNaN(rawVal)) rawVal = 500;
    if(rawVal < 20) rawVal = 20;
    intervalInput.value = rawVal;
    if(autoActive) {
      // 重启自动敲以应用新间隔
      if(autoIntervalId) clearInterval(autoIntervalId);
      restartAutoClick();
    }
  }

  // ----- 事件绑定 -----
  // 1. 点击木鱼
  myFishElement.addEventListener('mouseup', (e) => {
    e.stopPropagation();
    performKnock();
    isPressing = false;
  });
  myFishElement.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isPressing = true;
  });
  // 移动端触摸支持
  myFishElement.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isPressing = true;
  });
  myFishElement.addEventListener('touchend', (e) => {
    e.preventDefault();
    performKnock();
    isPressing = false;
  });
  
  // 2. 键盘空格 (考虑长按防连击)
  window.addEventListener('keydown', (e) => {
    if(e.code === 'Space') {
      e.preventDefault();
      if(!isPressing) {
        isPressing = true;
        // 按下时不敲，弹起时才敲（更符合物理触感）
      }
    }
  });
  window.addEventListener('keyup', (e) => {
    if(e.code === 'Space') {
      e.preventDefault();
      if(isPressing) {
        performKnock();
        isPressing = false;
      }
    }
  });
  
  // 3. 自动敲按钮
  autoClickElement.addEventListener('click', toggleAuto);
  
  // 4. 间隔调整时触发实时更新
  intervalInput.addEventListener('change', applyIntervalChange);
  intervalInput.addEventListener('blur', applyIntervalChange);
  
  // 5. 敲击数值控制（已修复 - 现在会实际修改 knockDelta）
  decrementBtn.addEventListener('click', () => changeKnockDelta(-1));
  incrementBtn.addEventListener('click', () => changeKnockDelta(1));
  resetBtn.addEventListener('click', resetKnockDelta);
  
  // 7. 支持直接在 knockValue 输入框输入功德变化量（强制 ≤ -1）
  knockValueSpan.addEventListener('change', function() {
    let raw = this.value.trim().replace(/^\+/, '');
    let val = parseInt(raw, 10);
    if(isNaN(val) || val > -1) {
      // 无效输入（0、正数、非整数）：恢复当前值
      this.value = `${knockDelta}`;
      return;
    }
    knockDelta = val;
    persistDelta();
    this.value = `${knockDelta}`;
    // 视觉反馈
    this.style.transform = 'scale(1.08)';
    setTimeout(() => { this.style.transform = 'scale(1)'; }, 120);
  });
  knockValueSpan.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') { e.preventDefault(); this.blur(); }
    e.stopPropagation();
  });
  
  // 6. 手动设置功德数
  setCountBtn.addEventListener('click', setCountManually);
  countInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
      setCountManually();
    }
  });
  
  // 防止页面空格滚动
  window.addEventListener('keydown', function(e) {
    if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if(e.target === document.body || e.target === document.documentElement || e.target === countInput) {
        // 如果焦点在输入框内，不阻止默认行为
        if(e.target === countInput) return;
        e.preventDefault();
      }
    }
  });
  
  // 避免鼠标移出时状态错误
  window.addEventListener('mouseup', () => {
    isPressing = false;
  });
  
  // 初始化动画过渡效果
  countDisplay.style.transition = 'transform 0.08s cubic-bezier(0.2, 1.2, 0.8, 1)';
  myFishElement.style.transition = 'transform 0.06s linear';
  knockValueSpan.style.transition = 'transform 0.08s ease';
  
  console.log('主要JavaScript腳本加載成功。版本:V5.0.1');
})();