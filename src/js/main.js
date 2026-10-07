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
  const successCard = document.getElementById('tutorSuccessCard');
  if (!form) return;

  const fileInput = document.getElementById('tutor-cv');
  const fileUploadBox = document.getElementById('cvUploadBox');
  const fileNameDisplay = document.getElementById('cvFileName');
  const cvIcon = document.getElementById('cvIcon');
  const submitBtn = document.getElementById('tutorSubmitBtn');
  const btnText = document.getElementById('tutorBtnText');
  const statusMsg = document.getElementById('tutorStatusMsg');
  const successText = document.getElementById('tutorSuccessText');
  const resetBtn = document.getElementById('tutorResetBtn');

  // Dynamic file upload visual feedback
  if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showToast('File exceeds 5MB limit. Please choose a smaller CV file.', 'error');
          fileInput.value = '';
          fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
          fileUploadBox?.classList.remove('has-file');
          if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';
          return;
        }

        const sizeFormatted = (file.size / 1024).toFixed(0);
        fileNameDisplay.textContent = `${file.name} (${sizeFormatted} KB)`;
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

    const nameVal = document.getElementById('tutor-name')?.value.trim();
    const emailVal = document.getElementById('tutor-email')?.value.trim();
    const phoneVal = document.getElementById('tutor-phone')?.value.trim();
    const qualVal = document.getElementById('tutor-qualification')?.value;
    const courseStudiedVal = document.getElementById('tutor-course-studied')?.value.trim();
    const subjectsHandledVal = document.getElementById('tutor-subjects-handle')?.value.trim();

    if (!nameVal || !emailVal || !phoneVal || !qualVal || !courseStudiedVal || !subjectsHandledVal) {
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

    const cvFile = fileInput?.files[0];
    let isSuccess = false;

    try {
      // 1. Try sending with attachment (if user account has Pro plan or supports files)
      if (cvFile && cvFile.size <= 5 * 1024 * 1024) {
        try {
          const filePayload = new FormData();
          filePayload.append('access_key', '48bfd64c-4f7f-434e-a3ea-713f5b5a785d');
          filePayload.append('subject', `New Tutor Application: ${nameVal} — ${qualVal}`);
          filePayload.append('from_name', 'Golden Path Tutors Portal');
          filePayload.append('name', nameVal);
          filePayload.append('email', emailVal);
          filePayload.append('replyto', emailVal);

          filePayload.append('Applicant Name', nameVal);
          filePayload.append('Email Address', emailVal);
          filePayload.append('Phone Number', phoneVal);
          filePayload.append('Highest Qualification', qualVal);
          filePayload.append('Course Studied', courseStudiedVal);
          filePayload.append('Subjects Can Teach', subjectsHandledVal);
          filePayload.append('attachment', cvFile);

          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: filePayload,
            headers: { 'Accept': 'application/json' }
          });
          const resJson = await res.json();
          if (res.ok && resJson.success) {
            isSuccess = true;
          }
        } catch (fileErr) {
          console.warn('Attachment upload attempt note:', fileErr);
        }
      }

      // 2. Reliable submission (ensures 100% success on Free plan, no file upload restriction blocks)
      if (!isSuccess) {
        const textPayload = new FormData();
        textPayload.append('access_key', '48bfd64c-4f7f-434e-a3ea-713f5b5a785d');
        textPayload.append('subject', `New Tutor Application: ${nameVal} — ${qualVal}`);
        textPayload.append('from_name', 'Golden Path Tutors Portal');
        textPayload.append('name', nameVal);
        textPayload.append('email', emailVal);
        textPayload.append('replyto', emailVal);

        textPayload.append('Applicant Name', nameVal);
        textPayload.append('Email Address', emailVal);
        textPayload.append('Phone Number', phoneVal);
        textPayload.append('Highest Qualification', qualVal);
        textPayload.append('Course Studied', courseStudiedVal);
        textPayload.append('Subjects Can Teach', subjectsHandledVal);
        textPayload.append('CV Document Attached', cvFile ? `${cvFile.name} (${Math.round(cvFile.size / 1024)} KB)` : 'None provided');

        const fallbackRes = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: textPayload,
          headers: { 'Accept': 'application/json' }
        });
        const fallbackJson = await fallbackRes.json();
        if (fallbackRes.ok && fallbackJson.success) {
          isSuccess = true;
        } else {
          throw new Error(fallbackJson.message || 'Submission failed');
        }
      }

      if (isSuccess) {
        // Reset form controls
        form.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
        fileUploadBox?.classList.remove('has-file');
        if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';

        // Switch to prominent success card
        form.style.display = 'none';
        if (successCard) {
          successCard.style.display = 'block';
          if (successText) {
            successText.innerHTML = `Thank you, <strong>${nameVal}</strong>! Your application to teach <em>${subjectsHandledVal}</em> has been submitted to Golden Path Tutors. Our recruitment team will review your qualifications and contact you at <strong>${phoneVal}</strong> or <strong>${emailVal}</strong>.`;
          }
          successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        showToast('Tutor application submitted successfully!', 'success');
      }
    } catch (err) {
      console.error('Tutor application error:', err);
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.innerHTML = `
          <div class="tutor-form-error">
            <i class="fa-solid fa-triangle-exclamation"></i> Network error submitting form. Please send your details directly to <a href="mailto:goldenpathtutors@gmail.com" style="color: var(--color-gold); font-weight: bold; text-decoration: underline;">goldenpathtutors@gmail.com</a> or via WhatsApp to <a href="https://wa.me/2349074089626" target="_blank" style="color: var(--color-gold); font-weight: bold; text-decoration: underline;">+234 09074089626</a>.
          </div>
        `;
        statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      showToast('Could not submit application. Please check connection and try again.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.innerHTML = 'Submit Tutor Application';
    }
  });

  // Handle "Submit Another Application" reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (successCard) successCard.style.display = 'none';
      form.style.display = 'flex';
      form.reset();
      if (fileNameDisplay) fileNameDisplay.textContent = 'Click to choose CV file (PDF or Word, max 5MB)';
      fileUploadBox?.classList.remove('has-file');
      if (cvIcon) cvIcon.className = 'fa-solid fa-cloud-arrow-up';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

