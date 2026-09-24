/* Golden Path Tutors - Main Application Script */
import { getCurrentSession, logoutUser, registerStudent, loginUser } from './auth.js';
import { initHeroSlider } from './slider.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Hero Slider if present
  initHeroSlider();

  // 2. Setup Navigation & Authentication Header State
  setupNavHeader();

  // 3. Mobile Navigation Menu Toggle
  setupMobileMenu();

  // 4. Setup Interactive Tuition Fee Estimator if on page
  setupFeeCalculator();

  // 5. Setup Student Registration & Login Forms if on page
  setupAuthForms();

  // 6. Setup Interactive Whiteboard if on Virtual Classroom Dashboard
  setupWhiteboardCanvas();

  // 7. Check Toast Redirect Messages
  checkSessionToastMessages();
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

function checkSessionToastMessages() {
  const reason = sessionStorage.getItem('gpt_redirect_reason');
  if (reason) {
    showToast(reason, 'info');
    sessionStorage.removeItem('gpt_redirect_reason');
  }
}

// Update Top Navigation Bar according to Login Session
function setupNavHeader() {
  const current = getCurrentSession();
  const authNavContainer = document.querySelector('.top-bar-auth');
  const mainNavActions = document.querySelector('.nav-actions');

  if (current) {
    if (authNavContainer) {
      authNavContainer.innerHTML = `
        <span style="color: var(--color-gold); font-weight: 700;">
          <i class="fa-solid fa-user-graduate"></i> Welcome, ${current.fullName} (${current.username})
        </span>
        <a href="dashboard.html" style="font-weight: 700; color: #60A5FA;">
          <i class="fa-solid fa-gauge"></i> Portal Dashboard
        </a>
        <button id="header-logout-btn" style="background: none; border: none; color: #F87171; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 0.3rem;">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      `;
      document.getElementById('header-logout-btn')?.addEventListener('click', () => {
        logoutUser();
      });
    }

    if (mainNavActions) {
      mainNavActions.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary">
          <i class="fa-solid fa-chalkboard-user"></i> Virtual Classroom
        </a>
      `;
    }
  } else {
    if (authNavContainer) {
      authNavContainer.innerHTML = `
        <a href="login.html"><i class="fa-solid fa-lock"></i> Student Portal Login</a>
        <span style="color: #475569;">|</span>
        <a href="register.html" style="color: var(--color-gold); font-weight: 700;"><i class="fa-solid fa-user-plus"></i> Register Student</a>
      `;
    }
    if (mainNavActions) {
      mainNavActions.innerHTML = `
        <a href="login.html" class="btn btn-outline"><i class="fa-solid fa-lock"></i> Portal Login</a>
        <a href="register.html" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Register Now</a>
      `;
    }
  }
}

function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = '#FFFFFF';
        navLinks.style.padding = '1.5rem';
        navLinks.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        navLinks.style.zIndex = '999';
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

// Forms: Register, Login, Contact
function setupAuthForms() {
  // 1. Student Registration Form
  const registerForm = document.getElementById('register-student-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('reg-fullname').value;
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const gradeLevel = document.getElementById('reg-grade').value;
      const learningMode = document.getElementById('reg-mode').value;

      const checkedSubjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(cb => cb.value);

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please retype password.', 'error');
        return;
      }

      const res = registerStudent({
        fullName,
        username,
        email,
        password,
        gradeLevel,
        learningMode,
        subjects: checkedSubjects.length > 0 ? checkedSubjects : ['General Studies']
      });

      if (!res.success) {
        showToast(res.message, 'error');
      } else {
        showToast(res.message, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      }
    });
  }

  // 2. Student Login Form
  const loginForm = document.getElementById('login-student-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const query = document.getElementById('login-query').value;
      const password = document.getElementById('login-password').value;

      const res = loginUser(query, password);

      if (!res.success) {
        showToast(res.message, 'error');
      } else {
        showToast(`Welcome back, ${res.user.fullName}!`, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      }
    });

    // Demo Login Helper Button
    document.getElementById('demo-login-btn')?.addEventListener('click', () => {
      document.getElementById('login-query').value = 'alexw';
      document.getElementById('login-password').value = 'password123';
      const res = loginUser('alexw', 'password123');
      if (res.success) {
        showToast('Logged in as Demo Student: Alexander Wright', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      }
    });
  }
}

// Interactive Canvas Whiteboard Simulator
function setupWhiteboardCanvas() {
  const canvas = document.getElementById('wb-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentColor = '#F5B014'; // Golden Path Gold
  let currentLineWidth = 4;

  // Set canvas scale correctly
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Fill white background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGridLines();
  }

  function drawGridLines() {
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.5;
    const step = 30;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function startPosition(e) {
    isDrawing = true;
    draw(e);
  }

  function endPosition() {
    isDrawing = false;
    ctx.beginPath();
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    ctx.lineWidth = currentLineWidth;
    ctx.strokeStyle = currentColor;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('touchstart', startPosition, { passive: true });
  canvas.addEventListener('touchend', endPosition, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });

  // Whiteboard controls
  document.querySelectorAll('.wb-color-picker').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.wb-color-picker').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentColor = e.target.getAttribute('data-color');
    });
  });

  document.getElementById('wb-clear-btn')?.addEventListener('click', () => {
    resizeCanvas();
    showToast('Whiteboard canvas cleared', 'info');
  });

  document.getElementById('wb-download-btn')?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'golden-path-whiteboard-notes.png';
    link.href = canvas.toDataURL();
    link.click();
    showToast('Whiteboard notes saved!', 'success');
  });
}
