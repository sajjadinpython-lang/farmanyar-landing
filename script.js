/* ═══════════════════════════════════════════
   فرمانیار — اسکریپت صفحه دمو
   تم روشن/تاریک · انیمیشن ظاهرشدن · fallback تصاویر
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── تعویض تم روشن/تاریک ─────────────────── */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');

  function applyTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('farmanyar-theme', t); } catch (e) { /* حالت ناشناس */ }
    if (toggle) {
      toggle.setAttribute('aria-label', t === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── انیمیشن ظاهرشدن هنگام اسکرول ─────────── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── تصویر بخش راهنمای فعال‌سازی وبهوک ──────
     تصویر اختصاصی (assets/webhook-guide.webp) در خود HTML قرار دارد؛
     اگر به هر دلیلی یافت نشد، تصویر تنظیمات تلگرام جایگزین می‌شود. */
  var webhookImg = document.getElementById('webhookShot');
  if (webhookImg) {
    var wbFbUsed = false;
    function wbFallback() {
      if (wbFbUsed) return;
      wbFbUsed = true;
      webhookImg.src = 'assets/telegram.webp';
    }
    webhookImg.addEventListener('error', wbFallback);
    /* اگر تصویر پیش از اجرای اسکریپت خطا داده باشد */
    if (webhookImg.complete && webhookImg.naturalWidth < 2) wbFallback();
  }

  /* ── تصاویر کارت تأیید (نمونه دستورها) ──────
     تصاویر (assets/approvals/command-1.webp و command-2.webp) مستقیم در
     HTML قرار دارند؛ این بخش فقط قاب را پس از بارگذاری سبک می‌کند و
     اگر فایلی نبود، کادر خالی نشان می‌دهد. */
  document.querySelectorAll('.approval[data-approval]').forEach(function (box) {
    var img = box.querySelector('img');
    if (!img) return;

    function markLoaded() {
      if (img.naturalWidth > 2) box.classList.add('is-loaded');
    }

    img.addEventListener('load', markLoaded);
    img.addEventListener('error', function () {
      img.removeAttribute('src');
      box.classList.remove('is-loaded');
    });

    /* اگر تصویر پیش از اجرای اسکریپت بارگذاری شده باشد */
    if (img.complete) markLoaded();
  });

  /* ── لایت‌باکس: نمایش تصاویر در ابعاد اصلی ──
     با کلیک روی اسکرین‌شات‌ها و کارت‌های تأیید، تصویر در یک پوشش تمام‌صفحه
     و دقیقاً در ابعاد طبیعی‌اش (پیکسل‌به‌پیکسل) نمایش داده می‌شود؛
     اگر از صفحه بزرگ‌تر باشد، با اسکرول قابل مشاهده است. */
  var zoomImgs = document.querySelectorAll('.shot img, .approval img');
  var lbEl = null;
  var lbLastFocus = null;

  function lbClose() {
    if (!lbEl) return;
    lbEl.remove();
    lbEl = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', lbKeydown);
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
  }

  function lbKeydown(e) {
    if (e.key === 'Escape' || e.keyCode === 27) lbClose();
  }

  function lbOpen(img) {
    if (lbEl) lbClose();
    lbLastFocus = document.activeElement;

    var naturalW = img.naturalWidth;
    var naturalH = img.naturalHeight;

    lbEl = document.createElement('div');
    lbEl.className = 'lightbox';
    lbEl.setAttribute('role', 'dialog');
    lbEl.setAttribute('aria-modal', 'true');
    lbEl.setAttribute('aria-label', 'نمایش تصویر در ابعاد اصلی');

    /* نوار بالا: دکمهٔ بستن، ابعاد، باز کردن در تب جدید */
    var bar = document.createElement('div');
    bar.className = 'lightbox-bar';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'lb-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'بستن نمایش تصویر');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    closeBtn.addEventListener('click', lbClose);

    var sizeNote = document.createElement('span');
    sizeNote.className = 'lb-size';
    sizeNote.textContent = naturalW + ' \u00D7 ' + naturalH + ' px';

    var openLink = document.createElement('a');
    openLink.className = 'lb-open';
    openLink.href = img.currentSrc || img.src;
    openLink.target = '_blank';
    openLink.rel = 'noopener';
    openLink.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg> باز کردن در تب جدید';

    bar.appendChild(closeBtn);
    bar.appendChild(sizeNote);
    bar.appendChild(openLink);

    /* صحنهٔ اسکرول‌شونده با تصویر در ابعاد اصلی */
    var stage = document.createElement('div');
    stage.className = 'lightbox-stage';
    var big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    big.draggable = false;
    /* تا بارگذاری کامل، ابعاد طبیعی را که از قبل می‌دانیم تنظیم می‌کنیم
       تا پرش چیدمان نداشته باشیم */
    if (naturalW > 2) {
      big.width = naturalW;
      big.height = naturalH;
    }
    big.addEventListener('load', function () { big.removeAttribute('width'); big.removeAttribute('height'); });
    stage.appendChild(big);

    var hint = document.createElement('div');
    hint.className = 'lightbox-hint';
    hint.textContent = 'تصویر در اندازهٔ اصلی نمایش داده می‌شود — برای بستن، Esc یا دکمهٔ بستن';

    lbEl.appendChild(bar);
    lbEl.appendChild(stage);
    lbEl.appendChild(hint);

    /* کلیک روی پس‌زمینه (نه خود تصویر) → بستن */
    lbEl.addEventListener('click', function (e) {
      if (e.target === lbEl || e.target === stage || e.target === hint) lbClose();
    });

    document.body.appendChild(lbEl);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', lbKeydown);
    closeBtn.focus();
  }

  zoomImgs.forEach(function (img) {
    img.setAttribute('title', 'نمایش در اندازهٔ اصلی');
    img.addEventListener('click', function () {
      if (img.naturalWidth > 2) lbOpen(img);
    });
  });

  /* ── هایلایت لینک فعال در ناوبری ──────────── */
  var navLinks = document.querySelectorAll('.main-nav a');
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ link: a, sec: sec });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          sections.forEach(function (s) { s.link.style.color = ''; s.link.style.background = ''; });
          var active = sections.filter(function (s) { return s.sec === e.target; })[0];
          if (active) {
            active.link.style.color = 'var(--accent-strong)';
            active.link.style.background = 'var(--accent-soft)';
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { secIO.observe(s.sec); });
  }
})();
