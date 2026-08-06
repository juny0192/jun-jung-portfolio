(function () {
  'use strict';

  /* ── Nav scroll effect ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Nav links: center section in viewport on click ── */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const rect      = target.getBoundingClientRect();
      const sectionH  = Math.min(rect.height, window.innerHeight);
      const scrollTo  = window.scrollY + rect.top - (window.innerHeight - sectionH) / 2;
      window.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
    });
  });

  /* ── Build slots array (images + AON Charlotte, NC card) ── */
  const gallery = document.getElementById('gallery');
  const { totalPages, aonCharlottePages, handDrawingsCount } = GALLERY_CONFIG;

  // Each slot is { type:'image', pageNum } or { type:'coming-soon' }
  const slots = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!aonCharlottePages.includes(i)) {
      slots.push({ type: 'image', pageNum: i });
    }
  }

  const lastPageNum = slots.filter(s => s.type === 'image').at(-1).pageNum;
  const portfolioImages = slots.map(slot => `images/page-${String(slot.pageNum).padStart(2, '0')}.jpg`);

  slots.forEach((slot, index) => {
    if (slot.type === 'image') {
      const num  = String(slot.pageNum).padStart(2, '0');
      const item = document.createElement('div');
      item.className = 'gallery-item';
      if (slot.pageNum === 1 || slot.pageNum === lastPageNum) {
        item.classList.add('gallery-item--full');
      }
      const img = document.createElement('img');
      img.src     = `images/page-${num}.jpg`;
      img.alt     = `Portfolio page ${slot.pageNum}`;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => openLightbox(portfolioImages, index));
      gallery.appendChild(item);
    }
  });

  /* ── Illustration viewer (one drawing at a time, arrow-to-flip) ── */
  const drawingImages = [];
  if (handDrawingsCount) {
    for (let i = 1; i <= handDrawingsCount; i++) {
      drawingImages.push(`images/hand-drawings/drawing-${String(i).padStart(2, '0')}.jpg`);
    }
  }

  const dv        = document.getElementById('drawing-viewer');
  const dvImg     = document.getElementById('dv-img');
  const dvCounter = document.getElementById('dv-counter');
  const dvPrev    = dv ? dv.querySelector('.dv-prev') : null;
  const dvNext    = dv ? dv.querySelector('.dv-next') : null;

  let dvIndex = 0;

  function showDrawing(index) {
    dvIndex = (index + drawingImages.length) % drawingImages.length;
    dvImg.src = drawingImages[dvIndex];
    dvImg.alt = `Hand drawing ${dvIndex + 1}`;
    dvCounter.textContent = `${String(dvIndex + 1).padStart(2, '0')} / ${String(drawingImages.length).padStart(2, '0')}`;
  }

  if (dv && dvImg && drawingImages.length) {
    showDrawing(0);
    dvPrev.addEventListener('click', () => showDrawing(dvIndex - 1));
    dvNext.addEventListener('click', () => showDrawing(dvIndex + 1));
    dvImg.addEventListener('click', () => openLightbox(drawingImages, dvIndex));
  }

  /* ── Image-download deterrents (right-click + drag) ── */
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' || e.target.classList.contains('img-protect-overlay')) {
      e.preventDefault();
    }
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  /* ── Lightbox ── */
  const lb        = document.getElementById('lightbox');
  const lbImgWrap = lb.querySelector('.lb-img-wrap');
  const lbImg     = lb.querySelector('.lb-img');
  const lbClose   = lb.querySelector('.lb-close');
  const lbPrev    = lb.querySelector('.lb-prev');
  const lbNext    = lb.querySelector('.lb-next');

  let current = 0;
  let currentImages = portfolioImages;

  function openLightbox(images, index) {
    currentImages = images;
    current = index;
    showSlot(current);
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showSlot(index) {
    lbImg.src = currentImages[index];
    lbImgWrap.style.display = '';
  }

  function prev() {
    current = (current - 1 + currentImages.length) % currentImages.length;
    showSlot(current);
  }

  function next() {
    current = (current + 1) % currentImages.length;
    showSlot(current);
  }

  let resumeMode = false;

  function closeAny() {
    closeLightbox();
    if (resumeMode) {
      lb.classList.remove('resume-mode', 'zoomed');
      resumeMode = false;
    }
  }

  // Click resume image to toggle zoom (fit ↔ natural size)
  lbImg.addEventListener('click', (e) => {
    if (!resumeMode) return;
    e.stopPropagation();
    lb.classList.toggle('zoomed');
    if (lb.classList.contains('zoomed')) {
      // Scroll to top-left so user starts reading from the beginning
      lbImgWrap.scrollTop = 0;
      lbImgWrap.scrollLeft = 0;
    }
  });

  lbClose.addEventListener('click', closeAny);
  lbPrev.addEventListener('click', () => { if (!resumeMode) prev(); });
  lbNext.addEventListener('click', () => { if (!resumeMode) next(); });

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeAny();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')     closeAny();
    if (e.key === 'ArrowLeft'  && !resumeMode) prev();
    if (e.key === 'ArrowRight' && !resumeMode) next();
  });

  /* ── View Resume button (hero) — opens lightbox standalone ── */
  const resumeBtn = document.getElementById('view-resume-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeMode = true;
      lbImg.src = 'images/resume/resume-01.jpg';
      lbImgWrap.style.display = '';
      lb.classList.add('resume-mode');
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
})();
