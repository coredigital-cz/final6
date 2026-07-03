/* CLIMA EXPERT HVAC — shared script */
document.addEventListener('DOMContentLoaded', () => {

  // year
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // nav scroll shadow
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 30));

  // hamburger
  const hb = document.getElementById('hb'), nl = document.getElementById('nl');
  if (hb && nl) {
    hb.addEventListener('click', () => { hb.classList.toggle('open'); nl.classList.toggle('open'); });
  }

  const isDesktop = () => window.matchMedia('(min-width:961px)').matches;

  // dropdown toggles (level 1 + level 2)
  document.querySelectorAll('[data-dd]').forEach(btn => {
    const item = btn.parentElement;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // close siblings at same level
      const parent = item.parentElement;
      parent.querySelectorAll(':scope > .nav-item.open, :scope > .dd-item.open').forEach(o => {
        if (o !== item) o.classList.remove('open');
      });
      item.classList.toggle('open');
    });
    if (isDesktop()) {
      item.addEventListener('mouseenter', () => item.classList.add('open'));
      item.addEventListener('mouseleave', () => item.classList.remove('open'));
    }
  });

  // click outside closes all dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open, .dd-item.open').forEach(o => o.classList.remove('open'));
    }
  });

  // close mobile menu when a real link is clicked
  if (nl) nl.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', () => {
    hb && hb.classList.remove('open');
    nl.classList.remove('open');
  }));

  // GSAP reveals
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    // hero elements stagger on load
    gsap.utils.toArray('.p-hero .rv, .hero-home .rv').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: .8, delay: .12 * i, ease: 'power3.out' });
    });

    // cards stagger
    if (document.querySelector('.card.rv')) {
      ScrollTrigger.batch('.card.rv', {
        start: 'top 88%',
        onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .6, stagger: .09, ease: 'power3.out', overwrite: true })
      });
    }

    // generic reveals
    gsap.utils.toArray('.rv').forEach(el => {
      if (el.closest('.p-hero') || el.closest('.hero-home') || el.classList.contains('card')) return;
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: .7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // image parallax in splits
    gsap.utils.toArray('.split-media img').forEach(img => {
      gsap.fromTo(img, { y: -12 }, {
        y: 12, ease: 'none',
        scrollTrigger: { trigger: img.closest('.split-media'), start: 'top bottom', end: 'bottom top', scrub: 1.4 }
      });
    });

    // animated counters
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dec = el.dataset.count.includes('.');
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.5, delay: .5, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
        onUpdate: () => el.textContent = (dec ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix
      });
    });
  }

});

// lightbox (global fns used by onclick)
function openLB(el) {
  const i = el.querySelector('img'); if (!i) return;
  const lb = document.getElementById('lb'); if (!lb) return;
  document.getElementById('lb-img').src = i.src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  const lb = document.getElementById('lb'); if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
