const carousel = document.querySelector('[data-carousel]');
const slides = Array.from(document.querySelectorAll('[data-slide]'));
const dots = Array.from(document.querySelectorAll('[data-dot]'));
const currentLabel = document.querySelector('[data-current]');
const totalLabel = document.querySelector('[data-total]');
const prevButton = document.querySelector('[data-prev]');
const nextButton = document.querySelector('[data-next]');

if (totalLabel) {
  totalLabel.textContent = String(slides.length).padStart(2, '0');
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let activeIndex = 0;
let rafId = 0;

const scrollToIndex = (index) => {
  const targetIndex = clamp(index, 0, slides.length - 1);
  const targetSlide = slides[targetIndex];

  carousel.scrollTo({
    left: targetSlide.offsetLeft - (carousel.clientWidth - targetSlide.offsetWidth) / 2,
    behavior: 'smooth',
  });
};

const updateCarousel = () => {
  rafId = 0;

  const center = carousel.scrollLeft + carousel.clientWidth / 2;
  let closest = Infinity;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = (slideCenter - center) / carousel.clientWidth;
    const absDistance = Math.abs(distance);

    if (absDistance < closest) {
      closest = absDistance;
      activeIndex = index;
    }

    const tilt = clamp(distance * 16, -16, 16);
    const lift = clamp(-absDistance * 10 + 2, -8, 2);
    const scale = 1 - Math.min(absDistance, 1) * 0.06;
    const opacity = 1 - Math.min(absDistance, 1) * 0.12;

    slide.style.setProperty('--tilt', `${tilt}deg`);
    slide.style.setProperty('--lift', `${lift}px`);
    slide.style.setProperty('--scale', scale.toFixed(3));
    slide.style.setProperty('--opacity', opacity.toFixed(3));
  });

  if (currentLabel) {
    currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  dots.forEach((dot, index) => {
    dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
  });
};

const requestUpdate = () => {
  if (!rafId) {
    rafId = window.requestAnimationFrame(updateCarousel);
  }
};

carousel.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate);
window.addEventListener('load', requestUpdate);

prevButton.addEventListener('click', () => scrollToIndex(activeIndex - 1));
nextButton.addEventListener('click', () => scrollToIndex(activeIndex + 1));

dots.forEach((dot) => {
  dot.addEventListener('click', () => scrollToIndex(Number(dot.dataset.dot)));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    scrollToIndex(activeIndex + 1);
  }

  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    scrollToIndex(activeIndex - 1);
  }
});

requestUpdate();
