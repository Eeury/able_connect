// Landing page JavaScript functionality

// Path constants
const PATHS = {
  INDEX: '/',
  HOMEPAGE: '/homepage.html',
  CLIENT: '/client.html',
  TUBONGE: '/tubonge.html',
  STATIC: '/static'
};

let currentForm = 'signup';
let pendingRedirect = null;

// Get current user data (from API or localStorage fallback)
async function getCurrentUser() {
  // Try to get from API first
  try {
    if (window.ableConnectAPI && window.ableConnectAPI.auth) {
      const user = await window.ableConnectAPI.auth.getCurrentUser();
      if (user && user.id) {
        // Store in localStorage for compatibility
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        return {
          id: user.id,
          name: user.username || user.email,
          type: user.user_type || 'pwd'
        };
      }
    }
  } catch (error) {
    console.log('API not available, using localStorage fallback');
  }
  
  // Fallback to localStorage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
  
  // Check if logged in
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    return null;
  }
  
  // Determine if user is PWD or Client
  if (userData.email || userData.id) {
    return {
      id: userData.id || userData.email,
      name: userData.username || userData.name || userData.email,
      type: userData.user_type || 'pwd'
    };
  } else if (clientData.email) {
    return {
      id: clientData.id || clientData.email,
      name: clientData.name || 'Client User',
      type: 'client'
    };
  }
  
  return null;
}

// Show auth modal with specified form type
function triggerAuthModal(type) {
  const authModal = document.getElementById('authModal');
  if (!authModal) {
    console.error('Auth modal not found');
    return;
  }
  currentForm = type;
  showForm(type);
  authModal.style.display = 'flex';
}
window.triggerAuthModal = triggerAuthModal;

// Close modal
function closeModal() {
  const authModal = document.getElementById('authModal');
  const formContainer = document.getElementById('formContainer');
  if (authModal) {
    authModal.style.display = 'none';
  }
  if (formContainer) {
    formContainer.innerHTML = '';
  }
}
window.closeModal = closeModal;

// Show appropriate form based on type
function showForm(type) {
  const formContainer = document.getElementById('formContainer');
  if (!formContainer) {
    console.error('Form container not found');
    return;
  }
  const modalContent = document.querySelector('.modal-content');
  if (type === 'signup') {
    if (modalContent) modalContent.classList.add('signup-modal');
    formContainer.innerHTML = `
      <div class="slider-switch">
        <button class="active" onclick="switchForm('pwd')">PWD</button>
        <button onclick="switchForm('client')">Client</button>
      </div>
      <form id="signupForm" novalidate>
        <div id="pwdFields">
          <input type="text" placeholder="Full Name" name="pwdName" />
          <input type="email" placeholder="Email Address" name="pwdEmail" />
          <input type="tel" placeholder="Phone Number" name="pwdPhone" />
          <input type="password" placeholder="Password" id="password" name="pwdPassword" />
          <div class="password-requirements">
            <ul>
              <li class="invalid" id="length">At least 8 characters</li>
              <li class="invalid" id="number">At least 1 number</li>
              <li class="invalid" id="uppercase">At least 1 uppercase letter</li>
              <li class="invalid" id="special">At least 1 special character</li>
            </ul>
          </div>
          <input type="password" placeholder="Confirm Password" name="pwdConfirmPassword" />
        </div>
        <div id="clientFields" style="display: none;">
          <input type="text" placeholder="Full Name" name="clientName" />
          <input type="email" placeholder="Email Address" name="clientEmail" />
          <input type="tel" placeholder="Phone Number" name="clientPhone" />
          <input type="password" placeholder="Password" id="clientPassword" name="clientPassword" />
          <div class="password-requirements">
            <ul>
              <li class="invalid" id="clientLength">At least 8 characters</li>
              <li class="invalid" id="clientNumber">At least 1 number</li>
              <li class="invalid" id="clientUppercase">At least 1 uppercase letter</li>
              <li class="invalid" id="clientSpecial">At least 1 special character</li>
            </ul>
          </div>
          <input type="password" placeholder="Confirm Password" name="clientConfirmPassword" />
          <div class="radio-options" id="clientTypeOptions">
            <label class="active"><input type="radio" name="clientType" value="gig" checked> Gig</label>
            <label><input type="radio" name="clientType" value="service"> Service</label>
          </div>
        </div>
        <button type="submit">Sign Up</button>
        <a href="#" onclick="showForm('login')">Already have an account? Login</a>
      </form>
    `;
    // Attach event listener to the form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignup);
    }
    setupPasswordValidation();
    setupClientPasswordValidation();
    setupRadioButtons();
  } else {
    if (modalContent) modalContent.classList.remove('signup-modal');
    formContainer.innerHTML = `
      <div class="slider-switch">
        <button class="active" onclick="switchForm('pwd')">PWD</button>
        <button onclick="switchForm('client')">Client</button>
      </div>
      <form id="loginForm">
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <a href="#" onclick="showForm('signup')">Don't have an account? Sign Up</a>
      </form>
    `;
    // Attach event listener to the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  }
}

