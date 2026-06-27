/**
 * 防篡改全局保護腳本 木魚版 腳本V1.1.0
 */
(function () {
  'use strict';

  /* ============================================================
     常量
     ============================================================ */
  const CORRECT_PWD      = '112233';
  const KEY_PAGE_TITLE   = 'lensir_pageTitle';
  const KEY_HTML_TITLE   = 'lensir_htmlTitle';
  const KEY_FLOAT_TEXT   = 'lensir_floatText';
  const DEFAULT_TITLE    = '🐟 梁sir的木魚';
  const DEFAULT_FLOAT    = '梁sir功德 {n}';
  const TAMPER_INTERVAL  = 5000; // 5 秒

  /* ============================================================
     1. 初始化标题
     ============================================================ */
  const titleEl        = document.getElementById('titleText');
  const subtitleEl     = document.querySelector('.subtitle');
  const savedPageTitle = localStorage.getItem(KEY_PAGE_TITLE) || DEFAULT_TITLE;
  const savedHtmlTitle = localStorage.getItem(KEY_HTML_TITLE) || DEFAULT_TITLE;

  // 记录"正确"的标题值（防篡改用）
  let _correctPageTitle = savedPageTitle;
  let _correctHtmlTitle = savedHtmlTitle;
  const _correctSubtitle = subtitleEl ? subtitleEl.textContent : '';

  if (titleEl) titleEl.textContent = _correctPageTitle;
  document.title = _correctHtmlTitle;

  /* ============================================================
     2. 底部 🐟 点击 → 触发木鱼敲击
     ============================================================ */
  const footerFish = document.getElementById('footerFish');
  const myFishEl   = document.querySelector('.myFish');

  function triggerFishKnock() {
    if (!myFishEl) return;
    myFishEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: false, cancelable: true }));
    setTimeout(function () {
      myFishEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: false, cancelable: true }));
    }, 60);
  }

  if (footerFish) {
    footerFish.addEventListener('click', triggerFishKnock);
    footerFish.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFishKnock(); }
    });
  }

  /* ============================================================
     3. 密码保护设置弹窗（四项设置）
     ============================================================ */
  const overlay       = document.getElementById('settingsOverlay');
  const step1         = document.getElementById('settingsStep1');
  const step2         = document.getElementById('settingsStep2');
  const pwdInput      = document.getElementById('settingsPwd');
  const pwdError      = document.getElementById('settingsPwdError');
  const verifyBtn     = document.getElementById('settingsVerifyBtn');
  const closeBtn      = document.getElementById('settingsCloseBtn');
  const cancelBtn     = document.getElementById('settingsCancelBtn');
  const saveBtn       = document.getElementById('settingsSaveBtn');
  const floatTextInp  = document.getElementById('settingsFloatText');
  const htmlTitleInp  = document.getElementById('settingsHtmlTitle');
  const pageTitleInp  = document.getElementById('settingsPageTitle');
  const meritCountInp = document.getElementById('settingsMeritCount');
  const footerPhrase  = document.getElementById('footerPhrase');

  // ── 打开弹窗 ──
  function openModal() {
    if (!overlay) return;
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    if (pwdInput) pwdInput.value = '';
    if (pwdError) pwdError.textContent = '';
    overlay.classList.remove('hidden');
    setTimeout(function () { if (pwdInput) pwdInput.focus(); }, 80);
  }

  // ── 关闭弹窗 ──
  function closeModal() {
    if (overlay) overlay.classList.add('hidden');
  }

  // ── 验证密码 ──
  function verifyPassword() {
    if (!pwdInput) return;
    if (pwdInput.value === CORRECT_PWD) {
      step1.classList.add('hidden');
      step2.classList.remove('hidden');

      // 预填弹幕模板
      if (floatTextInp) {
        floatTextInp.value = localStorage.getItem(KEY_FLOAT_TEXT) || DEFAULT_FLOAT;
      }
      // 预填标题
      if (htmlTitleInp) htmlTitleInp.value = document.title;
      if (pageTitleInp && titleEl) pageTitleInp.value = titleEl.textContent;
      // 预填功德数
      if (meritCountInp) {
        meritCountInp.value = localStorage.getItem('meritCount') || '0';
      }

      setTimeout(function () { if (floatTextInp) floatTextInp.focus(); }, 80);
    } else {
      if (pwdError) {
        pwdError.textContent = '❌ PIN不正確';
        pwdError.style.animation = 'none';
        requestAnimationFrame(function () { pwdError.style.animation = ''; });
      }
      if (pwdInput) { pwdInput.value = ''; pwdInput.focus(); }
    }
  }

  // ── 保存设置 ──
  function saveSettings() {
    // 1. 弹幕模板
    const tmpl = (floatTextInp && floatTextInp.value.trim()) || DEFAULT_FLOAT;
    localStorage.setItem(KEY_FLOAT_TEXT, tmpl);

    // 2. 浏览器标签页标题
    const newHtmlTitle = (htmlTitleInp && htmlTitleInp.value.trim()) || DEFAULT_TITLE;
    document.title = newHtmlTitle;
    localStorage.setItem(KEY_HTML_TITLE, newHtmlTitle);
    _correctHtmlTitle = newHtmlTitle;

    // 3. 页面显示大标题
    const newPageTitle = (pageTitleInp && pageTitleInp.value.trim()) || DEFAULT_TITLE;
    if (titleEl) titleEl.textContent = newPageTitle;
    localStorage.setItem(KEY_PAGE_TITLE, newPageTitle);
    _correctPageTitle = newPageTitle;

    // 4. 功德数
    if (meritCountInp) {
      const newCount = parseInt(meritCountInp.value, 10);
      if (!isNaN(newCount)) {
        // 通过 main.js 暴露的 #countInput + #setCountBtn 机制设置
        const ci = document.getElementById('countInput');
        const sb = document.getElementById('setCountBtn');
        if (ci && sb) {
          ci.value = newCount;
          sb.click();
        }
      }
    }

    closeModal();

    // 视觉提示
    if (titleEl) {
      titleEl.style.transition = 'filter 0.3s';
      titleEl.style.filter = 'brightness(1.5) drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))';
      setTimeout(function () { titleEl.style.filter = ''; }, 600);
    }
  }

  // ── 事件绑定 ──
  if (footerPhrase) {
    footerPhrase.addEventListener('click', openModal);
    footerPhrase.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });
  }

  if (verifyBtn) verifyBtn.addEventListener('click', verifyPassword);
  if (closeBtn)  closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (saveBtn)   saveBtn.addEventListener('click', saveSettings);

  // 点击背景关闭
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      closeModal();
    }
  });

  // 弹窗内所有输入框：阻止 keydown/keyup 冒泡
  [
    pwdInput, floatTextInp, htmlTitleInp, pageTitleInp, meritCountInp,
    document.getElementById('intervalInput'),
    document.getElementById('countInput'),
    document.getElementById('knockValue'),
  ].forEach(function (el) {
    if (!el) return;
    el.addEventListener('keydown', function (e) { e.stopPropagation(); });
    el.addEventListener('keyup',   function (e) { e.stopPropagation(); });
  });

  // 密码框 Enter → 验证
  if (pwdInput) {
    pwdInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.stopPropagation(); verifyPassword(); }
    });
  }

  // 设置框 Enter → 保存
  [floatTextInp, htmlTitleInp, pageTitleInp, meritCountInp].forEach(function (el) {
    if (!el) return;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.stopPropagation(); saveSettings(); }
    });
  });

  /* ============================================================
     4. 全方位防 F12 篡改
     保护对象：
       a) #countDisplay — 功德数
       b) #titleText    — 页面大标题
       c) .subtitle     — "梁sir的功德"
       d) document.title — 浏览器标签页
     ============================================================ */

  // ── 恢复函数 ──
  function restoreAll() {
    // 功德数
    const countEl = document.getElementById('countDisplay');
    if (countEl) {
      const saved = localStorage.getItem('meritCount') ?? '0';
      if (countEl.innerText !== saved) {
        console.warn('[防篡改] 功德數從', countEl.innerText, '恢復為', saved);
        countEl.innerText = saved;
      }
    }

    // 页面大标题
    if (titleEl && titleEl.textContent !== _correctPageTitle) {
      console.warn('[防篡改] 大標題從', titleEl.textContent, '恢復為', _correctPageTitle);
      titleEl.textContent = _correctPageTitle;
    }

    // 副标题
    if (subtitleEl && subtitleEl.textContent !== _correctSubtitle) {
      console.warn('[防篡改] 副標題恢復');
      subtitleEl.textContent = _correctSubtitle;
    }

    // 浏览器标签页
    if (document.title !== _correctHtmlTitle) {
      console.warn('[防篡改] HTML標題恢復');
      document.title = _correctHtmlTitle;
    }
  }

  // 定时检查（每 5 秒）
  setInterval(function () {
    if (document.visibilityState === 'hidden') return;
    restoreAll();
  }, TAMPER_INTERVAL);

  /* ============================================================
     5. MutationObserver — 监视 #countDisplay + #titleText + .subtitle
     ============================================================ */
  function watchElement(el, label) {
    if (!el || !window.MutationObserver) return;
    const obs = new MutationObserver(function () {
      // 等 main.js 一个 tick 同步 localStorage，再恢复
      setTimeout(restoreAll, 100);
    });
    obs.observe(el, {
      childList:      true,
      characterData:  true,
      subtree:        true,
      attributes:     true,
      attributeFilter: ['contenteditable', 'style'],
    });
  }

  watchElement(document.getElementById('countDisplay'), 'countDisplay');
  watchElement(titleEl, 'titleText');
  watchElement(subtitleEl, 'subtitle');

  /* ============================================================
     6. 防止非输入元素被 contenteditable 编辑
     ============================================================ */
  function lockNonInputs() {
    document.querySelectorAll('*').forEach(function (el) {
      const tag = el.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        el.setAttribute('contenteditable', 'false');
        el.setAttribute('draggable', 'false');
      }
    });
  }
  lockNonInputs();

  // 持续锁定：有人通过 F12 改了 contenteditable 也会立即恢复
  setInterval(lockNonInputs, TAMPER_INTERVAL);

  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  /* ============================================================
     7. 初始化日志
     ============================================================ */
  console.log(
    '%c🐟 梁sir的木鱼 Enhancement v5.0.1',
    'color: #7C3AED; font-weight: bold; font-size: 13px;'
  );
  console.log(
    '  ✦ 清新風格，介面美觀\n' +
    '  ✦ 卡通木魚，響應介面\n' +
    '  ✦ 支援開發人員模式\n' +
    '  ✦ 支援TLS加密連線\n' +
    '  ✦ 輪詢標簽內容防篡改\n' +
    '  ✦ MutationObserver即時檢測\n' +
    '  🚀 V1.1.0 防篡改'
  );

})();
