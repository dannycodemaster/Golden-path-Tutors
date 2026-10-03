/* Golden Path Tutors - Main Application Script */
import { initHeroSlider } from './slider.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Hero Slider if present
  initHeroSlider();

  // 2. Mobile Navigation Menu Toggle
  setupMobileMenu();

  // 3. Setup Interactive Tuition Fee Estimator if on page
  setupFeeCalculator();
});

// Toast notification helper
export function showToast(message, type = 'info') {
  let toastEl = document.getElementById('app-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'app-toast';
    toastEl.className = 'toast-msg';
    document.body.appendChild(toastEl);
  }

  const iconClass = type === 'error' ? 'fa-triangle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  
  toastEl.innerHTML = `
    <i class="fa-solid ${iconClass}" style="color: var(--color-gold); font-size: 1.2rem;"></i>
    <span>${message}</span>
  `;

  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 4500);
}

function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navLinks.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    // Close menu when a link inside is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });

    // Close menu if user clicks anywhere outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  }
}

// Interactive Fee Estimator Calculator
function setupFeeCalculator() {
  const modeSelect = document.getElementById('calc-mode');
  const levelSelect = document.getElementById('calc-level');
  const hoursInput = document.getElementById('calc-hours');
  const priceOutput = document.getElementById('calc-price-output');

  if (!modeSelect || !levelSelect || !hoursInput || !priceOutput) return;

  function calculateFee() {
    const mode = modeSelect.value;
    const level = levelSelect.value;
    const hours = parseInt(hoursInput.value) || 1;

    let baseRate = 4500; // ₦4,500/hr online base rate
    if (mode === 'home') baseRate = 7500; // ₦7,500/hr home base rate

    let multiplier = 1;
    if (level === 'secondary') multiplier = 1.2;
    if (level === 'examprep') multiplier = 1.4;
    if (level === 'adult') multiplier = 1.3;

    const total = Math.round(baseRate * multiplier * hours);
    priceOutput.textContent = `₦${total.toLocaleString('en-NG')} / week`;
  }

  modeSelect.addEventListener('change', calculateFee);
  levelSelect.addEventListener('change', calculateFee);
  hoursInput.addEventListener('input', calculateFee);
  calculateFee();
}
