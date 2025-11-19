// PWD Homepage JavaScript functionality

// Path constants
const PATHS = {
  INDEX: '/',
  HOMEPAGE: '/homepage.html',
  CLIENT: '/client.html',
  TUBONGE: '/tubonge.html',
  STATIC: '/static'
};

// DOM elements - will be initialized in DOMContentLoaded
let profileIcon, profilePopup, editProfileBtn, editProfileModal, bidModal, bookModal, gigsGrid, servicesGrid;

// Sample data for gigs and services (used as fallback when API unavailable)
const sampleGigs = [
  {
    id: 1,
    title: 'Web Design Project',
    description: 'Design a responsive website for a local business',
    price: 5000,
    timeframe: '2 weeks',
    requirements: 'HTML, CSS, JavaScript skills',
    client: 'Tech Solutions Ltd'
  },
  {
    id: 2,
    title: 'Content Writing',
    description: 'Write blog posts for a health website',
    price: 2000,
    timeframe: '1 week',
    requirements: 'Good writing skills, health knowledge',
    client: 'Health Blog'
  },
  {
    id: 3,
    title: 'Logo Design',
    description: 'Create a modern logo for a startup',
    price: 3000,
    timeframe: '5 days',
    requirements: 'Graphic design skills, creativity',
    client: 'StartupXYZ'
  }
];

const sampleServices = [
  {
    id: 1,
    title: 'Physical Therapy',
    description: 'Professional physical therapy sessions',
    price: 3000,
    duration: '1 hour',
    therapist: 'Dr. Sarah Johnson',
    location: 'Nairobi CBD'
  },
  {
    id: 2,
    title: 'Occupational Therapy',
    description: 'Help with daily living activities',
    price: 2500,
    duration: '45 minutes',
    therapist: 'Dr. Michael Chen',
    location: 'Westlands'
  },
  {
    id: 3,
    title: 'Speech Therapy',
    description: 'Speech and language development',
    price: 2800,
    duration: '1 hour',
    therapist: 'Dr. Emily Brown',
    location: 'Kilimani'
  },
  {
    id: 4,
    title: 'Sign Language Interpretation',
    description: 'Professional sign language interpretation for events, meetings, and personal needs.',
    price: 3500,
    duration: 'Per session',
    therapist: 'Certified Interpreter',
    location: 'Available Nationwide'
  }
];

let availableGigs = [...sampleGigs];
let availableServices = [...sampleServices];
let selectedGigId = null;
let selectedServiceId = null;

async function syncCurrentUserWithBackend() {
  if (!(window.ableConnectAPI && window.ableConnectAPI.auth)) {
    return JSON.parse(localStorage.getItem('userData') || 'null');
  }

  try {
    const user = await window.ableConnectAPI.auth.getCurrentUser();
    if (user && user.id) {
      const normalizedUser = {
        id: user.id,
        name: user.username || user.email,
        email: user.email,
        phone: user.phone || '',
        disability: user.disability || '',
        skills: user.skills || [],
        user_type: user.user_type || 'pwd',
      };
      localStorage.setItem('userData', JSON.stringify(normalizedUser));
      localStorage.setItem('isLoggedIn', 'true');
      return normalizedUser;
    }
  } catch (error) {
    console.debug('Unable to sync user via API', error);
  }

  return JSON.parse(localStorage.getItem('userData') || 'null');
}

function formatGigFromApi(gig) {
  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    price: gig.price,
    timeframe: gig.timeframe,
    requirements: gig.requirements || 'See description',
    client: gig.client,
    clientName: gig.client?.username || gig.client?.email || 'Client',
    status: gig.status || 'open',
  };
}

function formatServiceFromApi(service) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    price: service.price,
    duration: service.duration,
    requirements: service.requirements || 'Contact provider for details',
    client: service.client,
    clientName: service.client?.username || service.client?.email || 'Client',
    status: service.status || 'open',
  };
}

async function fetchGigsFromAPI() {
  if (!(window.ableConnectAPI && window.ableConnectAPI.gigs)) {
    return;
  }

  try {
    const gigs = await window.ableConnectAPI.gigs.getGigs();
    availableGigs = gigs.map(formatGigFromApi);
  } catch (error) {
    console.error('Unable to load gigs from the API. Using fallback data.', error);
    availableGigs = [...sampleGigs];
  }
}

