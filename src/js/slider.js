/* Golden Path Tutors - Automatic 6-Slide Carousel System */

export function initHeroSlider() {
  const sliderEl = document.querySelector('.hero-slider-section');
  if (!sliderEl) return;

  const slides = sliderEl.querySelectorAll('.slide');
  const dotsContainer = sliderEl.querySelector('.slider-pagination');
  const progressBar = sliderEl.querySelector('.slider-progress-bar');
  const prevBtn = sliderEl.querySelector('.prev-slide');
  const nextBtn = sliderEl.querySelector('.next-slide');

  if (!slides || slides.length === 0) return;

  let currentIndex = 0;
  const slideCount = slides.length; // 6 slides
  const SLIDE_DURATION = 5000; // 5 seconds per slide
  let slideTimer = null;
  let progressTimer = null;
  let startTime = null;
  let isPaused = false;

  // Create dot indicators
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('data-index', i);
      dot.setAttribute('title', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(index) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    currentIndex = (index + slideCount) % slideCount;
    slides[currentIndex].classList.add('active');
    updateDots(currentIndex);
    resetTimers();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Event Listeners for Arrows
  if (nextBtn) nextBtn.addEventListener('click', () => nextSlide());
  if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  // Hover Pause
  sliderEl.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  sliderEl.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Progress Bar Animation & Timer
  function resetTimers() {
    if (progressBar) progressBar.style.width = '0%';
    startTime = Date.now();
    clearInterval(progressTimer);
    clearTimeout(slideTimer);
    
    startProgress();
  }

  function startProgress() {
    const stepTime = 50; // Update every 50ms
    progressTimer = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
      }

      if (elapsed >= SLIDE_DURATION) {
        clearInterval(progressTimer);
        nextSlide();
      }
    }, stepTime);
  }

  // Touch / Swipe Gesture support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  sliderEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (touchEndX < touchStartX - 40) nextSlide(); // Swipe left
    if (touchEndX > touchStartX + 40) prevSlide(); // Swipe right
  }

  // Start initial auto slider
  resetTimers();
}