// Switch between PWD and Client forms
function switchForm(userType) {
  const buttons = document.querySelectorAll('.slider-switch button');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Find the clicked button and mark it as active
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  } else {
    // Fallback: find button by text content
    buttons.forEach(btn => {
      if (btn.textContent.toLowerCase().trim() === userType) {
        btn.classList.add('active');
      }
    });
  }
  
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
        const gigRadio = document.querySelector('input[name="clientType"][value="gig"]');
        if (gigRadio) {
          gigRadio.checked = true;
        }
      }
    }
  }
}
window.switchForm = switchForm;
window.showForm = showForm;

// Handle signup form submission
async function handleSignup(event) {
  event.preventDefault();
  console.log('handleSignup called');
  const form = event.target;
  
  // Get user type from active slider button
  const activeButton = document.querySelector('.slider-switch button.active');
  const userType = activeButton ? activeButton.textContent.toLowerCase() : 'pwd';
  console.log('User type:', userType);
  
  // Validate password requirements and confirmation
  let password, confirmPassword;
  
  if (userType === 'client') {
    const clientFields = document.getElementById('clientFields');
    if (!clientFields || clientFields.style.display === 'none') {
      alert('Please fill in all required fields.');
      return;
    }
    
    const clientTypeRadio = form.querySelector('input[name="clientType"]:checked');
    if (!clientTypeRadio) {
      alert('Please select either Gig or Service before signing up as a Client.');
      return;
    }
    
    password = document.getElementById('clientPassword');
    const passwordInputs = clientFields.querySelectorAll('input[type="password"]');
    confirmPassword = passwordInputs[1];
    
    // Check if password fields exist
    if (!password || !confirmPassword) {
      alert('Password fields not found. Please refresh the page and try again.');
      return;
    }
    
    // Check if password is filled
    if (!password.value || password.value.trim() === '') {
      alert('Please enter a password.');
      return;
    }
    
    if (!confirmPassword.value || confirmPassword.value.trim() === '') {
      alert('Please confirm your password.');
      return;
    }
    
    // Validate password requirements
    const pwdValue = password.value;
    const lengthValid = pwdValue.length >= 8;
    const numberValid = /\d/.test(pwdValue);
    const uppercaseValid = /[A-Z]/.test(pwdValue);
    const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwdValue);
    
    if (!lengthValid || !numberValid || !uppercaseValid || !specialValid) {
      alert('Password does not meet all requirements. Please check the password requirements.');
      return;
    }
    
    // Check if password and confirm password match
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match. Please try again.');
      return;
    }
  } else {
    // PWD validation
    const pwdFields = document.getElementById('pwdFields');
    console.log('PWD Fields:', pwdFields, 'Display:', pwdFields?.style.display);
    if (!pwdFields || pwdFields.style.display === 'none') {
      alert('Please fill in all required fields.');
      return;
    }
    
    password = document.getElementById('password');
    const passwordInputs = pwdFields.querySelectorAll('input[type="password"]');
    confirmPassword = passwordInputs[1];
    console.log('Password inputs found:', passwordInputs.length);
    
    // Check if password fields exist
    if (!password || !confirmPassword) {
      alert('Password fields not found. Please refresh the page and try again.');
      return;
    }
    
    // Check if password is filled
    if (!password.value || password.value.trim() === '') {
      alert('Please enter a password.');
      return;
    }
    
    if (!confirmPassword.value || confirmPassword.value.trim() === '') {
      alert('Please confirm your password.');
      return;
    }
    
    // Validate password requirements
    const pwdValue = password.value;
    const lengthValid = pwdValue.length >= 8;
    const numberValid = /\d/.test(pwdValue);
    const uppercaseValid = /[A-Z]/.test(pwdValue);
    const specialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwdValue);
    
    console.log('Password validation:', { lengthValid, numberValid, uppercaseValid, specialValid });
    
    if (!lengthValid || !numberValid || !uppercaseValid || !specialValid) {
      alert('Password does not meet all requirements. Please check the password requirements.');
      return;
    }
    
    // Check if password and confirm password match
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match. Please try again.');
      return;
    }
  }
  
  // Prepare signup data
  let signupData = {};
  
  if (userType === 'client') {
    const clientTypeRadio = form.querySelector('input[name="clientType"]:checked');
    const clientType = clientTypeRadio ? clientTypeRadio.value : 'gig';
    
    const clientFields = document.getElementById('clientFields');
    if (clientFields) {
      const inputs = clientFields.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
      
      if (!inputs[0]?.value || !inputs[1]?.value || !inputs[2]?.value) {
        alert('Please fill in all required fields.');
        return;
      }
      
      signupData = {
        username: inputs[0].value.split(' ').join('_').toLowerCase(),
        email: inputs[1].value,
        password: password.value,
        password_confirm: confirmPassword.value,
        user_type: 'client',
        phone: inputs[2].value,
        client_type: clientType
      };
    }
  } else {
    const pwdFields = document.getElementById('pwdFields');
    if (pwdFields) {
      const inputs = pwdFields.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
      
      if (!inputs[0]?.value || !inputs[1]?.value || !inputs[2]?.value) {
        alert('Please fill in all required fields.');
        return;
      }
      
      signupData = {
        username: inputs[0].value.split(' ').join('_').toLowerCase(),
        email: inputs[1].value,
        password: password.value,
        password_confirm: confirmPassword.value,
        user_type: 'pwd',
        phone: inputs[2].value,
        disability: '',
        skills: []
      };
    }
  }
  
  // Register via API
  if (window.ableConnectAPI && window.ableConnectAPI.auth) {
    try {
      const response = await window.ableConnectAPI.auth.register(signupData);
      if (response.user) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Close modal and redirect immediately
        closeModal();
        
        // Redirect based on user type
        if (userType === 'pwd') {
          window.location.href = PATHS.HOMEPAGE;
        } else {
          window.location.href = PATHS.CLIENT;
        }
      }
    } catch (error) {
      alert(error.message || 'Registration failed. Please try again.');
      console.error('Signup error:', error);
    }
  } else {
    // Fallback to localStorage (for development without backend)
    localStorage.setItem('isLoggedIn', 'true');
    closeModal();
    if (userType === 'pwd') {
      localStorage.setItem('userData', JSON.stringify({
        name: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        user_type: 'pwd'
      }));
      window.location.href = PATHS.HOMEPAGE;
    } else {
      localStorage.setItem('clientData', JSON.stringify({
        name: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        client_type: signupData.client_type
      }));
      window.location.href = PATHS.CLIENT;
    }
  }
}

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  
  // Get email and password from form
  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = form.querySelector('input[type="password"]');
  const email = emailInput ? emailInput.value : '';
  const password = passwordInput ? passwordInput.value : '';
  
  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }
  
  // Get user type from active slider button
  const activeButton = document.querySelector('.slider-switch button.active');
  const userType = activeButton ? activeButton.textContent.toLowerCase() : 'pwd';
  
  // Login via API
  if (window.ableConnectAPI && window.ableConnectAPI.auth) {
    try {
      const response = await window.ableConnectAPI.auth.login(email, password, userType);
      if (response.user) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Close the modal
        closeModal();
        
        // Show success message
        if (window.showSuccessAlert) {
          showSuccessAlert('Signed in successfully!', 2000);
        }
        
        // Check if there's a pending redirect (e.g., to tubonge.html)
        if (pendingRedirect) {
          const redirectUrl = pendingRedirect;
          pendingRedirect = null;
          if (redirectUrl.includes('tubonge.html')) {
            localStorage.setItem('tubongeReferrer', window.location.href);
          }
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1000);
          return;
        }
        
        // Redirect based on user type
        setTimeout(() => {
          if (response.user.user_type === 'pwd') {
            window.location.href = PATHS.HOMEPAGE;
          } else {
            window.location.href = PATHS.CLIENT;
          }
        }, 1000);
      }
    } catch (error) {
      if (window.showErrorAlert) {
        showErrorAlert(error.message || 'Invalid email or password. Please try again.');
      } else {
        alert(error.message || 'Invalid email or password. Please try again.');
      }
      console.error('Login error:', error);
    }
  } else {
    // Fallback to localStorage (for development without backend)
    if (window.showInfoAlert) {
      showInfoAlert('API not available. Using local storage fallback.');
    } else {
      alert('API not available. Using local storage fallback.');
    }
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const clientData = JSON.parse(localStorage.getItem('clientData')) || {};
    const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData')) || {};
    
    let userFound = false;
    if (userType === 'pwd') {
      if ((userData.email === email || pwdSignupData.email === email) && password) {
        userFound = true;
      }
    } else {
      if (clientData.email === email && password) {
        userFound = true;
      }
    }
    
    if (!userFound) {
      if (window.showErrorAlert) {
        showErrorAlert('Invalid email or password. Please try again.');
      } else {
        alert('Invalid email or password. Please try again.');
      }
      return;
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    closeModal();
    
    // Show success message
    if (window.showSuccessAlert) {
      showSuccessAlert('Signed in successfully!', 2000);
    }
    
    if (pendingRedirect) {
      const redirectUrl = pendingRedirect;
      pendingRedirect = null;
      setTimeout(() => window.location.href = redirectUrl, 1000);
      return;
    }
    
    setTimeout(() => {
      if (userType === 'pwd') {
        window.location.href = PATHS.HOMEPAGE;
      } else {
        window.location.href = PATHS.CLIENT;
      }
    }, 1000);
  }
}

