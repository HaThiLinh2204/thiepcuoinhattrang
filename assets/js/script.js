import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// ---------- Firebase ----------
var fbApp = initializeApp(firebaseConfig);
var db = getFirestore(fbApp);
var wishesCol = collection(db, 'wishes');

// ---------- Envelope intro ----------
var overlay = document.getElementById('envelope-overlay');
var openBtn = document.getElementById('open-invite');
var site = document.getElementById('site');

function openInvite() {
  overlay.classList.add('closed');
  site.classList.remove('hidden');
  document.body.style.overflow = '';
  playMusic();
}

if (openBtn) {
  document.body.style.overflow = 'hidden';
  openBtn.addEventListener('click', openInvite);
} else {
  site.classList.remove('hidden');
}

// ---------- Background music ----------
var music = document.getElementById('bg-music');
var musicBtn = document.getElementById('music-toggle');

function playMusic() {
  if (!music) return;
  music.play().catch(function () {
    // Autoplay blocked (e.g. no prior user gesture) — leave paused, toggle stays off.
    if (musicBtn) {
      musicBtn.classList.remove('is-playing');
      musicBtn.setAttribute('aria-pressed', 'false');
    }
  });
}

if (musicBtn && music) {
  musicBtn.addEventListener('click', function () {
    if (music.paused) {
      music.play().catch(function () {});
      musicBtn.classList.add('is-playing');
      musicBtn.setAttribute('aria-pressed', 'true');
    } else {
      music.pause();
      musicBtn.classList.remove('is-playing');
      musicBtn.setAttribute('aria-pressed', 'false');
    }
  });
}

// ---------- Reveal on scroll ----------
var revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    revealEls.forEach(function (el, i) {
      if (!el.style.getPropertyValue('--reveal-delay')) {
        el.style.setProperty('--reveal-delay', Math.min(i % 3, 2) * 0.12 + 's');
      }
    });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }
}

// ---------- Back to top ----------
var backToTop = document.getElementById('back-to-top');
if (backToTop) {
  var toggleBackToTop = function () {
    if (window.scrollY > window.innerHeight * 0.8) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---------- Countdown ----------
var WEDDING_DATE = new Date('2026-10-18T08:00:00+07:00').getTime();
var elDays = document.getElementById('cd-days');
var elHours = document.getElementById('cd-hours');
var elMins = document.getElementById('cd-mins');
var elSecs = document.getElementById('cd-secs');

function pad(n) { return String(n).padStart(2, '0'); }

function tickCountdown() {
  var diff = WEDDING_DATE - Date.now();
  if (diff <= 0) {
    elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
    return;
  }
  var days = Math.floor(diff / 86400000);
  var hours = Math.floor((diff % 86400000) / 3600000);
  var mins = Math.floor((diff % 3600000) / 60000);
  var secs = Math.floor((diff % 60000) / 1000);
  elDays.textContent = pad(days);
  elHours.textContent = pad(hours);
  elMins.textContent = pad(mins);
  elSecs.textContent = pad(secs);
}

if (elDays) {
  tickCountdown();
  setInterval(tickCountdown, 1000);
}

// ---------- Gallery lightbox ----------
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');
var lightboxClose = document.getElementById('lightbox-close');
var lightboxPrev = document.getElementById('lightbox-prev');
var lightboxNext = document.getElementById('lightbox-next');
var galleryImgs = document.querySelectorAll('.gallery-item img');

if (lightbox && lightboxImg && galleryImgs.length) {
  var lastFocusedGallery = null;
  var currentIndex = 0;

  var showImage = function (index) {
    currentIndex = (index + galleryImgs.length) % galleryImgs.length;
    var img = galleryImgs[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  };

  var openLightbox = function (index) {
    lastFocusedGallery = document.activeElement;
    showImage(index);
    lightbox.classList.add('is-open');
    document.body.classList.add('no-scroll');
  };

  var closeLightbox = function () {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    lightboxImg.src = '';
    if (lastFocusedGallery && lastFocusedGallery.focus) lastFocusedGallery.focus();
  };

  galleryImgs.forEach(function (img, index) {
    img.addEventListener('click', function () { openLightbox(index); });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showImage(currentIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showImage(currentIndex + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  var touchStartX = null;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) showImage(currentIndex + 1);
      else showImage(currentIndex - 1);
    }
    touchStartX = null;
  }, { passive: true });
}

// ---------- Copy account number ----------
var copyBtns = document.querySelectorAll('.btn-copy');
copyBtns.forEach(function (copyBtn) {
  copyBtn.addEventListener('click', function () {
    var value = copyBtn.dataset.copy;
    var restore = function () {
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyBtn.setAttribute('aria-label', 'Sao chép số tài khoản');
      }, 1800);
    };
    var done = function () {
      copyBtn.classList.add('copied');
      copyBtn.setAttribute('aria-label', 'Đã sao chép số tài khoản');
      restore();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  });
});

// ---------- Wishes wall (shared, stored in Firestore) ----------
var list = document.getElementById('wish-list');
var bubbleLayer = document.getElementById('wish-bubbles');

var SAMPLE_WISHES = [
  { name: 'Gia đình bạn Thảo', message: 'Chúc hai bạn trăm năm hạnh phúc nhé!' },
  { name: 'Bạn Hương', message: 'Chúc mừng đôi chim nhạn 🎉' },
  { name: 'Anh Toàn', message: 'Chúc hai em trăm năm hạnh phúc' },
  { name: 'Chị Hảo', message: 'Chúc em trăm năm hạnh phúc nhé 💐' },
];

var latestWishes = [];
var firstSnapshot = true;

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderWishes(docs) {
  if (!list) return;
  if (!docs.length) {
    list.innerHTML = '<p class="wish-empty">Hãy là người đầu tiên gửi lời chúc phúc đến cô dâu chú rể 💕</p>';
    return;
  }
  list.innerHTML = docs
    .map(function (w) {
      return '<div class="wish-card"><strong>' + escapeHtml(w.name) + '</strong><p>' + escapeHtml(w.message) + '</p></div>';
    })
    .join('');
}

function spawnWishBubble(wish) {
  if (!bubbleLayer || !wish) return;
  var el = document.createElement('div');
  el.className = 'wish-bubble';
  el.innerHTML = '<p><strong>' + escapeHtml(wish.name) + ':</strong> ' + escapeHtml(wish.message) + '</p>';
  el.style.left = (4 + Math.random() * 10) + '%';
  el.style.animationDuration = (6 + Math.random() * 2.5) + 's';
  bubbleLayer.appendChild(el);
  el.addEventListener('animationend', function () {
    el.remove();
  });
}

if (list) {
  var wishesQuery = query(wishesCol, orderBy('time', 'desc'), limit(200));
  onSnapshot(
    wishesQuery,
    function (snapshot) {
      var docs = snapshot.docs.map(function (d) { return d.data(); });
      latestWishes = docs;
      renderWishes(docs);

      if (!firstSnapshot) {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === 'added') {
            spawnWishBubble(change.doc.data());
          }
        });
      }
      firstSnapshot = false;
    },
    function () {
      list.innerHTML = '<p class="wish-empty">Không tải được lời chúc, vui lòng thử lại sau.</p>';
    }
  );
}