async function fetchServicesFromAPI() {
  if (!(window.ableConnectAPI && window.ableConnectAPI.services)) {
    return;
  }

  try {
    const services = await window.ableConnectAPI.services.getServices();
    availableServices = services.map(formatServiceFromApi);
  } catch (error) {
    console.error('Unable to load services from the API. Using fallback data.', error);
    availableServices = [...sampleServices];
  }
}

function getStoredUser() {
  return JSON.parse(localStorage.getItem('userData') || 'null');
}

function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
  if (!isUserLoggedIn()) {
    return null;
  }
  return getStoredUser();
}

async function ensureUserSession() {
  const user = await syncCurrentUserWithBackend();
  if (!isUserLoggedIn()) {
    if (window.showWarningAlert) {
      showWarningAlert('Please login to continue');
    } else {
      alert('Please login to continue');
    }
    window.location.href = PATHS.INDEX;
    return null;
  }
  return user || getStoredUser();
}

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
  if (modal === bidModal) {
    selectedGigId = null;
  }
  if (modal === bookModal) {
    selectedServiceId = null;
  }
}

function setupModalAccessibility(modal) {
  if (!modal) return;
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
}

// Profile icon toggles popup - will be initialized in DOMContentLoaded
function setupProfileIcon() {
  if (profileIcon) {
    profileIcon.addEventListener('click', () => {
      if (profilePopup && (profilePopup.style.display === 'none' || profilePopup.style.display === '')) {
        loadUserDataIntoProfilePopup();
        openModal(profilePopup);
      } else if (profilePopup) {
        closeModal(profilePopup);
      }
    });
  }
}

// Load user data into profile popup
function loadUserDataIntoProfilePopup() {
  if (!profilePopup) return;
  
  // Cache localStorage read
  const userDataStr = localStorage.getItem('userData');
  const userData = userDataStr ? JSON.parse(userDataStr) : {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    disability: 'Hearing Impairment',
    skills: ['Web Design', 'Content Writing']
  };
  
  // Update profile popup content
  const profileName = profilePopup.querySelector('p:nth-of-type(1)');
  const profileEmail = profilePopup.querySelector('p:nth-of-type(2)');
  const profileDisability = profilePopup.querySelector('p:nth-of-type(3)');
  const profilePhone = profilePopup.querySelector('p:nth-of-type(4)');
  const profileSkills = profilePopup.querySelector('p:nth-of-type(5)');
  
  if (profileName) profileName.innerHTML = `<strong>Name:</strong> ${userData.name || userData.username || 'Not set'}`;
  if (profileEmail) profileEmail.innerHTML = `<strong>Email:</strong> ${userData.email || 'Not set'}`;
  if (profileDisability) profileDisability.innerHTML = `<strong>Disability:</strong> ${userData.disability || 'Not specified'}`;
  if (profilePhone) profilePhone.innerHTML = `<strong>Phone:</strong> ${userData.phone || 'Not set'}`;
  if (profileSkills) profileSkills.innerHTML = `<strong>Skills:</strong> ${userData.skills ? userData.skills.join(', ') : 'None'}`;
}

// Edit profile button
// Setup edit profile button - will be called in DOMContentLoaded
function setupEditProfileButton() {
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      // Ensure disability field is disabled for existing users (not new users)
      const disabilityEl = document.getElementById('editDisability');
      if (disabilityEl) {
        const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData'));
        // Only enable if it's a new user with incomplete profile
        if (!pwdSignupData || !pwdSignupData.isNewUser) {
          disabilityEl.disabled = true;
        }
      }
      
      // Load user data from profile popup or localStorage
      loadUserDataIntoEditForm();
      if (editProfileModal) openModal(editProfileModal);
      if (profilePopup) closeModal(profilePopup);
    });
  }
}