// Password validation
function setupPasswordValidation() {
  const password = document.getElementById('password');
  if (!password) return;
  
  password.addEventListener('input', function() {
    const value = this.value;
    
    // Check each requirement
    document.getElementById('length').className = value.length >= 8 ? 'valid' : 'invalid';
    document.getElementById('number').className = /\d/.test(value) ? 'valid' : 'invalid';
    document.getElementById('uppercase').className = /[A-Z]/.test(value) ? 'valid' : 'invalid';
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
    document.getElementById('clientNumber').className = /\d/.test(value) ? 'valid' : 'invalid';
    document.getElementById('clientUppercase').className = /[A-Z]/.test(value) ? 'valid' : 'invalid';
    document.getElementById('clientSpecial').className = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ? 'valid' : 'invalid';
  });
}

// Setup radio button interactions
function setupRadioButtons() {
  // Handle client type radio buttons (for signup form only)
  const clientTypeRadios = document.querySelectorAll('#clientTypeOptions input[type="radio"]');
  const clientTypeLabels = document.querySelectorAll('#clientTypeOptions label');
  
  clientTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      clientTypeLabels.forEach(l => l.classList.remove('active'));
      if (this.checked) {
        this.closest('label').classList.add('active');
      }
    });
  });
  
  clientTypeLabels.forEach(label => {
    label.addEventListener('click', function(e) {
      const radio = this.querySelector('input[type="radio"]');
      if (radio && !radio.checked) {
        clientTypeLabels.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        radio.checked = true;
      }
    });
  });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const authModal = document.getElementById('authModal');
  if (authModal && e.target === authModal) {
    closeModal();
  }
});

