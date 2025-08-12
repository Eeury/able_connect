// Landing page JavaScript functionality
let currentForm = 'signup'; // Track current form type

// DOM elements
const authModal = document.getElementById('authModal');
const formContainer = document.getElementById('formContainer');

// Show auth modal with specified form type
function triggerAuthModal(type) {
  currentForm = type;
  showForm(type);
  authModal.style.display = 'flex';
}

// Close modal
function closeModal() {
  authModal.style.display = 'none';
  formContainer.innerHTML = '';
}

// Show appropriate form based on type
function showForm(type) {
  if (type === 'signup') {
    formContainer.innerHTML = `
      <div class="slider-switch">
        <button class="active" onclick="switchForm('pwd')">PWD</button>
        <button onclick="switchForm('client')">Client</button>
      </div>
      <form id="signupForm" onsubmit="handleSignup(event)">
        <div id="pwdFields">
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="tel" placeholder="Phone Number" required />
          <input type="password" placeholder="Password" id="password" required />
          <div class="password-requirements">
            <ul>
              <li class="invalid" id="length">At least 8 characters</li>
              <li class="invalid" id="uppercase">One uppercase letter</li>
              <li class="invalid" id="lowercase">One lowercase letter</li>
              <li class="invalid" id="number">One number</li>
              <li class="invalid" id="special">One special character</li>
            </ul>
          </div>
          <input type="password" placeholder="Confirm Password" required />
        </div>
        <div id="clientFields" style="display: none;">
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="tel" placeholder="Phone Number" required />
          <input type="password" placeholder="Password" id="clientPassword" required />
          <div class="password-requirements">
            <ul>
              <li class="invalid" id="clientLength">At least 8 characters</li>
              <li class="invalid" id="clientUppercase">One uppercase letter</li>
              <li class="invalid" id="clientLowercase">One lowercase letter</li>
              <li class="invalid" id="clientNumber">One number</li>
              <li class="invalid" id="clientSpecial">One special character</li>
            </ul>
          </div>
          <input type="password" placeholder="Confirm Password" required />
          <div class="radio-options" id="clientTypeOptions">
            <label><input type="radio" name="clientType" value="gig" checked> Gig</label>
            <label><input type="radio" name="clientType" value="service"> Service</label>
          </div>
        </div>
        <button type="submit">Sign Up</button>
        <a href="#" onclick="showForm('login')">Already have an account? Login</a>
      </form>
    `;
    setupPasswordValidation();
    setupClientPasswordValidation();
  } else {
    formContainer.innerHTML = `
      <div class="slider-switch">
        <button class="active" onclick="switchForm('pwd')">PWD</button>
        <button onclick="switchForm('client')">Client</button>
      </div>
      <form id="loginForm" onsubmit="handleLogin(event)">
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <div class="radio-options" id="loginUserTypeOptions">
          <label><input type="radio" name="loginUserType" value="pwd" checked> PWD</label>
          <label><input type="radio" name="loginUserType" value="client"> Client</label>
        </div>
        <button type="submit">Login</button>
        <a href="#" onclick="showForm('signup')">Don't have an account? Sign Up</a>
      </form>
    `;
  }
}

// Switch between PWD and Client forms
function switchForm(userType) {
  const buttons = document.querySelectorAll('.slider-switch button');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Show/hide appropriate fields for signup form
  const pwdFields = document.getElementById('pwdFields');
  const clientFields = document.getElementById('clientFields');
  
  if (pwdFields && clientFields) {
    if (userType === 'pwd') {
      pwdFields.style.display = 'block';
      clientFields.style.display = 'none';
    } else {
      pwdFields.style.display = 'none';
      clientFields.style.display = 'block';
      // Ensure a client type is selected when switching to client
      const clientTypeRadio = document.querySelector('input[name="clientType"]:checked');
      if (!clientTypeRadio) {
        document.querySelector('input[name="clientType"][value="gig"]').checked = true;
      }
    }
  }
  
  // Update radio button selection for login form
  const loginRadio = document.querySelector(`input[name="loginUserType"][value="${userType}"]`);
  if (loginRadio) loginRadio.checked = true;
}

// Handle signup form submission
function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Get user type from active slider button
  const activeButton = document.querySelector('.slider-switch button.active');
  const userType = activeButton ? activeButton.textContent.toLowerCase() : 'pwd';
  
  // Validate client type selection if signing up as client
  if (userType === 'client') {
    const clientTypeRadio = form.querySelector('input[name="clientType"]:checked');
    if (!clientTypeRadio) {
      alert('Please select either Gig or Service before signing up as a Client.');
      return;
    }
    const clientType = clientTypeRadio.value;
    console.log('Signing up as:', userType, `(${clientType})`);
  } else {
    console.log('Signing up as:', userType);
  }
  
  // Simulate signup process
  console.log('Processing signup...');
  
  // Redirect based on user type
  setTimeout(() => {
    if (userType === 'pwd') {
      window.location.href = '/homepage.html';
    } else {
      window.location.href = '/client.html';
    }
  }, 1000);
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Get user type from radio selection
  const userType = form.querySelector('input[name="loginUserType"]:checked').value;
  
  // Simulate login process
  console.log('Logging in as:', userType);
  
  // Redirect based on user type
  setTimeout(() => {
    if (userType === 'pwd') {
      window.location.href = '/homepage.html';
    } else {
      window.location.href = '/client.html';
    }
  }, 1000);
}

// Password validation
function setupPasswordValidation() {
  const password = document.getElementById('password');
  if (!password) return;
  
  password.addEventListener('input', function() {
    const value = this.value;
    
    // Check each requirement
    document.getElementById('length').className = value.length >= 8 ? 'valid' : 'invalid';
    document.getElementById('uppercase').className = /[A-Z]/.test(value) ? 'valid' : 'invalid';
    document.getElementById('lowercase').className = /[a-z]/.test(value) ? 'valid' : 'invalid';
    document.getElementById('number').className = /\d/.test(value) ? 'valid' : 'invalid';
    document.getElementById('special').className = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ? 'valid' : 'invalid';
  });
}

// Client password validation
function setupClientPasswordValidation() {
  const clientPassword = document.getElementById('clientPassword');
  if (!clientPassword) return;
  
  clientPassword.addEventListener('input', function() {
    const value = this.value;
    
    // Check each requirement
    document.getElementById('clientLength').className = value.length >= 8 ? 'valid' : 'invalid';
    document.getElementById('clientUppercase').className = /[A-Z]/.test(value) ? 'valid' : 'invalid';
    document.getElementById('clientLowercase').className = /[a-z]/.test(value) ? 'valid' : 'invalid';
    document.getElementById('clientNumber').className = /\d/.test(value) ? 'valid' : 'invalid';
    document.getElementById('clientSpecial').className = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ? 'valid' : 'invalid';
  });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === authModal) {
    closeModal();
  }
});

// Close modal with Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && authModal.style.display === 'flex') {
    closeModal();
  }
});

// Initialize with signup form
document.addEventListener('DOMContentLoaded', () => {
  // Set default form
  if (formContainer) {
    showForm('signup');
  }
}); 