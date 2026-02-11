/* ============================================================
   WELLNESS INSTITUTE OF NEURODEVELOPMENT - SCRIPTS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- NAVIGATION ---------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll behavior
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('nav--scrolled', scrollY > 40);
    lastScroll = scrollY;
  }, { passive: true });

  // Mobile toggle
  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('nav__toggle--open');
    navLinks.classList.toggle('nav__links--mobile-open');
  });

  // Close mobile menu on link click
  navLinks?.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle?.classList.remove('nav__toggle--open');
      navLinks.classList.remove('nav__links--mobile-open');
    });
  });

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav__link');
  function highlightNav() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinkEls.forEach(link => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ---------- STATS COUNTER ANIMATION ---------- */
  const statNumbers = document.querySelectorAll('.stats-bar__number[data-target]');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        if (target >= 1000) {
          el.textContent = '+' + current.toLocaleString();
        } else {
          el.textContent = current;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      requestAnimationFrame(update);
    });
  }

  /* ---------- TESTIMONIAL CAROUSEL ---------- */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (track) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;
    let slidesPerView = 1;
    let totalSlides = cards.length;

    function updateSlidesPerView() {
      if (window.innerWidth >= 1024) slidesPerView = 3;
      else if (window.innerWidth >= 768) slidesPerView = 2;
      else slidesPerView = 1;
    }

    function getTotalPages() {
      return Math.max(1, totalSlides - slidesPerView + 1);
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const pages = getTotalPages();
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === currentSlide ? ' carousel__dot--active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goToSlide(index) {
      const pages = getTotalPages();
      currentSlide = Math.max(0, Math.min(index, pages - 1));

      const cardWidth = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const offset = currentSlide * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      dotsContainer?.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('carousel__dot--active', i === currentSlide);
      });
    }

    prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
      }
    }, { passive: true });

    // Auto-advance
    let autoPlay = setInterval(() => goToSlide(currentSlide + 1 >= getTotalPages() ? 0 : currentSlide + 1), 6000);

    track.closest('.testimonial-carousel')?.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.closest('.testimonial-carousel')?.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goToSlide(currentSlide + 1 >= getTotalPages() ? 0 : currentSlide + 1), 6000);
    });

    function initCarousel() {
      updateSlidesPerView();
      buildDots();
      goToSlide(0);
    }

    initCarousel();
    window.addEventListener('resize', () => {
      updateSlidesPerView();
      buildDots();
      goToSlide(Math.min(currentSlide, getTotalPages() - 1));
    });
  }

  /* ---------- SCROLL ANIMATIONS ---------- */
  const animatedElements = document.querySelectorAll(
    '.condition-card, .treatment-card, .method__step, .about__image-frame, .about__content, ' +
    '.contact__form-col, .contact__info-col, .mission__inner, .section-tag, .section-title'
  );

  animatedElements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in--visible');

        // Trigger stats animation when stats bar is visible
        if (entry.target.closest('.stats-bar') || entry.target.classList.contains('stats-bar__number')) {
          animateStats();
        }

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  // Also observe stats bar
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsBar);
  }

  /* ---------- STICKY MOBILE CTA ---------- */
  const stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    const showThreshold = 600;
    window.addEventListener('scroll', () => {
      stickyCta.classList.toggle('sticky-cta--visible', window.scrollY > showThreshold);
    }, { passive: true });
  }

  /* ---------- CONTACT FORM ---------- */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.contact__submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Message Sent!
    `;
    submitBtn.style.background = 'var(--green-500)';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
      contactForm.reset();
    }, 3000);
  });

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
