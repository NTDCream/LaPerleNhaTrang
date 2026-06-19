/* ========== HEADER SCROLL ========== */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

/* ========== MOBILE MENU ========== */
const menuToggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-list');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navList.classList.toggle('open');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navList.classList.remove('open');
    });
  });
}

/* ========== SCROLL REVEAL ========== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ========== TABS (Location & Floorplan) ========== */
document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    const parent = btn.closest('.section, section');
    // Deactivate siblings
    btn.parentElement.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Show correct content
    const allContents = parent.querySelectorAll('[id^="tab-"]');
    allContents.forEach(c => c.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
  });
});

/* ========== COUNTER ANIMATION ========== */
const counters = document.querySelectorAll('[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const increment = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current + suffix;
      }, 25);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(el => counterObserver.observe(el));


/* ========== LIGHTBOX ========== */
const lightbox = document.getElementById('custom-lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbClose = lightbox.querySelector('.custom-lightbox-close');
  const lbPrev = lightbox.querySelector('.custom-lightbox-nav.prev');
  const lbNext = lightbox.querySelector('.custom-lightbox-nav.next');
  let lbCounter = lightbox.querySelector('.custom-lightbox-counter');
  // Create counter element if not in HTML
  if (!lbCounter) {
    lbCounter = document.createElement('span');
    lbCounter.classList.add('custom-lightbox-counter');
    lightbox.appendChild(lbCounter);
  }

  let lbThumbsContainer = lightbox.querySelector('.custom-lightbox-thumbnails');
  if (!lbThumbsContainer) {
    lbThumbsContainer = document.createElement('div');
    lbThumbsContainer.classList.add('custom-lightbox-thumbnails');
    lightbox.appendChild(lbThumbsContainer);
  }

  let currentGroup = []; // src array for the active group
  let lbIndex = 0;

  /**
   * Find the closest grouping container for a custom-lightbox-trigger image.
   * Priority: .marquee-wrapper / .amenity-grid > .plan-tab-content / .loc-tab-content > section / .section
   */
  function getGroup(triggerImg) {
    const customGroup = triggerImg.closest('.marquee-wrapper, .amenity-grid');
    if (customGroup) return customGroup;
    const tabContent = triggerImg.closest('.plan-tab-content, .loc-tab-content');
    if (tabContent) return tabContent;
    const section = triggerImg.closest('section, .section');
    if (section) return section;
    return document.body;
  }

  // Attach click listeners to all lightbox triggers
  document.querySelectorAll('.custom-lightbox-trigger').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const container = getGroup(img);
      const groupImages = container.querySelectorAll('.custom-lightbox-trigger');
      currentGroup = [];
      lbThumbsContainer.innerHTML = '';
      let clickedIndex = 0;
      groupImages.forEach((gImg, i) => {
        const src = gImg.src || gImg.dataset.src;
        currentGroup.push(src);
        if (gImg === img) clickedIndex = i;

        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.classList.add('custom-lightbox-thumb');
        thumb.addEventListener('click', (e) => {
          e.stopPropagation();
          lbIndex = i;
          updateLightbox();
        });
        lbThumbsContainer.appendChild(thumb);
      });
      lbIndex = clickedIndex;
      showLightbox();
    });
  });

  function updateLightbox() {
    lbImg.src = currentGroup[lbIndex];
    lbCounter.textContent = (lbIndex + 1) + ' / ' + currentGroup.length;

    // Update active thumb
    const thumbs = lbThumbsContainer.querySelectorAll('.custom-lightbox-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === lbIndex);
      if (i === lbIndex) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function showLightbox() {
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function hideLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', hideLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); lbIndex = (lbIndex - 1 + currentGroup.length) % currentGroup.length; updateLightbox(); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); lbIndex = (lbIndex + 1) % currentGroup.length; updateLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
    if (e.key === 'ArrowRight' && lbNext) lbNext.click();
  });
}

/* ========== ACTIVE NAV LINK ========== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});



/* ========== FORM SUBMIT TO GOOGLE SHEETS ========== */
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-contact-form');

if (contactForm && submitBtn) {
  submitBtn.addEventListener('click', function (e) {
    e.preventDefault();

    // Tự động kiểm tra các trường bắt buộc (required, pattern) trước khi gửi
    if (!contactForm.reportValidity()) {
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang gửi...';
    submitBtn.disabled = true;

    // TODO: Thay bằng URL Web App của Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwkjAub6RIIFvf05r0eXqO215t6VY7oLA49Zqid2WDx-htetpBZ3-05C6UR7varls97jg/exec';

    const formData = new FormData(contactForm);

    fetch(scriptURL, { method: 'POST', body: formData })
      .then(response => {
        submitBtn.textContent = 'Gửi thành công!';
        submitBtn.style.setProperty('background', '#28a745', 'important');
        submitBtn.style.setProperty('color', '#fff', 'important');
        contactForm.reset();

        // Đợi 3 giây rồi quay về trạng thái cũ
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.removeProperty('background');
          submitBtn.style.removeProperty('color');
        }, 3000);
      })
      .catch(error => {
        console.error('Error!', error.message);
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  });
}