// Close modal with Escape key
window.addEventListener('keydown', (e) => {
  const authModal = document.getElementById('authModal');
  if (e.key === 'Escape' && authModal && authModal.style.display === 'flex') {
    closeModal();
  }
});

// Handle Tubonge button click with authentication check
async function handleTubongeClick() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    // User is not logged in, show login modal and set pending redirect
    pendingRedirect = PATHS.TUBONGE;
    triggerAuthModal('login');
  } else {
    localStorage.setItem('tubongeReferrer', window.location.href);
    window.location.href = PATHS.TUBONGE;
  }
}
window.handleTubongeClick = handleTubongeClick;

// Service description functionality
function showServiceDescription(serviceType) {
  const serviceModal = document.getElementById('serviceModal');
  const serviceDescription = document.getElementById('serviceDescription');
  
  let content = '';
  
  switch(serviceType) {
    case 'signlanguage':
      content = `
        <h2>Sign Language Training</h2>
        <div class="service-image" style="background-image: url('${PATHS.STATIC}/images/signlanguage.jpg')"></div>
        <p>Our certified interpreters provide professional sign language training for events, meetings, and personal needs, ensuring clear and inclusive communication for all participants.</p>
        <div class="service-features">
          <h4>Service highlights:</h4>
          <ul>
            <li>Available for in-person and virtual events</li>
            <li>Certified and experienced interpreters</li>
            <li>Flexible scheduling</li>
            <li>Confidential and respectful service</li>
            <li>Support for a variety of sign languages</li>
          </ul>
        </div>
        <p>Contact us to book a session or learn more about our interpretation services.</p>
        <button class="service-action-button" onclick="window.open('https://www.youtube.com', '_blank')">Enrol for sign language</button>
      `;
      break;
      
    case 'pwdconnect':
      content = `
        <h2>PWD Connect</h2>
        <div class="service-image" style="background-image: url('${PATHS.STATIC}/images/pwdconnect.jpg')"></div>
        <p>Join a vibrant community of persons with disabilities where you can connect, share experiences, and support each other on your journey.</p>
        <div class="service-features">
          <h4>Community features:</h4>
          <ul>
            <li>Connect with peers who understand your journey</li>
            <li>Share experiences and stories</li>
            <li>Access peer support and mentorship</li>
            <li>Join discussion groups and forums</li>
            <li>Participate in community events</li>
            <li>Build meaningful relationships</li>
          </ul>
        </div>
        <p>Together we are stronger. Join PWD Connect and be part of a supportive community that celebrates diversity and empowers each member.</p>
        <button class="service-action-button" onclick="handleTubongeClick()">Tubonge</button>
      `;
      break;
      
    case 'freelance':
      content = `
        <h2>Freelance Gigs</h2>
        <div class="service-image" style="background-image: url('${PATHS.STATIC}/images/freelancegigs.jpg')"></div>
        <p>Connect with opportunities that match your unique skills and abilities. Our freelance platform is designed to be accessible and inclusive for everyone.</p>
        <div class="service-features">
          <h4>What we offer:</h4>
          <ul>
            <li>Skill-based project matching</li>
            <li>Flexible work schedules</li>
            <li>Accessible project descriptions</li>
            <li>Inclusive client community</li>
            <li>Fair compensation standards</li>
            <li>24/7 support assistance</li>
          </ul>
        </div>
        <p>Whether you're a graphic designer, writer, programmer, or offer any other service, find projects that value your expertise and accommodate your needs.</p>
      `;
      break;
      
    case 'medical':
      content = `
        <h2>Medical Services</h2>
        <div class="service-image" style="background-image: url('${PATHS.STATIC}/images/medicalservices.jpg')"></div>
        <p>Access comprehensive medical and therapy services through our network of healthcare providers who understand and accommodate diverse abilities.</p>
        <div class="service-features">
          <h4>Available services:</h4>
          <ul>
            <li>Primary care consultations</li>
            <li>Specialized therapy sessions</li>
            <li>Mental health support</li>
            <li>Physical therapy</li>
            <li>Occupational therapy</li>
            <li>Accessible medical facilities</li>
          </ul>
        </div>
        <p>All our healthcare partners are trained in accessibility and provide accommodations to ensure comfortable and effective care for everyone.</p>
      `;
      break;
      
    case 'inclusive':
      content = `
        <h2>Inclusive Work</h2>
        <div class="service-image" style="background-image: url('${PATHS.STATIC}/images/inclusivework.jpg')"></div>
        <p>Connect with employers who are committed to creating truly inclusive work environments that celebrate diversity and provide necessary accommodations.</p>
        <div class="service-features">
          <h4>Workplace features:</h4>
          <ul>
            <li>Accessible office environments</li>
            <li>Flexible work arrangements</li>
            <li>Inclusive hiring practices</li>
            <li>Diversity training programs</li>
            <li>Accommodation support</li>
            <li>Equal opportunity policies</li>
          </ul>
        </div>
        <p>Find employers who value your skills and are committed to creating workplaces where everyone can thrive and succeed.</p>
      `;
      break;
  }
  
  serviceDescription.innerHTML = content;
  serviceModal.style.display = 'flex';
}
window.showServiceDescription = showServiceDescription;

function closeServiceModal() {
  const serviceModal = document.getElementById('serviceModal');
  serviceModal.style.display = 'none';
}
window.closeServiceModal = closeServiceModal;

// Close service modal when clicking outside
window.addEventListener('click', (e) => {
  const serviceModal = document.getElementById('serviceModal');
  if (e.target === serviceModal) {
    closeServiceModal();
  }
});

// Close service modal with Escape key
window.addEventListener('keydown', (e) => {
  const serviceModal = document.getElementById('serviceModal');
  if (e.key === 'Escape' && serviceModal.style.display === 'flex') {
    closeServiceModal();
  }
});

// Functions are already exposed above after their definitions

// Initialize with signup form
document.addEventListener('DOMContentLoaded', () => {
  // Set default form
  const formContainer = document.getElementById('formContainer');
  if (formContainer) {
    showForm('signup');
  }
}); 