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