// Load user data into edit form
function loadUserDataIntoEditForm() {
  // Get data from profile popup or localStorage
  const nameEl = document.getElementById('editName');
  const emailEl = document.getElementById('editEmail');
  const phoneEl = document.getElementById('editPhone');
  const disabilityEl = document.getElementById('editDisability');
  const skillsList = document.getElementById('skillsList');
  
  // Check for signup data first (new user), then userData
  const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData'));
  const userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    disability: 'Hearing Impairment',
    skills: ['Web Design', 'Content Writing']
  };
  
  // Use signup data if available, otherwise use userData
  const dataToUse = pwdSignupData ? {
    name: pwdSignupData.name || userData.name,
    email: pwdSignupData.email || userData.email,
    phone: pwdSignupData.phone || userData.phone,
    disability: userData.disability || '',
    skills: userData.skills || []
  } : userData;
  
  if (nameEl) nameEl.value = dataToUse.name;
  if (emailEl) emailEl.value = dataToUse.email;
  if (phoneEl) phoneEl.value = dataToUse.phone;
  if (disabilityEl) disabilityEl.value = dataToUse.disability;
  
  // Render skills
  if (skillsList) {
    skillsList.innerHTML = '';
    if (dataToUse.skills && dataToUse.skills.length > 0) {
      dataToUse.skills.forEach(skill => {
        const skillSpan = document.createElement('span');
        skillSpan.className = 'skill';
        skillSpan.innerHTML = `
          ${skill} 
          <button class="remove-skill" onclick="removeSkill(this)">×</button>
        `;
        skillsList.appendChild(skillSpan);
      });
    }
  }
}

// Check if user is new and show profile modal
function checkForNewUser() {
  const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData'));
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  
  // Check if user is new (has signup data with isNewUser flag) and profile is incomplete
  if (pwdSignupData && pwdSignupData.isNewUser) {
    // Check if profile is incomplete (missing disability or no skills)
    const isProfileIncomplete = !userData.disability || 
                                 (userData.skills && userData.skills.length === 0) ||
                                 !userData.skills;
    
    if (isProfileIncomplete) {
      // Enable disability field for new users
      const disabilityEl = document.getElementById('editDisability');
      if (disabilityEl) {
        disabilityEl.disabled = false;
      }
      
      // Load data into form and show modal
      loadUserDataIntoEditForm();
      openModal(editProfileModal);
    }
  }
}

// Setup all event listeners - will be called in DOMContentLoaded
function setupEventListeners() {
  // View history button
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      if (window.showInfoAlert) {
        showInfoAlert('Bid history feature coming soon!');
      } else {
        alert('Bid history feature coming soon!');
      }
      if (profilePopup) closeModal(profilePopup);
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear login session
      localStorage.removeItem('isLoggedIn');
      
      // Redirect to index.html
      window.location.href = PATHS.INDEX;
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    [profilePopup, editProfileModal, bidModal, bookModal].forEach((modal) => {
      if (modal && e.target === modal) closeModal(modal);
    });
  });

  // Close modals with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [profilePopup, editProfileModal, bidModal, bookModal].forEach((modal) => {
        if (modal && modal.style.display === 'flex') closeModal(modal);
      });
    }
  });
}

// Render gigs
function renderGigs() {
  if (!gigsGrid) return;
  
  gigsGrid.innerHTML = '';
  
  // Cache localStorage read
  const postedItemsStr = localStorage.getItem('postedGigsServices');
  const postedItems = postedItemsStr ? JSON.parse(postedItemsStr) : [];
  const postedGigs = postedItems.filter(item => item.type === 'gig' && item.status === 'open');
  
  // Combine sample gigs with posted gigs
  const allGigs = [...availableGigs];
  
  // Add posted gigs (convert to gig format)
  postedGigs.forEach(postedGig => {
    allGigs.push({
      id: postedGig.id,
      title: postedGig.title,
      description: postedGig.description,
      price: postedGig.amount,
      timeframe: postedGig.timeframe,
      requirements: postedGig.requirements || 'See description',
      clientName: 'Posted by Client',
      status: postedGig.status || 'open'
    });
  });

  if (allGigs.length === 0) {
    gigsGrid.innerHTML = `
      <div class="empty-state">
        <p>No gigs are available right now.</p>
      </div>
    `;
    return;
  }
  
  allGigs.forEach(gig => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${gig.title}</h3>
      <p>${gig.description}</p>
      <p><strong>Price:</strong> ${gig.price} KES</p>
      <p><strong>Timeframe:</strong> ${gig.timeframe}</p>
      <p><strong>Requirements:</strong> ${gig.requirements}</p>
      <p><strong>Client:</strong> ${gig.clientName || gig.client || 'Client'}</p>
      <button class="bid-btn" onclick="openBidModal(${gig.id})">Submit Bid</button>
    `;
    gigsGrid.appendChild(card);
  });
}

// Render services
function renderServices() {
  if (!servicesGrid) return;
  
  servicesGrid.innerHTML = '';
  
  // Cache localStorage read
  const postedItemsStr = localStorage.getItem('postedGigsServices');
  const postedItems = postedItemsStr ? JSON.parse(postedItemsStr) : [];
  const postedServices = postedItems.filter(item => item.type === 'service' && item.status === 'open');
  
  // Combine sample services with posted services
  const allServices = [...availableServices];
  
  // Add posted services (convert to service format)
  postedServices.forEach(postedService => {
    allServices.push({
      id: postedService.id,
      title: postedService.title,
      description: postedService.description,
      price: postedService.amount,
      duration: postedService.timeframe,
      therapist: 'Available Provider',
      location: 'Contact for details',
      clientName: 'Posted by Client',
      status: postedService.status || 'open'
    });
  });

  if (allServices.length === 0) {
    servicesGrid.innerHTML = `
      <div class="empty-state">
        <p>No services are currently available.</p>
      </div>
    `;
    return;
  }
  
  allServices.forEach(service => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <p><strong>Price:</strong> ${service.price} KES</p>
      <p><strong>Duration:</strong> ${service.duration}</p>
      <p><strong>Therapist:</strong> ${service.therapist || service.clientName || 'Provider'}</p>
      <p><strong>Location:</strong> ${service.location || 'Contact for details'}</p>
      <button class="book-btn" onclick="openBookModal(${service.id})">Book Service</button>
    `;
    servicesGrid.appendChild(card);
  });
}

