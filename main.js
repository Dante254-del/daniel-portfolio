/* ============================================================
   main.js — Portfolio  |  Works on file://, http://, https://
   Enhanced motion (IntersectionObserver reveals, staggered bars,
   magnetic buttons, hero parallax) + real email delivery via
   Formspree (see the comment above the <form> in index.html).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------------------------------- */
  /*  SAFE STORAGE  (localStorage fails on file://)     */
  /* -------------------------------------------------- */
  var store = {
    get: function(k) { try { return localStorage.getItem(k); } catch(e) { return null; } },
    set: function(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }
  };

  /* -------------------------------------------------- */
  /*  DARK / LIGHT TOGGLE                               */
  /* -------------------------------------------------- */
  var themeBtn = document.getElementById('themeBtn');

  function applyTheme(dark) {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    if (themeBtn) {
      themeBtn.textContent = dark ? '☀️' : '🌙';
      themeBtn.setAttribute('title', dark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  }

  var savedTheme = store.get('theme');
  applyTheme(savedTheme === 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark');
      applyTheme(!isDark);
      store.set('theme', !isDark ? 'dark' : 'light');
    });
  }

  /* -------------------------------------------------- */
  /*  HAMBURGER MENU                                    */
  /* -------------------------------------------------- */
  var ham       = document.getElementById('ham');
  var mobileNav = document.getElementById('mobileNav');

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (ham) {
      var s = ham.querySelectorAll('span');
      s[0].style.transform = '';
      s[1].style.opacity   = '';
      s[2].style.transform = '';
    }
  }

  if (ham && mobileNav) {
    ham.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      var s = ham.querySelectorAll('span');
      if (open) {
        s[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        s[1].style.opacity   = '0';
        s[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        closeMenu();
      }
    });
    document.querySelectorAll('.mob-link').forEach(function(a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* -------------------------------------------------- */
  /*  TYPING / TYPEWRITER EFFECT                        */
  /* -------------------------------------------------- */
  var typedEl = document.getElementById('typed');

  if (typedEl) {
    var words = [
      'Computer Science Student',
      'Full-Stack Developer',
      'Cybersecurity Enthusiast',
      'Problem Solver',
      'Open Source Contributor',
      'AI & ML Explorer'
    ];
    var wIdx = 0, cIdx = 0, deleting = false;

    function typeStep() {
      var word = words[wIdx];
      if (!deleting) {
        cIdx++;
        typedEl.textContent = word.slice(0, cIdx);
        if (cIdx === word.length) {
          deleting = true;
          setTimeout(typeStep, 1800);
          return;
        }
        setTimeout(typeStep, 90);
      } else {
        cIdx--;
        typedEl.textContent = word.slice(0, cIdx);
        if (cIdx === 0) {
          deleting = false;
          wIdx = (wIdx + 1) % words.length;
          setTimeout(typeStep, 400);
          return;
        }
        setTimeout(typeStep, 45);
      }
    }
    setTimeout(typeStep, 600);
  }

  /* -------------------------------------------------- */
  /*  SCROLL REVEAL — IntersectionObserver (smoother,   */
  /*  cheaper than scroll-polling; falls back gracefully)*/
  /* -------------------------------------------------- */
  document.body.classList.add('js-ready');
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('show'); });
  }
  // hard fallback in case something is mis-measured
  setTimeout(function () {
    reveals.forEach(function (el) { el.classList.add('show'); });
  }, 2500);

  /* -------------------------------------------------- */
  /*  SKILL BARS — staggered fill                       */
  /* -------------------------------------------------- */
  var skillCards = document.querySelectorAll('.skill-card');

  function fillBars(card) {
    var bars = card.querySelectorAll('.bar-fill');
    bars.forEach(function (bar, idx) {
      setTimeout(function () {
        bar.style.width = (bar.getAttribute('data-w') || 0) + '%';
      }, idx * 60);
    });
  }

  var barsFilled = new WeakSet();
  function checkBars() {
    var wh = window.innerHeight;
    skillCards.forEach(function (card) {
      if (!barsFilled.has(card) && card.getBoundingClientRect().top < wh - 60) {
        barsFilled.add(card);
        fillBars(card);
      }
    });
  }

  setTimeout(checkBars, 300);
  window.addEventListener('scroll', checkBars, { passive: true });

  /* -------------------------------------------------- */
  /*  PROJECT FILTER — with a little pop-in animation   */
  /* -------------------------------------------------- */
  var fBtns = document.querySelectorAll('.f-btn');
  fBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      fBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-f');
      document.querySelectorAll('.proj-card').forEach(function (card) {
        var match = (f === 'all' || card.getAttribute('data-cat') === f);
        if (match) {
          card.style.display = 'flex';
          card.style.animation = 'none';
          void card.offsetWidth; // restart animation
          card.style.animation = 'popIn .45s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* -------------------------------------------------- */
  /*  CONTACT FORM — real email delivery via Formspree  */
  /*  (AJAX so the page never reloads). To activate:     */
  /*   1. Create a free form at https://formspree.io     */
  /*      using danielmikuro29@gmail.com                 */
  /*   2. Put the endpoint it gives you in the form's     */
  /*      action="" attribute in index.html, replacing    */
  /*      YOUR_FORM_ID.                                   */
  /*  Every submission then lands straight in that inbox. */
  /* -------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.f-submit');
      var successMsg = document.getElementById('formSuccess');
      var errorMsg = document.getElementById('formError');
      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      var action = form.getAttribute('action') || '';
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        if (errorMsg) {
          errorMsg.textContent = "⚠️ Form isn't connected yet — add your Formspree endpoint, or email danielmikuro29@gmail.com directly.";
          errorMsg.style.display = 'block';
        }
        return;
      }

      btn.textContent = 'Sending…';
      btn.disabled = true;

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            btn.textContent = 'Message Sent ✓';
            if (successMsg) successMsg.style.display = 'block';
            form.reset();
          } else {
            throw new Error('Send failed');
          }
        })
        .catch(function () {
          btn.textContent = 'Send Message';
          if (errorMsg) errorMsg.style.display = 'block';
        })
        .finally(function () {
          btn.disabled = false;
          setTimeout(function () {
            btn.textContent = 'Send Message';
            if (successMsg) successMsg.style.display = 'none';
          }, 5000);
        });
    });
  }

  /* -------------------------------------------------- */
  /*  ACTIVE NAV + BACK TO TOP                         */
  /* -------------------------------------------------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a');
  var btt      = document.getElementById('btt');

  window.addEventListener('scroll', function() {
    var cur = '';
    sections.forEach(function(s) {
      if (window.scrollY >= s.offsetTop - 150) cur = s.id;
    });
    navLinks.forEach(function(a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + cur || href.endsWith('#' + cur));
    });
    if (btt) btt.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  if (btt) {
    btt.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------- */
  /*  COUNTER ANIMATION (stats in hero)                */
  /* -------------------------------------------------- */
  var counters = document.querySelectorAll('.stat-num');
  var counted  = false;

  function runCounters() {
    if (counted) return;
    var heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;
    var rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      counted = true;
      counters.forEach(function(el) {
        var text  = el.textContent.trim();
        var num   = parseInt(text);
        var suffix = text.replace(/[0-9]/g, '');
        if (isNaN(num)) return;
        var dur   = 1200;
        var step  = 16;
        var steps = dur / step;
        var inc   = num / steps;
        var cur   = 0;
        var timer = setInterval(function() {
          cur += inc;
          if (cur >= num) { cur = num; clearInterval(timer); }
          el.textContent = Math.floor(cur) + suffix;
        }, step);
      });
    }
  }

  window.addEventListener('scroll', runCounters, { passive: true });
  setTimeout(runCounters, 800);

  /* -------------------------------------------------- */
  /*  NAVBAR SHADOW ON SCROLL                          */
  /* -------------------------------------------------- */
  var navEl = document.querySelector('nav');
  window.addEventListener('scroll', function() {
    if (!navEl) return;
    navEl.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
  }, { passive: true });

  /* -------------------------------------------------- */
  /*  SCROLL PROGRESS BAR                              */
  /* -------------------------------------------------- */
  var scrollBar = document.getElementById('scroll-bar');
  if (scrollBar) {
    window.addEventListener('scroll', function() {
      var total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
      scrollBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* -------------------------------------------------- */
  /*  TILT EFFECT ON PROJECT CARDS                     */
  /* -------------------------------------------------- */
  document.querySelectorAll('.proj-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width  / 2;
      var cy = rect.height / 2;
      var rotX =  (y - cy) / cy * 4;
      var rotY = -(x - cx) / cx * 4;
      card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });

  /* -------------------------------------------------- */
  /*  MAGNETIC GLOW ON BUTTONS (motion-graphic accent)  */
  /* -------------------------------------------------- */
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = this.getBoundingClientRect();
      this.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      this.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  /* -------------------------------------------------- */
  /*  HERO IMAGE PARALLAX ON MOUSE MOVE                */
  /* -------------------------------------------------- */
  var heroWrap = document.getElementById('heroImgWrap');
  var heroSection = document.getElementById('hero');
  if (heroWrap && heroSection && window.matchMedia('(min-width:961px)').matches) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = this.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      heroWrap.style.transform = 'translate(' + (relX * 14) + 'px,' + (relY * 14) + 'px)';
    });
    heroSection.addEventListener('mouseleave', function () {
      heroWrap.style.transition = 'transform .4s ease';
      heroWrap.style.transform = '';
    });
  }

  /* -------------------------------------------------- */
  /*  RIPPLE EFFECT ON BUTTONS                         */
  /* -------------------------------------------------- */
  document.querySelectorAll('.btn, .nav-cta, .f-btn, .f-submit').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var r = document.createElement('span');
      r.className = 'ripple';
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      r.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - rect.left - size/2) + 'px;' +
        'top:'  + (e.clientY - rect.top  - size/2) + 'px;' +
        'background:rgba(255,255,255,0.3);transform:scale(0);' +
        'animation:ripple 0.5s ease-out forwards;';
      var old = btn.style.position;
      if (!old || old === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      setTimeout(function() { r.remove(); }, 600);
    });
  });

}); // end DOMContentLoaded
