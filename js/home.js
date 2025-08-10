// PWD Homepage JavaScript functionality

// DOM elements
const profileIcon = document.getElementById('profileIcon');
const profilePopup = document.getElementById('profilePopup');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const bidModal = document.getElementById('bidModal');
const bookModal = document.getElementById('bookModal');
const gigsGrid = document.getElementById('gigsGrid');
const servicesGrid = document.getElementById('servicesGrid');

// Sample data for gigs and services
const availableGigs = [
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

const availableServices = [
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
  }
];

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

// Setup accessibility for all modals on load
[profilePopup, editProfileModal, bidModal, bookModal].forEach(setupModalAccessibility);

// Profile icon toggles popup
if (profileIcon) {
  profileIcon.addEventListener('click', () => {
    if (profilePopup.style.display === 'none' || profilePopup.style.display === '') {
      openModal(profilePopup);
    } else {
      closeModal(profilePopup);
    }
  });
}

// Edit profile button
if (editProfileBtn) {
  editProfileBtn.addEventListener('click', () => {
    openModal(editProfileModal);
    closeModal(profilePopup);
  });
}

// View history button
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
if (viewHistoryBtn) {
  viewHistoryBtn.addEventListener('click', () => {
    alert('Bid history feature coming soon!');
    closeModal(profilePopup);
  });
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  [profilePopup, editProfileModal, bidModal, bookModal].forEach((modal) => {
    if (e.target === modal) closeModal(modal);
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

// Render gigs
function renderGigs() {
  if (!gigsGrid) return;
  
  gigsGrid.innerHTML = '';
  availableGigs.forEach(gig => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${gig.title}</h3>
      <p>${gig.description}</p>
      <p><strong>Price:</strong> ${gig.price} KES</p>
      <p><strong>Timeframe:</strong> ${gig.timeframe}</p>
      <p><strong>Requirements:</strong> ${gig.requirements}</p>
      <p><strong>Client:</strong> ${gig.client}</p>
      <button class="bid-btn" onclick="openBidModal(${gig.id})">Submit Bid</button>
    `;
    gigsGrid.appendChild(card);
  });
}

// Render services
function renderServices() {
  if (!servicesGrid) return;
  
  servicesGrid.innerHTML = '';
  availableServices.forEach(service => {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <p><strong>Price:</strong> ${service.price} KES</p>
      <p><strong>Duration:</strong> ${service.duration}</p>
      <p><strong>Therapist:</strong> ${service.therapist}</p>
      <p><strong>Location:</strong> ${service.location}</p>
      <button class="book-btn" onclick="openBookModal(${service.id})">Book Service</button>
      <button class="chat-btn" onclick="openChatModal()">Chat</button>
    `;
    servicesGrid.appendChild(card);
  });
}

// Open bid modal
function openBidModal(gigId) {
  const gig = availableGigs.find(g => g.id === gigId);
  if (gig) {
    document.querySelector('#bidModal h2').textContent = `Submit Your Bid - ${gig.title}`;
    openModal(bidModal);
  }
}

// Open book modal
function openBookModal(serviceId) {
  const service = availableServices.find(s => s.id === serviceId);
  if (service) {
    document.querySelector('#bookModal h2').textContent = `Book Service - ${service.title}`;
    openModal(bookModal);
  }
}

// Open chat modal (placeholder)
function openChatModal() {
  alert('Chat feature coming soon!');
}

// Handle bid submission
const submitBidBtn = document.getElementById('submitBidBtn');
if (submitBidBtn) {
  submitBidBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    const bidAmount = form.querySelector('input[type="number"]').value;
    const proposal = form.querySelector('textarea').value;
    
    if (bidAmount && proposal) {
      alert('Bid submitted successfully!');
      closeModal(bidModal);
      form.reset();
    } else {
      alert('Please fill in all fields');
    }
  });
}

// Handle service booking
const submitBookBtn = document.getElementById('submitBookBtn');
if (submitBookBtn) {
  submitBookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const form = e.target.closest('form');
    const proposal = form.querySelector('textarea').value;
    
    if (proposal) {
      alert('Service booked successfully!');
      closeModal(bookModal);
      form.reset();
    } else {
      alert('Please fill in your proposal');
    }
  });
}

// Handle profile editing
const editProfileForm = editProfileModal?.querySelector('form');
if (editProfileForm) {
  editProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
    closeModal(editProfileModal);
  });
}

// Skills management
const addSkillDropdown = document.getElementById('addSkillDropdown');
if (addSkillDropdown) {
  addSkillDropdown.addEventListener('change', function() {
    if (this.value) {
      addSkill(this.value);
      this.value = '';
    }
  });
}

function addSkill(skillName) {
  const skillsList = document.querySelector('.skills-list');
  if (skillsList) {
    const skillSpan = document.createElement('span');
    skillSpan.className = 'skill';
    skillSpan.innerHTML = `
      ${skillName} 
      <button class="remove-skill" onclick="removeSkill(this)">x</button>
    `;
    skillsList.appendChild(skillSpan);
  }
}

function removeSkill(button) {
  button.parentElement.remove();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  renderGigs();
  renderServices();
});