function setButtonLoading(button, isLoading, defaultLabel = 'Submit') {
  if (!button) return;
  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || defaultLabel;
    }
    button.disabled = true;
    button.textContent = 'Submitting...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || defaultLabel;
    delete button.dataset.originalText;
  }
}

// Open bid modal
function openBidModal(gigId) {
  // Check sample gigs first
  let gig = availableGigs.find(g => g.id === gigId);
  
  // If not found, check posted gigs
  if (!gig) {
    const postedItems = JSON.parse(localStorage.getItem('postedGigsServices')) || [];
    const postedGig = postedItems.find(item => item.id === gigId && item.type === 'gig');
    if (postedGig) {
      gig = {
        id: postedGig.id,
        title: postedGig.title,
        description: postedGig.description,
        price: postedGig.amount,
        timeframe: postedGig.timeframe
      };
    }
  }
  
  if (gig) {
    selectedGigId = gig.id;
    document.querySelector('#bidModal h2').textContent = `Submit Your Bid - ${gig.title}`;
    openModal(bidModal);
  }
}
window.openBidModal = openBidModal;

// Open book modal
function openBookModal(serviceId) {
  // Check sample services first
  let service = availableServices.find(s => s.id === serviceId);
  
  // If not found, check posted services
  if (!service) {
    const postedItems = JSON.parse(localStorage.getItem('postedGigsServices')) || [];
    const postedService = postedItems.find(item => item.id === serviceId && item.type === 'service');
    if (postedService) {
      service = {
        id: postedService.id,
        title: postedService.title,
        description: postedService.description,
        price: postedService.amount,
        duration: postedService.timeframe
      };
    }
  }
  
  if (service) {
    selectedServiceId = service.id;
    document.querySelector('#bookModal h2').textContent = `Book Service - ${service.title}`;
    openModal(bookModal);
  }
}
window.openBookModal = openBookModal;

