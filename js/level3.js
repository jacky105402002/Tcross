/* ============================================================
   level3.js  — 共用工具（按鈕互動、RWD 橫式遮罩、Cookie 流程守門）
   ※ 已改用 Cookie（session cookie）取代 LocalStorage
   ============================================================ */

/* ========== Cookie Helpers ========== */
/** 建立 session cookie（關閉瀏覽器即清除） */
function setCookie(name, value, opts = {}) {
  // 預設 path=/
  const path = opts.path || "/";
  const sameSite = opts.sameSite || "Lax";
  const secure = opts.secure ?? location.protocol === "https:";
  const encoded = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  let cookie = `${encoded}; path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += "; Secure"; // HTTPS 才會生效
  // 不設定 expires / max-age，成為 session cookie
  document.cookie = cookie;
}

/** 讀取 cookie 值（不存在回傳 null） */
function getCookie(name) {
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)")
  );
  return m ? decodeURIComponent(m[1]) : null;
}

/** 判斷 cookie 值是否為字串 "true" */
function isCookieTrue(name) {
  return getCookie(name) === "true";
}

/** 刪除 cookie（同路徑） */
function deleteCookie(name, opts = {}) {
  const path = opts.path || "/";
  document.cookie =
    encodeURIComponent(name) +
    "=; path=" +
    path +
    "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

/* ========== Route Guards（頁面守門機制） ========== */
/**
 * 若指定 cookie 不為 "true"，就導回 backUrl
 * @param {string} name  cookie 名稱
 * @param {string} backUrl  要導回的頁面（例如 './level3_01.html'）
 */
function requireCookieOrBack(name, backUrl) {
  if (!isCookieTrue(name)) {
    location.replace(backUrl);
  }
}

/* ==========（保留）LocalStorage 安全方法（若仍有舊程式使用） ========== */
/* 共用：安全存取 LocalStorage */
function safeSetLocal(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {
    /* ignore */
  }
}
function safeGetLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/* ========== 圖片按鈕：按下切換 On，放開回 Off，點擊呼叫 callback ========== */
function bindPressSwap(selector, onSrc, offSrc, onClick) {
  const btn = document.querySelector(selector);
  if (!btn) return;
  const img = btn.querySelector("img");

  const press = () => {
    img && (img.src = onSrc);
  };
  const release = () => {
    img && (img.src = offSrc);
  };

  // 滑鼠
  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
  btn.addEventListener("mouseleave", release);

  // 觸控
  btn.addEventListener(
    "touchstart",
    () => {
      press();
    },
    { passive: true }
  );
  btn.addEventListener(
    "touchend",
    () => {
      release();
    },
    { passive: true }
  );
  btn.addEventListener(
    "touchcancel",
    () => {
      release();
    },
    { passive: true }
  );

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof onClick === "function") onClick();
  });
}

/* ========== 手機/平板限定橫式：直式顯示遮罩 ========== */
function handleOrientationMask() {
  const mask = document.getElementById("rotateMask");
  const check = () => {
    const isMobileOrTablet = /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (isMobileOrTablet && isPortrait) {
      mask && (mask.style.display = "block");
    } else {
      mask && (mask.style.display = "none");
    }
  };
  check();
  window.addEventListener("orientationchange", check);
  window.addEventListener("resize", check);
}

/* ===== 導出到全域（若需要在 inline script 直接呼叫） ===== */
window.setCookie = setCookie;
window.getCookie = getCookie;
window.isCookieTrue = isCookieTrue;
window.deleteCookie = deleteCookie;
window.requireCookieOrBack = requireCookieOrBack;
window.bindPressSwap = bindPressSwap;
window.handleOrientationMask = handleOrientationMask;
/* （可選）保留 LocalStorage 便於相容舊碼 */
window.safeSetLocal = safeSetLocal;
window.safeGetLocal = safeGetLocal;
