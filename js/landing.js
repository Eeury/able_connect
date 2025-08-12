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
        <div class="radio-options" id="userTypeOptions">
          <label><input type="radio" name="userType" value="pwd" checked> PWD</label>
          <label><input type="radio" name="userType" value="client"> Client</label>
        </div>
        <button type="submit">Sign Up</button>
        <a href="#" onclick="showForm('login')">Already have an account? Login</a>
      </form>
    `;
    setupPasswordValidation();
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
  
  // Update radio button selection for both signup and login forms
  const signupRadio = document.querySelector(`input[name="userType"][value="${userType}"]`);
  const loginRadio = document.querySelector(`input[name="loginUserType"][value="${userType}"]`);
  
  if (signupRadio) signupRadio.checked = true;
  if (loginRadio) loginRadio.checked = true;
}

// Handle signup form submission
function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  // Get user type from radio selection
  const userType = form.querySelector('input[name="userType"]:checked').value;
  
  // Simulate signup process
  console.log('Signing up as:', userType);
  
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
    document.getElementById('special').className = /[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'valid' : 'invalid';
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