// Setup bid and book submission handlers - will be called in DOMContentLoaded
function setupBidAndBookHandlers() {
  // Handle bid submission
  const submitBidBtn = document.getElementById('submitBidBtn');
  if (submitBidBtn) {
    submitBidBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    const bidAmount = form.querySelector('input[type="number"]').value;
    const proposal = form.querySelector('textarea').value;
    const fileInput = form.querySelector('input[type="file"]');
    const supportingDoc = fileInput && fileInput.files ? fileInput.files[0] : null;
    
    if (!bidAmount || !proposal) {
      if (window.showWarningAlert) {
        showWarningAlert('Please fill in all bid fields.');
      } else {
        alert('Please fill in all bid fields.');
      }
      return;
    }
    
    if (selectedGigId && window.ableConnectAPI && window.ableConnectAPI.gigs) {
      setButtonLoading(submitBidBtn, true);
      try {
        await window.ableConnectAPI.gigs.placeBid(selectedGigId, {
          amount: bidAmount,
          proposal,
          document: supportingDoc || undefined,
        });
        if (window.showSuccessAlert) {
          showSuccessAlert('Bid submitted successfully!');
        } else {
          alert('Bid submitted successfully!');
        }
        closeModal(bidModal);
        form.reset();
      } catch (error) {
        console.error('Error submitting bid:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to submit bid. Please try again.');
        } else {
          alert(error.message || 'Failed to submit bid. Please try again.');
        }
      } finally {
        setButtonLoading(submitBidBtn, false);
      }
      return;
    }
    
    if (window.showWarningAlert) {
      showWarningAlert('Live bidding is unavailable for this gig right now.');
    } else {
      alert('Live bidding is unavailable for this gig right now.');
    }
    });
  }

  // Handle service booking
  const submitBookBtn = document.getElementById('submitBookBtn');
  if (submitBookBtn) {
    submitBookBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    const proposal = form.querySelector('textarea').value;
    const fileInput = form.querySelector('input[type="file"]');
    const supportingDoc = fileInput && fileInput.files ? fileInput.files[0] : null;
    
    if (!proposal) {
      if (window.showWarningAlert) {
        showWarningAlert('Please fill in your proposal.');
      } else {
        alert('Please fill in your proposal.');
      }
      return;
    }
    
    if (selectedServiceId && window.ableConnectAPI && window.ableConnectAPI.services) {
      setButtonLoading(submitBookBtn, true);
      try {
        await window.ableConnectAPI.services.bookService(selectedServiceId, {
          proposal,
          document: supportingDoc || undefined,
        });
        if (window.showSuccessAlert) {
          showSuccessAlert('Service booked successfully!');
        } else {
          alert('Service booked successfully!');
        }
        closeModal(bookModal);
        form.reset();
      } catch (error) {
        console.error('Error booking service:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to book service. Please try again.');
        } else {
          alert(error.message || 'Failed to book service. Please try again.');
        }
      } finally {
        setButtonLoading(submitBookBtn, false);
      }
      return;
    }
    
    if (window.showWarningAlert) {
      showWarningAlert('Live booking is unavailable for this service right now.');
    } else {
      alert('Live booking is unavailable for this service right now.');
    }
    });
  }

  // Handle profile editing
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('editPhone').value;
    const disability = document.getElementById('editDisability').value;
    
    // Get current user data
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const pwdSignupData = JSON.parse(localStorage.getItem('pwdSignupData'));
    
    // Update user data
    userData.phone = phone;
    userData.disability = disability;
    
    // Get current skills
    const skills = [];
    document.querySelectorAll('#skillsList .skill').forEach(skillEl => {
      const skillText = skillEl.textContent.trim().replace('×', '').trim();
      if (skillText) skills.push(skillText);
    });
    userData.skills = skills;
    
    // If name and email are not set, get them from signup data
    if (pwdSignupData) {
      if (!userData.name) userData.name = pwdSignupData.name;
      if (!userData.email) userData.email = pwdSignupData.email;
    }
    
    const submitBtn = editProfileForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    if (window.ableConnectAPI && window.ableConnectAPI.auth && userData.id) {
      try {
        await window.ableConnectAPI.auth.updateProfile(userData.id, {
          phone,
          disability,
          skills,
        });
      } catch (error) {
        console.error('Unable to update profile via API:', error);
        if (window.showErrorAlert) {
          showErrorAlert(error.message || 'Failed to update profile. Please try again.');
        } else {
          alert(error.message || 'Failed to update profile. Please try again.');
        }
        setButtonLoading(submitBtn, false);
        return;
      }
    }
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Clear the new user flag since profile is now complete
    if (pwdSignupData && pwdSignupData.isNewUser) {
      pwdSignupData.isNewUser = false;
      localStorage.setItem('pwdSignupData', JSON.stringify(pwdSignupData));
    }
    
    // Update profile popup display
    const profilePhone = profilePopup.querySelector('p:nth-of-type(4)');
    if (profilePhone) {
      profilePhone.innerHTML = `<strong>Phone:</strong> ${phone}`;
    }
    
    const profileSkills = profilePopup.querySelector('p:nth-of-type(5)');
    if (profileSkills) {
      profileSkills.innerHTML = `<strong>Skills:</strong> ${skills.join(', ') || 'None'}`;
    }
    
    if (window.showSuccessAlert) {
      showSuccessAlert('Profile updated successfully!');
    } else {
      alert('Profile updated successfully!');
    }
    closeModal(editProfileModal);
    
    // Update chat system with new user data
    const allUsers = JSON.parse(localStorage.getItem('allUsers')) || {};
    if (userData.email) {
      allUsers[userData.email] = {
        name: userData.name,
        type: 'pwd'
      };
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
    
    setButtonLoading(submitBtn, false);
    });
  }

  // Skills management
  const addSkillBtn = document.getElementById('addSkillBtn');
  const addSkillDropdown = document.getElementById('addSkillDropdown');

  if (addSkillBtn && addSkillDropdown) {
    addSkillBtn.addEventListener('click', () => {
    const selectedSkill = addSkillDropdown.value;
    if (selectedSkill) {
      addSkill(selectedSkill);
      addSkillDropdown.value = '';
    } else {
      if (window.showWarningAlert) {
        showWarningAlert('Please select a skill to add');
      } else {
        alert('Please select a skill to add');
      }
    }
    });
  }
}

