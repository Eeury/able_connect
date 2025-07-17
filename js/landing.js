const modal = document.getElementById('authModal');
const formContainer = document.getElementById('formContainer');

// Modal Utility Functions
function openModal(modal) {
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  modal.focus();
}
function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
}
function setupModalAccessibility(modal) {
  if (!modal) return;
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
}
// Setup accessibility for the auth modal on load
setupModalAccessibility(modal);
window.onclick = function (event) {
  if (event.target === modal) {
    closeModal(modal);
  }
};
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    closeModal(modal);
  }
});

function renderSlider(mode, userType = 'PWD') {
  // Clear existing content to prevent duplicates
  formContainer.innerHTML = '';

  // Create slider
  const slider = document.createElement('div');
  slider.className = 'slider-switch';
  slider.innerHTML = `
    <button id="pwdBtn" class="${userType === 'PWD' ? 'active' : ''}">PWD</button>
    <button id="clientBtn" class="${userType === 'Client' ? 'active' : ''}">Client</button>
  `;
  formContainer.appendChild(slider);

  // Create form area
  const formArea = document.createElement('div');
  formArea.id = 'formArea';
  formContainer.appendChild(formArea);

  // Attach event listeners
  const pwdBtn = document.getElementById('pwdBtn');
  const clientBtn = document.getElementById('clientBtn');

  pwdBtn.onclick = () => {
    pwdBtn.classList.add('active');
    clientBtn.classList.remove('active');
    mode === 'login' ? showLoginForm('PWD') : showSignupForm('PWD');
  };

  clientBtn.onclick = () => {
    clientBtn.classList.add('active');
    pwdBtn.classList.remove('active');
    mode === 'login' ? showLoginForm('Client') : showSignupForm('Client');
  };

  // Render initial form
  mode === 'login' ? showLoginForm(userType) : showSignupForm(userType);
}

function showSignupForm(userType) {
  const isPWD = userType === 'PWD';
  const extraFields = isPWD
    ? `
      <input type="text" placeholder="Username" required>
      <select name="disability" required>
        <option value="" disabled selected>Select Disability Type</option>
        <option>Vision</option>
        <option>Hearing</option>
        <option>Mobility</option>
        <option>Cognitive</option>
        <option>Other</option>
      </select>`
    : `
      <div class="radio-options">
        <label><input type="radio" name="role" value="medical" checked> Medical Services</label>
        <label><input type="radio" name="role" value="freelance"> Freelance Gigs</label>
      </div>`;

  document.getElementById('formArea').innerHTML = `
    <form onsubmit="return validateForm(event)">
      <input type="email" placeholder="Email" required>
      <input type="tel" placeholder="Phone Number" required>
      ${extraFields}
      <input type="password" id="password" placeholder="Password" required oninput="validatePassword()">
      <input type="password" id="confirm-password" placeholder="Confirm Password" required oninput="validatePassword()">
      <div class="password-requirements">
        <ul>
          <li id="length" class="invalid">At least 6 characters</li>
          <li id="uppercase" class="invalid">At least 1 uppercase letter</li>
          <li id="number" class="invalid">At least 1 number</li>
          <li id="match" class="invalid">Passwords match</li>
        </ul>
      </div>
      <button type="submit">Sign Up</button>
    </form>
  `;
}

function showLoginForm(userType) {
  document.getElementById('formArea').innerHTML = `
    <form>
      <input type="email" placeholder="Email" required>
      <input type="password" placeholder="Password" required>
      <a href="#">Forgot Password?</a>
      <button type="submit">Login</button>
    </form>
  `;
}

function validatePassword() {
  const password = document.getElementById('password')?.value || '';
  const confirmPassword = document.getElementById('confirm-password')?.value || '';
  
  const lengthCheck = password.length >= 6;
  const uppercaseCheck = /[A-Z]/.test(password);
  const numberCheck = /\d/.test(password);
  const matchCheck = password === confirmPassword && password !== '';

  const lengthEl = document.getElementById('length');
  const uppercaseEl = document.getElementById('uppercase');
  const numberEl = document.getElementById('number');
  const matchEl = document.getElementById('match');

  if (lengthEl) lengthEl.classList.toggle('valid', lengthCheck);
  if (lengthEl) lengthEl.classList.toggle('invalid', !lengthCheck);
  if (uppercaseEl) uppercaseEl.classList.toggle('valid', uppercaseCheck);
  if (uppercaseEl) uppercaseEl.classList.toggle('invalid', !uppercaseCheck);
  if (numberEl) numberEl.classList.toggle('valid', numberCheck);
  if (numberEl) numberEl.classList.toggle('invalid', !numberCheck);
  if (matchEl) matchEl.classList.toggle('valid', matchCheck);
  if (matchEl) matchEl.classList.toggle('invalid', !matchCheck);

  return lengthCheck && uppercaseCheck && numberCheck && matchCheck;
}

function validateForm(event) {
  event.preventDefault();
  if (validatePassword()) {
    alert('Form submitted successfully!');
    closeModal(modal); // Use the new closeModal function
    return true;
  } else {
    alert('Please meet all password requirements.');
    return false;
  }
}