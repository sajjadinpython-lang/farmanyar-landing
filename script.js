/* ═══════════════════════════════════════════
   فرمانیار — اسکریپت صفحه دمو
   تم روشن/تاریک · انیمیشن ظاهرشدن · بارگذاری تصاویر تأیید
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
     تصویر اختصاصی این بخش را با نام webhook-guide و هر یک از
     پسوندهای زیر در پوشهٔ assets قرار دهید؛ در صورت نبودِ فایل،
     تصویر پیش‌فرض (telegram.webp) نمایش داده می‌شود. */
  var webhookImg = document.getElementById('webhookShot');
  if (webhookImg) {
    var wIdx = 0;
    var wExts = ['png', 'webp', 'jpg', 'jpeg', 'gif'];

    function tryWebhook() {
      if (wIdx >= wExts.length) {
        /* تصویر اختصاصی پیدا نشد — پیش‌فرض */
        webhookImg.src = 'assets/telegram.webp';
        return;
      }
      webhookImg.src = 'assets/webhook-guide.' + wExts[wIdx++];
    }

    webhookImg.addEventListener('error', tryWebhook);
    tryWebhook();
  }

  /* ── تصاویر کارت تأیید (نمونه دستورها) ──────
     فایل را با هر یک از این پسوندها در پوشهٔ
     assets/approvals قرار دهید؛ خودکار پیدا و نمایش داده می‌شود. */
  var EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'gif'];

  document.querySelectorAll('.approval[data-approval]').forEach(function (box) {
    var img = box.querySelector('img');
    var hint = box.querySelector('.empty-hint');
    if (!img) return;
    var idx = 0;

    function tryNext() {
      if (idx >= EXTENSIONS.length) {
        /* هیچ فایلی پیدا نشد — راهنمای جای‌گذاری نمایش داده می‌شود */
        img.removeAttribute('src');
        box.classList.remove('is-loaded');
        if (hint) hint.style.display = '';
        return;
      }
      var ext = EXTENSIONS[idx++];
      img.src = 'assets/approvals/' + box.dataset.approval + '.' + ext;
    }

    img.addEventListener('error', function () {
      /* فایل با این پسوند نبود؛ پسوند بعدی امتحان شود */
      tryNext();
    });
    img.addEventListener('load', function () {
      if (img.naturalWidth > 2) {
        box.classList.add('is-loaded');
        if (hint) hint.style.display = 'none';
      } else {
        tryNext();
      }
    });

    if (hint) hint.style.display = 'none'; /* تا زمانی که نتیجه معلوم نشود */
    tryNext();
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