function addSkill(skillName) {
  const skillsList = document.getElementById('skillsList');
  if (!skillsList) return;
  
  // Check if skill already exists
  const existingSkills = Array.from(skillsList.querySelectorAll('.skill')).map(skill => {
    return skill.textContent.trim().replace('×', '').trim();
  });
  
  if (existingSkills.includes(skillName)) {
    if (window.showWarningAlert) {
      showWarningAlert('This skill is already in your list');
    } else {
      alert('This skill is already in your list');
    }
    return;
  }
  
  const skillSpan = document.createElement('span');
  skillSpan.className = 'skill';
  skillSpan.innerHTML = `
    ${skillName} 
    <button class="remove-skill" onclick="removeSkill(this)">×</button>
  `;
  skillsList.appendChild(skillSpan);
}

function removeSkill(button) {
  button.parentElement.remove();
}
window.removeSkill = removeSkill;

// Initialize user data if not exists
function initializeUserData() {
  if (!localStorage.getItem('userData')) {
    const defaultUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+254712345678',
      disability: 'Hearing Impairment',
      skills: ['Web Design', 'Content Writing']
    };
    localStorage.setItem('userData', JSON.stringify(defaultUserData));
  }
}

// Handle Tubonge button click with authentication check
function handleTubongeClick() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // User is not logged in, redirect to index.html with login prompt
    if (window.showWarningAlert) {
      showWarningAlert('Please login to access Tubonge');
    } else {
      alert('Please login to access Tubonge');
    }
    window.location.href = PATHS.INDEX;
  } else {
    // Store current page as referrer before navigating to tubonge
    localStorage.setItem('tubongeReferrer', window.location.href);
    // User is logged in, redirect to tubonge.html
    window.location.href = PATHS.TUBONGE;
  }
}
window.handleTubongeClick = handleTubongeClick;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM elements
  profileIcon = document.getElementById('profileIcon');
  profilePopup = document.getElementById('profilePopup');
  editProfileBtn = document.getElementById('editProfileBtn');
  editProfileModal = document.getElementById('editProfileModal');
  bidModal = document.getElementById('bidModal');
  bookModal = document.getElementById('bookModal');
  gigsGrid = document.getElementById('gigsGrid');
  servicesGrid = document.getElementById('servicesGrid');
  
  // Setup accessibility for modals
  [profilePopup, editProfileModal, bidModal, bookModal].forEach(setupModalAccessibility);
  
  // Setup all event listeners
  setupProfileIcon();
  setupEditProfileButton();
  setupEventListeners();
  setupBidAndBookHandlers();
  
  // Check authentication
  const user = await ensureUserSession();
  if (!user) {
    return;
  }
  
  // Initialize user data
  initializeUserData();
  
  // Show content immediately with sample data (for fast initial render)
  renderGigs();
  renderServices();
  
  // Load API data in background (non-blocking)
  Promise.all([fetchGigsFromAPI(), fetchServicesFromAPI()]).then(() => {
    // Re-render with API data when available
    renderGigs();
    renderServices();
  }).catch(() => {
    // API failed, but we already showed sample data
    console.log('Using fallback data');
  });
  
  // Check for new users and show profile modal if needed (non-blocking)
  setTimeout(() => {
    checkForNewUser();
  }, 100);
});