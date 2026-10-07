/* Golden Path Tutors - Main Application Script */
import { initHeroSlider } from './slider.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Hero Slider if present
  initHeroSlider();

  // 2. Mobile Navigation Menu Toggle
  setupMobileMenu();

  // 3. Setup Become a Tutor Application Form
  setupBecomeTutorForm();

  // 4. Setup Interactive Tuition Fee Estimator if on page
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

// Become a Tutor Form Application Handler
function setupBecomeTutorForm() {
  const form = document.getElementById('becomeTutorForm');
  if (!form) return;

  const fileInput = document.getElementById('tutor-cv');
  const fileUploadBox = document.getElementById('cvUploadBox');
  const fileNameDisplay = document.getElementById('cvFileName');
  const cvIcon = document.getElementById('cvIcon');
  const submitBtn = document.getElementById('tutorSubmitBtn');
  const btnText = document.getElementById('tutorBtnText');
  const statusMsg = document.getElementById('tutorStatusMsg');

  // Dynamic file upload visual feedback
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          showToast('File exceeds 5MB limit. Please upload a smaller CV.', 'error');
          fileInput.value = '';
          fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
          fileUploadBox?.classList.remove('has-file');
          if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';
          return;
        }

        const sizeFormatted = (file.size / 1024 / 1024).toFixed(2);
        fileNameDisplay.textContent = `${file.name} (${sizeFormatted} MB)`;
        fileUploadBox?.classList.add('has-file');
        if (cvIcon) cvIcon.className = 'fa-solid fa-file-circle-check';
      } else {
        fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
        fileUploadBox?.classList.remove('has-file');
        if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';
      }
    });
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!fileInput?.files[0]) {
      showToast('Please upload your CV before submitting.', 'error');
      return;
    }

    const nameVal = document.getElementById('tutor-name')?.value.trim();
    const phoneVal = document.getElementById('tutor-phone')?.value.trim();
    const qualVal = document.getElementById('tutor-qualification')?.value;
    const courseStudiedVal = document.getElementById('tutor-course-studied')?.value.trim();
    const subjectsHandledVal = document.getElementById('tutor-subjects-handle')?.value.trim();

    if (!nameVal || !phoneVal || !qualVal || !courseStudiedVal || !subjectsHandledVal) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    // Set loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting Application...';
    if (statusMsg) {
      statusMsg.style.display = 'none';
      statusMsg.innerHTML = '';
    }

    try {
      const formData = new FormData(form);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        // Success
        form.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
        fileUploadBox?.classList.remove('has-file');
        if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';

        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.innerHTML = `
            <div class="tutor-form-success">
              <i class="fa-solid fa-circle-check" style="font-size: 2rem; color: #10B981; margin-bottom: 0.5rem; display: block;"></i>
              <h4>Application Received!</h4>
              <p>Thank you, <strong>${nameVal}</strong>. Your CV and credentials have been submitted. Our recruitment team will review your application and contact you at <strong>${phoneVal}</strong>.</p>
            </div>
          `;
        }

        showToast('Tutor application submitted successfully!', 'success');
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Tutor application error:', err);
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = `
          <div class="tutor-form-error">
            <i class="fa-solid fa-triangle-exclamation"></i> Could not send online. Please email your CV directly to <a href="mailto:goldenpathtutors@gmail.com" style="color: var(--color-gold); font-weight: bold; text-decoration: underline;">goldenpathtutors@gmail.com</a> or WhatsApp <a href="https://wa.me/2349074089626" target="_blank" style="color: var(--color-gold); font-weight: bold; text-decoration: underline;">+234 09074089626</a>.
          </div>
        `;
      }
      showToast('Could not submit application. Please check your network or email us directly.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.innerHTML = 'Submit Tutor Application';
    }
  });
}