// ---------- Floating wish bubbles (ambient, when nothing new has arrived) ----------
(function cycleBubbles() {
  function tick() {
    var pool = latestWishes.length ? latestWishes : SAMPLE_WISHES;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    spawnWishBubble(pick);
    setTimeout(tick, 5000 + Math.random() * 3000);
  }
  setTimeout(tick, 2200);
})();

function submitWish(nameInput, msgInput, submitBtn, onDone) {
  var name = nameInput.value.trim();
  var message = msgInput.value.trim();
  if (!name || !message) return;

  if (submitBtn) submitBtn.disabled = true;
  addDoc(wishesCol, { name: name, message: message, time: serverTimestamp() })
    .then(function () {
      nameInput.value = '';
      msgInput.value = '';
      if (onDone) onDone();
    })
    .catch(function () {
      window.alert('Gửi lời chúc thất bại, vui lòng thử lại.');
    })
    .finally(function () {
      if (submitBtn) submitBtn.disabled = false;
    });
}

// ---------- "Send wish" popup modal (opened from footer or bottom bar) ----------
var wishModal = document.getElementById('wish-modal');
var footerWishBtn = document.getElementById('footer-wish-btn');
var wishModalForm = document.getElementById('wish-modal-form');
var modalName = document.getElementById('modal-name');
var modalMsg = document.getElementById('modal-msg');

if (wishModal && wishModalForm) {
  var modalSubmitBtn = wishModalForm.querySelector('.wish-modal-submit');
  var lastFocused = null;

  function openWishModal() {
    lastFocused = document.activeElement;
    wishModal.hidden = false;
    document.body.classList.add('no-scroll');
    modalName.focus();
  }

  function closeWishModal() {
    wishModal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (footerWishBtn) footerWishBtn.addEventListener('click', openWishModal);

  wishModal.querySelectorAll('[data-wish-close]').forEach(function (el) {
    el.addEventListener('click', closeWishModal);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !wishModal.hidden) closeWishModal();
  });

  wishModalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitWish(modalName, modalMsg, modalSubmitBtn, closeWishModal);
  });
}
